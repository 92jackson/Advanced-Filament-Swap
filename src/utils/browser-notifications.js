class BrowserNotifications {
	constructor() {
		this.player = null;
		this._lastReqId = 0;
		this.cfgUrl =
			typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL
				? chrome.runtime.getURL('assets/adv_filament_swap.cfg')
				: 'assets/adv_filament_swap.cfg';
		this.runoutTune = '';
		this.m600Tune = '';
		this.printCompleteTune = '';
		this.lastReqId = 0;
	}

	init() {
		this.updateSettings(window.UserSettings ? window.UserSettings.getAll() : {});
	}

	updateSettings(s) {
		const settings = s || {};
		this.runoutTune = settings.runoutTune || '';
		this.m600Tune = settings.m600Tune || '';
		this.printCompleteTune = settings.printCompleteTune || '';
	}

	alertRunout() {
		if (this.runoutTune) this._playSound(this.runoutTune);
	}

	alertM600() {
		if (this.m600Tune) this._playSound(this.m600Tune);
	}

	alertPrintComplete() {
		if (this.printCompleteTune) this._playSound(this.printCompleteTune);
	}

	async getAvailableTunes() {
		try {
			const text = await fetch(this.cfgUrl).then((r) => r.text());
			const block = window.ConfigParser
				? window.ConfigParser.getMacroGcode(text, 'AFS_NOISE')
				: '';
			if (!block) return [];

			// Regex to find params.SOUND == 'NAME'
			// Matches: {% if params.SOUND == 'NAME' %} or {% elif params.SOUND == 'NAME' %}
			const re = /\{%\s*(?:if|elif)\s+params\.SOUND\s*==\s*'([^']+)'\s*%\}/g;
			const matches = [];
			let m;
			while ((m = re.exec(block)) !== null) {
				matches.push(m[1]);
			}
			return [...new Set(matches)]; // Unique values
		} catch (e) {
			if (window.logger)
				window.logger.error('BrowserNotifications', 'Failed to get tunes', e);
			return [];
		}
	}

	stop() {
		this.lastReqId++;
		if (this.player) this.player.stop();
	}

	_playSound(soundName) {
		this._ensurePlayer();
		// Stop any existing playback or pending requests
		this.stop();

		const reqId = this.lastReqId;
		this._getM300Text(soundName)
			.then((txt) => {
				if (reqId !== this.lastReqId) return;
				if (txt && txt.trim()) return this.player.playGcode(txt);
			})
			.catch(() => {});
	}

	_ensurePlayer() {
		if (!this.player && typeof M300Player !== 'undefined') {
			this.player = new M300Player({
				volume: 0.18,
				type: 'triangle',
				defaultFreq: 160,
				defaultDur: 100,
				tempoScale: 0.8,
			});
		}
	}

	_getM300Text(soundName) {
		return fetch(this.cfgUrl)
			.then((r) => r.text())
			.then((text) => {
				const block = window.ConfigParser
					? window.ConfigParser.getMacroGcode(text, 'AFS_NOISE')
					: '';
				if (!block) return '';
				const re = new RegExp(
					"{%\\s*(?:if|elif)\\s+params\\.SOUND\\s*==\\s*'" +
						soundName +
						"'\\s*%}([\\s\\S]*?)(?={%\\s*(?:elif|else|endif)\\b)",
					'm'
				);
				const m = re.exec(block);
				if (!m) return '';
				let body = m[1] || '';
				body = body.replace(
					/\{\%\s*for\s+[^%]*range\(\s*(\d+)\s*\)\s*\%\}([\s\S]*?)\{\%\s*endfor\s*\%\}/gm,
					(_, n, inner) => {
						const count = parseInt(n, 10) || 0;
						let out = '';
						for (let i = 0; i < count; i++) out += inner;
						return out;
					}
				);
				body = body.replace(/\{\%[\s\S]*?\%\}/g, '');
				const lines = body
					.split('\n')
					.map((l) => l.trim())
					.filter((l) => /^M300\b/i.test(l));
				return lines.join('\n');
			});
	}
}

window.BrowserNotifications = BrowserNotifications;
