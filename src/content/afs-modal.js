/**
 * Class representing the Advanced Filament Swap Modal Dialog
 */
class FilamentSwapModal {
	static lastProcessId = -1;

	constructor(config, processId) {
		this._validateConfig(config);
		this._validateProcessId(processId);

		this.config = config;
		this.processId = processId;
		this.currentStage = null;
		this.elements = {};
		this.timerInterval = null;
		this.metaInterval = null;
		this._metaText = '';
		this._etaRemaining = 0;
		this.lastEtaElement = null;

		// Fixed timeline state
		this.timelineItems = [];
		this.currentTimelineIndex = 0;

		// Inject CSS if not already present
		this._injectStyles();

		// Create Modal DOM
		this._createModalStructure();

		// Update static tracker
		FilamentSwapModal.lastProcessId = processId;

		// Add to document
		document.body.appendChild(this.elements.overlay);

		// Trigger enter animation
		requestAnimationFrame(() => {
			this.elements.overlay.classList.add('visible');
		});
	}

	_validateConfig(config) {
		if (!config || typeof config !== 'object' || !config.stages) {
			window.logger.error('Main', 'Invalid configuration: "stages" object is required.');
		}
	}

	_validateProcessId(processId) {
		const pid = parseInt(processId, 10);
		if (isNaN(pid)) window.logger.error('Main', 'Invalid processId: must be an integer.');
		if (pid <= FilamentSwapModal.lastProcessId) {
			window.logger.error(
				'Main',
				`Invalid processId: ${pid} must be greater than last ID ${FilamentSwapModal.lastProcessId}`
			);
		}
	}

	_injectStyles() {
		if (window.StyleUtils) {
			window.StyleUtils.inject('afs-modal-styles', 'src/content/styles/afs-modal.css');
		} else if (!document.getElementById('afs-modal-styles')) {
			// Fallback
			const link = document.createElement('link');
			link.id = 'afs-modal-styles';
			link.rel = 'stylesheet';
			// Attempt to use extension URL if available, otherwise relative path
			if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
				link.href = chrome.runtime.getURL('src/content/styles/afs-modal.css');
			} else {
				// Fallback for non-extension environment (e.g. local dev or direct injection)
				// Assuming standard structure relative to the script or root
				link.href = 'src/content/styles/afs-modal.css';
			}
			document.head.appendChild(link);
		}
	}

	_createModalStructure() {
		// Overlay
		this.elements.overlay = document.createElement('div');
		this.elements.overlay.className = 'afs-modal-overlay';

		this.elements.overlay.addEventListener('click', (ev) => {
			if (ev.target === this.elements.overlay) {
				if (!this.elements.modal.classList.contains('minimized')) {
					this._triggerShake();
				}
			}
		});

		// Modal Container
		this.elements.modal = document.createElement('div');
		this.elements.modal.className = 'afs-modal';
		this.elements.overlay.appendChild(this.elements.modal);

		// Header
		const header = document.createElement('div');
		header.className = 'afs-modal-header';

		this.elements.title = document.createElement('h3');
		this.elements.title.className = 'afs-modal-title';
		this.elements.title.textContent = window.I18n.t('modal.title');

		// Timeline moved to header
		this.elements.timeline = document.createElement('div');
		this.elements.timeline.className = 'afs-timeline';

		const controls = document.createElement('div');
		controls.className = 'afs-header-controls';
		this.elements.headerControls = controls;

		const minBtn = document.createElement('button');
		minBtn.className = 'afs-btn-icon';
		minBtn.textContent = '\u005F'; // Underscore
		minBtn.title = window.I18n.t('modal.minimize_restore');
		this.elements.minBtn = minBtn;
		minBtn.onclick = () => this.minimize();

		const connInd = document.createElement('span');
		connInd.className = 'afs-conn-indicator';
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('viewBox', '0 0 24 24');
		svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
		svg.setAttribute('fill', '#000000');

		const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

		const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path1.setAttribute('fill', 'none');
		path1.setAttribute('d', 'M0 0H24V24H0z');

		const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path2.setAttribute(
			'd',
			'M12 3c4.284 0 8.22 1.497 11.31 3.996l-1.257 1.556C19.306 6.331 15.808 5 12 5c-3.089 0-5.973.875-8.419 2.392L12 17.817l6-7.429v3.183L12 21 .69 6.997C3.78 4.497 7.714 3 12 3zm10 16v2h-2v-2h2zm0-9v7h-2v-7h2z'
		);

		g.appendChild(path1);
		g.appendChild(path2);
		svg.appendChild(g);
		connInd.appendChild(svg);
		connInd.title = window.I18n.t('modal.connection_lost');
		this.elements.connIndicator = connInd;

		/*const closeBtn = document.createElement('button');
		closeBtn.className = 'afs-btn-icon';
		closeBtn.textContent = '\u2715'; // X
		closeBtn.onclick = () => this.close();*/

		controls.appendChild(connInd);
		controls.appendChild(minBtn);
		//controls.appendChild(closeBtn);

		const titleGroup = document.createElement('div');
		titleGroup.className = 'afs-header-left';
		titleGroup.appendChild(this.elements.title);
		titleGroup.appendChild(this.elements.timeline);

		header.appendChild(titleGroup);
		header.appendChild(controls);
		this.elements.modal.appendChild(header);

		// Body
		this.elements.body = document.createElement('div');
		this.elements.body.className = 'afs-modal-body';
		this.elements.modal.appendChild(this.elements.body);

		// Console Area
		this.elements.consoleWrapper = document.createElement('div');
		this.elements.consoleWrapper.className = 'afs-console-wrapper hidden';

		const consoleHeader = document.createElement('div');
		consoleHeader.className = 'afs-console-header';
		consoleHeader.textContent = window.I18n.t('modal.status_log');
		this.elements.consoleWrapper.appendChild(consoleHeader);

		this.elements.console = document.createElement('div');
		this.elements.console.className = 'afs-console';
		this.elements.consoleWrapper.appendChild(this.elements.console);

		this.elements.stageContainer = document.createElement('div');
		this.elements.stageContainer.className = 'afs-stage-info';
		this.elements.body.appendChild(this.elements.stageContainer);

		this.elements.body.appendChild(this.elements.consoleWrapper);

		// Footer
		this.elements.footer = document.createElement('div');
		this.elements.footer.className = 'afs-modal-footer';
		this.elements.modal.appendChild(this.elements.footer);
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
		} else if (name === 'close') {
			const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			p1.setAttribute('x1', '6');
			p1.setAttribute('y1', '6');
			p1.setAttribute('x2', '18');
			p1.setAttribute('y2', '18');
			svg.appendChild(p1);
			const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			p2.setAttribute('x1', '6');
			p2.setAttribute('y1', '18');
			p2.setAttribute('x2', '18');
			p2.setAttribute('y2', '6');
			svg.appendChild(p2);
		} else if (name === 'refresh') {
			const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			p1.setAttribute('d', 'M20 11a8 8 0 1 0-3 6');
			svg.appendChild(p1);
			const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
			p2.setAttribute('points', '20 7 20 11 16 11');
			svg.appendChild(p2);
		}
		return svg;
	}

	_triggerShake() {
		if (!this.elements.modal) return;
		this.elements.modal.classList.add('shake');
		const onEnd = () => {
			this.elements.modal.classList.remove('shake');
			this.elements.modal.removeEventListener('animationend', onEnd);
		};
		this.elements.modal.addEventListener('animationend', onEnd);
	}

	pushStage(stageIndex) {
		const stage = this.config.stages[stageIndex];
		if (!stage) {
			console.error(`Stage ${stageIndex} not found in config`);
			return;
		}

		// Initialize fixed timeline if empty (first pushStage)
		if (this.timelineItems.length === 0) {
			this.timelineItems = [
				...(stage.previousStages || []),
				stage.timelineLabel,
				...(stage.upcomingStages || []),
			];
		}

		// Update current timeline index
		// Search from current index to handle duplicate labels correctly (progression)
		let newIndex = this.timelineItems.indexOf(stage.timelineLabel, this.currentTimelineIndex);
		// Fallback: search from beginning if not found (e.g. reset or backward jump)
		if (newIndex === -1) {
			newIndex = this.timelineItems.indexOf(stage.timelineLabel);
		}
		if (newIndex !== -1) {
			this.currentTimelineIndex = newIndex;
		}

		this.currentStage = stageIndex;
		this._finishPreviousReadout();

		// Clear and hide console on new stage
		this.elements.console.textContent = '';
		this.elements.consoleWrapper.classList.add('hidden');

		// Update Title
		//this.elements.title.textContent = stage.title || 'Filament Swap';

		// Update Content
		this.elements.stageContainer.textContent = '';

		const titleEl = document.createElement('h2');
		titleEl.className = 'afs-stage-title';
		// Use i18n for title
		const stageTitle = window.I18n.t(`modal.stages.${stageIndex}.title`);
		titleEl.textContent =
			stageTitle !== `modal.stages.${stageIndex}.title` ? stageTitle : stage.title;

		const descEl = document.createElement('p');
		descEl.className = 'afs-stage-desc';
		// Use i18n for desc
		const stageDesc = window.I18n.t(`modal.stages.${stageIndex}.desc`);
		descEl.textContent =
			stageDesc !== `modal.stages.${stageIndex}.desc` ? stageDesc : stage.description || '';

		if (stage.colorScheme) {
			titleEl.style.color = stage.colorScheme;
		}

		this.elements.stageContainer.appendChild(titleEl);

		if (Array.isArray(stage.actionGroups) && stage.actionGroups.length > 0) {
			stage.actionGroups.forEach((group) => {
				const h = document.createElement('h3');
				h.className = 'afs-action-header';
				h.textContent = group.header || '';
				this.elements.stageContainer.appendChild(h);
				const list = document.createElement('ul');
				const cat = (group.header || '').toLowerCase().replace(/\s+/g, '-');
				list.className = 'afs-action-list ' + (cat ? 'afs-cat-' + cat : '');
				(group.items || []).forEach((item) => {
					const li = document.createElement('li');
					const txt = document.createElement('span');
					txt.className = 'afs-action-text';
					txt.textContent = item.text || '';
					li.appendChild(txt);
					if (item.file) {
						const file = document.createElement('span');
						file.className = 'afs-action-file';
						file.textContent = item.file;
						li.appendChild(file);
					}
					if (item.code) {
						const label = document.createElement('div');
						label.className = 'afs-action-preview';
						label.textContent = window.I18n.t('modal.preview_header');
						li.appendChild(label);
						const pre = document.createElement('pre');
						pre.className = 'afs-action-code';
						pre.textContent = item.code;
						li.appendChild(pre);
					}
					list.appendChild(li);
				});
				this.elements.stageContainer.appendChild(list);
			});
		} else if (Array.isArray(stage.actionItems) && stage.actionItems.length > 0) {
			const list = document.createElement('ul');
			list.className = 'afs-action-list';
			stage.actionItems.forEach((txt) => {
				const li = document.createElement('li');
				li.textContent = txt;
				list.appendChild(li);
			});
			this.elements.stageContainer.appendChild(list);
		}

		this.elements.stageContainer.appendChild(descEl);

		// Update Timeline
		this._updateTimeline(stage);

		this.elements.footer.textContent = '';
		this.elements.footer.classList.remove('hidden');

		if (
			stageIndex === 'filament_swap_loading' ||
			stageIndex === 'load_new_loaded' ||
			stageIndex === 'manual_swap_prepare'
		) {
			if (stageIndex === 'manual_swap_prepare') {
				const unloadBtn = document.createElement('button');
				unloadBtn.className = 'afs-btn afs-btn-secondary';
				unloadBtn.textContent = window.I18n.t('settings.common.unload_filament');
				unloadBtn.onclick = () => {
					if (window.sendGcode) window.sendGcode('AFS_UNLOAD');
				};
				this.elements.footer.appendChild(unloadBtn);
			}

			const group = document.createElement('div');
			group.className = 'afs-split-btn-group';
			let selected =
				stageIndex === 'filament_swap_loading' || stageIndex === 'manual_swap_prepare'
					? 'load_150'
					: 'purge_20';
			const labelFor = (val) => {
				const mm = val === 'load_150' ? 150 : parseInt(val.split('_')[1] || '20', 10);
				return window.I18n.t('settings.common.load_filament_x', { x: mm });
			};
			const mainBtn = document.createElement('button');
			mainBtn.className = 'afs-btn afs-btn-primary afs-split-btn-main';
			mainBtn.textContent = labelFor(selected);
			if (stage.colorScheme) mainBtn.style.backgroundColor = stage.colorScheme;
			const caretBtn = document.createElement('button');
			caretBtn.className = 'afs-btn-icon afs-split-btn-caret';
			caretBtn.textContent = '\u25BE';
			const menu = document.createElement('div');
			menu.className = 'afs-dropdown';
			const addItem = (val, text) => {
				const item = document.createElement('div');
				item.className = 'afs-dropdown-item';
				item.textContent = text;
				item.onclick = () => {
					selected = val;
					mainBtn.textContent = labelFor(selected);
					menu.classList.remove('open');
					/*if (selected === 'load_150') {
						sendGcode('LOAD_FILAMENT');
					} else {
						const mm = parseInt(selected.split('_')[1] || '20', 10);
						sendGcode(`LOAD_FILAMENT PURGE=${mm}`);
					}*/
				};
				menu.appendChild(item);
			};
			if (stageIndex === 'filament_swap_loading') {
				addItem('load_150', window.I18n.t('settings.common.load_x', { x: 150 }));
			}
			addItem('purge_20', window.I18n.t('settings.common.purge_x', { x: 20 }));
			addItem('purge_40', window.I18n.t('settings.common.purge_x', { x: 40 }));
			addItem('purge_60', window.I18n.t('settings.common.purge_x', { x: 60 }));
			addItem('purge_100', window.I18n.t('settings.common.purge_x', { x: 100 }));
			mainBtn.onclick = () => {
				if (selected === 'load_150') {
					if (window.sendGcode) window.sendGcode('LOAD_FILAMENT');
				} else {
					const mm = parseInt(selected.split('_')[1] || '20', 10);
					if (window.sendGcode) window.sendGcode(`LOAD_FILAMENT PURGE=${mm}`);
				}
			};
			caretBtn.onclick = (ev) => {
				ev.stopPropagation();
				menu.classList.toggle('open');
			};
			group.appendChild(mainBtn);
			group.appendChild(caretBtn);
			group.appendChild(menu);
			this.elements.footer.appendChild(group);

			this.elements.overlay.addEventListener('click', (e) => {
				if (!group.contains(e.target)) menu.classList.remove('open');
			});

			if (this.elements.tempControlWrap) {
				this.elements.tempControlWrap.remove();
				this.elements.tempControlWrap = null;
			}
			if (stage.showTempControl && this.elements.headerControls) {
				const ctl = document.createElement('div');
				ctl.className = 'afs-temp-ctl';

				const inp = document.createElement('input');
				inp.className = 'afs-input afs-temp-input-small';
				inp.type = 'number';
				inp.step = '5';
				inp.min = '0';
				const tgt =
					window.printerTelemetry && window.printerTelemetry.extruder
						? window.printerTelemetry.extruder.target
						: null;
				inp.placeholder = String(tgt || 200);
				inp.value = '';
				const commit = () => {
					const val = parseInt(inp.value || inp.placeholder || '200', 10);
					if (Number.isFinite(val) && val > 0) {
						if (window.sendGcode) window.sendGcode(`AFS_SET_TARGET T=${val}`);
						inp.placeholder = String(val);
						inp.value = '';
					}
				};
				inp.addEventListener('change', commit);
				inp.addEventListener('keydown', (e) => {
					if (e.key === 'Enter') commit();
				});
				const caret = document.createElement('button');
				caret.className = 'afs-btn-icon afs-split-btn-caret';
				caret.textContent = '\u25BE';
				const menu2 = document.createElement('div');
				menu2.className = 'afs-dropdown afs-dropdown-below';
				const addPreset2 = (value, label) => {
					const item = document.createElement('div');
					item.className = 'afs-dropdown-item';
					const txt =
						label && label !== String(value)
							? `${label} (${value}\u00B0C)`
							: `${value}\u00B0C`;
					item.textContent = txt;
					item.onclick = () => {
						inp.value = String(value);
						commit();
						menu2.classList.remove('open');
					};
					menu2.appendChild(item);
				};
				const presets = (window.UserSettings && window.UserSettings.get('tempPresets')) || [
					{ value: 180, label: '180' },
					{ value: 200, label: '200' },
					{ value: 220, label: '220' },
					{ value: 240, label: '240' },
					{ value: 260, label: '260' },
				];
				(presets || []).forEach((item) => {
					if (item && typeof item === 'object') {
						const n = parseInt(item.value, 10);
						if (Number.isFinite(n) && n > 0) addPreset2(n, item.label || String(n));
					} else {
						const n = parseInt(item, 10);
						if (Number.isFinite(n) && n > 0) addPreset2(n, String(n));
					}
				});
				caret.onclick = (ev) => {
					ev.stopPropagation();
					menu2.classList.toggle('open');
				};

				const prefix = document.createElement('span');
				prefix.className = 'afs-temp-prefix';
				prefix.textContent = '\u00B0C';

				ctl.appendChild(inp);
				ctl.appendChild(prefix);
				ctl.appendChild(caret);
				ctl.appendChild(menu2);
				const target =
					this.elements.minBtn && this.elements.headerControls
						? this.elements.minBtn
						: null;
				if (target && this.elements.headerControls.contains(target)) {
					this.elements.headerControls.insertBefore(ctl, target);
				} else {
					this.elements.headerControls.appendChild(ctl);
				}
				this.elements.tempControlWrap = ctl;
				this.elements.overlay.addEventListener('click', (e) => {
					if (!ctl.contains(e.target)) menu2.classList.remove('open');
				});
			}
		}

		if (stage.macros && Array.isArray(stage.macros) && stage.macros.length > 0) {
			stage.macros.forEach((macro) => {
				const btn = document.createElement('button');
				btn.className =
					'afs-btn ' +
					(macro.primary ? 'afs-btn-primary' : 'afs-btn-secondary') +
					' afs-btn-with-icon';

				// Try to translate macro label
				let label = macro.label;
				if (label === 'Start Swap') label = window.I18n.t('modal.macros.start_swap');
				else if (label === 'Finish') label = window.I18n.t('modal.macros.finish');
				else if (label === 'Close') label = window.I18n.t('modal.macros.close');

				if (macro.icon) btn.appendChild(this._createIcon(macro.icon));
				const t = document.createElement('span');
				t.textContent = label;
				btn.appendChild(t);
				btn.onclick = () => {
					if (macro.action === 'close') {
						this.close();
					} else if (macro.gcode) {
						if (window.sendGcode) window.sendGcode(macro.gcode);
					} else if (typeof macro.callback === 'function') {
						macro.callback();
					}
				};
				if (stage.colorScheme && macro.primary) {
					btn.style.backgroundColor = stage.colorScheme;
				}
				this.elements.footer.appendChild(btn);
			});
		} else {
			this.elements.footer.classList.add('hidden');
		}
	}

	_updateTimeline(stage) {
		this.elements.timeline.textContent = '';

		this.timelineItems.forEach((label, index) => {
			if (index > 0) {
				this._createTimelineArrow();
			}

			let status = '';
			if (index < this.currentTimelineIndex) {
				status = 'completed';
			} else if (index === this.currentTimelineIndex) {
				status = 'active';
			}

			this._createTimelineStep(label, status);
		});
	}

	_createTimelineStep(text, status) {
		const step = document.createElement('span');
		step.className = `afs-timeline-step ${status}`;

		const key = text.toLowerCase();
		const tVal = window.I18n.t(`modal.timeline.${key}`);
		const displayText = tVal !== `modal.timeline.${key}` ? tVal : text;

		if (status === 'completed') {
			step.textContent = '\u2713 ' + displayText; // Checkmark
			step.title = displayText; // Show text on hover
		} else {
			step.textContent = displayText;
		}
		this.elements.timeline.appendChild(step);
	}

	_createTimelineArrow() {
		const arrow = document.createElement('span');
		arrow.className = 'afs-timeline-arrow';
		arrow.textContent = '\u2192';
		this.elements.timeline.appendChild(arrow);
	}

	pushUpdate(message, eta = 0, ts, status) {
		this._finishPreviousReadout();
		const entry = document.createElement('div');
		entry.className = 'afs-log-entry';

		const time = document.createElement('span');
		time.className = 'afs-log-time';
		const offset = window.wsClockOffset || 0;
		const d = typeof ts === 'number' ? new Date(offset + ts * 1000) : new Date();
		time.textContent = d.toLocaleTimeString();

		const msg = document.createElement('span');
		msg.className = 'afs-log-msg';
		msg.textContent = message;

		entry.appendChild(time);
		entry.appendChild(msg);

		const etaSpan = document.createElement('span');
		etaSpan.className = 'afs-log-eta';
		entry.appendChild(etaSpan);
		if (eta > 0) {
			this._startTimer(etaSpan, eta);
		} else {
			this._etaRemaining = 0;
			this._renderEtaAndMeta(etaSpan, false);
			this._setFooterDisabled(false);
		}
		this.lastEtaElement = etaSpan;

		if (status) this._startMetaUpdater(etaSpan, status);

		this.elements.consoleWrapper.classList.remove('hidden');
		this.elements.console.appendChild(entry);
		this.elements.console.scrollTop = this.elements.console.scrollHeight;

		if (status === 'cooling' && this.currentStage === 'run_out') {
			this._ensureReheatButton();
		}
	}

	_startTimer(element, seconds) {
		this._clearTimer();
		this._etaRemaining = parseInt(seconds);
		this._setFooterDisabled(true);
		const update = () => {
			if (this._etaRemaining <= 0) {
				this._etaRemaining = 0;
				this._renderEtaAndMeta(element, true);
				this._clearTimer();
				this._setFooterDisabled(false);
				return;
			}
			this._renderEtaAndMeta(element, false);
			this._etaRemaining--;
		};
		update();
		this.timerInterval = setInterval(update, 1000);
	}

	_finishPreviousReadout() {
		if (this.lastEtaElement) {
			this.lastEtaElement.textContent = ` (${window.I18n.t('modal.done')})`;
			this._clearTimer();
			this.lastEtaElement = null;
			this._setFooterDisabled(false);
		}
	}

	_startMetaUpdater(element, status) {
		if (this.metaInterval) {
			clearInterval(this.metaInterval);
			this.metaInterval = null;
		}
		const updateMeta = () => {
			let t = '';
			// Use global printerTelemetry
			const telemetry = window.printerTelemetry || {};

			if (status === 'heating' || status === 'temp_set') {
				const curr =
					telemetry.extruder && typeof telemetry.extruder.temperature === 'number'
						? telemetry.extruder.temperature
						: null;
				const tgt =
					telemetry.extruder && typeof telemetry.extruder.target === 'number'
						? telemetry.extruder.target
						: null;
				if (curr != null || tgt != null) {
					const c = curr != null ? Math.round(curr) : '-';
					const tg = tgt != null ? Math.round(tgt) : '-';
					t = `${window.I18n.t('modal.hotend')}: ${c}/${tg}°C`;
				}
			} else if (status === 'homing' || status === 'parking') {
				const pos =
					telemetry.toolhead && Array.isArray(telemetry.toolhead.position)
						? telemetry.toolhead.position
						: null;
				if (pos && pos.length >= 3) {
					const x = pos[0].toFixed(1);
					const y = pos[1].toFixed(1);
					const z = pos[2].toFixed(1);
					t = `${window.I18n.t('modal.pos')}: X${x} Y${y} Z${z}`;
				}
			}
			this._metaText = t;
			this._renderEtaAndMeta(element, false);
		};
		updateMeta();
		this.metaInterval = setInterval(updateMeta, 500);
	}

	_renderEtaAndMeta(element, done) {
		let text = '';
		if (this._etaRemaining > 0) {
			const m = Math.floor(this._etaRemaining / 60);
			const s = this._etaRemaining % 60;
			text = `${window.I18n.t('modal.eta')}: ${m}:${s.toString().padStart(2, '0')}`;
		} else if (done) {
			text = window.I18n.t('modal.done');
		}
		if (!done && this._metaText) {
			text = text ? `${text} | ${this._metaText}` : this._metaText;
		}
		element.textContent = text ? ` (${text})` : '';
	}

	_clearTimer() {
		if (this.timerInterval) {
			clearInterval(this.timerInterval);
			this.timerInterval = null;
		}
		if (this.metaInterval) {
			clearInterval(this.metaInterval);
			this.metaInterval = null;
		}
		this._metaText = '';
		this._etaRemaining = 0;
		this._setFooterDisabled(false);
	}

	_setFooterDisabled(disabled) {
		if (!this.elements.footer) return;
		const buttons = this.elements.footer.querySelectorAll('button');
		buttons.forEach((b) => {
			b.disabled = !!disabled;
		});
	}

	_ensureReheatButton() {
		if (!this.elements.footer) return;
		if (this.elements.footer.querySelector('[data-afs-reheat]')) return;
		const btn = document.createElement('button');
		btn.className = 'afs-btn afs-btn-secondary';
		btn.textContent = window.I18n.t('modal.reheat');
		btn.setAttribute('data-afs-reheat', '1');
		btn.onclick = () => {
			if (window.sendGcode) window.sendGcode('AFS_TEMP_CHECK');
		};
		this.elements.footer.appendChild(btn);
	}

	close() {
		this._clearTimer();
		if (this.elements.overlay && this.elements.overlay.parentNode) {
			this.elements.overlay.classList.remove('visible');
			setTimeout(() => {
				if (this.elements.overlay.parentNode) {
					this.elements.overlay.parentNode.removeChild(this.elements.overlay);
				}
			}, 400); // Match longest CSS transition
		}
	}

	minimize() {
		this.elements.modal.classList.toggle('minimized');
		if (this.elements.overlay) {
			this.elements.overlay.classList.toggle('minimized');
		}
		const isMin = this.elements.modal.classList.contains('minimized');
		if (this.elements.minBtn) {
			this.elements.minBtn.textContent = isMin ? '\u25A1' : '\u005F';
		}
	}

	setConnectionAlive(alive) {
		if (!this.elements.connIndicator) return;
		if (alive) {
			this.elements.connIndicator.classList.remove('down');
		} else {
			this.elements.connIndicator.classList.add('down');
		}
	}
}

// Export for usage
window.FilamentSwapModal = FilamentSwapModal;
