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
						if (client.testing) {
							if (!document.querySelector('.afs-preview-border')) {
								const border = document.createElement('div');
								border.className = 'afs-preview-border';
								border.style.position = 'fixed';
								border.style.top = '0';
								border.style.left = '0';
								border.style.right = '0';
								border.style.bottom = '0';
								border.style.boxSizing = 'border-box';
								border.style.border = '4px dashed #f39c12';
								border.style.backgroundColor = '#00000055';
								border.style.pointerEvents = 'none';
								border.style.zIndex = '999';
								const label = document.createElement('div');
								label.style.position = 'absolute';
								label.style.top = '8px';
								label.style.left = '50%';
								label.style.transform = 'translateX(-50%)';
								label.style.animation =
									'afs-conn-blink-fill 0.8s infinite ease-in-out';
								label.style.color = '#000';
								label.style.fontWeight = '600';
								label.style.fontFamily = 'system-ui, sans-serif';
								label.style.padding = '6px 10px';
								label.textContent = 'AFS Preview Mode';
								border.appendChild(label);
								document.body.appendChild(border);
							}
							if (!document.querySelector('.afs-preview-fab')) {
								const fab = document.createElement('div');
								fab.className = 'afs-preview-fab';
								fab.style.position = 'fixed';
								fab.style.bottom = '24px';
								fab.style.left = '50%';
								fab.style.transform = 'translateX(-50%)';
								fab.style.zIndex = '9998';
								fab.style.display = 'flex';
								fab.style.alignItems = 'center';
								fab.style.justifyContent = 'center';
								fab.style.width = '140px';
								fab.style.height = '44px';
								fab.style.borderRadius = '22px';
								fab.style.background = '#f39c12';
								fab.style.color = '#000';
								fab.style.fontWeight = '600';
								fab.style.fontFamily = 'system-ui, sans-serif';
								fab.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
								fab.style.cursor = 'pointer';
								fab.style.userSelect = 'none';
								fab.title = 'Start Preview Swap';
								fab.textContent = 'Preview Swap';
								const wait = (ms) => new Promise((r) => setTimeout(r, ms));
								const send = (detail) => {
									window.dispatchEvent(new CustomEvent('afs-state', { detail }));
								};
								let previewPid = 0;
								let previewTs = 0;
								const step = async (origin, status, eta, delayMs) => {
									send({
										processid: previewPid,
										origin,
										status,
										eta,
										ts: previewTs,
									});
									if (delayMs > 0) await wait(delayMs);
								};
								const originalSendGcode = window.sendGcode;
								window.sendGcode = async (gcode) => {
									const cmd = String(gcode || '');
									if (!client.testing || !window.afsPreviewActive) {
										return originalSendGcode
											? originalSendGcode(gcode)
											: Promise.resolve();
									}
									if (/AFS_UNLOAD\b/.test(cmd)) {
										await step(
											'filament_swap_unloading',
											'unloading',
											18,
											18000
										);
										await step('filament_swap_loading', 'waiting', 0, 0);
										return Promise.resolve();
									}
									if (/LOAD_FILAMENT\b/.test(cmd)) {
										const purgeMatch = /PURGE\s*=\s*(\d+)/i.exec(cmd);
										if (purgeMatch) {
											const mm = parseInt(purgeMatch[1], 10) || 0;
											const eta = Math.max(0, Math.round((mm / 200) * 60));
											await step(
												'filament_swap_loading',
												'purging',
												eta,
												eta * 1000
											);
										} else {
											await step(
												'filament_swap_loading',
												'loading',
												45,
												45000
											);
										}
										await step('load_new_loaded', '', 0, 1000);
										return Promise.resolve();
									}
									if (/FINISH_SWAP\b/.test(cmd)) {
										await step('complete', 'temp_restored', 0, 2000);
										await step('complete', 'resuming', 5, 5000);
										send({
											processid: -1,
											origin: '',
											status: '',
											eta: 0,
											ts: previewTs,
										});
										window.afsPreviewActive = false;
										return Promise.resolve();
									}
									if (/AFS_SET_TARGET\b/.test(cmd)) {
										await step('filament_swap_loading', 'heating', 15, 15000);
										await step('filament_swap_loading', 'waiting', 0, 0);
										return Promise.resolve();
									}
									return Promise.resolve();
								};
								fab.onclick = async () => {
									previewPid = Date.now();
									previewTs = Math.floor(Date.now() / 1000);
									window.afsPreviewActive = true;
									await step('filament_swap_unloading', 'homing', 0, 1500);
									await step('filament_swap_unloading', 'parking', 0, 2000);
									await step('filament_swap_unloading', 'heating', 15, 15000);
									await step('filament_swap_unloading', 'unloading', 18, 18000);
									await step('filament_swap_loading', 'waiting', 0, 0);
								};
								document.body.appendChild(fab);

								//Exit Moonraker Spoofing Button
								const closeBtn = document.createElement('div');
								closeBtn.className = 'afs-preview-close';
								closeBtn.style.position = 'absolute';
								closeBtn.style.top = '12px';
								closeBtn.style.right = '12px';
								closeBtn.style.width = '50px';
								closeBtn.style.height = '50px';
								closeBtn.style.borderRadius = '50%';
								closeBtn.style.background = '#000';
								closeBtn.style.color = '#fff';
								closeBtn.style.fontWeight = '600';
								closeBtn.style.fontFamily = 'system-ui, sans-serif';
								closeBtn.style.lineHeight = '50px';
								closeBtn.style.textAlign = 'center';
								closeBtn.style.cursor = 'pointer';
								closeBtn.style.zIndex = '9999';
								closeBtn.style.userSelect = 'none';
								closeBtn.title = 'Exit Moonraker Spoofing';
								closeBtn.textContent = '×';
								document.body.appendChild(closeBtn);

								closeBtn.onclick = () => {
									const u = new URL(location.href);
									const p = u.searchParams;
									p.delete('spoof-moonraker');
									p.delete('afs_installed');
									p.delete('afs_include');
									p.delete('afs_runout_fixed');
									u.search = p.toString();
									location.href = u.toString();
								};
							}
						}
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
