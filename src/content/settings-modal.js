class SettingsModal {
	constructor(moonrakerClient) {
		this.client = moonrakerClient;
		this.elements = {};
		this.configData = {
			defaults: [],
			originStrings: [],
			statusStrings: [],
		};
		this.macroHooks = {
			pre: { selection: '', gcode: '', message: '' },
			post: { selection: '', gcode: '', message: '' },
		};
		this.fullConfigText = '';
		this.activeTab = 'summary'; // 'summary', 'config', or 'extension'
		this.state = {
			loading: true,
			conflicts: [],
			isInstalled: false,
			configExists: false,
			axisMaximums: { x: 100, y: 100, z: 100 },
			isLegacyConfig: false,
		};
		this.configDirty = false;

		this._injectStyles();
		this._createStructure();
		document.body.appendChild(this.elements.overlay);
	}

	_injectStyles() {
		if (window.StyleUtils) {
			window.StyleUtils.inject(
				'afs-settings-styles',
				'src/content/styles/settings-modal.css'
			);
		} else if (!document.getElementById('afs-settings-styles')) {
			// Fallback
			const link = document.createElement('link');
			link.id = 'afs-settings-styles';
			link.rel = 'stylesheet';
			if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
				link.href = chrome.runtime.getURL('src/content/styles/settings-modal.css');
			} else {
				link.href = 'src/content/styles/settings-modal.css';
			}
			document.head.appendChild(link);
		}
	}

	_createStructure() {
		this.elements.overlay = document.createElement('div');
		this.elements.overlay.className = 'afs-settings-overlay';

		this.elements.modal = document.createElement('div');
		this.elements.modal.className = 'afs-settings-modal';
		this.elements.overlay.appendChild(this.elements.modal);

		// Sidebar
		const sidebar = document.createElement('div');
		sidebar.className = 'afs-settings-sidebar';

		const tabSummary = document.createElement('div');
		tabSummary.className = 'afs-settings-sidebar-item active';
		tabSummary.textContent = window.I18n.t('settings.menu.status');
		tabSummary.onclick = () => this._switchTab('summary');
		this.elements.tabSummary = tabSummary;

		const tabConfig = document.createElement('div');
		tabConfig.className = 'afs-settings-sidebar-item sub-item afs-hidden';
		tabConfig.textContent = window.I18n.t('settings.menu.config');
		tabConfig.onclick = () => this._switchTab('config');
		this.elements.tabConfig = tabConfig;

		const tabBackup = document.createElement('div');
		tabBackup.className = 'afs-settings-sidebar-item';
		tabBackup.textContent = window.I18n.t('settings.menu.backup');
		tabBackup.onclick = () => this._switchTab('backup');
		this.elements.tabBackup = tabBackup;

		const tabExt = document.createElement('div');
		tabExt.className = 'afs-settings-sidebar-item';
		tabExt.textContent = window.I18n.t('settings.menu.extension');
		tabExt.onclick = () => this._switchTab('extension');
		this.elements.tabExt = tabExt;

		const tabAbout = document.createElement('div');
		tabAbout.className = 'afs-settings-sidebar-item';
		tabAbout.textContent = window.I18n.t('settings.menu.about');
		tabAbout.onclick = () => this._switchTab('about');
		this.elements.tabAbout = tabAbout;

		sidebar.appendChild(tabSummary);
		sidebar.appendChild(tabConfig);
		sidebar.appendChild(tabBackup);
		sidebar.appendChild(tabExt);
		sidebar.appendChild(tabAbout);
		this.elements.modal.appendChild(sidebar);

		// Content
		this.elements.content = document.createElement('div');
		this.elements.content.className = 'afs-settings-content';
		this.elements.modal.appendChild(this.elements.content);

		// Close Button (Top Right of Content Area)
		const closeBtn = document.createElement('button');
		closeBtn.className = 'afs-settings-close';
		closeBtn.textContent = '\u00D7'; // &times;
		closeBtn.title = window.I18n.t('settings.common.close');
		closeBtn.onclick = () => this.close();
		this.elements.modal.appendChild(closeBtn);

		// Mobile Header (Back button)
		this.elements.mobileNav = document.createElement('div');
		this.elements.mobileNav.className = 'afs-mobile-nav';
		const backBtn = document.createElement('button');
		backBtn.className = 'afs-mobile-back';

		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('width', '24');
		svg.setAttribute('height', '24');
		svg.setAttribute('viewBox', '0 0 24 24');
		svg.setAttribute('fill', 'currentColor');
		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path.setAttribute('d', 'M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z');
		svg.appendChild(path);
		backBtn.appendChild(svg);

		backBtn.onclick = () => {
			this.elements.modal.classList.remove('mobile-content-active');
		};
		this.elements.mobileNav.appendChild(backBtn);
		this.elements.content.appendChild(this.elements.mobileNav);

		// Scroll Container for content
		this.elements.scrollContainer = document.createElement('div');
		this.elements.scrollContainer.className = 'afs-settings-scroll-container';
		this.elements.content.appendChild(this.elements.scrollContainer);

		// Close via overlay click
		this.elements.overlay.addEventListener('click', (e) => {
			if (e.target === this.elements.overlay) {
				this._triggerShake();
			}
		});
	}

	_triggerShake() {
		if (!this.elements.modal) return;
		// Remove class to restart animation if already present
		this.elements.modal.classList.remove('shake');
		// Force reflow
		void this.elements.modal.offsetWidth;
		this.elements.modal.classList.add('shake');

		const onEnd = () => {
			this.elements.modal.classList.remove('shake');
			this.elements.modal.removeEventListener('animationend', onEnd);
		};
		this.elements.modal.addEventListener('animationend', onEnd);
	}

	_updateSidebarText() {
		if (this.elements.tabSummary)
			this.elements.tabSummary.textContent = window.I18n.t('settings.menu.status');
		if (this.elements.tabConfig)
			this.elements.tabConfig.textContent = window.I18n.t('settings.menu.config');
		if (this.elements.tabBackup)
			this.elements.tabBackup.textContent = window.I18n.t('settings.menu.backup');
		if (this.elements.tabExt)
			this.elements.tabExt.textContent = window.I18n.t('settings.menu.extension');
		if (this.elements.tabAbout)
			this.elements.tabAbout.textContent = window.I18n.t('settings.menu.about');

		const closeBtn = this.elements.modal.querySelector('.afs-settings-close');
		if (closeBtn) closeBtn.title = window.I18n.t('settings.common.close');
	}

	_createIcon(name) {
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('width', '20');
		svg.setAttribute('height', '20');
		svg.setAttribute('viewBox', '0 0 24 24');
		svg.setAttribute('fill', 'none');
		svg.setAttribute('stroke', 'currentColor');
		svg.setAttribute('stroke-width', '2');
		svg.setAttribute('stroke-linecap', 'round');
		svg.setAttribute('stroke-linejoin', 'round');
		if (name === 'install') {
			const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			p1.setAttribute('d', 'M12 5v10');
			svg.appendChild(p1);
			const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
			p2.setAttribute('points', '8 11 12 15 16 11');
			svg.appendChild(p2);
			const p3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			p3.setAttribute('d', 'M5 19h14');
			svg.appendChild(p3);
		} else if (name === 'upgrade') {
			const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			c.setAttribute('cx', '12');
			c.setAttribute('cy', '12');
			c.setAttribute('r', '9');
			svg.appendChild(c);
			const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			p1.setAttribute('d', 'M12 16V8');
			svg.appendChild(p1);
			const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
			p2.setAttribute('points', '8 12 12 8 16 12');
			svg.appendChild(p2);
		} else if (name === 'advanced') {
			const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			p1.setAttribute('x1', '4');
			p1.setAttribute('y1', '6');
			p1.setAttribute('x2', '20');
			p1.setAttribute('y2', '6');
			svg.appendChild(p1);
			const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			p2.setAttribute('cx', '8');
			p2.setAttribute('cy', '6');
			p2.setAttribute('r', '2');
			svg.appendChild(p2);
			const p3 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			p3.setAttribute('x1', '4');
			p3.setAttribute('y1', '12');
			p3.setAttribute('x2', '20');
			p3.setAttribute('y2', '12');
			svg.appendChild(p3);
			const p4 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			p4.setAttribute('cx', '16');
			p4.setAttribute('cy', '12');
			p4.setAttribute('r', '2');
			svg.appendChild(p4);
			const p5 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			p5.setAttribute('x1', '4');
			p5.setAttribute('y1', '18');
			p5.setAttribute('x2', '20');
			p5.setAttribute('y2', '18');
			svg.appendChild(p5);
			const p6 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			p6.setAttribute('cx', '10');
			p6.setAttribute('cy', '18');
			p6.setAttribute('r', '2');
			svg.appendChild(p6);
		} else if (name === 'backup') {
			const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			p1.setAttribute('d', 'M12 5v10');
			svg.appendChild(p1);
			const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
			p2.setAttribute('points', '8 11 12 15 16 11');
			svg.appendChild(p2);
			const p3 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
			p3.setAttribute('x', '5');
			p3.setAttribute('y', '17');
			p3.setAttribute('width', '14');
			p3.setAttribute('height', '2');
			svg.appendChild(p3);
		} else if (name === 'uninstall') {
			const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
			p1.setAttribute('points', '3 6 5 6 21 6');
			svg.appendChild(p1);
			const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			p2.setAttribute('d', 'M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6');
			svg.appendChild(p2);
			const p3 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			p3.setAttribute('x1', '10');
			p3.setAttribute('y1', '11');
			p3.setAttribute('x2', '10');
			p3.setAttribute('y2', '17');
			svg.appendChild(p3);
			const p4 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			p4.setAttribute('x1', '14');
			p4.setAttribute('y1', '11');
			p4.setAttribute('x2', '14');
			p4.setAttribute('y2', '17');
			svg.appendChild(p4);
		}
		return svg;
	}

	_switchTab(tab) {
		// Check for dirty config if leaving 'config' tab
		if (this.activeTab === 'config' && tab !== 'config' && this.configDirty) {
			if (!confirm(window.I18n.t('settings.common.unsaved_warning'))) {
				return;
			}
			this.configDirty = false; // User accepted loss
			this._loadSmartData(); // Reload to reset state
		}

		this.activeTab = tab;

		if (this.elements.tabSummary)
			this.elements.tabSummary.classList.toggle('active', tab === 'summary');

		// Only show config tab if it is active
		const isConfig = tab === 'config';
		const isBackup = tab === 'backup';

		if (isConfig) {
			this.elements.tabConfig.classList.remove('afs-hidden');
		} else {
			this.elements.tabConfig.classList.add('afs-hidden');
		}
		this.elements.tabConfig.classList.toggle('active', isConfig);

		this.elements.tabBackup.classList.toggle('active', isBackup);

		this.elements.tabExt.classList.toggle('active', tab === 'extension');
		this.elements.tabAbout.classList.toggle('active', tab === 'about');

		// On mobile, switch to content view
		this.elements.modal.classList.add('mobile-content-active');

		if (this.elements.scrollContainer) this.elements.scrollContainer.scrollTop = 0;
		this.render();
	}

	open() {
		this.elements.overlay.classList.add('visible');
		this._loadSmartData();
	}

	close() {
		if (this.activeTab === 'config' && this.configDirty) {
			if (!confirm(window.I18n.t('settings.common.unsaved_warning'))) {
				return;
			}
			this.configDirty = false;
		}
		this.elements.overlay.classList.remove('visible');
	}

	async _loadSmartData() {
		this.elements.scrollContainer.textContent = '';
		const loader = document.createElement('div');
		loader.className = 'afs-loader';
		loader.textContent = window.I18n.t('settings.common.loading');
		this.elements.scrollContainer.appendChild(loader);

		try {
			// Reset defaults from schema to ensure clean state
			// Initialize all sections with localized defaults if available
			['defaults', 'originStrings', 'statusStrings'].forEach((section) => {
				this.configData[section] = window.ConfigDefinitions[section].map((def) => {
					let val = def.defaultValue;
					// Try localized default (for strings)
					if (section !== 'defaults') {
						// 'defaults' section contains numeric settings, strings are in other sections
						const i18nKey = `settings.config.${section}.${def.key}.defaultValue`;
						const tVal = window.I18n.t(i18nKey);
						if (tVal !== i18nKey) val = tVal;
					}
					return { key: def.key, value: val };
				});
			});

			// Fetch bundled template URL
			const templateUrl =
				typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL
					? chrome.runtime.getURL('assets/adv_filament_swap.cfg')
					: 'assets/adv_filament_swap.cfg';

			const snapshot = await this.client.getConfigSnapshot();
			const [templateText, axisMax, macros] = await Promise.all([
				fetch(templateUrl)
					.then((r) => r.text())
					.catch(() => ''),
				this.client.getAxisMaximums(),
				this.client.getGcodeMacros(),
			]);

			// If printer has config, parse it to update defaults
			if (snapshot.advConfigText) {
				this._parseConfig(snapshot.advConfigText, macros);
			}

			// Always use the bundled template as the base for saving
			// This ensures we override the printer's file with the latest version
			// while preserving the settings we just parsed.
			this.fullConfigText = templateText;

			const bundledCfgVersion =
				window.ConfigParser && typeof window.ConfigParser.extractVersion === 'function'
					? window.ConfigParser.extractVersion(templateText)
					: '';
			const installedCfgVersion =
				window.ConfigParser && typeof window.ConfigParser.extractVersion === 'function'
					? window.ConfigParser.extractVersion(snapshot.advConfigText || '')
					: '';
			const isOutdatedCfg =
				!!installedCfgVersion &&
				!!bundledCfgVersion &&
				this._compareSemver(installedCfgVersion, bundledCfgVersion) < 0;

			const isLegacyConfig = snapshot.isLegacyConfig;

			this.state = {
				loading: false,
				isInstalled: snapshot.hasAFSInclude,
				configExists: snapshot.advConfigExists,
				conflicts: snapshot.conflicts || [],
				axisMaximums: axisMax,
				macros: macros.sort(),
				isLegacyConfig,
				bundledCfgVersion,
				installedCfgVersion,
				isOutdatedCfg,
			};

			this.snapshot = snapshot;

			this.render();
		} catch (err) {
			this.elements.scrollContainer.textContent = '';
			const errorDiv = document.createElement('div');
			errorDiv.className = 'afs-error';
			errorDiv.textContent = window.I18n.t('settings.common.failed_load', {
				err: err.message,
			});
			this.elements.scrollContainer.appendChild(errorDiv);
		}
	}

	_compareSemver(a, b) {
		const pa = String(a || '')
			.trim()
			.split('.')
			.map((n) => parseInt(n, 10));
		const pb = String(b || '')
			.trim()
			.split('.')
			.map((n) => parseInt(n, 10));
		for (let i = 0; i < 3; i++) {
			const av = pa[i] || 0;
			const bv = pb[i] || 0;
			if (av < bv) return -1;
			if (av > bv) return 1;
		}
		return 0;
	}

	_parseConfig(text, macros = []) {
		// Delegate to utility
		if (window.ConfigParser) {
			const parsed = window.ConfigParser.parse(text, window.ConfigDefinitions);

			// Merge parsed data into initialized configData
			// This allows us to respect Localized Defaults if the file contains English Defaults
			['defaults', 'originStrings', 'statusStrings'].forEach((section) => {
				if (!parsed[section]) return;

				parsed[section].forEach((pItem) => {
					const currentItem = this.configData[section].find((i) => i.key === pItem.key);
					if (currentItem) {
						// If it's a string setting (origin/status), check if we should keep the localized default
						if (section !== 'defaults') {
							const def = window.ConfigDefinitions[section].find(
								(d) => d.key === pItem.key
							);
							const englishDefault = def ? def.defaultValue : null;

							// If the file value matches the English default exactly,
							// we prefer our currentItem.value (which is the Localized Default we set in _loadSmartData)
							// Otherwise, the user has customized it (or it's already localized), so we use the file value.
							if (englishDefault && pItem.value.trim() === englishDefault.trim()) {
								// Keep currentItem.value (Localized Default)
								return;
							}
						}

						// Otherwise overwrite with file value
						currentItem.value = pItem.value;
					}
				});
			});
		} else {
			if (window.logger) window.logger.error('SettingsModal', 'ConfigParser not loaded');
			return;
		}

		// Reset Hooks
		this.macroHooks = {
			pre: { selection: '', gcode: '', message: '' },
			post: { selection: '', gcode: '', message: '' },
		};

		// Parse Pre-Swap
		const preBody = window.ConfigParser.getMacroGcode(text, 'AFS_PRE_SWAP');
		if (preBody !== null) {
			this._parseHookBody(preBody, 'pre', macros);
		}

		// Parse Post-Swap
		const postBody = window.ConfigParser.getMacroGcode(text, 'AFS_POST_SWAP');
		if (postBody !== null) {
			this._parseHookBody(postBody, 'post', macros);
		}
	}

	_parseHookBody(content, type, macros) {
		if (!content) return;

		// Extract Message
		// Regex to find AFS_PUSH with TYPE=0 and STATUS="...", allowing for other params in between
		// Anchored to start (^) to ensure we only catch the header message and not manual ones later
		const msgMatch = /^AFS_PUSH TYPE=0(?: .*)? STATUS="([^"]+)"/.exec(content);
		if (msgMatch) {
			this.macroHooks[type].message = msgMatch[1];
			// Remove the message line
			content = content.replace(/^AFS_PUSH TYPE=0(?: .*)? STATUS="[^"]+"\s*\n?/, '');
			// Remove associated wait command if present (G4 P2000 ; MSG_WAIT)
			content = content.replace(/^G4 P2000 ; MSG_WAIT\s*\n?/, '');
		}

		content = content.trim();

		// If content is empty after removing message, it means no action selected
		if (!content) {
			this.macroHooks[type].selection = '';
			this.macroHooks[type].gcode = '';
			return;
		}

		// Check if it matches a known macro (exact match)
		if (macros.includes(content)) {
			this.macroHooks[type].selection = content;
		} else {
			this.macroHooks[type].selection = 'custom_gcode';
			this.macroHooks[type].gcode = content;
		}
	}

	render() {
		this.elements.scrollContainer.textContent = '';

		if (this.activeTab === 'summary') {
			this._renderSummaryTab();
		} else if (this.activeTab === 'config') {
			this._renderConfigTab();
		} else if (this.activeTab === 'backup') {
			this._renderBackupTab();
		} else if (this.activeTab === 'extension') {
			this._renderExtensionTab();
		} else {
			this._renderAboutTab();
		}
	}

	async _uninstallConfig() {
		const cfg = {
			stages: {
				uninstall_confirm: {
					title: window.I18n.t('settings.status.uninstall_confirm_title'),
					timelineLabel: window.I18n.t('settings.status.timelineConfirm'),
					upcomingStages: [
						window.I18n.t('settings.status.timelineApply'),
						window.I18n.t('settings.status.timelineComplete'),
					],
					description: window.I18n.t('settings.status.uninstall_confirm_desc'),
					macros: [],
					actionItems: [],
					actionGroups: [],
					colorScheme: '#e53935',
				},
				apply: {
					title: window.I18n.t('settings.status.applyingUninstallTitle'),
					timelineLabel: window.I18n.t('settings.status.timelineApply'),
					upcomingStages: [window.I18n.t('settings.status.timelineComplete')],
					description: window.I18n.t('settings.status.applyingUninstallDesc'),
					macros: [],
					colorScheme: '#e53935',
				},
				success: {
					title: window.I18n.t('settings.status.uninstall_success_title'),
					timelineLabel: window.I18n.t('settings.status.timelineComplete'),
					upcomingStages: [],
					description: window.I18n.t('settings.status.uninstall_success_desc'),
					macros: [],
					colorScheme: '#4caf50',
				},
			},
		};
		const backupFiles =
			this.snapshot && Array.isArray(this.snapshot.runoutBackups)
				? this.snapshot.runoutBackups
				: [];
		const groupsUninstall = [];
		const removeItems = [
			{
				text: window.I18n.t('modal.items.remove_include'),
				file: 'printer.cfg',
				code: '[include adv_filament_swap.cfg]',
			},
		];
		if (this.state && this.state.configExists) {
			removeItems.push({
				text: window.I18n.t('modal.items.delete_cfg_optional'),
				file: 'adv_filament_swap.cfg',
			});
		}
		groupsUninstall.push({ header: window.I18n.t('modal.groups.remove'), items: removeItems });
		if (backupFiles.length > 0) {
			const items = backupFiles.map((f) => {
				let codeSample = '';
				try {
					const ftxt = this.snapshot.files.get(f) || '';
					const block = this.client.getSectionBlock(
						ftxt,
						'filament_switch_sensor runout'
					);
					const bm = /^(\s*)#\s*AFS_BACKUP\s+runout_gcode\s*:(.*)$/m.exec(block || '');
					const orig = bm ? String(bm[2] || '').trim() : '';
					codeSample = `[filament_switch_sensor runout]\nrunout_gcode: ${orig}`;
				} catch (e) {}
				return {
					text: window.I18n.t('modal.items.restore_runout'),
					file: f,
					code: codeSample,
				};
			});
			groupsUninstall.push({ header: window.I18n.t('modal.groups.fix'), items });
		}
		groupsUninstall.push({
			header: window.I18n.t('modal.groups.restart'),
			items: [{ text: window.I18n.t('modal.items.restart_klipper') }],
		});
		cfg.stages.uninstall_confirm.actionGroups = groupsUninstall;
		const modal = new window.FilamentSwapModal(cfg, Date.now());
		const wait = (ms) => new Promise((r) => setTimeout(r, ms));
		let deleteCfg = false;
		const run = async () => {
			modal.pushStage('apply');
			modal.pushUpdate(window.I18n.t('modal.log.validating_uninstall'), 5);
			await wait(5000);
			try {
				modal.pushUpdate(window.I18n.t('modal.log.remove_include'), 5);
				const needRestorePrinter =
					this.snapshot && Array.isArray(this.snapshot.runoutBackups)
						? this.snapshot.runoutBackups.indexOf('printer.cfg') !== -1
						: false;
				const resUninstall = await this.client.updatePrinterCfg(this.snapshot, {
					removeInclude: true,
					restoreRunout: needRestorePrinter,
				});
				if (resUninstall.includeRemoved) {
					modal.pushUpdate(window.I18n.t('modal.log.include_removed'), 0);
				}
				if (resUninstall.runoutRestored) {
					try {
						const verifyText = await this.client.readPrinterConfigRaw();
						const block = this.client.getSectionBlock(
							verifyText,
							'filament_switch_sensor runout'
						);
						const hasBackup = /(^|\n)\s*#\s*AFS_BACKUP\s+runout_gcode\s*:/.test(
							block || ''
						);
						const runoutLine = /(^|\n)\s*runout_gcode\s*:\s*[^\s]+\s*(\n|$)/.test(
							block || ''
						);
						if (runoutLine && !hasBackup) {
							modal.pushUpdate(window.I18n.t('modal.log.runout_fixed'), 0);
						} else {
							modal.pushUpdate(
								window.I18n.t('modal.log.runout_restore_verify_failed'),
								1
							);
						}
					} catch (e) {
						modal.pushUpdate(
							window.I18n.t('modal.log.runout_restore_verify_failed'),
							1
						);
					}
				}
			} catch (e) {}
			if (
				this.snapshot &&
				Array.isArray(this.snapshot.runoutBackups) &&
				this.snapshot.runoutBackups.filter((f) => f !== 'printer.cfg').length > 0
			) {
				modal.pushUpdate(window.I18n.t('modal.log.restore_runout'), 5);
				await wait(5000);
				try {
					const restored = await this.client.restoreRunoutSensors(this.snapshot, [
						'printer.cfg',
					]);
					if (restored) {
						try {
							const nonPrinter = this.snapshot.runoutBackups.filter(
								(f) => f !== 'printer.cfg'
							);
							const f = nonPrinter[0];
							const verifyText =
								f === 'printer.cfg'
									? await this.client.readPrinterConfigRaw()
									: await this.client.readConfigFile(f);
							const block = this.client.getSectionBlock(
								verifyText,
								'filament_switch_sensor runout'
							);
							const hasBackup = /(^|\n)\s*#\s*AFS_BACKUP\s+runout_gcode\s*:/.test(
								block || ''
							);
							const runoutLine = /(^|\n)\s*runout_gcode\s*:\s*[^\s]+\s*(\n|$)/.test(
								block || ''
							);
							if (runoutLine && !hasBackup) {
								modal.pushUpdate(window.I18n.t('modal.log.runout_fixed'), 0);
							} else {
								modal.pushUpdate(
									window.I18n.t('modal.log.runout_restore_verify_failed'),
									1
								);
							}
						} catch (e) {
							modal.pushUpdate(
								window.I18n.t('modal.log.runout_restore_verify_failed'),
								1
							);
						}
					}
				} catch (e) {}
			}
			if (deleteCfg) {
				modal.pushUpdate(window.I18n.t('modal.log.deleting_cfg'), 5);
				await wait(5000);
				try {
					const okDel = await this.client.deleteConfigFile('adv_filament_swap.cfg');
					if (okDel) {
						modal.pushUpdate(window.I18n.t('modal.log.cfg_deleted'), 0);
					} else {
						modal.pushUpdate(window.I18n.t('modal.log.cfg_delete_failed'), 1);
					}
				} catch (e) {}
			}
			modal.pushUpdate(window.I18n.t('modal.log.restarting'), 5);
			await wait(5000);
			try {
				await this.client.restartFirmware();
				modal.pushUpdate(window.I18n.t('modal.log.reconnecting'), 0);
			} catch (e) {}
			const successStage = cfg.stages.success;
			successStage.macros = [
				{
					label: window.I18n.t('settings.common.refresh_page'),
					primary: true,
					icon: 'refresh',
					callback: () => {
						location.reload();
					},
				},
				{
					label: window.I18n.t('settings.common.close'),
					icon: 'close',
					callback: () => {
						modal.close();
					},
				},
			];
			modal.pushStage('success');
			modal.pushUpdate(window.I18n.t('modal.log.uninstall_success'), 0);
		};
		const confirmStage = cfg.stages.uninstall_confirm;
		confirmStage.macros = [
			{
				label: window.I18n.t('settings.common.cancel'),
				callback: () => {
					modal.close();
				},
			},
			{
				label: window.I18n.t('settings.common.uninstall'),
				primary: true,
				callback: async () => {
					let blocked = false;
					try {
						blocked = await this.client.isPrintActive();
					} catch (e) {}
					if (blocked) {
						cfg.stages.blocked = {
							title: window.I18n.t('settings.status.uninstall_blocked_title'),
							timelineLabel: 'Confirm',
							previousStages: ['Confirm'],
							upcomingStages: [],
							description: window.I18n.t('settings.status.uninstall_blocked_desc'),
							macros: [
								{
									label: window.I18n.t('settings.common.close'),
									callback: () => modal.close(),
								},
							],
							colorScheme: '#e53935',
						};
						modal.pushStage('blocked');
						return;
					}
					run();
				},
			},
			{
				label: window.I18n.t('settings.common.uninstall_delete_file'),
				primary: true,
				callback: async () => {
					let blocked = false;
					try {
						blocked = await this.client.isPrintActive();
					} catch (e) {}
					if (blocked) {
						cfg.stages.blocked = {
							title: window.I18n.t('settings.status.uninstall_blocked_title'),
							timelineLabel: 'Confirm',
							previousStages: ['Confirm'],
							upcomingStages: [],
							description: window.I18n.t('settings.status.uninstall_blocked_desc'),
							macros: [
								{
									label: window.I18n.t('settings.common.close'),
									callback: () => modal.close(),
								},
							],
							colorScheme: '#e53935',
						};
						modal.pushStage('blocked');
						return;
					}
					deleteCfg = true;
					run();
				},
			},
		];
		modal.pushStage('uninstall_confirm');
	}

	_renderSummaryTab() {
		const container = this.elements.scrollContainer;
		const {
			isInstalled,
			configExists,
			conflicts,
			isLegacyConfig,
			isOutdatedCfg,
			installedCfgVersion,
			bundledCfgVersion,
		} = this.state;

		const header = document.createElement('div');
		header.className = 'afs-settings-header';
		const title = document.createElement('h2');
		title.className = 'afs-settings-title';
		title.textContent = window.I18n.t('settings.status.title');
		header.appendChild(title);
		container.appendChild(header);

		// 1. Status Grid
		const statusGrid = document.createElement('div');
		statusGrid.className = 'afs-status-list';

		// Check Logic
		const hasAFS = configExists && !isLegacyConfig;
		const isIncluded = isInstalled;
		const isRunoutConfigured =
			!conflicts.some((c) => c.isRunoutSensor) &&
			!conflicts.some((c) => c.name === 'filament_switch_sensor runout' && !c.isRunoutSensor); // If it exists and is not a conflict, it's good? No, we need to know if it exists at all.

		const runoutConflict = conflicts.find((c) => c.isRunoutSensor);
		const runoutStatus = runoutConflict ? 'error' : 'success';

		// If setupCompletedOn is blank but we detect a valid install (no fixes needed), set it now.
		const setupCompletedOn = window.UserSettings.get('setupCompletedOn');
		const isValidInstall = hasAFS && isIncluded && !runoutConflict;
		if (!setupCompletedOn && isValidInstall) {
			const date = new Date().toISOString();
			window.UserSettings.set('setupCompletedOn', date);
		}

		// Macros status: check if overrides exist (informational/warning) or missing macros?

		// Container for details
		const detailsContainer = document.createElement('div');
		detailsContainer.className = 'afs-status-details hidden';

		let activeStatusItem = null;
		let detailsLocked = false;

		const hideDetails = () => {
			detailsContainer.classList.add('hidden');
			activeStatusItem = null;
			Array.from(statusGrid.children).forEach((c) => c.classList.remove('active'));
		};

		statusGrid.onmouseleave = () => {
			if (!detailsLocked && !detailsContainer.matches(':hover')) {
				hideDetails();
			}
		};

		detailsContainer.onmouseleave = () => {
			if (!detailsLocked) {
				hideDetails();
			}
		};

		const showDetails = (type, data, force = false) => {
			if (!force && detailsLocked && activeStatusItem !== type) {
				return;
			}
			if (activeStatusItem === type) {
				return;
			}

			activeStatusItem = type;
			detailsContainer.innerHTML = '';
			detailsContainer.classList.remove('hidden');

			// Update active state
			Array.from(statusGrid.children).forEach((c) => {
				c.classList.toggle('active', c.dataset.type === type);
			});

			const title = document.createElement('h4');
			const iconWrap = document.createElement('div');
			const itemEl = Array.from(statusGrid.children).find((c) => c.dataset.type === type);
			iconWrap.className =
				'afs-status-type-icon' +
				(itemEl && itemEl.classList.contains('success')
					? ' success'
					: itemEl && itemEl.classList.contains('warning')
					? ' warning'
					: itemEl && itemEl.classList.contains('error')
					? ' error'
					: itemEl && itemEl.classList.contains('info')
					? ' info'
					: '');
			const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			svg.setAttribute('width', '20');
			svg.setAttribute('height', '20');
			svg.setAttribute('viewBox', '0 0 24 24');
			svg.setAttribute('fill', 'none');
			svg.setAttribute('stroke', 'currentColor');
			svg.setAttribute('stroke-width', '2');
			svg.setAttribute('stroke-linecap', 'round');
			svg.setAttribute('stroke-linejoin', 'round');
			if (type === 'afs') {
				const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
				p1.setAttribute('d', 'M8 7h8l-3-3');
				svg.appendChild(p1);
				const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
				p2.setAttribute('d', 'M16 17H8l3 3');
				svg.appendChild(p2);
				const p3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
				p3.setAttribute('d', 'M7 12h10');
				svg.appendChild(p3);
			} else if (type === 'include') {
				const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
				p1.setAttribute('d', 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z');
				svg.appendChild(p1);
				const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
				p2.setAttribute('d', 'M14 2v6h6');
				svg.appendChild(p2);
			} else if (type === 'runout') {
				const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
				p1.setAttribute('d', 'M12 5l9 15H3z');
				svg.appendChild(p1);
				const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
				p2.setAttribute('x1', '12');
				p2.setAttribute('y1', '10');
				p2.setAttribute('x2', '12');
				p2.setAttribute('y2', '15');
				svg.appendChild(p2);
				const p3 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
				p3.setAttribute('cx', '12');
				p3.setAttribute('cy', '18');
				p3.setAttribute('r', '1');
				svg.appendChild(p3);
			} else {
				const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
				p1.setAttribute('points', '8 9 5 12 8 15');
				svg.appendChild(p1);
				const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
				p2.setAttribute('points', '16 9 19 12 16 15');
				svg.appendChild(p2);
				const p3 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
				p3.setAttribute('x1', '11');
				p3.setAttribute('y1', '9');
				p3.setAttribute('x2', '13');
				p3.setAttribute('y2', '15');
				svg.appendChild(p3);
			}
			iconWrap.appendChild(svg);
			title.appendChild(iconWrap);
			const titleText = document.createTextNode(data.title);
			title.appendChild(titleText);
			detailsContainer.appendChild(title);

			if (data.description) {
				const p = document.createElement('p');
				p.textContent = data.description;
				detailsContainer.appendChild(p);
			}

			if (data.items && data.items.length > 0) {
				const list = document.createElement('ul');
				list.className = 'afs-detail-list';
				data.items.forEach((item) => {
					const li = document.createElement('li');
					const strong = document.createElement('strong');
					strong.textContent = item.name;
					const span = document.createElement('span');
					span.textContent = item.value;
					li.appendChild(strong);
					li.appendChild(span);
					list.appendChild(li);
				});
				detailsContainer.appendChild(list);
			}

			let footerText = null;
			let footerLevel = 'info';
			if (type === 'afs') {
				if (!configExists) {
					footerText = window.I18n.t('settings.status.footer_afs_install');
					footerLevel = 'error';
				} else if (isLegacyConfig) {
					footerText = window.I18n.t('settings.status.footer_afs_legacy');
					footerLevel = 'warning';
				} else if (isOutdatedCfg) {
					footerText = `Update recommended: installed ${installedCfgVersion}, latest ${bundledCfgVersion}`;
					footerLevel = 'warning';
				}
			} else if (type === 'include') {
				if (!isIncluded) {
					footerText = window.I18n.t('settings.status.footer_include_missing');
					footerLevel = 'error';
				}
			} else if (type === 'runout') {
				if (runoutConflict) {
					footerText = window.I18n.t('settings.status.footer_runout_fix');
					footerLevel = 'error';
				}
			} else if (type === 'macros') {
				if (overrides && overrides.length > 0) {
					footerText = window.I18n.t('settings.status.footer_macros_ok');
					footerLevel = 'info';
				}
			}

			if (footerText) {
				const foot = document.createElement('div');
				foot.className = 'afs-details-footer ' + footerLevel;
				foot.textContent = footerText;
				detailsContainer.appendChild(foot);
			}
		};

		const createStatusItem = (type, label, status, subText, detailsData) => {
			const item = document.createElement('div');
			item.className = `afs-status-row ${status}`;
			item.dataset.type = type;
			item.title = `${label} — ${subText}`;

			const iconWrap = document.createElement('div');
			iconWrap.className = 'afs-status-type-icon';
			const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			svg.setAttribute('width', '20');
			svg.setAttribute('height', '20');
			svg.setAttribute('viewBox', '0 0 24 24');
			svg.setAttribute('fill', 'none');
			svg.setAttribute('stroke', 'currentColor');
			svg.setAttribute('stroke-width', '2');
			svg.setAttribute('stroke-linecap', 'round');
			svg.setAttribute('stroke-linejoin', 'round');
			if (type === 'afs') {
				const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
				p1.setAttribute('d', 'M8 7h8l-3-3');
				svg.appendChild(p1);
				const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
				p2.setAttribute('d', 'M16 17H8l3 3');
				svg.appendChild(p2);
				const p3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
				p3.setAttribute('d', 'M7 12h10');
				svg.appendChild(p3);
			} else if (type === 'include') {
				const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
				p1.setAttribute('d', 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z');
				svg.appendChild(p1);
				const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
				p2.setAttribute('d', 'M14 2v6h6');
				svg.appendChild(p2);
			} else if (type === 'runout') {
				const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
				p1.setAttribute('d', 'M12 5l9 15H3z');
				svg.appendChild(p1);
				const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
				p2.setAttribute('x1', '12');
				p2.setAttribute('y1', '10');
				p2.setAttribute('x2', '12');
				p2.setAttribute('y2', '15');
				svg.appendChild(p2);
				const p3 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
				p3.setAttribute('cx', '12');
				p3.setAttribute('cy', '18');
				p3.setAttribute('r', '1');
				svg.appendChild(p3);
			} else {
				const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
				p1.setAttribute('points', '8 9 5 12 8 15');
				svg.appendChild(p1);
				const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
				p2.setAttribute('points', '16 9 19 12 16 15');
				svg.appendChild(p2);
				const p3 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
				p3.setAttribute('x1', '11');
				p3.setAttribute('y1', '9');
				p3.setAttribute('x2', '13');
				p3.setAttribute('y2', '15');
				svg.appendChild(p3);
			}
			iconWrap.appendChild(svg);

			const badge = document.createElement('div');
			badge.className = 'afs-status-badge';
			badge.textContent =
				status === 'success'
					? '✔'
					: status === 'warning'
					? '!'
					: status === 'info'
					? 'ℹ'
					: '✕';

			const textDiv = document.createElement('div');
			textDiv.className = 'afs-status-text';

			const labelSpan = document.createElement('div');
			labelSpan.className = 'afs-status-label';
			labelSpan.textContent = label;

			const subSpan = document.createElement('div');
			subSpan.className = 'afs-status-sub';
			subSpan.textContent = subText;

			textDiv.appendChild(labelSpan);
			textDiv.appendChild(subSpan);

			item.appendChild(iconWrap);
			item.appendChild(textDiv);
			item.appendChild(badge);

			// Interaction
			item.onmouseenter = () => {
				if (detailsLocked) return;
				showDetails(type, detailsData, false);
			};

			item.onclick = () => {
				if (activeStatusItem === type) {
					detailsLocked = !detailsLocked;
					return;
				}
				showDetails(type, detailsData, true);
				detailsLocked = true;
			};

			return item;
		};

		// Data for details
		const afsDetails = {
			title: 'Advanced Filament Swap Status',
			description: isLegacyConfig
				? window.I18n.t('settings.status.legacy_msg')
				: hasAFS
				? isOutdatedCfg
					? `Configuration is outdated (installed ${installedCfgVersion}, latest ${bundledCfgVersion}).`
					: window.I18n.t('settings.status.installed_msg')
				: window.I18n.t('settings.status.not_installed_msg'),
			items: [],
		};
		if (hasAFS) {
			afsDetails.items.push({ name: 'Installed cfg', value: installedCfgVersion || '-' });
			afsDetails.items.push({ name: 'Bundled cfg', value: bundledCfgVersion || '-' });
		}

		const includeDetails = {
			title: 'Configuration Include Status',
			description: isIncluded
				? window.I18n.t('settings.status.installed_msg')
				: window.I18n.t('settings.status.incomplete_msg'),
			items: [],
		};

		const modifications = conflicts.filter((c) => c.isRunoutSensor);
		const runoutDetails = {
			title: 'Runout Sensor Configuration',
			description:
				modifications.length > 0
					? window.I18n.t('settings.status.conflicts_modify_msg')
					: window.I18n.t('settings.status.no_runout_conflicts'),
			items: modifications.map((c) => ({
				name: c.name,
				value: window.I18n.t('settings.status.in_file', { file: c.file }),
			})),
		};

		const overrides = conflicts.filter((c) => !c.isRunoutSensor);
		const macroDetails = {
			title: window.I18n.t('settings.status.macro_integration_title'),
			description:
				overrides.length > 0
					? window.I18n.t('settings.status.conflicts_override_msg')
					: window.I18n.t('settings.status.footer_macros_ok'),
			items: overrides.map((c) => ({
				name: c.name,
				value: window.I18n.t('settings.status.in_file', { file: c.file }),
			})),
		};
		const macrosStatus = overrides.length > 0 ? 'info' : 'success';

		// AFS Status
		let afsStatus = 'error';
		let afsSub = window.I18n.t('settings.status.not_installed');
		if (hasAFS) {
			if (isOutdatedCfg) {
				afsStatus = 'warning';
				afsSub = `Outdated (${installedCfgVersion} → ${bundledCfgVersion})`;
			} else {
				afsStatus = 'success';
				afsSub = window.I18n.t('settings.status.installed');
			}
		} else if (isLegacyConfig) {
			afsStatus = 'warning';
			afsSub = window.I18n.t('settings.status.legacy');
		}

		statusGrid.appendChild(
			createStatusItem(
				'afs',
				window.I18n.t('settings.status.afs_title'),
				afsStatus,
				afsSub,
				afsDetails
			)
		);

		// Include Status
		const incStatus = isIncluded ? 'success' : 'error';
		const incSub = isIncluded
			? window.I18n.t('settings.status.installed')
			: window.I18n.t('settings.status.incomplete');
		statusGrid.appendChild(
			createStatusItem(
				'include',
				window.I18n.t('settings.status.include_title'),
				incStatus,
				incSub,
				includeDetails
			)
		);

		// Runout Sensor
		const rSub = runoutConflict
			? window.I18n.t('settings.status.invalid_config')
			: window.I18n.t('settings.status.ok');
		statusGrid.appendChild(
			createStatusItem(
				'runout',
				window.I18n.t('settings.status.runout_title'),
				runoutStatus,
				rSub,
				runoutDetails
			)
		);

		// Macros
		statusGrid.appendChild(
			createStatusItem(
				'macros',
				window.I18n.t('settings.status.macros_title'),
				macrosStatus,
				window.I18n.t('settings.status.ok'),
				macroDetails
			)
		);

		container.appendChild(statusGrid);
		container.appendChild(detailsContainer);

		// 3. Config Summary (ReadOnly)
		const summaryCard = document.createElement('div');
		summaryCard.className = 'afs-status-card info';

		const summaryContent = document.createElement('div');
		summaryContent.className = 'afs-status-content';
		const summaryTitle = document.createElement('h3');
		summaryTitle.textContent = window.I18n.t('settings.status.summary_title');
		summaryContent.appendChild(summaryTitle);

		// Prioritize main config items
		const priorityKeys = [
			'default_temp',
			'load_new',
			'unload',
			'park_x',
			'park_y',
			'park_z',
			'timeout',
		];

		const mainItemsContainer = document.createElement('div');
		mainItemsContainer.className = 'afs-summary-grid';

		const moreItemsContainer = document.createElement('div');
		moreItemsContainer.className = 'afs-summary-grid';

		let hasMoreItems = false;

		const createSummaryItem = (label, value) => {
			const div = document.createElement('div');
			div.className = 'afs-summary-item';
			const spanLabel = document.createElement('span');
			spanLabel.className = 'afs-summary-label';
			spanLabel.textContent = label + ':';
			const spanValue = document.createElement('span');
			spanValue.className = 'afs-summary-value';
			spanValue.textContent = value;
			div.appendChild(spanLabel);
			div.appendChild(spanValue);
			return div;
		};

		const prioritySet = new Set(priorityKeys);
		const mmKeys = new Set([
			'park_z',
			'zmin',
			'load_new',
			'unload',
			'cooldown_runout_unprime_mm',
		]);
		const secondsKeys = new Set(['timeout', 'cooldown_delay']);

		const getParamLabel = (key) => {
			const def = window.ConfigDefinitions.defaults.find((d) => d.key === key);
			const labelKey = `settings.config.params.${key}.label`;
			const tLabel = window.I18n.t(labelKey);
			return tLabel !== labelKey ? tLabel : (def && def.label) || key;
		};

		const getParamDisplay = (item) => {
			let v = item.value;
			const isBool = !v.startsWith('"') && (v === '0' || v === '1');
			const isPark = item.key === 'park_x' || item.key === 'park_y' || item.key === 'park_z';
			if (isBool && !isPark) {
				return v === '1'
					? window.I18n.t('settings.common.enabled')
					: window.I18n.t('settings.common.disabled');
			}
			v = v.replace(/^"|"$/g, '');
			if (item.key === 'park_x' || item.key === 'park_y') {
				const val = parseFloat(item.value);
				if (val === -1) {
					const axis = item.key === 'park_x' ? 'X' : 'Y';
					const max =
						axis === 'X' ? this.state.axisMaximums.x : this.state.axisMaximums.y;
					return `${window.I18n.t('settings.status.max')} (${max}mm)`;
				}
				return v + 'mm';
			}
			if (mmKeys.has(item.key)) return v + 'mm';
			if (item.key.includes('speed')) return v + 'mm/min';
			if (secondsKeys.has(item.key)) return v + 's';
			if (item.key === 'default_temp') return v + '°C';
			return v;
		};

		const mainFrag = document.createDocumentFragment();
		const moreFrag = document.createDocumentFragment();

		this.configData.defaults.forEach((item) => {
			const label = getParamLabel(item.key);
			const displayVal = getParamDisplay(item);
			const itemEl = createSummaryItem(label, displayVal);
			if (prioritySet.has(item.key)) {
				mainFrag.appendChild(itemEl);
			} else {
				moreFrag.appendChild(itemEl);
				hasMoreItems = true;
			}
		});

		mainItemsContainer.appendChild(mainFrag);
		moreItemsContainer.appendChild(moreFrag);

		// Custom Macro Summary
		['pre', 'post'].forEach((type) => {
			const hook = this.macroHooks[type];
			const labelPrefix =
				type === 'pre'
					? window.I18n.t('settings.config.macros.pre_title')
					: window.I18n.t('settings.config.macros.post_title');

			if (hook.selection) {
				let val = hook.selection;
				if (val === 'custom_gcode') {
					val = window.I18n.t('settings.config.macros.custom_gcode');
					if (hook.gcode) {
						const lines = hook.gcode.trim().split('\n');
						val += ` (${lines.length} ${window.I18n.t(
							'settings.config.macros.lines'
						)})`;
					} else {
						val += ' ' + window.I18n.t('settings.config.macros.empty');
					}
				}

				const itemEl = createSummaryItem(
					window.I18n.t(
						type === 'pre'
							? 'settings.config.macros.pre_action'
							: 'settings.config.macros.post_action'
					),
					val
				);
				moreItemsContainer.appendChild(itemEl);
				hasMoreItems = true;
			}

			if (hook.message) {
				const itemEl = createSummaryItem(
					window.I18n.t(
						type === 'pre'
							? 'settings.config.macros.pre_msg'
							: 'settings.config.macros.post_msg'
					),
					`"${hook.message}"`
				);
				moreItemsContainer.appendChild(itemEl);
				hasMoreItems = true;
			}
		});

		summaryContent.appendChild(mainItemsContainer);

		if (hasMoreItems) {
			const moreWrapper = document.createElement('div');
			moreWrapper.className = 'afs-summary-more afs-hidden';
			moreWrapper.appendChild(moreItemsContainer);
			summaryContent.appendChild(moreWrapper);

			const toggleBtn = document.createElement('button');
			toggleBtn.className = 'afs-btn-link';
			toggleBtn.textContent = window.I18n.t('settings.status.show_more');
			toggleBtn.onclick = () => {
				moreWrapper.classList.toggle('afs-hidden');
				toggleBtn.textContent = moreWrapper.classList.contains('afs-hidden')
					? window.I18n.t('settings.status.show_more')
					: window.I18n.t('settings.status.show_less');
			};
			summaryContent.appendChild(toggleBtn);
		}

		summaryCard.appendChild(summaryContent);
		container.appendChild(summaryCard);

		// 4. Actions / Install
		const actions = document.createElement('div');
		actions.className = 'afs-actions-panel';

		// Only show "Save Changes" if not installed OR dirty (though dirty check usually happens on tab switch, here we mean if user manually triggered install flow)
		// Actually user requested: "Hide Save when clean" (implied context: usually button says "Install / Repair" or "Save Changes").
		// If installed and clean, maybe just show "Reinstall / Repair" ?
		// Or hide it completely if everything is good? User said "currently the save button shows... even when theres not any changes".
		// Let's show "Install / Repair" only if NOT installed or config missing.
		// If installed, show nothing (since they can go to Advanced to edit & save).

		if (!isInstalled || !configExists || isLegacyConfig || runoutConflict) {
			const btnInstall = document.createElement('button');
			btnInstall.className = 'afs-btn-primary large afs-btn-with-icon';
			btnInstall.title = window.I18n.t('settings.status.tip_install');
			btnInstall.onclick = () => this._saveConfig(true);
			btnInstall.appendChild(this._createIcon('install'));
			btnInstall.appendChild(
				document.createTextNode(window.I18n.t('settings.common.install_repair'))
			);
			actions.appendChild(btnInstall);
		}

		if (isOutdatedCfg && isInstalled && configExists && !isLegacyConfig && !runoutConflict) {
			const btnUpgrade = document.createElement('button');
			btnUpgrade.className = 'afs-btn-primary large afs-btn-with-icon';
			const lbl = window.I18n.t('settings.common.upgrade_cfg');
			const tip = window.I18n.t('settings.status.tip_upgrade');
			btnUpgrade.title =
				tip !== 'settings.status.tip_upgrade' ? tip : 'Upgrade to latest bundled cfg';
			btnUpgrade.onclick = () => this._saveConfig(true);
			btnUpgrade.appendChild(this._createIcon('upgrade'));
			btnUpgrade.appendChild(
				document.createTextNode(lbl !== 'settings.common.upgrade_cfg' ? lbl : 'Upgrade Cfg')
			);
			actions.appendChild(btnUpgrade);
		}

		const btnAdvanced = document.createElement('button');
		btnAdvanced.className = 'afs-btn-secondary large afs-btn-with-icon';
		btnAdvanced.title = window.I18n.t('settings.status.tip_advanced');
		btnAdvanced.onclick = () => this._switchTab('config');
		btnAdvanced.appendChild(this._createIcon('advanced'));
		btnAdvanced.appendChild(
			document.createTextNode(window.I18n.t('settings.common.open_advanced'))
		);

		actions.appendChild(btnAdvanced);

		if (isInstalled && configExists) {
			const btnBackup = document.createElement('button');
			btnBackup.className = 'afs-btn-secondary large afs-btn-with-icon afs-mt-10';
			btnBackup.onclick = () => this._switchTab('backup');
			btnBackup.appendChild(this._createIcon('backup'));
			btnBackup.appendChild(document.createTextNode(window.I18n.t('settings.menu.backup')));
			actions.appendChild(btnBackup);

			const btnUninstall = document.createElement('button');
			btnUninstall.className = 'afs-btn-danger large afs-btn-with-icon afs-mt-10';
			btnUninstall.onclick = () => this._uninstallConfig();
			btnUninstall.appendChild(this._createIcon('uninstall'));
			btnUninstall.appendChild(
				document.createTextNode(window.I18n.t('settings.common.uninstall'))
			);
			actions.appendChild(btnUninstall);
		}

		summaryContent.appendChild(actions);
	}

	_renderBackupTab() {
		const container = this.elements.scrollContainer;
		container.textContent = '';

		const header = document.createElement('div');
		header.className = 'afs-settings-header';
		const title = document.createElement('h2');
		title.className = 'afs-settings-title';
		title.textContent = window.I18n.t('settings.backup.title');
		header.appendChild(title);
		container.appendChild(header);

		const { isInstalled, configExists } = this.state;

		if (!isInstalled || !configExists) {
			const warning = document.createElement('div');
			warning.className = 'afs-status-card warning';
			const iconDiv = document.createElement('div');
			iconDiv.className = 'afs-status-icon';
			iconDiv.textContent = '⚠';

			const contentDiv = document.createElement('div');
			contentDiv.className = 'afs-status-content';

			const h3 = document.createElement('h3');
			h3.textContent = window.I18n.t('settings.backup.not_found_title');

			const p = document.createElement('p');
			p.textContent = window.I18n.t('settings.backup.not_found_msg');

			contentDiv.appendChild(h3);
			contentDiv.appendChild(p);

			warning.appendChild(iconDiv);
			warning.appendChild(contentDiv);
			container.appendChild(warning);
			return;
		}

		// Export Section
		const exportSection = document.createElement('div');
		exportSection.className = 'afs-settings-section';
		const exportTitle = document.createElement('h3');
		exportTitle.className = 'afs-settings-section-title';
		exportTitle.textContent = window.I18n.t('settings.backup.export_title');
		exportTitle.classList.add('afs-mb-10');
		exportSection.appendChild(exportTitle);

		const exportDesc = document.createElement('p');
		exportDesc.className = 'afs-field-desc';
		exportDesc.classList.add('afs-mb-16');
		exportDesc.textContent = window.I18n.t('settings.backup.export_desc');
		exportSection.appendChild(exportDesc);

		const btnExport = document.createElement('button');
		btnExport.className = 'afs-btn-primary';
		btnExport.textContent = window.I18n.t('settings.backup.download_btn');
		btnExport.onclick = () => this._exportConfig();
		exportSection.appendChild(btnExport);

		container.appendChild(exportSection);

		// Import Section
		const importSection = document.createElement('div');
		importSection.className = 'afs-settings-section';
		const importTitle = document.createElement('h3');
		importTitle.className = 'afs-settings-section-title';
		importTitle.textContent = window.I18n.t('settings.backup.import_title');
		importTitle.classList.add('afs-mb-10');
		importSection.appendChild(importTitle);

		const importDesc = document.createElement('p');
		importDesc.className = 'afs-field-desc';
		importDesc.classList.add('afs-mb-16');
		importDesc.textContent = window.I18n.t('settings.backup.import_desc');
		importSection.appendChild(importDesc);

		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.accept = '.json';
		fileInput.classList.add('afs-hidden');
		fileInput.onchange = (e) => {
			if (e.target.files.length > 0) {
				this._importConfig(e.target.files[0]);
			}
			// Reset value so same file can be selected again if needed
			e.target.value = '';
		};

		const btnImport = document.createElement('button');
		btnImport.className = 'afs-btn-secondary';
		btnImport.textContent = window.I18n.t('settings.backup.select_btn');
		btnImport.onclick = () => fileInput.click();
		importSection.appendChild(btnImport);

		container.appendChild(importSection);
	}

	_exportConfig() {
		const exportData = {
			version: '1.0',
			timestamp: new Date().toISOString(),
			defaults: this.configData.defaults,
			originStrings: this.configData.originStrings,
			statusStrings: this.configData.statusStrings,
			macroHooks: this.macroHooks,
		};

		const json = JSON.stringify(exportData, null, 2);
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `afs-config-backup-${new Date().toISOString().slice(0, 10)}.json`;
		document.body.appendChild(a);
		a.click();
		setTimeout(() => {
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		}, 100);
	}

	_importConfig(file) {
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const data = JSON.parse(e.target.result);

				// Basic Validation
				if (!data.defaults || !Array.isArray(data.defaults)) {
					throw new Error(window.I18n.t('settings.backup.invalid_file'));
				}

				// Confirm overwrite
				if (!confirm(window.I18n.t('settings.backup.confirm_restore'))) {
					return;
				}

				// Merge Data
				// We iterate our schema/current data and look for matches in the import
				const mergeSection = (currentArr, importArr) => {
					importArr.forEach((importItem) => {
						const idx = currentArr.findIndex((i) => i.key === importItem.key);
						if (idx >= 0) {
							currentArr[idx].value = importItem.value;
						}
					});
				};

				mergeSection(this.configData.defaults, data.defaults);
				if (data.originStrings)
					mergeSection(this.configData.originStrings, data.originStrings);
				if (data.statusStrings)
					mergeSection(this.configData.statusStrings, data.statusStrings);

				if (data.macroHooks) {
					if (data.macroHooks.pre) this.macroHooks.pre = data.macroHooks.pre;
					if (data.macroHooks.post) this.macroHooks.post = data.macroHooks.post;
				}

				this.configDirty = true;
				alert(window.I18n.t('settings.backup.restore_success'));
				this._switchTab('config');
			} catch (err) {
				alert(window.I18n.t('settings.backup.restore_fail', { error: err.message }));
			}
		};
		reader.readAsText(file);
	}

	_renderConfigTab() {
		const container = this.elements.scrollContainer;

		const header = document.createElement('div');
		header.className = 'afs-settings-header';
		const title = document.createElement('h2');
		title.className = 'afs-settings-title';
		title.textContent = window.I18n.t('settings.config.title');
		header.appendChild(title);
		container.appendChild(header);

		const tip = document.createElement('div');
		tip.className = 'afs-tip';
		tip.textContent = window.I18n.t('settings.config.tip');
		container.appendChild(tip);

		// Collapsible sections with descriptions
		this._renderSection(
			container,
			'defaults',
			window.I18n.t('settings.config.sections.defaults'),
			window.I18n.t('settings.config.sections.defaults_desc'),
			this.configData.defaults,
			false
		);
		this._renderSection(
			container,
			'originStrings',
			window.I18n.t('settings.config.sections.originStrings'),
			window.I18n.t('settings.config.sections.originStrings_desc'),
			this.configData.originStrings,
			true,
			'post_origin_console'
		);
		this._renderSection(
			container,
			'statusStrings',
			window.I18n.t('settings.config.sections.statusStrings'),
			window.I18n.t('settings.config.sections.statusStrings_desc'),
			this.configData.statusStrings,
			true,
			'post_status_console'
		);

		// Custom Macro Section
		this._renderCustomMacroSection(container);

		// Actions
		const actions = document.createElement('div');
		actions.className = 'afs-actions';

		const btnSave = document.createElement('button');
		btnSave.className = 'afs-btn-primary';
		btnSave.textContent = window.I18n.t('settings.common.save');
		btnSave.onclick = () => this._saveConfig();

		const btnCancel = document.createElement('button');
		btnCancel.className = 'afs-btn-cancel';
		btnCancel.textContent = window.I18n.t('settings.common.cancel');
		btnCancel.onclick = () => this._switchTab('summary');

		actions.appendChild(btnCancel);
		actions.appendChild(btnSave);
		container.appendChild(actions);
	}

	_renderSection(
		container,
		type,
		titleText,
		descriptionText,
		data,
		collapsedByDefault,
		parentKey
	) {
		const section = document.createElement('div');
		section.className = 'afs-settings-section';
		if (parentKey) {
			section.setAttribute('data-parent-section', parentKey);
		}

		const header = document.createElement('div');
		header.className = 'afs-collapse-header';
		const htitle = document.createElement('div');
		htitle.className = 'afs-settings-section-title';
		htitle.textContent = titleText;
		const toggle = document.createElement('button');
		toggle.className = 'afs-collapse-toggle';
		toggle.textContent = collapsedByDefault
			? window.I18n.t('settings.common.expand')
			: window.I18n.t('settings.common.collapse');
		header.appendChild(htitle);
		header.appendChild(toggle);
		section.appendChild(header);

		const desc = document.createElement('div');
		desc.className = 'afs-section-desc';
		desc.textContent = descriptionText;
		// Store original text for restoration
		desc.setAttribute('data-original-text', descriptionText);
		section.appendChild(desc);

		const content = document.createElement('div');
		content.className = 'afs-collapse-content';
		if (collapsedByDefault) content.classList.add('collapsed');
		toggle.onclick = () => {
			const isCollapsed = content.classList.toggle('collapsed');
			toggle.textContent = isCollapsed
				? window.I18n.t('settings.common.expand')
				: window.I18n.t('settings.common.collapse');
		};

		// Define Groups for 'defaults' type
		const GROUPS = {
			Temperature: [
				'default_temp',
				'cooldown_m600',
				'cooldown_runout',
				'cooldown_runout_unprime_mm',
				'cooldown_delay',
			],
			Movement: ['park_x', 'park_y', 'park_z', 'zmin', 'park_speed'],
			Filament: [
				'load_new',
				'unload',
				'load_speed',
				'unload_speed',
				'auto_unload_manual',
				'retract_park',
			],
			System: [
				'timeout',
				'post_origin_console',
				'post_status_console',
				'enable_beeper',
				'sound_m600',
				'sound_runout',
			],
		};

		// Helpers
		const getUnit = (key) => {
			if (['timeout', 'cooldown_delay'].includes(key)) return 's';
			if (['load_speed', 'unload_speed', 'park_speed'].includes(key)) return 'mm/min';
			if (['default_temp'].includes(key)) return '°C';
			if (
				[
					'park_x',
					'park_y',
					'park_z',
					'zmin',
					'load_new',
					'unload',
					'retract_park',
					'cooldown_runout_unprime_mm',
				].includes(key)
			)
				return 'mm';
			return '';
		};

		const formatTime = (seconds) => {
			const s = parseInt(seconds);
			if (isNaN(s) || s < 0) return '';
			if (s < 60)
				return `${s} ${
					s !== 1
						? window.I18n.t('settings.common.time.seconds')
						: window.I18n.t('settings.common.time.second')
				}`;
			const h = Math.floor(s / 3600);
			const m = Math.floor((s % 3600) / 60);
			const parts = [];
			if (h > 0)
				parts.push(
					`${h} ${
						h !== 1
							? window.I18n.t('settings.common.time.hours')
							: window.I18n.t('settings.common.time.hour')
					}`
				);
			if (m > 0)
				parts.push(
					`${m} ${
						m !== 1
							? window.I18n.t('settings.common.time.minutes')
							: window.I18n.t('settings.common.time.minute')
					}`
				);
			if (parts.length === 0) return `${s} ${window.I18n.t('settings.common.time.seconds')}`;
			return parts.join(' ');
		};

		// Helper to render a single item
		const renderItem = (item) => {
			const group = document.createElement('div');
			group.className = 'afs-form-group';
			group.setAttribute('data-key', item.key);

			const def = window.ConfigDefinitions[type]
				? window.ConfigDefinitions[type].find((d) => d.key === item.key)
				: null;

			// Map type to i18n section ('defaults' -> 'params', others match)
			const i18nSection = type === 'defaults' ? 'params' : type;

			const labelKey = `settings.config.${i18nSection}.${item.key}.label`;
			const tLabel = window.I18n.t(labelKey);
			const labelText = tLabel !== labelKey ? tLabel : (def && def.label) || item.key;

			const descKey = `settings.config.${i18nSection}.${item.key}.desc`;
			const tDesc = window.I18n.t(descKey);
			const descText = tDesc !== descKey ? tDesc : (def && def.desc) || '';

			if (def && def.indent) {
				group.classList.add('afs-indented');
			}

			if (def && def.parents) {
				group.setAttribute('data-parents', JSON.stringify(def.parents));
			}

			// Special handling for Park X/Y Smart Toggle
			if (item.key === 'park_x' || item.key === 'park_y') {
				const wrapper = document.createElement('div');
				wrapper.className = 'afs-smart-input-group';

				const label = document.createElement('label');
				label.className = 'afs-label';
				label.textContent = labelText;
				wrapper.appendChild(label);

				const isX = item.key === 'park_x';
				const maxVal = isX ? this.state.axisMaximums.x : this.state.axisMaximums.y;
				const currentVal = parseFloat(item.value);
				// If -1 or > max, it means "Use Max" (handled by macro), so we toggle ON
				const isUsingMax = currentVal === -1 || currentVal > maxVal;

				// Toggle Row
				const toggleRow = document.createElement('div');
				toggleRow.className = 'afs-toggle-row';

				const labelSwitch = document.createElement('label');
				labelSwitch.className = 'afs-switch small';
				const cb = document.createElement('input');
				cb.type = 'checkbox';
				cb.checked = isUsingMax;

				const slider = document.createElement('span');
				slider.className = 'afs-slider';
				labelSwitch.appendChild(cb);
				labelSwitch.appendChild(slider);

				const toggleLabel = document.createElement('span');
				toggleLabel.className = 'afs-toggle-text';
				toggleLabel.textContent = window.I18n.t('settings.common.use_max', { max: maxVal });
				toggleLabel.onclick = () => cb.click();

				toggleRow.appendChild(labelSwitch);
				toggleRow.appendChild(toggleLabel);

				// Controls Container (Flex)
				const controls = document.createElement('div');
				controls.className = 'afs-smart-controls';
				controls.appendChild(toggleRow);

				const inputBox = document.createElement('div');
				inputBox.className = 'afs-input-box';

				// Number Input
				const input = document.createElement('input');
				input.type = 'number';
				input.className = 'afs-input';
				// If using max, show max (greyed out). Else show actual value.
				input.value = isUsingMax ? maxVal : currentVal;
				input.disabled = isUsingMax;
				if (isUsingMax) input.classList.add('disabled');
				const inputId = `afs-input-${item.key}`;
				input.id = inputId;
				label.htmlFor = inputId;

				inputBox.appendChild(input);

				// Unit
				const unit = document.createElement('span');
				unit.className = 'afs-input-unit';
				unit.textContent = 'mm';
				inputBox.appendChild(unit);

				controls.appendChild(inputBox);
				wrapper.appendChild(controls);

				// Description
				const desc = document.createElement('div');
				desc.className = 'afs-field-desc';
				desc.textContent = descText;
				wrapper.appendChild(desc);

				// Logic
				cb.onchange = (e) => {
					if (e.target.checked) {
						// Toggle ON: Set to -1 (Use Max)
						item.value = '-1';
						input.value = maxVal;
						input.disabled = true;
						input.classList.add('disabled');
					} else {
						// Toggle OFF: Set to maxVal initially
						item.value = maxVal.toString();
						input.value = maxVal;
						input.disabled = false;
						input.classList.remove('disabled');
					}
					this.configDirty = true;
				};

				input.onchange = (e) => {
					const val = parseFloat(e.target.value);
					// If user types -1 or > max, auto-enable "Use Max"
					if (val === -1 || val > maxVal) {
						cb.checked = true;
						item.value = '-1';
						input.value = maxVal;
						input.disabled = true;
						input.classList.add('disabled');
					} else {
						item.value = val.toString();
					}
					this.configDirty = true;
				};

				group.appendChild(wrapper);
				return group;
			}

			// Special handling for Runout Unprime Length
			if (item.key === 'cooldown_runout_unprime_mm') {
				const wrapper = document.createElement('div');
				wrapper.className = 'afs-smart-input-group';

				const label = document.createElement('label');
				label.className = 'afs-label';
				label.textContent = labelText;
				// if (item.comment) label.title = item.comment;
				wrapper.appendChild(label);

				const currentVal = parseFloat(item.value);
				const isEnabled = currentVal > 0;

				// Toggle Row
				const toggleRow = document.createElement('div');
				toggleRow.className = 'afs-toggle-row';

				const labelSwitch = document.createElement('label');
				labelSwitch.className = 'afs-switch small';
				const cb = document.createElement('input');
				cb.type = 'checkbox';
				cb.checked = isEnabled;

				const slider = document.createElement('span');
				slider.className = 'afs-slider';
				labelSwitch.appendChild(cb);
				labelSwitch.appendChild(slider);

				const toggleLabel = document.createElement('span');
				toggleLabel.className = 'afs-toggle-text';
				toggleLabel.textContent = window.I18n.t('settings.common.enable');
				toggleLabel.onclick = () => cb.click();

				toggleRow.appendChild(labelSwitch);
				toggleRow.appendChild(toggleLabel);

				// Controls Container (Flex)
				const controls = document.createElement('div');
				controls.className = 'afs-smart-controls';
				controls.appendChild(toggleRow);

				const inputBox = document.createElement('div');
				inputBox.className = 'afs-input-box';

				// Number Input
				const input = document.createElement('input');
				input.type = 'number';
				input.className = 'afs-input';
				input.value = isEnabled ? currentVal : 0;
				input.disabled = !isEnabled;
				if (!isEnabled) input.classList.add('disabled');
				const inputId2 = `afs-input-${item.key}`;
				input.id = inputId2;
				label.htmlFor = inputId2;

				inputBox.appendChild(input);

				// Unit
				const unit = document.createElement('span');
				unit.className = 'afs-input-unit';
				unit.textContent = 'mm';
				inputBox.appendChild(unit);

				controls.appendChild(inputBox);
				wrapper.appendChild(controls);

				// Description
				const desc = document.createElement('div');
				desc.className = 'afs-field-desc';
				desc.textContent = descText;
				wrapper.appendChild(desc);

				// Logic
				cb.onchange = (e) => {
					if (e.target.checked) {
						// Toggle ON: Default to 10mm if 0
						const newVal = currentVal > 0 ? currentVal : 10;
						item.value = newVal.toString();
						input.value = newVal;
						input.disabled = false;
						input.classList.remove('disabled');
					} else {
						// Toggle OFF: Set to 0
						item.value = '0';
						input.value = 0;
						input.disabled = true;
						input.classList.add('disabled');
					}
					this.configDirty = true;
				};

				input.onchange = (e) => {
					const val = parseFloat(e.target.value);
					if (val <= 0) {
						cb.checked = false;
						item.value = '0';
						input.value = 0;
						input.disabled = true;
						input.classList.add('disabled');
					} else {
						item.value = val.toString();
					}
					this.configDirty = true;
				};

				group.appendChild(wrapper);
				return group;
			}

			// Heuristic for type
			let isBool = !item.value.startsWith('"') && (item.value === '0' || item.value === '1');

			if (def && def.type === 'number') {
				isBool = false;
			}

			const isNumber =
				!isNaN(parseFloat(item.value)) &&
				isFinite(item.value) &&
				!item.value.startsWith('"');
			const isString = item.value.startsWith('"');

			if (def && def.type === 'select') {
				const label = document.createElement('label');
				label.className = 'afs-label';
				label.textContent = labelText;
				group.appendChild(label);

				const container = document.createElement('div');
				container.style.display = 'flex';
				container.style.alignItems = 'center';
				container.style.gap = '10px';

				const select = document.createElement('select');
				select.className = 'afs-input';
				select.style.flex = '1';

				const currentVal = item.value.replace(/^"|"$/g, '');

				if (def.options) {
					def.options.forEach((optVal) => {
						const opt = document.createElement('option');
						opt.value = optVal;
						const optKey = `settings.config.params.${def.key}.options.${optVal}`;
						const tOpt = window.I18n.t(optKey);
						opt.textContent = tOpt !== optKey ? tOpt : optVal;
						if (currentVal === optVal) {
							opt.selected = true;
						}
						select.appendChild(opt);
					});
				}

				select.onchange = (e) => {
					item.value = `"${e.target.value}"`;
					this.configDirty = true;
				};

				container.appendChild(select);

				if (def.preview) {
					const btnPreview = document.createElement('button');
					btnPreview.className = 'afs-btn-secondary';
					btnPreview.textContent = '🔊';
					btnPreview.title = window.I18n.t('settings.config.macros.preview_button');
					btnPreview.type = 'button';
					btnPreview.onclick = () => {
						const val = select.value;
						const gcode = `AFS_NOISE SOUND=${val}`;
						if (this.client && this.client.sendGcode) {
							this.client.sendGcode(gcode);
						}
					};
					container.appendChild(btnPreview);
				}

				group.appendChild(container);

				const desc = document.createElement('div');
				desc.className = 'afs-field-desc';
				desc.textContent = descText;
				group.appendChild(desc);
			} else if (isBool && isNumber) {
				// 0 or 1 boolean
				// Render as switch
				const toggleGroup = document.createElement('div');
				toggleGroup.className = 'afs-toggle-group afs-mb-0';

				const wrapper = document.createElement('div');
				const toggleLabel = document.createElement('div');
				toggleLabel.className = 'afs-toggle-label';

				toggleLabel.textContent = (def && def.label) || item.key;

				const desc = document.createElement('div');
				desc.className = 'afs-toggle-desc';
				desc.textContent = (def && def.desc) || '';

				wrapper.appendChild(toggleLabel);
				wrapper.appendChild(desc);

				const labelSwitch = document.createElement('label');
				labelSwitch.className = 'afs-switch';
				const cb = document.createElement('input');
				cb.type = 'checkbox';
				cb.checked = item.value == '1';
				cb.onchange = (e) => {
					item.value = e.target.checked ? '1' : '0';
					this.configDirty = true;
					this._updateDependencies();
				};
				wrapper.onclick = (e) => {
					if (e.target.closest('.afs-switch')) return;
					cb.click();
				};

				const slider = document.createElement('span');
				slider.className = 'afs-slider';

				labelSwitch.appendChild(cb);
				labelSwitch.appendChild(slider);

				toggleGroup.appendChild(wrapper);
				toggleGroup.appendChild(labelSwitch);
				group.appendChild(toggleGroup);
			} else {
				const label = document.createElement('label');
				label.className = 'afs-label';
				label.textContent = labelText;
				// if (item.comment) label.title = item.comment; // Comment removed
				group.appendChild(label);

				let input;
				if (isString) {
					input = document.createElement('textarea');
					input.rows = 2;
					input.className = 'afs-input';
					// Strip quotes for display
					input.value = item.value.replace(/^"|"$/g, '');
					input.onchange = (e) => {
						// Sanitize: replace double quotes with single quotes, strip newlines
						const val = e.target.value
							.replace(/"/g, "'")
							.replace(/[\r\n]+/g, ' ')
							.trim();
						e.target.value = val;
						item.value = `"${val}"`;
						this.configDirty = true;
					};
					group.appendChild(input);
				} else {
					input = document.createElement('input');
					input.type = isNumber ? 'number' : 'text';
					input.className = 'afs-input';
					input.value = item.value;
					input.onchange = (e) => {
						item.value = e.target.value;
						this.configDirty = true;
					};

					// Enhanced Input with Unit
					const unitStr = getUnit(item.key);
					if (unitStr) {
						const wrapper = document.createElement('div');
						wrapper.className = 'afs-input-container';

						const inputBox = document.createElement('div');
						inputBox.className = 'afs-input-box';

						inputBox.appendChild(input);

						const unitSpan = document.createElement('span');
						unitSpan.className = 'afs-input-unit';
						unitSpan.textContent = unitStr;
						inputBox.appendChild(unitSpan);

						wrapper.appendChild(inputBox);

						if (unitStr === 's') {
							const timeHelper = document.createElement('span');
							timeHelper.className = 'afs-time-helper';
							const initialTime = formatTime(input.value);
							timeHelper.textContent = initialTime ? `(${initialTime})` : '';
							inputBox.appendChild(timeHelper);

							// Update on change/input
							const updateTimeHelper = (val) => {
								const t = formatTime(val);
								timeHelper.textContent = t ? `(${t})` : '';
							};

							input.addEventListener('input', (e) => {
								updateTimeHelper(e.target.value);
							});
							// Ensure update on change as well (though input covers it)
							const origOnChange = input.onchange;
							input.onchange = (e) => {
								origOnChange(e);
								updateTimeHelper(e.target.value);
							};
						}

						group.appendChild(wrapper);
					} else {
						group.appendChild(input);
					}
				}
				const inputId3 = `afs-input-${item.key}`;
				input.id = inputId3;
				label.htmlFor = inputId3;

				// Description
				const desc = document.createElement('div');
				desc.className = 'afs-field-desc';
				desc.textContent = descText;
				group.appendChild(desc);
			}

			return group;
		};

		if (type === 'defaults') {
			// Use Groups
			const remainingKeys = new Set(data.map((i) => i.key));

			Object.entries(GROUPS).forEach(([groupName, keys]) => {
				const fieldset = document.createElement('fieldset');
				fieldset.className = 'afs-fieldset';
				const legend = document.createElement('legend');
				legend.className = 'afs-legend';
				legend.textContent = window.I18n.t(`settings.config.groups.${groupName}`);
				fieldset.appendChild(legend);

				let hasItems = false;
				keys.forEach((key) => {
					const item = data.find((i) => i.key === key);
					if (item) {
						fieldset.appendChild(renderItem(item));
						remainingKeys.delete(key);
						hasItems = true;
					}
				});

				if (hasItems) content.appendChild(fieldset);
			});

			// Render remaining items
			if (remainingKeys.size > 0) {
				const fieldset = document.createElement('fieldset');
				fieldset.className = 'afs-fieldset';
				const legend = document.createElement('legend');
				legend.className = 'afs-legend';
				legend.textContent = window.I18n.t('settings.config.groups.Other');
				fieldset.appendChild(legend);

				data.forEach((item) => {
					if (remainingKeys.has(item.key)) {
						fieldset.appendChild(renderItem(item));
					}
				});
				content.appendChild(fieldset);
			}
		} else {
			// Flat render for other types
			data.forEach((item) => {
				content.appendChild(renderItem(item));
			});
		}

		section.appendChild(content);
		container.appendChild(section);

		// Trigger dependency check after render
		this._updateDependencies();
	}

	_updateDependencies() {
		const groups = this.elements.scrollContainer.querySelectorAll(
			'.afs-form-group[data-parents]'
		);
		groups.forEach((group) => {
			const parentsAttr = group.getAttribute('data-parents');
			if (!parentsAttr) return;

			try {
				const parents = JSON.parse(parentsAttr);
				if (!Array.isArray(parents) || parents.length === 0) return;

				// Check if ANY parent is enabled
				// Parents are stored in this.configData.defaults
				const isAnyParentEnabled = parents.some((parentKey) => {
					const parentItem = this.configData.defaults.find((i) => i.key === parentKey);
					// Assume enabled if value is '1' (for booleans) or just present?
					// Based on request: "parents: Cooldown On M600 + Cooldown On Runout"
					// These are boolean toggles.
					return parentItem && parentItem.value === '1';
				});

				// Find inputs within the group to disable/enable
				const inputs = group.querySelectorAll('input, textarea, select, button');

				if (isAnyParentEnabled) {
					group.classList.remove('afs-disabled-group');
					inputs.forEach((inp) => {
						// Don't enable if it was disabled by its own logic (e.g. Smart Park X/Y)
						// But Smart Park logic handles its own state on render/change.
						// Simple approach: remove 'disabled' property
						if (!inp.classList.contains('disabled')) {
							inp.disabled = false;
						}
					});
				} else {
					group.classList.add('afs-disabled-group');
					inputs.forEach((inp) => {
						inp.disabled = true;
					});
				}
			} catch (e) {
				if (window.logger) window.logger.error('SettingsModal', 'Error parsing parents', e);
			}
		});

		// Handle Sections (After groups, so we can check if parent inputs are disabled)
		const sections = this.elements.scrollContainer.querySelectorAll(
			'.afs-settings-section[data-parent-section]'
		);
		sections.forEach((section) => {
			const parentKey = section.getAttribute('data-parent-section');
			if (!parentKey) return;

			const parentItem = this.configData.defaults.find((i) => i.key === parentKey);

			// Find parent input in DOM to check if it's disabled
			const parentGroup = this.elements.scrollContainer.querySelector(
				`.afs-form-group[data-key="${parentKey}"]`
			);
			const parentInput = parentGroup ? parentGroup.querySelector('input') : null;
			const isParentDisabled = parentInput ? parentInput.disabled : false;

			// Check if enabled (value '1') AND not disabled
			const isEnabled = parentItem && parentItem.value === '1' && !isParentDisabled;

			const inputs = section.querySelectorAll(
				'input, textarea, select, button:not(.afs-collapse-toggle)'
			);
			const descElement = section.querySelector('.afs-section-desc');

			if (isEnabled) {
				section.classList.remove('afs-disabled-section');
				inputs.forEach((inp) => {
					if (!inp.classList.contains('disabled')) {
						inp.disabled = false;
					}
				});
				// Restore description
				if (descElement && descElement.hasAttribute('data-original-text')) {
					descElement.textContent = descElement.getAttribute('data-original-text');
				}
			} else {
				section.classList.add('afs-disabled-section');
				inputs.forEach((inp) => {
					inp.disabled = true;
				});
				// Update description to explain why
				if (descElement) {
					const parentLabel =
						parentItem && parentItem.label ? parentItem.label : parentKey;
					descElement.textContent = `[Disabled] This section is unavailable because "${parentLabel}" is turned off.`;
				}
			}
		});
	}

	async _renderExtensionTab() {
		const container = this.elements.scrollContainer;
		const settings = window.UserSettings.getAll();
		container.innerHTML = '';

		// Shared notifier for audio control (prevents stacking)
		const sharedNotifier = window.BrowserNotifications
			? new window.BrowserNotifications()
			: null;

		const header = document.createElement('div');
		header.className = 'afs-settings-header';
		const title = document.createElement('h2');
		title.className = 'afs-settings-title';
		title.textContent = window.I18n.t('settings.extension.title');
		header.appendChild(title);
		container.appendChild(header);

		// Helper to create toggle (for Debug Logging)
		const createToggle = (key, labelText) => {
			const group = document.createElement('div');
			group.className = 'afs-toggle-group';

			const label = document.createElement('span');
			label.className = 'afs-toggle-label';
			label.textContent = labelText;

			const switchLabel = document.createElement('label');
			switchLabel.className = 'afs-switch';
			const inp = document.createElement('input');
			inp.type = 'checkbox';
			inp.checked = !!settings[key];
			inp.onchange = (e) => {
				window.UserSettings.set(key, e.target.checked);
			};
			const slider = document.createElement('span');
			slider.className = 'afs-slider round';

			switchLabel.appendChild(inp);
			switchLabel.appendChild(slider);
			group.appendChild(label);
			group.appendChild(switchLabel);
			return group;
		};

		// Helper to create select
		const createSelect = (key, labelText, options) => {
			const group = document.createElement('div');
			group.className = 'afs-form-group afs-mb-15';

			const label = document.createElement('label');
			label.className = 'afs-label';
			label.textContent = labelText;

			const container = document.createElement('div');
			container.className = 'afs-input-row';

			const select = document.createElement('select');
			select.className = 'afs-input afs-input-flex';

			// Add Disabled Option
			const dis = document.createElement('option');
			dis.value = '';
			dis.textContent = window.I18n.t('settings.common.disabled') || 'Disabled';
			if (!settings[key]) dis.selected = true;
			select.appendChild(dis);

			// Add Tunes in OptGroup
			if (options && options.length > 0) {
				const optGroup = document.createElement('optgroup');
				optGroup.label = window.I18n.t('settings.extension.convertedTunes');

				options.forEach((opt) => {
					const el = document.createElement('option');
					el.value = opt;
					el.textContent = opt;
					if (settings[key] === opt) el.selected = true;
					optGroup.appendChild(el);
				});
				select.appendChild(optGroup);
			}

			select.onchange = (e) => {
				window.UserSettings.set(key, e.target.value);
				if (sharedNotifier) {
					sharedNotifier.updateSettings(window.UserSettings.getAll());
				}
			};

			// Test Button
			const testBtn = document.createElement('button');
			testBtn.className = 'afs-btn-primary afs-btn-test';
			testBtn.textContent = window.I18n.t('settings.extension.testButton');
			testBtn.type = 'button';

			testBtn.onclick = () => {
				const val = select.value;
				if (!val) return;
				if (sharedNotifier) {
					if (typeof sharedNotifier.stop === 'function') {
						sharedNotifier.stop();
					} else if (sharedNotifier.player) {
						sharedNotifier.player.stop();
					}

					if (sharedNotifier._playSound) {
						sharedNotifier._playSound(val);
					}
				}
			};

			container.appendChild(select);
			container.appendChild(testBtn);

			group.appendChild(label);
			group.appendChild(container);
			return group;
		};

		// Fetch tunes
		let tunes = [];
		try {
			if (sharedNotifier) {
				tunes = await sharedNotifier.getAvailableTunes();
			}
		} catch (e) {
			console.error('Failed to fetch tunes', e);
		}
		if (tunes.length === 0) tunes = ['RUN_OUT', 'CAKE'];

		// Language Selector
		const langGroup = document.createElement('div');
		langGroup.className = 'afs-form-group afs-mb-20';

		const langLabel = document.createElement('label');
		langLabel.className = 'afs-label';
		langLabel.textContent = window.I18n.t('settings.extension.language');
		langGroup.appendChild(langLabel);

		const langSelect = document.createElement('select');
		langSelect.className = 'afs-input';

		window.I18n.getAvailableLocales().forEach((locale) => {
			const opt = document.createElement('option');
			opt.value = locale.code;
			opt.textContent = `${locale.name} (${locale.code})`;
			if (locale.code === window.I18n.locale) opt.selected = true;
			langSelect.appendChild(opt);
		});

		langSelect.onchange = (e) => {
			window.I18n.setLocale(e.target.value);
			this._updateSidebarText();
			this._loadSmartData();
		};
		langGroup.appendChild(langSelect);

		const langDesc = document.createElement('div');
		langDesc.className = 'afs-field-desc';
		langDesc.textContent = window.I18n.t('settings.extension.language_desc');
		langGroup.appendChild(langDesc);

		container.appendChild(langGroup);

		const presetsGroup = document.createElement('div');
		presetsGroup.className = 'afs-form-group afs-mb-20';
		const presetsLabel = document.createElement('label');
		presetsLabel.className = 'afs-label';
		presetsLabel.textContent = window.I18n.t('settings.extension.tempPresets');
		presetsGroup.appendChild(presetsLabel);
		const presetsRow = document.createElement('div');
		presetsRow.className = 'afs-input-row';
		const presetsInput = document.createElement('input');
		presetsInput.className = 'afs-input afs-input-flex';
		const curPresets = Array.isArray(settings.tempPresets) ? settings.tempPresets : [];
		presetsInput.placeholder = '[PLA:200], [ABS:240], [220]';
		presetsInput.value = curPresets
			.map((item) => {
				if (item && typeof item === 'object') {
					const n = parseInt(item.value, 10);
					if (!Number.isFinite(n) || n <= 0) return '';
					const lbl = item.label ? String(item.label) : String(n);
					if (lbl !== String(n)) return `[${lbl}:${n}]`;
					return `[${n}]`;
				}
				const n = parseInt(item, 10);
				if (!Number.isFinite(n) || n <= 0) return '';
				return `[${n}]`;
			})
			.filter((s) => s)
			.join(', ');
		const applyPresets = () => {
			const raw = presetsInput.value || '';
			const arr = raw
				.split(',')
				.map((s) => s.trim())
				.filter((s) => s)
				.map((s) => {
					let t = s;
					if (t.startsWith('[')) t = t.slice(1);
					if (t.endsWith(']')) t = t.slice(0, -1);
					t = t.trim();
					const parts = t.split(':');
					const label = parts.length > 1 ? parts[0].trim() : '';
					const valueStr = parts.length > 1 ? parts[1].trim() : parts[0].trim();
					const n = parseInt(valueStr, 10);
					if (!Number.isFinite(n) || n <= 0) return null;
					return { value: n, label: label || String(n) };
				})
				.filter((item) => item !== null);
			window.UserSettings.set('tempPresets', arr).then(() => {
				const cur = window.UserSettings.get('tempPresets') || [];
				const formatted = cur
					.map((item) => {
						if (item && typeof item === 'object') {
							const n = parseInt(item.value, 10);
							if (!Number.isFinite(n) || n <= 0) return '';
							const lbl = item.label ? String(item.label) : String(n);
							if (lbl !== String(n)) return `[${lbl}:${n}]`;
							return `[${n}]`;
						}
						const n = parseInt(item, 10);
						if (!Number.isFinite(n) || n <= 0) return '';
						return `[${n}]`;
					})
					.filter((s) => s)
					.join(', ');
				presetsInput.value = formatted;
			});
		};
		presetsInput.addEventListener('change', applyPresets);
		presetsInput.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') applyPresets();
		});
		presetsRow.appendChild(presetsInput);
		presetsGroup.appendChild(presetsRow);
		const presetsDesc = document.createElement('div');
		presetsDesc.className = 'afs-field-desc';
		presetsDesc.textContent = window.I18n.t('settings.extension.tempPresets_desc');
		presetsGroup.appendChild(presetsDesc);
		container.appendChild(presetsGroup);

		// Section: Alarms
		const alarmHeader = document.createElement('h3');
		alarmHeader.textContent = window.I18n.t('settings.extension.browserAlarms');
		alarmHeader.className = 'afs-header-white afs-mt-20';
		container.appendChild(alarmHeader);

		// Browser Alarm Note
		const alarmDesc = document.createElement('div');
		alarmDesc.className = 'afs-section-desc';
		alarmDesc.textContent = window.I18n.t('settings.extension.browserAlarmNote');
		container.appendChild(alarmDesc);

		// Runout
		container.appendChild(
			createSelect(
				'runoutTune',
				window.I18n.t('settings.extension.alarmOnRunout') || 'Alarm On Runout',
				tunes
			)
		);

		// M600
		container.appendChild(
			createSelect(
				'm600Tune',
				window.I18n.t('settings.extension.alarmOnM600') || 'Alarm On M600',
				tunes
			)
		);

		// Print Complete
		container.appendChild(
			createSelect(
				'printCompleteTune',
				window.I18n.t('settings.extension.alarmOnPrintComplete'),
				tunes
			)
		);

		// Tip
		const tip = document.createElement('div');
		tip.className = 'afs-status-card info small afs-mt-20';
		tip.innerHTML = window.I18n.t('settings.extension.printCompleteTip');
		container.appendChild(tip);

		// Debug Logging
		container.appendChild(
			createToggle(
				'enableDebugLogging',
				window.I18n.t('settings.extension.enableDebugLogging')
			)
		);

		// Note about setup
		const info = document.createElement('div');
		info.className = 'afs-tip afs-mt-20';
		info.textContent = `${window.I18n.t('settings.extension.setup_completed')}: ${
			settings.setupCompletedOn || window.I18n.t('settings.extension.never')
		}`;
		container.appendChild(info);

		// Close button for this tab
		const actions = document.createElement('div');
		actions.className = 'afs-actions';
		const btnClose = document.createElement('button');
		btnClose.className = 'afs-btn-primary';
		btnClose.textContent = window.I18n.t('settings.common.close');
		btnClose.onclick = () => this.close();
		actions.appendChild(btnClose);
		container.appendChild(actions);
	}

	async _renderAboutTab() {
		const container = this.elements.scrollContainer;
		container.innerHTML = ''; // Clear content

		// Main Container
		const wrapper = document.createElement('div');
		wrapper.className = 'afs-about-container';

		// 1. Hero Section
		const hero = document.createElement('div');
		hero.className = 'afs-about-hero';

		const logo = document.createElement('img');
		logo.className = 'afs-about-logo';
		logo.src = chrome.runtime.getURL('assets/logo.png');
		logo.alt = window.I18n.t('settings.extension.logoAlt');
		hero.appendChild(logo);

		const headerInfo = document.createElement('div');
		headerInfo.className = 'afs-about-header-info';

		const title = document.createElement('h1');
		title.className = 'afs-about-title';
		title.textContent = window.I18n.t('settings.extension.extensionName');
		headerInfo.appendChild(title);

		const badges = document.createElement('div');
		badges.className = 'afs-version-badges';

		// Extension Version Badge
		const extBadge = document.createElement('div');
		extBadge.className = 'afs-version-badge loading';
		extBadge.textContent = `Ext: ${window.I18n.t('settings.about.loading')}`;
		badges.appendChild(extBadge);

		// Config Version Badge
		const cfgBadge = document.createElement('div');
		cfgBadge.className = 'afs-version-badge loading';
		cfgBadge.textContent = `Cfg: ${window.I18n.t('settings.about.loading')}`;
		badges.appendChild(cfgBadge);

		headerInfo.appendChild(badges);
		hero.appendChild(headerInfo);
		wrapper.appendChild(hero);

		// Version Fetching
		if (window.VersionUtils) {
			if (window.VersionUtils.getCurrentVersion) {
				window.VersionUtils.getCurrentVersion().then((v) => {
					extBadge.textContent = `Ext: v${v}`;
					extBadge.classList.remove('loading');
				});
			}
			if (window.VersionUtils.getCfgVersion) {
				window.VersionUtils.getCfgVersion().then((v) => {
					cfgBadge.textContent = `Cfg: v${v}`;
					cfgBadge.classList.remove('loading');
				});
			}
		}

		// 2. Action Grid
		const grid = document.createElement('div');
		grid.className = 'afs-about-grid';

		// Helper to create cards
		const createCard = (title, sub, iconPath, url, isPrimary = false, isDiscord = false) => {
			const card = document.createElement('a');
			card.className = `afs-action-card ${isPrimary ? 'primary' : ''} ${
				isDiscord ? 'discord' : ''
			}`;
			card.href = url;
			card.target = '_blank';

			const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			svg.setAttribute('class', 'afs-card-icon');
			svg.setAttribute('viewBox', '0 0 24 24');
			svg.setAttribute('fill', 'currentColor');
			const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			path.setAttribute('d', iconPath);
			svg.appendChild(path);
			card.appendChild(svg);

			const t = document.createElement('div');
			t.className = 'afs-card-title';
			t.textContent = title;
			card.appendChild(t);

			const s = document.createElement('div');
			s.className = 'afs-card-sub';
			s.textContent = sub;
			card.appendChild(s);

			return card;
		};

		// Icons
		const iconGithub =
			'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z';
		const iconDiscord =
			'M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z';
		const iconCode =
			'M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.8c-.662 0-1.2-.538-1.2-1.2 0-.662.538-1.2 1.2-1.2.662 0 1.2.538 1.2 1.2 0 .662-.538 1.2-1.2 1.2zm6 6.8h-2v-6h2v6zm-1-6.8c-.662 0-1.2-.538-1.2-1.2 0-.662.538-1.2 1.2-1.2.662 0 1.2.538 1.2 1.2 0 .662-.538 1.2-1.2 1.2z'; // Placeholder for Jackson92/User
		const iconUser =
			'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z';
		const iconHeart =
			'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';
		const iconCoffee =
			'M18.5 3H6c-1.1 0-2 .9-2 2v5.71c0 3.83 2.95 7.18 6.78 7.29 3.96.12 7.22-3.06 7.22-7v-1h.5c1.93 0 3.5-1.57 3.5-3.5S20.43 3 18.5 3zM16 8.99c0 2.2-1.8 4-4 4s-4-1.8-4-4V5h8v3.99zM18.5 8h-.5V5h.5c.83 0 1.5.67 1.5 1.5S19.33 8 18.5 8zM2 19h20v2H2v-2z';

		// Developer
		grid.appendChild(
			createCard(
				'Jackson92',
				window.I18n.t('settings.about.developed_by'),
				iconUser,
				'https://github.com/92jackson',
				false
			)
		);

		// Discord
		grid.appendChild(
			createCard(
				window.I18n.t('settings.about.discord'),
				'Join the Community',
				iconDiscord,
				'https://discord.gg/e3eXGTJbjx',
				false,
				true
			)
		);

		// Source
		grid.appendChild(
			createCard(
				window.I18n.t('settings.about.github'),
				'View Source Code',
				iconGithub,
				'https://github.com/92jackson/Advanced-Filament-Swap'
			)
		);

		// Donate
		grid.appendChild(
			createCard(
				'Donate',
				'Buy Me a Coffee',
				iconCoffee,
				'https://buymeacoffee.com/92jackson',
				true
			)
		);

		wrapper.appendChild(grid);

		// 3. Sponsors Panel
		const sponsorsPanel = document.createElement('div');
		sponsorsPanel.className = 'afs-sponsors-panel';

		const spHeader = document.createElement('div');
		spHeader.className = 'afs-sponsors-header';
		spHeader.style.cursor = 'pointer'; // Make clickable

		const heartSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		heartSvg.setAttribute('class', 'afs-card-icon afs-heart-icon');
		heartSvg.setAttribute('viewBox', '0 0 24 24');
		heartSvg.setAttribute('fill', 'currentColor');
		heartSvg.setAttribute('width', '24');
		heartSvg.setAttribute('height', '24');
		const hPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		hPath.setAttribute('d', iconHeart);
		heartSvg.appendChild(hPath);
		spHeader.appendChild(heartSvg);

		const spTitle = document.createElement('h3');
		spTitle.className = 'afs-sponsors-title';
		spTitle.textContent = window.I18n.t('settings.about.sponsors');
		spHeader.appendChild(spTitle);

		// Toggle Icon
		const spToggle = document.createElement('span');
		spToggle.className = 'afs-collapse-icon';
		spToggle.textContent = '▼'; // Start collapsed
		spToggle.style.marginLeft = 'auto';
		spToggle.style.color = '#b9bbbe';
		spHeader.appendChild(spToggle);

		sponsorsPanel.appendChild(spHeader);

		const spContent = document.createElement('div');
		spContent.className = 'afs-sponsors-content afs-hidden'; // Hidden by default
		spContent.textContent = window.I18n.t('settings.about.loading');
		sponsorsPanel.appendChild(spContent);

		// Toggle Logic
		spHeader.onclick = () => {
			const isHidden = spContent.classList.toggle('afs-hidden');
			spToggle.textContent = isHidden ? '▼' : '▲';
		};

		wrapper.appendChild(sponsorsPanel);
		container.appendChild(wrapper);

		// Fetch Sponsors (Background)
		try {
			const response = await fetch(
				'https://gist.githubusercontent.com/92jackson/c1086b472ccd4b521cbb33d0a701befb/raw/Donors.txt'
			);
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			const text = await response.text();
			spContent.textContent = '';

			const names = text
				.split(/[\n,]/)
				.map((n) => n.trim())
				.filter((n) => n.length > 0);

			if (names.length > 0) {
				const list = document.createElement('p');
				list.innerHTML =
					window.I18n.t('settings.about.sponsors_desc') + '<br><br>' + names.join(' • ');
				spContent.appendChild(list);
			} else {
				spContent.textContent = 'No sponsors list available.';
			}
		} catch (error) {
			spContent.textContent = window.I18n.t('settings.about.fetch_fail');
		}
	}

	_renderCustomMacroSection(container) {
		const hooks = [
			{
				type: 'pre',
				title: window.I18n.t('settings.config.macros.pre_title'),
				desc: window.I18n.t('settings.config.macros.pre_desc'),
				data: this.macroHooks.pre,
			},
			{
				type: 'post',
				title: window.I18n.t('settings.config.macros.post_title'),
				desc: window.I18n.t('settings.config.macros.post_desc'),
				data: this.macroHooks.post,
			},
		];

		hooks.forEach((hook) => {
			const section = document.createElement('div');
			section.className = 'afs-settings-section';

			// Header
			const header = document.createElement('div');
			header.className = 'afs-collapse-header';
			const htitle = document.createElement('div');
			htitle.className = 'afs-settings-section-title';
			htitle.textContent = hook.title;
			const toggle = document.createElement('button');
			toggle.className = 'afs-collapse-toggle';
			toggle.textContent = window.I18n.t('settings.common.expand'); // Collapsed by default
			header.appendChild(htitle);
			header.appendChild(toggle);
			section.appendChild(header);

			const desc = document.createElement('div');
			desc.className = 'afs-section-desc';
			desc.textContent = hook.desc;
			section.appendChild(desc);

			const content = document.createElement('div');
			content.className = 'afs-collapse-content collapsed';
			toggle.onclick = () => {
				const isCollapsed = content.classList.toggle('collapsed');
				toggle.textContent = isCollapsed
					? window.I18n.t('settings.common.expand')
					: window.I18n.t('settings.common.collapse');
			};

			// Dropdown
			const group = document.createElement('div');
			group.className = 'afs-form-group';
			const label = document.createElement('label');
			label.className = 'afs-label';
			label.textContent = window.I18n.t('settings.config.macros.action_label');
			group.appendChild(label);

			const select = document.createElement('select');
			select.className = 'afs-input';

			// Options
			const noneOpt = document.createElement('option');
			noneOpt.value = '';
			noneOpt.textContent = window.I18n.t('settings.config.macros.none');
			select.appendChild(noneOpt);

			const customOpt = document.createElement('option');
			customOpt.value = 'custom_gcode';
			customOpt.textContent = window.I18n.t('settings.config.macros.custom_gcode_opt');
			select.appendChild(customOpt);

			const macroGroup = document.createElement('optgroup');
			macroGroup.label = window.I18n.t('settings.config.macros.predefined');
			select.appendChild(macroGroup);

			const macros = this.state.macros || [];
			const excludedMacros = this.client.getAFSMacroList();
			macros
				.filter((m) => !excludedMacros.includes(m))
				.forEach((m) => {
					const opt = document.createElement('option');
					opt.value = m;
					opt.textContent = m;
					macroGroup.appendChild(opt);
				});

			select.value = hook.data.selection;
			select.onchange = async (e) => {
				hook.data.selection = e.target.value;
				this.configDirty = true;

				const val = e.target.value;
				if (val === 'custom_gcode') {
					gcodeArea.classList.remove('afs-hidden');
					previewArea.classList.add('afs-hidden');
				} else if (val) {
					gcodeArea.classList.add('afs-hidden');
					previewArea.classList.remove('afs-hidden');
					previewTextarea.value = window.I18n.t('settings.config.macros.loading_preview');
					try {
						const source = await this.client.getMacroSource(val);
						previewTextarea.value =
							source || window.I18n.t('settings.config.macros.empty_macro');
					} catch (err) {
						previewTextarea.value = window.I18n.t(
							'settings.config.macros.failed_preview'
						);
					}
				} else {
					gcodeArea.classList.add('afs-hidden');
					previewArea.classList.add('afs-hidden');
				}
			};
			group.appendChild(select);
			content.appendChild(group);

			// Message Input
			const msgGroup = document.createElement('div');
			msgGroup.className = 'afs-form-group';

			const msgLabel = document.createElement('label');
			msgLabel.className = 'afs-label';
			msgLabel.textContent = window.I18n.t('settings.config.macros.msg_label');
			msgGroup.appendChild(msgLabel);

			const msgInput = document.createElement('input');
			msgInput.className = 'afs-input';
			msgInput.type = 'text';
			msgInput.placeholder = 'e.g. Cleaning nozzle...';
			msgInput.value = hook.data.message;
			msgInput.onchange = (e) => {
				// Sanitize: replace double quotes with single quotes, strip newlines
				const val = e.target.value
					.replace(/"/g, "'")
					.replace(/[\r\n]+/g, ' ')
					.trim();
				e.target.value = val;
				hook.data.message = val;
				this.configDirty = true;
			};
			msgLabel.appendChild(msgInput);

			const msgDesc = document.createElement('div');
			msgDesc.className = 'afs-field-desc';
			msgDesc.textContent = window.I18n.t('settings.config.macros.msg_desc');
			msgGroup.appendChild(msgDesc);
			content.appendChild(msgGroup);

			// G-Code Textarea
			const gcodeArea = document.createElement('div');
			if (hook.data.selection !== 'custom_gcode') {
				gcodeArea.classList.add('afs-hidden');
			}
			gcodeArea.classList.add('afs-mt-16');

			const gcodeLabel = document.createElement('label');
			gcodeLabel.className = 'afs-label';
			gcodeLabel.textContent = window.I18n.t('settings.config.macros.custom_gcode');
			gcodeArea.appendChild(gcodeLabel);

			const textarea = document.createElement('textarea');
			textarea.className = 'afs-input afs-code-editor';
			textarea.rows = 5;
			textarea.value = hook.data.gcode;
			textarea.onkeydown = (e) => {
				if (e.key === 'Tab') {
					e.preventDefault();
					const start = textarea.selectionStart;
					const end = textarea.selectionEnd;
					const val = textarea.value;
					textarea.value = val.substring(0, start) + '\t' + val.substring(end);
					textarea.selectionStart = textarea.selectionEnd = start + 1;
					// Trigger change
					hook.data.gcode = textarea.value;
					this.configDirty = true;
				}
			};
			textarea.onchange = (e) => {
				hook.data.gcode = e.target.value;
				this.configDirty = true;
			};
			gcodeArea.appendChild(textarea);
			content.appendChild(gcodeArea);

			// Macro Preview Area (Read-only)
			const previewArea = document.createElement('div');
			previewArea.classList.add('afs-hidden');
			previewArea.classList.add('afs-mt-16');

			const previewLabel = document.createElement('label');
			previewLabel.className = 'afs-label';
			previewLabel.textContent = window.I18n.t('settings.config.macros.preview');
			previewArea.appendChild(previewLabel);

			const previewTextarea = document.createElement('textarea');
			previewTextarea.className = 'afs-input afs-code-preview';
			previewTextarea.rows = 5;
			previewTextarea.readOnly = true;
			previewArea.appendChild(previewTextarea);
			content.appendChild(previewArea);

			// Trigger initial state
			if (hook.data.selection && hook.data.selection !== 'custom_gcode') {
				previewArea.classList.remove('afs-hidden');
				previewTextarea.value = window.I18n.t('settings.config.macros.loading_preview');
				this.client.getMacroSource(hook.data.selection).then((source) => {
					previewTextarea.value =
						source || window.I18n.t('settings.config.macros.empty_macro');
				});
			} else if (hook.data.selection === 'custom_gcode') {
				// Already handled by gcodeArea default display style
			}

			section.appendChild(content);
			container.appendChild(section);
		});
	}

	async _saveConfig(forceInstall = false) {
		if (!this.fullConfigText || !this.fullConfigText.includes('[gcode_macro AFS_CFG]')) {
			this.fullConfigText = `[gcode_macro AFS_CFG]
variable_defaults: {
}
variable_origin_string_data: {
}
variable_status_string_data: {
}
gcode:
`;
		}
		const cfg = {
			stages: {
				install_confirm: {
					title: window.I18n.t('settings.status.install_confirm_title'),
					timelineLabel: 'Confirm',
					previousStages: [],
					upcomingStages: ['Apply', 'Complete'],
					description: window.I18n.t('settings.status.install_confirm_desc'),
					macros: [],
					actionItems: [],
					actionGroups: [],
					colorScheme: '#5865f2',
				},
				apply: {
					title: window.I18n.t('settings.status.saving_title'),
					timelineLabel: 'Apply',
					previousStages: ['Confirm'],
					upcomingStages: ['Complete'],
					description: window.I18n.t('settings.status.saving_desc'),
					macros: [],
					colorScheme: '#5865f2',
				},
				success: {
					title: window.I18n.t('settings.status.success_title'),
					timelineLabel: 'Complete',
					previousStages: ['Confirm', 'Apply'],
					upcomingStages: [],
					description: window.I18n.t('settings.status.success_desc'),
					macros: [],
					colorScheme: '#4caf50',
				},
			},
		};
		const groupsInstall = [];
		const installItems = [];
		const updateItems = [];
		if (this.snapshot && this.snapshot.advConfigExists) {
			updateItems.push({
				text: window.I18n.t('modal.items.update_cfg'),
				file: 'adv_filament_swap.cfg',
			});
		} else {
			installItems.push({
				text: window.I18n.t('modal.items.install_cfg'),
				file: 'adv_filament_swap.cfg',
			});
		}
		if (this.snapshot && Array.isArray(this.snapshot.conflicts)) {
			const runoutConflict = this.snapshot.conflicts.find((c) => c.isRunoutSensor);
			if (runoutConflict) {
				let codeSample = 'runout_gcode: RUN_OUT';
				try {
					const ftxt = this.snapshot.files.get(runoutConflict.file) || '';
					const block = this.client.getSectionBlock(
						ftxt,
						'filament_switch_sensor runout'
					);
					const m = /^(\s*)runout_gcode\s*:(.*)$/m.exec(block || '');
					const orig = m ? String(m[2] || '').trim() : '';
					codeSample = `[filament_switch_sensor runout]\n# AFS_BACKUP runout_gcode:${orig}\nrunout_gcode: RUN_OUT`;
				} catch (e) {}
				groupsInstall.push({
					header: window.I18n.t('modal.groups.fix'),
					items: [
						{
							text: window.I18n.t('modal.items.fix_runout'),
							file: runoutConflict.file,
							code: codeSample,
						},
					],
				});
			}
		}
		if (!this.snapshot.hasAFSInclude) {
			installItems.push({
				text: window.I18n.t('modal.items.add_include'),
				file: 'printer.cfg',
				code: '[include adv_filament_swap.cfg]',
			});
		}
		if (installItems.length > 0) {
			groupsInstall.push({
				header: window.I18n.t('modal.groups.install'),
				items: installItems,
			});
		}
		if (updateItems.length > 0) {
			groupsInstall.push({
				header: window.I18n.t('modal.groups.update'),
				items: updateItems,
			});
		}
		groupsInstall.push({
			header: window.I18n.t('modal.groups.restart'),
			items: [{ text: window.I18n.t('modal.items.restart_klipper') }],
		});
		cfg.stages.install_confirm.actionGroups = groupsInstall;
		const modal = new window.FilamentSwapModal(cfg, Date.now());
		const wait = (ms) => new Promise((r) => setTimeout(r, ms));
		const run = async () => {
			modal.pushStage('apply');
			modal.pushUpdate(window.I18n.t('modal.log.validating_config'), 5);
			await wait(5000);
			let newText = this.fullConfigText;
			const rebuildBlock = window.ConfigParser
				? window.ConfigParser.buildBlock
				: (blockName, data) => {
						const lines = data.map((item) => `\t\t"${item.key}": ${item.value},`);
						return `${blockName}:\n\t{\n${lines.join('\n')}\n\t}`;
				  };
			if (this.configData.defaults.length > 0) {
				newText = newText.replace(
					/variable_defaults:\s*\{[\s\S]*?\n\s*\}/m,
					rebuildBlock('variable_defaults', this.configData.defaults)
				);
			}
			if (this.configData.originStrings.length > 0) {
				newText = newText.replace(
					/variable_origin_string_data:\s*\{[\s\S]*?\n\s*\}/m,
					rebuildBlock('variable_origin_string_data', this.configData.originStrings)
				);
			}
			if (this.configData.statusStrings.length > 0) {
				newText = newText.replace(
					/variable_status_string_data:\s*\{[\s\S]*?\n\s*\}/m,
					rebuildBlock('variable_status_string_data', this.configData.statusStrings)
				);
			}
			if (window.ConfigParser) {
				['pre', 'post'].forEach((type) => {
					const hook = this.macroHooks[type];
					const macroName = type === 'pre' ? 'AFS_PRE_SWAP' : 'AFS_POST_SWAP';
					const desc =
						type === 'pre'
							? 'Run custom code before swap starts'
							: 'Run custom code after swap completes';
					let body = '';
					if (hook.selection || hook.message) {
						if (hook.message) {
							body += `AFS_PUSH TYPE=0 STATUS="${hook.message}"\n`;
							body += `G4 P2000 ; MSG_WAIT\n`;
						}
						if (hook.selection) {
							const code =
								hook.selection === 'custom_gcode' ? hook.gcode : hook.selection;
							body += code;
						}
					}
					if (body) {
						newText = window.ConfigParser.injectMacro(newText, macroName, body, desc);
					} else {
						newText = window.ConfigParser.removeMacro(newText, macroName);
					}
				});
			}
			try {
				modal.pushUpdate(window.I18n.t('modal.log.writing_cfg'), 3);
				await this.client.saveFile('adv_filament_swap.cfg', newText);
				modal.pushUpdate(window.I18n.t('modal.log.file_saved'), 0);
			} catch (e) {}
			if (this.snapshot && Array.isArray(this.snapshot.conflicts)) {
				const runoutConflicts = this.snapshot.conflicts.filter((c) => c.isRunoutSensor);
				const hasPrinterRunout = runoutConflicts.some((c) => c.file === 'printer.cfg');
				const otherRunoutFiles = runoutConflicts
					.filter((c) => c.file !== 'printer.cfg')
					.map((c) => c.file);
				if (hasPrinterRunout) {
					modal.pushUpdate(
						window.I18n.t('modal.log.fix_runout_in_file', { file: 'printer.cfg' }),
						3
					);
				}
				modal.pushUpdate(window.I18n.t('modal.log.checking_include'), 5);
				await wait(5000);
				const ops = {};
				if (hasPrinterRunout) ops.fixRunout = true;
				if (forceInstall || !this.snapshot.hasAFSInclude) ops.addInclude = true;
				if (ops.fixRunout || ops.addInclude) {
					try {
						const resInstall = await this.client.updatePrinterCfg(this.snapshot, ops);
						if (resInstall.runoutFixed) {
							try {
								const verifyText = await this.client.readPrinterConfigRaw();
								const block = this.client.getSectionBlock(
									verifyText,
									'filament_switch_sensor runout'
								);
								const good = /(^|\n)\s*runout_gcode\s*:\s*RUN_OUT\s*(\n|$)/.test(
									block || ''
								);
								if (good) {
									modal.pushUpdate(window.I18n.t('modal.log.runout_fixed'), 0);
								} else {
									modal.pushUpdate(
										window.I18n.t('modal.log.runout_fix_verify_failed'),
										1
									);
								}
							} catch (e) {
								modal.pushUpdate(
									window.I18n.t('modal.log.runout_fix_verify_failed'),
									1
								);
							}
						}
						if (resInstall.includeAdded) {
							modal.pushUpdate(window.I18n.t('modal.log.include_added'), 0);
						}
					} catch (e) {}
				}
				if (otherRunoutFiles.length > 0) {
					try {
						const okOther = await this.client.fixRunoutSensors(this.snapshot, [
							'printer.cfg',
						]);
						if (okOther) {
							try {
								const f = otherRunoutFiles[0];
								const verifyText = await (f === 'printer.cfg'
									? this.client.readPrinterConfigRaw()
									: this.client.readConfigFile(f));
								const block = this.client.getSectionBlock(
									verifyText,
									'filament_switch_sensor runout'
								);
								const good = /(^|\n)\s*runout_gcode\s*:\s*RUN_OUT\s*(\n|$)/.test(
									block || ''
								);
								if (good) {
									modal.pushUpdate(window.I18n.t('modal.log.runout_fixed'), 0);
								} else {
									modal.pushUpdate(
										window.I18n.t('modal.log.runout_fix_verify_failed'),
										1
									);
								}
							} catch (e) {
								modal.pushUpdate(
									window.I18n.t('modal.log.runout_fix_verify_failed'),
									1
								);
							}
						}
					} catch (e) {}
				}
			}
			modal.pushUpdate(window.I18n.t('modal.log.restarting'), 5);
			await wait(5000);
			try {
				await this.client.restartFirmware();
				modal.pushUpdate(window.I18n.t('modal.log.reconnecting'), 0);
			} catch (e) {}
			const date = new Date().toISOString();
			window.UserSettings.set('setupCompletedOn', date);
			this.configDirty = false;
			const successStage = cfg.stages.success;
			successStage.macros = [
				{
					label: window.I18n.t('settings.common.refresh_page'),
					primary: true,
					callback: () => {
						location.reload();
					},
				},
				{
					label: window.I18n.t('settings.common.close'),
					callback: () => {
						modal.close();
					},
				},
			];
			modal.pushStage('success');
			modal.pushUpdate(window.I18n.t('modal.log.success'), 0);
		};
		const confirmStage = cfg.stages.install_confirm;
		confirmStage.macros = [
			{
				label: window.I18n.t('settings.common.cancel'),
				icon: 'close',
				callback: () => {
					modal.close();
				},
			},
			{
				label: window.I18n.t('settings.common.install_repair'),
				primary: true,
				icon: 'install',
				callback: async () => {
					let blocked = false;
					try {
						blocked = await this.client.isPrintActive();
					} catch (e) {}
					if (blocked) {
						cfg.stages.blocked = {
							title: window.I18n.t('settings.status.install_blocked_title'),
							timelineLabel: 'Confirm',
							previousStages: ['Confirm'],
							upcomingStages: [],
							description: window.I18n.t('settings.status.install_blocked_desc'),
							macros: [
								{
									label: window.I18n.t('settings.common.close'),
									icon: 'close',
									callback: () => modal.close(),
								},
							],
							colorScheme: '#e53935',
						};
						modal.pushStage('blocked');
						return;
					}
					run();
				},
			},
		];
		modal.pushStage('install_confirm');
	}

	_processSave(forceInstall) {
		let newText = this.fullConfigText;

		const rebuildBlock = window.ConfigParser
			? window.ConfigParser.buildBlock
			: (blockName, data) => {
					// Fallback if parser not loaded (unlikely)
					const lines = data.map((item) => `\t\t"${item.key}": ${item.value},`);
					return `${blockName}:\n\t{\n${lines.join('\n')}\n\t}`;
			  };

		if (this.configData.defaults.length > 0) {
			newText = newText.replace(
				/variable_defaults:\s*\{[\s\S]*?\n\s*\}/m,
				rebuildBlock('variable_defaults', this.configData.defaults)
			);
		}

		if (this.configData.originStrings.length > 0) {
			newText = newText.replace(
				/variable_origin_string_data:\s*\{[\s\S]*?\n\s*\}/m,
				rebuildBlock('variable_origin_string_data', this.configData.originStrings)
			);
		}

		if (this.configData.statusStrings.length > 0) {
			newText = newText.replace(
				/variable_status_string_data:\s*\{[\s\S]*?\n\s*\}/m,
				rebuildBlock('variable_status_string_data', this.configData.statusStrings)
			);
		}

		// Inject Hooks
		if (window.ConfigParser) {
			['pre', 'post'].forEach((type) => {
				const hook = this.macroHooks[type];
				const macroName = type === 'pre' ? 'AFS_PRE_SWAP' : 'AFS_POST_SWAP';
				const desc =
					type === 'pre'
						? 'Run custom code before swap starts'
						: 'Run custom code after swap completes';

				let body = '';
				if (hook.selection || hook.message) {
					if (hook.message) {
						body += `AFS_PUSH TYPE=0 STATUS="${hook.message}"\n`;
						body += `G4 P2000 ; MSG_WAIT\n`;
					}

					if (hook.selection) {
						const code =
							hook.selection === 'custom_gcode' ? hook.gcode : hook.selection;
						body += code;
					}
				}

				if (body) {
					newText = window.ConfigParser.injectMacro(newText, macroName, body, desc);
				} else {
					newText = window.ConfigParser.removeMacro(newText, macroName);
				}
			});
		}

		this.client
			.saveFile('adv_filament_swap.cfg', newText)
			.then(() => {
				// Check for runout sensor conflict and fix it if it exists
				if (this.state.conflicts) {
					const runoutConflict = this.state.conflicts.find((c) => c.isRunoutSensor);
					if (runoutConflict) {
						return this.client.fixRunoutSensor(runoutConflict.file);
					}
				}
			})
			.then(() => {
				if (forceInstall || !this.snapshot.hasAFSInclude) {
					return this.client.addAFSIncludeFromSnapshot(this.snapshot);
				}
			})
			.then(() => {
				// Update setup date
				const date = new Date().toISOString();
				window.UserSettings.set('setupCompletedOn', date);
				this.configDirty = false;

				// Restart firmware and refresh page
				this.client
					.restartFirmware()
					.then(() => {
						location.reload();
					})
					.catch((err) => {
						if (window.logger)
							window.logger.error('SettingsModal', 'Firmware restart failed', err);
						location.reload();
					});
			})
			.catch((err) => {
				alert(window.I18n.t('settings.common.save_fail', { error: err.message }));
			});
	}
}

window.SettingsModal = SettingsModal;
