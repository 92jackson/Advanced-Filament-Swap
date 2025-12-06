class MoonrakerClient {
	/**
	 * @param {string} [base] Base origin for HTTP requests (defaults to `location.origin`).
	 */
	constructor(base) {
		this.base = (base && base.trim()) || location.origin;
		this.ws = null;
		this.wsOpen = false;
		this.wsSubscribed = false;

		// Heartbeat configuration
		this.pingInterval = null;
		this.pingTimeout = null;
		this.PING_INTERVAL_MS = 5000;
		this.PONG_TIMEOUT_MS = 2000;
	}

	/**
	 * Detects whether the current origin hosts a Moonraker instance.
	 * @returns {Promise<boolean>} Resolves `true` if `/server/info` responds OK.
	 */
	isMoonraker() {
		return fetch(this.base.replace(/\/$/, '') + '/server/info')
			.then((r) => (r.ok ? r.json() : null))
			.then((j) => j && j.result && typeof j.result.api_version !== 'undefined')
			.catch(() => false);
	}

	/**
	 * Computes the WebSocket URL for the Moonraker instance at the current host.
	 * @returns {string} WebSocket URL (ws:// or wss://).
	 */
	getWebSocketURL() {
		const proto = location.protocol === 'https:' ? 'wss://' : 'ws://';
		return proto + location.host + '/websocket';
	}

	/**
	 * Sends a G-Code command to the printer.
	 * @param {string} gcode The G-Code command to send.
	 * @returns {Promise<void>}
	 */
	sendGcode(gcode) {
		const url = this.base.replace(/\/$/, '') + '/printer/gcode/script';
		// Use POST with query param as per Moonraker API
		return fetch(`${url}?script=${encodeURIComponent(gcode)}`, { method: 'POST' }).catch(
			(err) => {
				if (window.logger) window.logger.error('MoonrakerClient', 'GCode send failed', err);
			}
		);
	}

	/**
	 * Sends a firmware restart command to Moonraker.
	 * @returns {Promise<void>}
	 */
	restartFirmware() {
		const url = this.base.replace(/\/$/, '') + '/printer/firmware_restart';
		return fetch(url, { method: 'POST' }).then((r) => {
			if (!r.ok) throw new Error('Restart failed: ' + r.status);
		});
	}

	isPrintActive() {
		const url = this.base.replace(/\/$/, '') + '/printer/objects/query?print_stats';
		return fetch(url)
			.then((r) => (r.ok ? r.json() : null))
			.then((j) => {
				const st =
					j && j.result && j.result.status && j.result.status.print_stats
						? j.result.status.print_stats.state
						: '';
				return st === 'printing' || st === 'paused';
			})
			.catch(() => false);
	}

	/**
	 * Opens and maintains the AFS WebSocket connection, auto-reconnecting on close.
	 * @returns {void}
	 */
	startAFSWebSocket() {
		const url = this.getWebSocketURL();

		this.ws = new WebSocket(url);

		this.ws.onopen = () => {
			this.wsOpen = true;
			try {
				window.dispatchEvent(new CustomEvent('afs-ws-status', { detail: { open: true } }));
			} catch {}
			this.startHeartbeat();
			this.subscribeAFS();
		};

		this.ws.onmessage = this.handleAFSMessage.bind(this);

		this.ws.onclose = () => {
			this.wsOpen = false;
			this.wsSubscribed = false;
			this.stopHeartbeat();
			try {
				window.dispatchEvent(new CustomEvent('afs-ws-status', { detail: { open: false } }));
			} catch {}
			setTimeout(() => this.startAFSWebSocket(), 1000);
		};

		this.ws.onerror = () => {
			this.wsOpen = false;
			this.stopHeartbeat();
			try {
				window.dispatchEvent(new CustomEvent('afs-ws-status', { detail: { open: false } }));
			} catch {}
		};
	}

	/**
	 * Starts the heartbeat loop to detect connection loss.
	 */
	startHeartbeat() {
		this.stopHeartbeat();
		this.pingInterval = setInterval(() => {
			if (this.wsOpen) {
				this.sendPing();
			}
		}, this.PING_INTERVAL_MS);
	}

	/**
	 * Stops the heartbeat loop.
	 */
	stopHeartbeat() {
		if (this.pingInterval) clearInterval(this.pingInterval);
		if (this.pingTimeout) clearTimeout(this.pingTimeout);
		this.pingInterval = null;
		this.pingTimeout = null;
	}

	/**
	 * Sends a ping (server.info) and waits for response.
	 */
	sendPing() {
		if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

		// Set timeout to kill connection if no pong
		this.pingTimeout = setTimeout(() => {
			if (window.logger)
				window.logger.error('MoonrakerClient', 'WS Ping timeout, reconnecting...');
			try {
				window.dispatchEvent(new CustomEvent('afs-ws-status', { detail: { open: false } }));
			} catch {}
			if (this.ws) this.ws.close();
		}, this.PONG_TIMEOUT_MS);

		this.ws.send(
			JSON.stringify({
				jsonrpc: '2.0',
				method: 'server.info',
				id: 9999,
			})
		);
	}

	/**
	 * Subscribes to `gcode_macro AFS_STATE` over WebSocket.
	 * @returns {void}
	 */
	subscribeAFS() {
		if (this.wsSubscribed || !this.wsOpen) return;

		const msg = {
			jsonrpc: '2.0',
			method: 'printer.objects.subscribe',
			params: {
				objects: {
					'gcode_macro AFS_STATE': ['processid', 'push', 'origin', 'status', 'eta', 'ts'],
					extruder: ['temperature', 'target'],
					toolhead: ['position', 'homed_axes'],
					print_stats: ['state'],
				},
			},
			id: 1,
		};

		this.ws.send(JSON.stringify(msg));
		this.wsSubscribed = true;
	}

	/**
	 * Handles incoming WebSocket messages and dispatches `afs-state` events.
	 * @param {MessageEvent} e WebSocket message event.
	 * @returns {void}
	 */
	handleAFSMessage(e) {
		let data;

		try {
			data = JSON.parse(e.data || '{}');
		} catch {
			return;
		}

		// Handle Pong
		if (data.id === 9999) {
			if (this.pingTimeout) clearTimeout(this.pingTimeout);
			this.pingTimeout = null;
			return;
		}

		if (data.method === 'notify_status_update') {
			const obj = (data.params && data.params[0]) || {};
			const afs = obj['gcode_macro AFS_STATE'];
			if (afs) window.dispatchEvent(new CustomEvent('afs-state', { detail: afs }));
			const extr = obj['extruder'];
			const tool = obj['toolhead'];
			if (extr || tool)
				window.dispatchEvent(
					new CustomEvent('printer-telemetry', {
						detail: { extruder: extr, toolhead: tool },
					})
				);
			const pstats = obj['print_stats'];
			if (pstats)
				window.dispatchEvent(
					new CustomEvent('print-state-change', {
						detail: pstats,
					})
				);
			return;
		}

		if (data.id === 1 && data.result && data.result.status) {
			const status = data.result.status;
			const afs = status['gcode_macro AFS_STATE'];
			if (afs) window.dispatchEvent(new CustomEvent('afs-state', { detail: afs }));
			const extr = status['extruder'];
			const tool = status['toolhead'];
			if (extr || tool)
				window.dispatchEvent(
					new CustomEvent('printer-telemetry', {
						detail: { extruder: extr, toolhead: tool },
					})
				);
			const pstats = status['print_stats'];
			if (pstats)
				window.dispatchEvent(
					new CustomEvent('print-state-change', {
						detail: pstats,
					})
				);
		}
	}

	/**
	 * Fetches a URL and returns its body as text.
	 * @param {string} url Absolute or relative URL to fetch.
	 * @returns {Promise<string>} Response body as text.
	 */
	fetchText(url) {
		// Add timestamp to bypass cache
		const noCacheUrl = url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now();
		return fetch(noCacheUrl, { method: 'GET', cache: 'no-store' }).then((r) => {
			if (!r.ok) throw new Error('HTTP ' + r.status);
			return r.text();
		});
	}

	/**
	 * Reads `printer.cfg` from Moonraker's config root.
	 * @returns {Promise<string>} The contents of `printer.cfg` as text.
	 */
	readPrinterConfigRaw() {
		const url = this.base.replace(/\/$/, '') + '/server/files/config/printer.cfg';
		return this.fetchText(url);
	}

	/**
	 * Reads a specific configuration file from Moonraker's config root.
	 * @param {string} path Relative path under the `config` root (e.g. `macros/m600.cfg`).
	 * @returns {Promise<string>} File contents as text.
	 */
	readConfigFile(path) {
		const url = this.base.replace(/\/$/, '') + '/server/files/config/' + path;
		return this.fetchText(url);
	}

	/**
	 * Queries Moonraker for toolhead axis maximums.
	 * @returns {Promise<{x: number, y: number, z: number}>} Axis maximums or defaults if query fails.
	 */
	getAxisMaximums() {
		const url = this.base.replace(/\/$/, '') + '/printer/objects/query?toolhead';
		return fetch(url)
			.then((r) => (r.ok ? r.json() : null))
			.then((j) => {
				if (j && j.result && j.result.status && j.result.status.toolhead) {
					const th = j.result.status.toolhead;
					if (th.axis_maximum) {
						return {
							x: th.axis_maximum[0] - 2,
							y: th.axis_maximum[1] - 2,
							z: th.axis_maximum[2] - 2,
						};
					}
				}
				return { x: 200, y: 200, z: 200 }; // Fallback
			})
			.catch(() => ({ x: 200, y: 200, z: 200 }));
	}

	deleteConfigFile(path) {
		const urlDel = this.base.replace(/\/$/, '') + '/server/files/config/' + path;
		return fetch(urlDel, { method: 'DELETE' })
			.then((r) => {
				if (r.ok) return true;
				const urlAlt = this.base.replace(/\/$/, '') + '/server/files/delete';
				const fd = new FormData();
				fd.append('path', path);
				fd.append('root', 'config');
				return fetch(urlAlt, { method: 'POST', body: fd }).then((rr) => {
					if (!rr.ok) throw new Error('Delete failed: ' + rr.status);
					return true;
				});
			})
			.catch(() => false);
	}

	/**
	 * Parses `[include ...]` paths from a Klipper/Moonraker config text.
	 * @param {string} text Config file contents.
	 * @returns {string[]} Array of include paths.
	 */
	parseIncludePaths(text) {
		const re = /^\s*\[include\s+([^\]]+)\]/gm;
		const out = [];
		let m;

		while ((m = re.exec(text)) !== null) {
			const p = (m[1] || '').trim();

			if (p) out.push(p);
		}

		return out;
	}

	/**
	 * Extracts a section block by its name, e.g., `[pause_resume]`.
	 * @param {string} text Full config file text.
	 * @param {string} sectionName Name inside brackets.
	 * @returns {string} Block text for that section.
	 */
	getSectionBlock(text, sectionName) {
		const header = new RegExp(
			'^\\s*\\[' + sectionName.replace(/[-\\/\\^$*+?.()|[\\]{}]/g, '\\$&') + '\\]',
			'm'
		);
		const match = header.exec(text);

		if (!match) return '';

		const start = match.index;
		const after = start + match[0].length;
		const next = this.getNextHeaderIndex(text, after);
		const end = next >= 0 ? next : text.length;

		return text.slice(start, end);
	}

	/**
	 * Extracts a `[gcode_macro NAME]` block.
	 * @param {string} text Full config file text.
	 * @param {string} macroName Macro name.
	 * @returns {string} Block text for that macro.
	 */
	getMacroBlock(text, macroName) {
		const header = new RegExp(
			'^\\s*\\[gcode_macro\\s+' +
				macroName.replace(/[-\\/\\^$*+?.()|[\\]{}]/g, '\\$&') +
				'\\]\\s*$',
			'm'
		);
		const match = header.exec(text);

		if (!match) return '';

		const start = match.index;
		const after = start + match[0].length;
		const next = this.getNextHeaderIndex(text, after);
		const end = next >= 0 ? next : text.length;

		return text.slice(start, end);
	}

	/**
	 * Finds the index of the next header (`^[... ]`) after a given offset.
	 * @param {string} text Full config text.
	 * @param {number} fromOffset Start searching after this offset.
	 * @returns {number} Index of next header, or -1 if none.
	 */
	getNextHeaderIndex(text, fromOffset) {
		const re = /^\s*\[[^\]]+\]/gm;
		re.lastIndex = fromOffset;
		const m = re.exec(text);

		return m ? m.index : -1;
	}

	/**
	 * Queries Moonraker for the list of available G-Code macros.
	 * @returns {Promise<string[]>} List of macro names.
	 */
	getGcodeMacros() {
		const url = this.base.replace(/\/$/, '') + '/printer/objects/list';
		return fetch(url)
			.then((r) => (r.ok ? r.json() : null))
			.then((j) => {
				if (j && j.result && j.result.objects) {
					return j.result.objects
						.filter((o) => o.startsWith('gcode_macro '))
						.map((o) => o.replace('gcode_macro ', ''));
				}
				return [];
			})
			.catch(() => []);
	}

	/**
	 * Fetches the source G-Code for a specific macro.
	 * Tries to read from raw config files first to preserve formatting/comments.
	 * Fallbacks to parsed `configfile` object if raw lookup fails.
	 * @param {string} macroName The name of the macro.
	 * @returns {Promise<string>} The G-Code content or empty string.
	 */
	getMacroSource(macroName) {
		// Try raw file lookup first
		return this.findMacroInFiles(macroName).then((raw) => {
			if (raw !== null) return raw;

			// Fallback to parsed config
			const url = this.base.replace(/\/$/, '') + '/printer/objects/query?configfile';
			return fetch(url)
				.then((r) => (r.ok ? r.json() : null))
				.then((j) => {
					if (
						j &&
						j.result &&
						j.result.status &&
						j.result.status.configfile &&
						j.result.status.configfile.config
					) {
						const key = 'gcode_macro ' + macroName;
						const config = j.result.status.configfile.config[key];
						return config ? config.gcode || '' : '';
					}
					return '';
				})
				.catch(() => '');
		});
	}

	/**
	 * Scans config files for a macro definition and extracts its G-Code block.
	 * @param {string} macroName Name of the macro.
	 * @returns {Promise<string|null>} Raw G-Code string or null if not found.
	 */
	findMacroInFiles(macroName) {
		const queue = ['printer.cfg'];
		const visited = new Set(['printer.cfg']);

		// Helper to process queue recursively
		const processNext = () => {
			if (queue.length === 0) return Promise.resolve(null);

			const currentFile = queue.shift();
			const isRoot = currentFile === 'printer.cfg';

			const readPromise = isRoot
				? this.readPrinterConfigRaw()
				: this.readConfigFile(currentFile);

			return readPromise
				.then((text) => {
					// Check if macro exists in this file
					const re = new RegExp(
						'^\\s*\\[gcode_macro\\s+' +
							macroName.replace(/[-\\/\\^$*+?.()|[\\]{}]/g, '\\$&') +
							'\\]\\s*$',
						'm'
					);

					if (re.test(text)) {
						const block = this.getMacroBlock(text, macroName);
						return this.extractGCodeFromBlock(block);
					}

					// Parse includes
					const includes = this.parseIncludePaths(text);
					for (const inc of includes) {
						if (!visited.has(inc)) {
							visited.add(inc);
							queue.push(inc);
						}
					}

					return processNext();
				})
				.catch(() => processNext()); // Skip file on error
		};

		return processNext();
	}

	/**
	 * Parses a [gcode_macro] block and extracts the gcode section body,
	 * preserving relative indentation but stripping base indentation.
	 * @param {string} block The full macro block text.
	 * @returns {string} The G-Code body.
	 */
	extractGCodeFromBlock(block) {
		const lines = block.split('\n');
		let gcodeLines = [];
		let inGcode = false;

		// Determine indentation of "gcode:" key if possible to handle "gcode: ..." on same line
		// But Klipper usually enforces "gcode:" then newline.
		// We will scan line by line.

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			// Skip section header
			if (line.trim().startsWith('[') && line.trim().endsWith(']')) continue;

			// Check for key: value
			// We need to be careful not to match "key: value" inside gcode if we are already in gcode
			// BUT, a new key at the same indentation level as "gcode:" ends the gcode block.
			// Since we don't strictly know the indentation level of "gcode:", we assume standard Klipper config:
			// Keys are usually at the root indentation of the section (often 0 or indented).
			// GCode lines are indented further.

			// Simple heuristic:
			// If we are NOT in gcode, look for "gcode:".
			// If we ARE in gcode, check if the line looks like a new config key (start of line, no extra indent compared to keys).
			// However, macros can have anything.
			// The reliable way is: "gcode:" starts the block. The block ends when another key starts OR the section ends.
			// In Klipper config, keys must be at the beginning of the line (or same indent).
			// Gcode lines MUST be indented further than the "gcode:" key.

			const keyMatch = /^\s*([A-Za-z0-9_]+)\s*:(.*)/.exec(line);

			if (!inGcode) {
				if (keyMatch) {
					const key = keyMatch[1].toLowerCase();
					if (key === 'gcode') {
						inGcode = true;
						// If there is content after "gcode:", it's the first line of gcode
						if (keyMatch[2].trim()) {
							gcodeLines.push(keyMatch[2].trim());
						}
					}
				}
			} else {
				// We are in gcode.
				// Check if this line terminates the gcode block.
				// A line terminates the block if it is a new key definition.
				// A new key definition in Klipper config is a line that is NOT indented further than the previous key.
				// But "gcode:" allows the value to be indented.
				// Actually, Klipper parser logic:
				// The value of a option can span multiple lines if the subsequent lines are indented.
				// So any line that is NOT indented (start of line) or indented LESS/EQUAL to the "gcode:" key is a new key.
				// We can assume keys start with non-whitespace or are less indented.
				// Simplest safe assumption for now: if it looks like "key: value" AND is at the start of the line (no indent), it's a new key.
				// Most macros in printer.cfg have keys at indent 0.

				// Refined check: if line starts with non-whitespace character, it is a new key (unless it's a comment?)
				// Comments at start of line in a macro ARE part of the macro gcode usually?
				// No, comments starting with # or ; at start of line might be config comments.
				// BUT inside gcode, we want to preserve them if they are part of the indented block.

				// Let's look at the user's failure case.
				// The user's file has:
				// gcode:
				//   {% set ... %}
				// ...
				//   {% endif %}
				//
				// The output was truncated at "Hyperlapse: No valid input parameter".
				// This looks like the regex or split logic failed on a specific line.
				// "Hyperlapse: No valid input parameter" is inside `{action_raise_error("...")}`.
				// The multiline string inside `{...}` might be confusing the parser if we aren't careful.

				// Wait, the user says "this was the output preview... however this is from the file".
				// The file shows `{action_raise_error("Hyperlapse: No valid input parameter \n Use: ...")}`
				// The output shows `{action_raise_error("Hyperlapse: No valid input parameter` and stops.
				// It seems the multi-line jinja/gcode tag was cut off.

				// Ah, `extractGCodeFromBlock` iterates `lines`.
				// `lines` comes from `block.split('\n')`.
				// The logic seems to simply push lines.
				// Why did it cut off?

				// The user's example output ends with:
				// `  {action_raise_error("Hyperlapse: No valid input parameter `
				//
				// The file has:
				// `    {action_raise_error("Hyperlapse: No valid input parameter `
				// `                         Use: `
				// `                         - HYPERLAPSE ACTION=START [CYCLE=time] `
				// `                         - HYPERLAPSE ACTION=STOP")} `
				//
				// This means the lines:
				// `                         Use: `
				// `                         - HYPERLAPSE ACTION=START [CYCLE=time] `
				// `                         - HYPERLAPSE ACTION=STOP")} `
				// were NOT included.

				// Why?
				// My previous logic:
				// `const keyMatch = /^\s*([A-Za-z0-9_]+)\s*:(.*)/.exec(line);`
				// `if (keyMatch) { ... }`

				// The line `                         Use: ` matches `^\s*([A-Za-z0-9_]+)\s*:(.*)`!
				// `Use` matches `[A-Za-z0-9_]+`.
				// So it thinks `Use:` is a new config key, so it sets `inGcode = false`.

				// FIX: Config keys usually appear at the start of the line (indent 0) or at a specific indentation level.
				// Inside a `gcode:` block, lines are indented.
				// We should ONLY detect a new key if it is at the SAME or LOWER indentation level than the `gcode:` key.
				// Since we don't track `gcode:` indent easily here, we can assume that for a valid Klipper config,
				// the multiline value MUST be indented MORE than the key.
				// If `gcode:` is at indent 0, any line starting with whitespace is part of the value.
				// Any line starting with non-whitespace is a new key (or section end).

				// We will enforce: a line is a new key ONLY if it starts with a non-whitespace character (excluding comments).
				// If it starts with whitespace, it is a continuation of the gcode block.

				const isIndented = /^\s/.test(line);
				const isComment = /^\s*[#;]/.test(line);
				const looksLikeKey = /^[A-Za-z0-9_]+\s*:/.test(line);

				if (!isIndented && looksLikeKey) {
					inGcode = false;
				} else {
					gcodeLines.push(line);
				}
			}
		}

		// Trim trailing comment lines (which likely belong to the next macro)
		while (gcodeLines.length > 0) {
			const last = gcodeLines[gcodeLines.length - 1].trim();
			if (!last || last.startsWith('#') || last.startsWith(';')) {
				gcodeLines.pop();
			} else {
				break;
			}
		}

		if (gcodeLines.length === 0) return '';

		// Determine base indentation from first non-empty line
		const nonEmpty = gcodeLines.filter((l) => l.trim().length > 0);
		if (nonEmpty.length === 0) return gcodeLines.join('\n');

		const firstIndentMatch = nonEmpty[0].match(/^\s*/);
		const baseIndent = firstIndentMatch ? firstIndentMatch[0] : '';

		if (!baseIndent) return gcodeLines.join('\n');

		return gcodeLines
			.map((l) => {
				if (l.startsWith(baseIndent)) return l.substring(baseIndent.length);
				// If line is empty/whitespace but shorter than indent, just make it empty
				if (l.trim().length === 0) return '';
				return l;
			})
			.join('\n');
	}

	/**
	 * Returns the list of macros defined by the AFS system.
	 * @returns {string[]} Array of macro names.
	 */
	getAFSMacroList() {
		return [
			'AFS_CFG',
			'M600',
			'RUN_OUT',
			'FILAMENT_SWAP',
			'LOAD_FILAMENT',
			'FINISH_SWAP',
			'AFS_STATE',
			'AFS_PUSH',
			'PAUSE',
			'RESUME',
			'M125',
			'AFS_LOAD',
			'AFS_UNLOAD',
			'AFS_TEMP_CHECK',
			'AFS_IGNORE_M600',
			'AFS_NOISE',
			'AFS_SILENT',
			'AFS_STORE_TEMPERATURE',
			'AFS_RESTORE_IDLE_TIMEOUT',
			'AFS_INCREMENT_ALERT_COUNT',
			'AFS_COOLDOWN_IF_IDLE',
			'M300',
		];
	}

	/**
	 * Fixes the `runout_gcode` in `[filament_switch_sensor runout]` to be `RUN_OUT`.
	 * @param {string} file Path to the config file.
	 * @returns {Promise<boolean>} `true` if fixed.
	 */
	fixRunoutSensor(file) {
		const readPromise =
			file === 'printer.cfg' ? this.readPrinterConfigRaw() : this.readConfigFile(file);

		return readPromise.then((text) => {
			const headerRe = /^\s*\[filament_switch_sensor\s+runout\]\s*$/m;
			const match = headerRe.exec(text);
			if (!match) return false;

			// Find the block
			const block = this.getSectionBlock(text, 'filament_switch_sensor runout');
			if (!block) return false;

			// Replace `runout_gcode: ...` with `runout_gcode: RUN_OUT`,
			// first backing up the original value via a commented line tagged with AFS_BACKUP.
			let newBlock = block;
			const runoutLineRe = /^(\s*)runout_gcode\s*:(.*)$/m;
			const backupRe = /^\s*#\s*AFS_BACKUP\s+runout_gcode\s*:/m;

			if (runoutLineRe.test(newBlock)) {
				if (!backupRe.test(newBlock)) {
					newBlock = newBlock.replace(runoutLineRe, (m, indent, val) => {
						const orig = String(val || '').trim();
						return `${indent}# AFS_BACKUP runout_gcode:${orig}\n${indent}runout_gcode: RUN_OUT`;
					});
				} else {
					newBlock = newBlock.replace(
						runoutLineRe,
						(m, indent) => `${indent}runout_gcode: RUN_OUT`
					);
				}
			} else {
				// Append to block if no line present
				newBlock = newBlock.trimEnd() + '\nrunout_gcode: RUN_OUT\n';
			}

			// Replace only the first occurrence of the block in the text
			// Since `block` contains the header and content, and `newBlock` is the modified version
			const newText = text.replace(block, newBlock);

			if (file === 'printer.cfg') {
				return this.savePrinterConfig(newText);
			} else {
				// Use the 'config' root explicitly if not absolute path (which it shouldn't be)
				// Actually saveFile takes filename and optional root.
				// If 'file' is 'subfolder/foo.cfg', saveFile should handle it if we pass it as filename?
				// Moonraker saveFile: if root is 'config', filename can be relative path.
				return this.saveFile(file, newText);
			}
		});
	}

	restoreRunoutSensor(file) {
		const readPromise =
			file === 'printer.cfg' ? this.readPrinterConfigRaw() : this.readConfigFile(file);

		return readPromise.then((text) => {
			const headerRe = /^\s*\[filament_switch_sensor\s+runout\]\s*$/m;
			const match = headerRe.exec(text);
			if (!match) return false;

			const block = this.getSectionBlock(text, 'filament_switch_sensor runout');
			if (!block) return false;

			let newBlock = block;
			const backupLineRe = /^(\s*)#\s*AFS_BACKUP\s+runout_gcode\s*:(.*)$/m;
			const runoutLineRe = /^\s*runout_gcode\s*:\s*RUN_OUT\s*$/m;

			const bMatch = backupLineRe.exec(newBlock);
			if (!bMatch) return true;

			const indent = bMatch[1] || '';
			const origVal = String(bMatch[2] || '').trim();
			// Replace backup comment with restored line
			newBlock = newBlock.replace(backupLineRe, `${indent}runout_gcode: ${origVal}`);
			// Remove RUN_OUT override line if present
			newBlock = newBlock.replace(runoutLineRe, '');
			// Normalise excessive blank lines
			newBlock = newBlock.replace(/\n{3,}/g, '\n\n');

			const newText = text.replace(block, newBlock);

			if (file === 'printer.cfg') {
				return this.savePrinterConfig(newText);
			} else {
				return this.saveFile(file, newText);
			}
		});
	}

	/**
	 * Scans `printer.cfg` and its direct includes for conflicts with AFS definitions.
	 * Excludes any include referring to `adv_filament_swap.cfg`.
	 * Optional sections reported if present: `[pause_resume]`, `[respond]`, `[save_variables]`.
	 * Non-optional macros reported if present: `AFS_CFG`, `M600`, `RUN_OUT`, `FILAMENT_SWAP`, `LOAD_FILAMENT`,
	 * `FINISH_SWAP`, `AFS_STATE`, `AFS_PUSH`, `PAUSE`, `RESUME`, `M125`, `AFS_LOAD`, `AFS_UNLOAD`, `AFS_TEMP_CHECK`,
	 * `AFS_IGNORE_M600`, `AFS_NOISE`, `AFS_SILENT`.
	 * @returns {Promise<{conflicts: Array<{name: string, type: 'section'|'gcode_macro', file: string, optional: boolean, content: string}>}>}
	 */
	checkAFSConflicts() {
		const optionalSections = ['pause_resume', 'respond', 'save_variables'];
		const macroNames = this.getAFSMacroList();

		const conflicts = [];
		const files = new Map();
		const queue = ['printer.cfg'];
		const visited = new Set(['printer.cfg']);

		const isAFSFile = (p) => /(^|[\\/])adv_filament_swap\.cfg$/i.test(p || '');

		// Recursive file loader
		const loadAllFiles = () => {
			if (queue.length === 0) return Promise.resolve();

			const currentPath = queue.shift();
			const isRoot = currentPath === 'printer.cfg';

			const readPromise = isRoot
				? this.readPrinterConfigRaw()
				: this.readConfigFile(currentPath);

			return readPromise
				.then((text) => {
					files.set(currentPath, text);

					// Parse includes and add to queue
					const incs = this.parseIncludePaths(text);
					for (const inc of incs) {
						if (!isAFSFile(inc) && !visited.has(inc)) {
							visited.add(inc);
							queue.push(inc);
						}
					}
				})
				.catch(() => {
					// Ignore read errors for includes (file might be missing)
				})
				.then(() => loadAllFiles()); // Process next file
		};

		return loadAllFiles().then(() => {
			for (const [path, text] of files.entries()) {
				for (let k = 0; k < optionalSections.length; k++) {
					const sec = optionalSections[k];
					const re = new RegExp('^\\s*\\[' + sec + '\\]', 'm');

					if (re.test(text)) {
						const block = this.getSectionBlock(text, sec);

						conflicts.push({
							name: sec,
							type: 'section',
							file: path,
							optional: true,
							content: block.trim(),
						});
					}
				}

				// Check for filament_switch_sensor runout
				if (/^\s*\[filament_switch_sensor\s+runout\]/m.test(text)) {
					const block = this.getSectionBlock(text, 'filament_switch_sensor runout');
					// Check if runout_gcode is set to RUN_OUT (case insensitive for key)
					// We look for runout_gcode: RUN_OUT
					const gcodeRe = /^\s*runout_gcode\s*:\s*RUN_OUT\s*$/m;
					if (!gcodeRe.test(block)) {
						conflicts.push({
							name: 'filament_switch_sensor runout',
							type: 'section',
							file: path,
							optional: false,
							content: block.trim(),
							isRunoutSensor: true,
						});
					}
				}

				for (let m = 0; m < macroNames.length; m++) {
					const nm = macroNames[m];
					const re = new RegExp('^\\s*\\[gcode_macro\\s+' + nm + '\\]', 'm');

					if (re.test(text)) {
						const block = this.getMacroBlock(text, nm);

						conflicts.push({
							name: nm,
							type: 'gcode_macro',
							file: path,
							optional: false,
							content: block.trim(),
						});
					}
				}
			}

			return { conflicts };
		});
	}

	getConfigSnapshot() {
		const snapshot = {};
		return this.readPrinterConfigRaw()
			.then((rootText) => {
				snapshot.printerText = rootText;
				snapshot.hasAFSInclude = /^\s*\[include\s+[^\]]*adv_filament_swap\.cfg\]/m.test(
					rootText
				);
				const files = new Map();
				files.set('printer.cfg', rootText);
				snapshot.files = files;
				const queue = ['printer.cfg'];
				const visited = new Set(['printer.cfg']);
				const isAFSFile = (p) => /(^|[\\/])adv_filament_swap\.cfg$/i.test(p || '');
				const processNext = () => {
					if (queue.length === 0) return Promise.resolve();
					const currentPath = queue.shift();
					const text = files.get(currentPath) || '';
					const includes = this.parseIncludePaths(text);
					const pushes = [];
					for (const inc of includes) {
						if (!visited.has(inc) && !isAFSFile(inc)) {
							visited.add(inc);
							pushes.push(
								this.readConfigFile(inc)
									.then((t) => {
										files.set(inc, t);
										queue.push(inc);
									})
									.catch(() => {})
							);
						}
					}
					return Promise.all(pushes).then(() => processNext());
				};
				return processNext();
			})
			.then(() => {
				const files = snapshot.files;
				const optionalSections = ['pause_resume', 'respond', 'save_variables'];
				const macroNames = this.getAFSMacroList();
				const conflicts = [];
				for (const [path, text] of files.entries()) {
					for (let k = 0; k < optionalSections.length; k++) {
						const sec = optionalSections[k];
						const re = new RegExp('^\\s*\\[' + sec + '\\]', 'm');
						if (re.test(text)) {
							const block = this.getSectionBlock(text, sec);
							conflicts.push({
								name: sec,
								type: 'section',
								file: path,
								optional: true,
								content: block.trim(),
							});
						}
					}
					if (/^\s*\[filament_switch_sensor\s+runout\]/m.test(text)) {
						const block = this.getSectionBlock(text, 'filament_switch_sensor runout');
						const gcodeRe = /^\s*runout_gcode\s*:\s*RUN_OUT\s*$/m;
						if (!gcodeRe.test(block)) {
							conflicts.push({
								name: 'filament_switch_sensor runout',
								type: 'section',
								file: path,
								optional: false,
								content: block.trim(),
								isRunoutSensor: true,
							});
						}
					}
					for (let m = 0; m < macroNames.length; m++) {
						const nm = macroNames[m];
						const re = new RegExp('^\\s*\\[gcode_macro\\s+' + nm + '\\]', 'm');
						if (re.test(text)) {
							const block = this.getMacroBlock(text, nm);
							conflicts.push({
								name: nm,
								type: 'gcode_macro',
								file: path,
								optional: false,
								content: block.trim(),
							});
						}
					}
				}
				snapshot.conflicts = conflicts;
				const runoutBackups = [];
				for (const [path, text] of files.entries()) {
					if (/^\s*\[filament_switch_sensor\s+runout\]/m.test(text)) {
						const block = this.getSectionBlock(text, 'filament_switch_sensor runout');
						const backupLineRe = /^\s*#\s*AFS_BACKUP\s+runout_gcode\s*:/m;
						if (backupLineRe.test(block)) runoutBackups.push(path);
					}
				}
				snapshot.runoutBackups = runoutBackups;
				return this.readConfigFile('adv_filament_swap.cfg')
					.then((t) => t)
					.catch(() => '');
			})
			.then((advText) => {
				snapshot.advConfigText = advText.trim();
				snapshot.advConfigExists = !!snapshot.advConfigText;
				const hasDict = /variable_defaults\s*:\s*\{/m.test(snapshot.advConfigText);
				const hasLegacy = /^\s*variable_default_temp\s*:\s*/m.test(snapshot.advConfigText);
				snapshot.isLegacyConfig = !!snapshot.advConfigText && !hasDict && hasLegacy;
				return snapshot;
			});
	}

	addAFSIncludeFromSnapshot(snapshot) {
		const text =
			snapshot.files && snapshot.files.get('printer.cfg')
				? snapshot.files.get('printer.cfg')
				: snapshot.printerText || '';
		const hasRe = /^\s*\[include\s+[^\]]*adv_filament_swap\.cfg\]\s*$/m;
		if (hasRe.test(text)) return Promise.resolve(true);
		let autoIdx = -1;
		const autoMatch = text.match(/^\s*#\*#.*$/m);
		if (autoMatch) autoIdx = text.indexOf(autoMatch[0]);
		const boundary = autoIdx !== -1 ? autoIdx : text.length;
		let lastIncEnd = -1;
		const incRe = /^\s*\[include\s+[^\]]+\]\s*$/gm;
		let im;
		while ((im = incRe.exec(text)) !== null) {
			if (im.index < boundary) {
				const eol = text.indexOf('\n', im.index);
				lastIncEnd = eol === -1 ? text.length : eol + 1;
			}
		}
		let lastMacroHeader = -1;
		const macroRe = /^\s*\[gcode_macro\s+[^\]]+\]\s*$/gm;
		let mm;
		while ((mm = macroRe.exec(text)) !== null) {
			if (mm.index < boundary) lastMacroHeader = mm.index;
		}
		let lastMacroEnd = -1;
		if (lastMacroHeader !== -1) {
			const nextHeaderRe = /^\s*\[[^\]]+\]/gm;
			nextHeaderRe.lastIndex = lastMacroHeader + 1;
			let nh;
			let nextHeader = -1;
			while ((nh = nextHeaderRe.exec(text)) !== null) {
				if (nh.index > lastMacroHeader && nh.index < boundary) {
					nextHeader = nh.index;
					break;
				}
			}
			lastMacroEnd = nextHeader !== -1 ? nextHeader : boundary;
		}
		let insertPos;
		if (autoIdx !== -1) insertPos = boundary;
		else insertPos = Math.max(lastIncEnd, lastMacroEnd, text.length);
		const before = text.slice(0, insertPos);
		const after = text.slice(insertPos);
		const line = '[include adv_filament_swap.cfg]\n';
		const updated =
			before.length && !before.endsWith('\n')
				? before + '\n' + line + after
				: before + line + after;
		return this.savePrinterConfig(updated).then((ok) => {
			if (ok) {
				snapshot.printerText = updated;
				snapshot.hasAFSInclude = true;
				snapshot.files.set('printer.cfg', updated);
			}
			return ok;
		});
	}

	removeAFSIncludeFromSnapshot(snapshot) {
		const text = snapshot.printerText;
		const re = /^\s*\[include\s+[^\]]*adv_filament_swap\.cfg\]\s*$/gm;
		if (!re.test(text)) return Promise.resolve(true);
		const updated = text.replace(re, '').replace(/\n{3,}/g, '\n\n');
		return this.savePrinterConfig(updated).then((ok) => {
			if (ok) {
				snapshot.printerText = updated;
				snapshot.hasAFSInclude = false;
				snapshot.files.set('printer.cfg', updated);
			}
			return ok;
		});
	}

	fixRunoutSensors(snapshot, excludeFiles = []) {
		const conflicts = (snapshot.conflicts || [])
			.filter((c) => c.isRunoutSensor)
			.filter((c) => excludeFiles.indexOf(c.file) === -1);
		if (conflicts.length === 0) return Promise.resolve(false);
		const tasks = conflicts.map((c) => {
			const text = snapshot.files.get(c.file) || '';
			const block = this.getSectionBlock(text, 'filament_switch_sensor runout');
			let newBlock = block;
			const runoutLineRe = /^(\s*)runout_gcode\s*:(.*)$/m;
			const backupRe = /^\s*#\s*AFS_BACKUP\s+runout_gcode\s*:/m;
			if (runoutLineRe.test(newBlock)) {
				if (!backupRe.test(newBlock)) {
					newBlock = newBlock.replace(runoutLineRe, (m, indent, val) => {
						const orig = String(val || '').trim();
						return `${indent}# AFS_BACKUP runout_gcode:${orig}\n${indent}runout_gcode: RUN_OUT`;
					});
				} else {
					newBlock = newBlock.replace(
						runoutLineRe,
						(m, indent) => `${indent}runout_gcode: RUN_OUT`
					);
				}
			} else {
				newBlock = newBlock + '\nrunout_gcode: RUN_OUT\n';
			}
			if (newBlock === block) {
				return Promise.resolve(false);
			}
			const newText = text.replace(block, newBlock);
			if (c.file === 'printer.cfg') {
				return this.savePrinterConfig(newText).then(() => {
					snapshot.files.set('printer.cfg', newText);
					snapshot.printerText = newText;
					return true;
				});
			} else {
				return this.saveFile(c.file, newText).then(() => {
					snapshot.files.set(c.file, newText);
					return true;
				});
			}
		});
		return Promise.all(tasks).then((arr) => arr.some((x) => !!x));
	}

	restoreRunoutSensors(snapshot, excludeFiles = []) {
		const filesToRestore = (snapshot.runoutBackups || []).filter(
			(f) => excludeFiles.indexOf(f) === -1
		);
		if (filesToRestore.length === 0) return Promise.resolve(false);
		const tasks = filesToRestore.map((file) => {
			const text = snapshot.files.get(file) || '';
			const block = this.getSectionBlock(text, 'filament_switch_sensor runout');
			let newBlock = block;
			const backupLineRe = /^(\s*)#\s*AFS_BACKUP\s+runout_gcode\s*:(.*)$/m;
			const runoutLineRe = /^\s*runout_gcode\s*:\s*RUN_OUT\s*$/m;
			const bMatch = backupLineRe.exec(newBlock);
			if (!bMatch) return Promise.resolve(false);
			const indent = bMatch[1] || '';
			const origVal = String(bMatch[2] || '').trim();
			newBlock = newBlock.replace(backupLineRe, `${indent}runout_gcode: ${origVal}`);
			newBlock = newBlock.replace(runoutLineRe, '');
			newBlock = newBlock.replace(/\n{3,}/g, '\n\n');
			const newText = text.replace(block, newBlock);
			if (file === 'printer.cfg') {
				return this.savePrinterConfig(newText).then(() => {
					snapshot.files.set('printer.cfg', newText);
					snapshot.printerText = newText;
					return true;
				});
			} else {
				return this.saveFile(file, newText).then(() => {
					snapshot.files.set(file, newText);
					return true;
				});
			}
		});
		return Promise.all(tasks).then((arr) => arr.some((x) => !!x));
	}

	updatePrinterCfg(snapshot, ops) {
		const textSrc =
			snapshot.files && snapshot.files.get('printer.cfg')
				? snapshot.files.get('printer.cfg')
				: snapshot.printerText || '';
		let text = textSrc;
		let includeAdded = false;
		let includeRemoved = false;
		let runoutFixed = false;
		let runoutRestored = false;

		if (ops && ops.fixRunout) {
			const block = this.getSectionBlock(text, 'filament_switch_sensor runout');
			if (block) {
				let newBlock = block;
				const runoutLineRe = /^(\s*)runout_gcode\s*:(.*)$/m;
				const backupRe = /^\s*#\s*AFS_BACKUP\s+runout_gcode\s*:/m;
				if (runoutLineRe.test(newBlock)) {
					if (!backupRe.test(newBlock)) {
						newBlock = newBlock.replace(runoutLineRe, (m, indent, val) => {
							const orig = String(val || '').trim();
							return `${indent}# AFS_BACKUP runout_gcode:${orig}\n${indent}runout_gcode: RUN_OUT`;
						});
					} else {
						newBlock = newBlock.replace(
							runoutLineRe,
							(m, indent) => `${indent}runout_gcode: RUN_OUT`
						);
					}
				} else {
					newBlock = newBlock + '\nrunout_gcode: RUN_OUT\n';
				}
				if (newBlock !== block) {
					text = text.replace(block, newBlock);
					runoutFixed = true;
				}
			}
		}

		if (ops && ops.restoreRunout) {
			const block = this.getSectionBlock(text, 'filament_switch_sensor runout');
			if (block) {
				let newBlock = block;
				const backupLineRe = /^(\s*)#\s*AFS_BACKUP\s+runout_gcode\s*:(.*)$/m;
				const runoutLineRe = /^\s*runout_gcode\s*:\s*RUN_OUT\s*$/m;
				const bMatch = backupLineRe.exec(newBlock);
				if (bMatch) {
					const indent = bMatch[1] || '';
					const origVal = String(bMatch[2] || '').trim();
					newBlock = newBlock.replace(backupLineRe, `${indent}runout_gcode: ${origVal}`);
					newBlock = newBlock.replace(runoutLineRe, '');
					newBlock = newBlock.replace(/\n{3,}/g, '\n\n');
					if (newBlock !== block) {
						text = text.replace(block, newBlock);
						runoutRestored = true;
					}
				}
			}
		}

		if (ops && ops.removeInclude) {
			const re = /^\s*\[include\s+[^\]]*adv_filament_swap\.cfg\]/gm;
			if (re.test(text)) {
				text = text.replace(re, '').replace(/\n{3,}/g, '\n\n');
				includeRemoved = true;
			}
		}

		if (ops && ops.addInclude) {
			const hasRe = /^\s*\[include\s+[^\]]*adv_filament_swap\.cfg\]/m;
			if (!hasRe.test(text)) {
				let autoIdx = -1;
				const autoMatch = text.match(/^\s*#\*#.*$/m);
				if (autoMatch) autoIdx = text.indexOf(autoMatch[0]);
				const boundary = autoIdx !== -1 ? autoIdx : text.length;
				let lastIncEnd = -1;
				const incRe = /^\s*\[include\s+[^\]]+\]/gm;
				let im;
				while ((im = incRe.exec(text)) !== null) {
					if (im.index < boundary) {
						const eol = text.indexOf('\n', im.index);
						lastIncEnd = eol === -1 ? text.length : eol + 1;
					}
				}
				let lastMacroHeader = -1;
				const macroRe = /^\s*\[gcode_macro\s+[^\]]+\]/gm;
				let mm;
				while ((mm = macroRe.exec(text)) !== null) {
					if (mm.index < boundary) lastMacroHeader = mm.index;
				}
				let lastMacroEnd = -1;
				if (lastMacroHeader !== -1) {
					const nextHeaderRe = /^\s*\[[^\]]+\]/gm;
					nextHeaderRe.lastIndex = lastMacroHeader + 1;
					let nh;
					let nextHeader = -1;
					while ((nh = nextHeaderRe.exec(text)) !== null) {
						if (nh.index > lastMacroHeader && nh.index < boundary) {
							nextHeader = nh.index;
							break;
						}
					}
					lastMacroEnd = nextHeader !== -1 ? nextHeader : boundary;
				}
				let insertPos;
				if (autoIdx !== -1) insertPos = boundary;
				else insertPos = Math.max(lastIncEnd, lastMacroEnd, text.length);
				const before = text.slice(0, insertPos);
				const after = text.slice(insertPos);
				const line = '[include adv_filament_swap.cfg]\n';
				text =
					before.length && !before.endsWith('\n')
						? before + '\n' + line + after
						: before + line + after;
				includeAdded = true;
			}
		}

		const changed = text !== textSrc;
		if (!changed) {
			return Promise.resolve({
				changed: false,
				includeAdded,
				includeRemoved,
				runoutFixed,
				runoutRestored,
			});
		}
		return this.savePrinterConfig(text).then((ok) => {
			if (ok) {
				snapshot.files.set('printer.cfg', text);
				snapshot.printerText = text;
				snapshot.hasAFSInclude = /^\s*\[include\s+[^\]]*adv_filament_swap\.cfg\]/m.test(
					text
				);
			}
			return { changed: ok, includeAdded, includeRemoved, runoutFixed, runoutRestored };
		});
	}

	findRunoutBackupFiles() {
		const files = new Map();
		const queue = ['printer.cfg'];
		const visited = new Set(['printer.cfg']);
		const isAFSFile = (p) => /(^|[\\/])adv_filament_swap\.cfg$/i.test(p || '');

		const loadAllFiles = () => {
			const processNext = () => {
				if (queue.length === 0) return Promise.resolve();
				const currentPath = queue.shift();
				const isRoot = currentPath === 'printer.cfg';
				const readPromise = isRoot
					? this.readPrinterConfigRaw()
					: this.readConfigFile(currentPath);
				return readPromise
					.then((text) => {
						files.set(currentPath, text);
						const includes = this.parseIncludePaths(text);
						for (const inc of includes) {
							if (!visited.has(inc) && !isAFSFile(inc)) {
								visited.add(inc);
								queue.push(inc);
							}
						}
						return processNext();
					})
					.catch(() => processNext());
			};
			return processNext();
		};

		return loadAllFiles().then(() => {
			const out = [];
			for (const [path, text] of files.entries()) {
				if (/^\s*\[filament_switch_sensor\s+runout\]/m.test(text)) {
					const block = this.getSectionBlock(text, 'filament_switch_sensor runout');
					const backupLineRe = /^\s*#\s*AFS_BACKUP\s+runout_gcode\s*:/m;
					if (backupLineRe.test(block)) out.push(path);
				}
			}
			return out;
		});
	}

	/**
	 * Checks if `adv_filament_swap.cfg` is included in `printer.cfg`.
	 * @returns {Promise<boolean>} `true` if an include line for AFS is present.
	 */
	isAFSIncluded() {
		return this.readPrinterConfigRaw().then((text) => {
			const re = /^\s*\[include\s+[^\]]*adv_filament_swap\.cfg\]/m;
			return re.test(text);
		});
	}

	/**
	 * Uploads a file to Moonraker.
	 * @param {string} filename Name of the file (e.g. 'adv_filament_swap.cfg').
	 * @param {string} text Content of the file.
	 * @param {string} [root] Root directory (default 'config').
	 * @returns {Promise<boolean>} Resolves `true` on success.
	 */
	saveFile(filename, text, root = 'config') {
		const urlUpload = this.base.replace(/\/$/, '') + '/server/files/upload';
		const fd = new FormData();
		const blob = new Blob([text], { type: 'text/plain' });

		fd.append('file', blob, filename);
		fd.append('root', root);

		return fetch(urlUpload, { method: 'POST', body: fd }).then((r) => {
			if (!r.ok) throw new Error('Upload failed: ' + r.status);
			return true;
		});
	}

	/**
	 * Backs up current `printer.cfg` then writes the provided content.
	 * Uses `POST /server/files/upload` with `root=config` and falls back to direct write.
	 * @param {string} text Full contents of `printer.cfg` to save.
	 * @returns {Promise<boolean>} Resolves `true` on success.
	 */
	savePrinterConfig(text) {
		const urlUpload = this.base.replace(/\/$/, '') + '/server/files/upload';
		const doBackup = () => this.backupPrinterConfig().catch(() => false);

		return doBackup().then(() => {
			const fd = new FormData();
			const blob = new Blob([text], { type: 'text/plain' });

			fd.append('file', blob, 'printer.cfg');
			fd.append('root', 'config');

			return fetch(urlUpload, { method: 'POST', body: fd }).then((r) => {
				if (!r.ok) throw new Error('Upload failed: ' + r.status);
				return true;
			});
		});
	}

	/**
	 * Creates a timestamped backup of `printer.cfg` in the `config` root.
	 * Filename format: `printer.cfg.afs-YYYY-MM-DDTHH-MM-SS-sssZ.bak`.
	 * @returns {Promise<boolean>} Resolves `true` on success.
	 */
	backupPrinterConfig() {
		return this.readPrinterConfigRaw().then((text) => {
			const urlUpload = this.base.replace(/\/$/, '') + '/server/files/upload';
			const stamp = new Date().toISOString().replace(/[:.]/g, '-');
			const name = 'printer.cfg.afs-' + stamp + '.bak';
			const fd = new FormData();
			const blob = new Blob([text], { type: 'text/plain' });

			fd.append('file', blob, name);
			fd.append('root', 'config');

			return fetch(urlUpload, { method: 'POST', body: fd }).then((r) => {
				if (!r.ok) throw new Error('backup failed');

				return true;
			});
		});
	}

	/**
	 * Appends `[include adv_filament_swap.cfg]` to `printer.cfg` if missing.
	 * @returns {Promise<boolean>} `true` if already included or saved successfully.
	 */
	addAFSInclude() {
		return this.readPrinterConfigRaw().then((text) => {
			const hasRe = /^\s*\[include\s+[^\]]*adv_filament_swap\.cfg\]\s*$/m;
			if (hasRe.test(text)) return true;
			let autoIdx = -1;
			const autoMatch = text.match(/^\s*#\*#.*$/m);
			if (autoMatch) autoIdx = text.indexOf(autoMatch[0]);
			const boundary = autoIdx !== -1 ? autoIdx : text.length;
			let lastIncEnd = -1;
			const incRe = /^\s*\[include\s+[^\]]+\]\s*$/gm;
			let im;
			while ((im = incRe.exec(text)) !== null) {
				if (im.index < boundary) {
					const eol = text.indexOf('\n', im.index);
					lastIncEnd = eol === -1 ? text.length : eol + 1;
				}
			}
			let lastMacroHeader = -1;
			const macroRe = /^\s*\[gcode_macro\s+[^\]]+\]\s*$/gm;
			let mm;
			while ((mm = macroRe.exec(text)) !== null) {
				if (mm.index < boundary) lastMacroHeader = mm.index;
			}
			let lastMacroEnd = -1;
			if (lastMacroHeader !== -1) {
				const nextHeaderRe = /^\s*\[[^\]]+\]/gm;
				nextHeaderRe.lastIndex = lastMacroHeader + 1;
				let nh;
				let nextHeader = -1;
				while ((nh = nextHeaderRe.exec(text)) !== null) {
					if (nh.index > lastMacroHeader && nh.index < boundary) {
						nextHeader = nh.index;
						break;
					}
				}
				lastMacroEnd = nextHeader !== -1 ? nextHeader : boundary;
			}
			let insertPos;
			if (autoIdx !== -1) {
				insertPos = boundary;
			} else {
				insertPos = Math.max(lastIncEnd, lastMacroEnd, text.length);
			}
			const before = text.slice(0, insertPos);
			const after = text.slice(insertPos);
			const line = '[include adv_filament_swap.cfg]\n';
			const updated =
				before.length && !before.endsWith('\n')
					? before + '\n' + line + after
					: before + line + after;
			return this.savePrinterConfig(updated);
		});
	}

	/**
	 * Removes `[include adv_filament_swap.cfg]` from `printer.cfg` if present.
	 * @returns {Promise<boolean>} `true` if not present or saved successfully.
	 */
	removeAFSInclude() {
		return this.readPrinterConfigRaw().then((text) => {
			const re = /^\s*\[include\s+[^\]]*adv_filament_swap\.cfg\]\s*$/gm;
			if (!re.test(text)) return true;

			const updated = text.replace(re, '').replace(/\n{3,}/g, '\n\n');

			return this.savePrinterConfig(updated);
		});
	}
}

window.MoonrakerClient = MoonrakerClient;
