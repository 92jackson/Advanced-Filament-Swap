(function () {
	const client = new window.MoonrakerClient();
	client.isMoonraker().then((ok) => {
		if (!ok) return;

		const notifier = new window.BrowserNotifications();

		// In-memory AFS state cache (merged from WebSocket deltas)
		const afsState = {};
		let currentModal = null;
		window.wsClockOffset = null;
		window.printerTelemetry = { extruder: {}, toolhead: {} };

		// G-Code sender helper
		window.sendGcode = client.sendGcode.bind(client);

		/**
		 * Merge incoming AFS_STATE delta into local cache and log.
		 * @param {object} delta Object with any subset of AFS_STATE keys
		 */
		function updateAFSState(delta) {
			if (!delta || typeof delta !== 'object') return;

			// Check for changes to trigger updates
			const prevOrigin = afsState.origin;
			const prevStatus = afsState.status;
			const prevPush = afsState.push;
			const prevEta = afsState.eta;
			const prevPid = parseInt(afsState.processid || 0, 10);

			Object.assign(afsState, delta);

			if (window.logger)
				window.logger.log('AFS-State', 'Merged delta', delta, 'Full cache', afsState);

			if (typeof delta.ts === 'number' && wsClockOffset === null) {
				wsClockOffset = Date.now() - delta.ts * 1000;
			}

			// Modal Logic
			const pid = parseInt(afsState.processid || 0, 10);

			const originChanged = 'origin' in delta && delta.origin !== prevOrigin;
			const statusChanged = 'status' in delta && delta.status !== prevStatus;
			const pushChanged = 'push' in delta && delta.push !== prevPush;
			const etaChanged = 'eta' in delta && (delta.eta || 0) !== (prevEta || 0);
			const pidChanged =
				'processid' in delta && parseInt(delta.processid || 0, 10) !== prevPid;
			const hasChange =
				originChanged || statusChanged || pushChanged || etaChanged || pidChanged;

			if ((originChanged || pidChanged) && pid > 0) {
				if (afsState.origin === 'run_out') notifier.alertRunout();
				if (afsState.origin === 'filament_swap_unloading') notifier.alertM600();
			}

			// Close if process ended or origin cleared (e.g. via TYPE=-1 or WS reset)
			if (currentModal && (pid <= 0 || !afsState.origin || afsState.origin === '')) {
				let timeout = 0;
				if (pid === -1) timeout = 1000; // Delay close for 1s to allow modal to close

				setTimeout(() => {
					currentModal.close();
					currentModal = null;
				}, timeout);
			}

			// 1. Check if we need to open a new modal
			if (pid > 0) {
				const hadModal = !!currentModal;
				if (!currentModal || currentModal.processId < pid) {
					if (
						afsState.origin &&
						window.ConfigDefinitions.modalConfig.stages[afsState.origin]
					) {
						if (currentModal) currentModal.close();
						currentModal = new FilamentSwapModal(
							window.ConfigDefinitions.modalConfig,
							pid
						);

						if (typeof currentModal.setConnectionAlive === 'function') {
							currentModal.setConnectionAlive(!!client.wsOpen);
						}
					}
				}
				const modalCreated = !hadModal && !!currentModal;

				if (!currentModal) return;

				// 2. Update Stage if origin changed or modal just created
				if (afsState.origin && (originChanged || modalCreated)) {
					if (window.ConfigDefinitions.modalConfig.stages[afsState.origin]) {
						currentModal.pushStage(afsState.origin);
					}
				}

				// 3. Push Updates (Status / ETA)
				// Trigger only when there is a change or just created modal
				if (statusChanged || pushChanged || etaChanged || modalCreated) {
					let msgKey = afsState.status;
					// Try to find translation for status message
					// Note: ConfigDefinitions.modalConfig.statusMessages values are English defaults
					// We should check if we have a translation key for this status

					// Check if status is one of our known keys
					const knownKeys = [
						'homing',
						'parking',
						'purging',
						'loading',
						'unloading',
						'temp_set',
						'heating',
						'temp_restored',
						'cooling',
						'resuming',
						'complete_idle',
						'waiting',
						'unpriming',
					];

					let msg = afsState.status;
					if (knownKeys.includes(msgKey)) {
						msg = window.I18n.t(
							`settings.config.params.statusStrings.${msgKey}.defaultValue`
						);
						// The I18n keys for statusStrings are complex, let's simplify.
						// We can reuse the statusStrings section from settings config translation
						// BUT the config translation keys are for the *description* of the setting, not the *message* itself.
						// Wait, statusStrings in config-definitions has defaultValue like '"Homing..."'
						// We should add a dedicated section for status messages in i18n.
					}

					// Fallback to config definition if no translation (or if we implement status lookup)
					// Actually, let's add a statusMessages section to i18n

					if (knownKeys.includes(msgKey)) {
						const tMsg = window.I18n.t(`modal.statusMessages.${msgKey}`);
						if (tMsg !== `modal.statusMessages.${msgKey}`) {
							msg = tMsg;
						} else {
							// Fallback to English default from config
							msg =
								window.ConfigDefinitions.modalConfig.statusMessages[
									afsState.status
								] || afsState.status;
						}
					} else {
						msg =
							window.ConfigDefinitions.modalConfig.statusMessages[afsState.status] ||
							afsState.status;
					}

					if (!msg || (typeof msg === 'string' && msg.trim() === '')) {
						if (
							currentModal &&
							typeof currentModal._finishPreviousReadout === 'function'
						) {
							currentModal._finishPreviousReadout();
						}
					} else {
						currentModal.pushUpdate(
							msg,
							afsState.eta || 0,
							afsState.ts,
							afsState.status
						);
					}
				}

				// If nothing changed and we already had a dialog, do not react further
				if (!hasChange && !modalCreated) {
					window.logger.log(
						'AFS-State',
						'No change to origin, status, push, eta or processid, not reacting'
					);
					return;
				}
			}
		}

		// Listen for WebSocket-driven AFS_STATE updates
		window.addEventListener('afs-state', (e) => updateAFSState(e.detail));
		window.addEventListener('afs-ws-status', (e) => {
			const alive = !!(e.detail && e.detail.open);
			if (currentModal && typeof currentModal.setConnectionAlive === 'function') {
				currentModal.setConnectionAlive(alive);
			}
		});

		window.addEventListener('offline', () => {
			if (currentModal && typeof currentModal.setConnectionAlive === 'function') {
				currentModal.setConnectionAlive(false);
			}
		});

		window.addEventListener('online', () => {
			if (currentModal && typeof currentModal.setConnectionAlive === 'function') {
				currentModal.setConnectionAlive(true);
			}
		});
		window.addEventListener('printer-telemetry', (e) => {
			const d = e.detail || {};
			if (d.extruder) Object.assign(window.printerTelemetry.extruder, d.extruder);
			if (d.toolhead) Object.assign(window.printerTelemetry.toolhead, d.toolhead);
		});

		let lastPrintState = '';
		window.addEventListener('print-state-change', (e) => {
			const state = e.detail ? e.detail.state : '';
			if (state === 'complete' && lastPrintState !== 'complete' && lastPrintState !== '') {
				notifier.alertPrintComplete();
			}
			lastPrintState = state;
		});

		// Expose settings opener
		window.openAFSSettings = () => {
			if (window.SettingsModal) new window.SettingsModal(client).open();
		};

		// Start functionality
		client.startAFSWebSocket();

		// Initialize logic that requires DOM/Settings
		const init = () => {
			if (window.UserSettings) {
				window.UserSettings.init()
					.then(() => {
						notifier.init();
						if (window.logger)
							window.logger.log(
								'Main',
								'UserSettings initialized',
								window.UserSettings.getAll()
							);

						if (window.I18n) window.I18n.init();

						// Check if setup is required
						const settings = window.UserSettings.getAll();
						const setupRequired = !settings.setupCompletedOn;
						if (setupRequired) {
							if (window.SettingsModal) {
								new window.SettingsModal(client).open();
							}
						}

						// Add FAB
						const createSettingsFAB = (shouldBlink) => {
							// Check if FAB already exists
							if (document.querySelector('.afs-settings-fab')) return;

							const fab = document.createElement('div');
							fab.className = 'afs-settings-fab';
							if (shouldBlink) fab.classList.add('blink');
							fab.title = 'Advanced Filament Swap Settings';

							const icon = document.createElement('img');
							icon.src = chrome.runtime.getURL('assets/icon.png');
							icon.alt = 'AFS Settings';
							fab.appendChild(icon);

							fab.onclick = () => {
								if (window.SettingsModal) {
									new window.SettingsModal(client).open();
									fab.classList.remove('blink');
								}
							};

							document.body.appendChild(fab);
						};

						createSettingsFAB(setupRequired);
					})
					.catch((error) => {
						if (window.logger)
							window.logger.error('Main', 'UserSettings init failed', error);
					});
			}

			// Checks
			client
				.isAFSIncluded()
				.then((inc) => {
					if (window.logger) window.logger.log('Main', 'AFS include present', inc);
				})
				.catch(() => {});

			client
				.checkAFSConflicts()
				.then((conflicts) => {
					if (window.logger) window.logger.log('Main', 'AFS conflicts', conflicts);
				})
				.catch(() => {});
		};

		if (document.readyState === 'loading') {
			window.addEventListener('load', init);
		} else {
			init();
		}
	});
})();
