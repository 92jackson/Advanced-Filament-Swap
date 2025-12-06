// M300Player.js
// Usage: const player = new M300Player({audioContext, volume:0.2, type:'sine', defaultFreq:260, defaultDur:100});
// player.playGcode(m300Text).then(()=>console.log('done'));

class M300Player {
	constructor(options = {}) {
		this.ctx =
			options.audioContext ||
			(typeof window !== 'undefined'
				? new (window.AudioContext || window.webkitAudioContext)()
				: null);
		if (!this.ctx) throw new Error('AudioContext required (browser environment).');
		this.volume = typeof options.volume === 'number' ? options.volume : 0.25;
		this.type = options.type || 'sine'; // 'sine', 'square', 'sawtooth', 'triangle'
		this.defaultFreq = options.defaultFreq || 260; // Hz
		this.defaultDur = options.defaultDur || 100; // ms
		this.tempoScale = typeof options.tempoScale === 'number' ? options.tempoScale : 1.0;
		this._running = false;
		this._runId = 0;
		this._currentNodes = [];
	}

	// Parse M300 lines into array of {freq, dur} objects.
	parse(gcodeText) {
		const lines = String(gcodeText).split(/\r?\n/);
		const notes = [];
		const regex = /M300(?:\s+[^;]*)?/i;
		for (let raw of lines) {
			const line = raw.split(';')[0].trim(); // strip comments after ';'
			if (!line) continue;
			if (!regex.test(line)) continue;
			// Find P and S params. Fields like P251 S784 or S440 P200
			const params = {};
			const tokens = line.split(/\s+/);
			for (let t of tokens.slice(1)) {
				const m =
					t.match(/^([PS])\s*[:=]?\s*(-?\d+(\.\d+)?)$/i) ||
					t.match(/^([PS])(-?\d+(\.\d+)?)$/i);
				if (m) params[m[1].toUpperCase()] = Number(m[2]);
			}
			const freq = Number.isFinite(params.S) ? params.S : this.defaultFreq;
			const durMs = Number.isFinite(params.P) ? params.P : this.defaultDur;
			// skip zero/negative durations
			if (durMs <= 0) continue;
			notes.push({ freq: Math.max(1, freq), dur: Math.max(1, durMs) });
		}
		return notes;
	}

	// Play a single note (freq in Hz, dur in ms). Returns a Promise that resolves after the note finishes.
	playNote(freq, durMs, when = 0) {
		if (!this.ctx) return Promise.reject(new Error('No AudioContext'));
		const startTime = this.ctx.currentTime + when;
		const endTime = startTime + (durMs / 1000) * this.tempoScale;

		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();

		osc.type = this.type;
		osc.frequency.setValueAtTime(freq, startTime);

		gain.gain.setValueAtTime(0, startTime);
		gain.gain.exponentialRampToValueAtTime(this.volume * 0.6, startTime + 0.01);
		gain.gain.setValueAtTime(this.volume * 0.6, Math.max(startTime + 0.01, endTime - 0.03));
		gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

		osc.connect(gain);
		gain.connect(this.ctx.destination);

		osc.start(startTime);
		osc.stop(endTime + 0.01);

		// keep references to allow stop()
		this._currentNodes.push({ osc, gain });

		return new Promise((resolve) => {
			const t = (endTime + 0.05 - this.ctx.currentTime) * 1000;
			setTimeout(() => {
				// remove from list
				this._currentNodes = this._currentNodes.filter((n) => n.osc !== osc);
				resolve();
			}, Math.max(0, t));
		});
	}

	// Play an array of notes [{freq, dur}, ...]. Returns a Promise resolving when done.
	async playSequence(notes) {
		if (!Array.isArray(notes) || notes.length === 0) return;
		this.stop();
		const myRunId = this._runId;
		this._running = true;
		let cursor = 0;
		for (let n of notes) {
			if (this._runId !== myRunId) break;
			await this.playNote(n.freq, n.dur, 0);
			if (this._runId !== myRunId) break;
			// small gap between queued notes to mimic Marlin behavior (tone queue). No extra delay when freq/dur back-to-back, as each playNote schedules from ctx.currentTime.
			// But ensure responsiveness:
			await new Promise((r) => setTimeout(r, 2));
			cursor++;
		}
		if (this._runId === myRunId) this._running = false;
	}

	// Convenience: parse raw gcode text and play it.
	playGcode(gcodeText) {
		const notes = this.parse(gcodeText);
		return this.playSequence(notes);
	}

	// Stop playback immediately.
	stop() {
		this._runId = (this._runId || 0) + 1;
		this._running = false;
		for (let n of this._currentNodes) {
			try {
				n.osc.stop(0);
			} catch (e) {}
			try {
				n.gain.disconnect();
			} catch (e) {}
			try {
				n.osc.disconnect();
			} catch (e) {}
		}
		this._currentNodes = [];
	}

	// Utilities
	setVolume(v) {
		this.volume = Math.min(1, Math.max(0, v));
	}
	setWaveType(t) {
		this.type = t;
	}
	setTempoScale(scale) {
		this.tempoScale = Math.max(0.01, scale);
	}
}
