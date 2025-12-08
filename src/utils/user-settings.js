const SETTINGS_KEY = 'afs_user_settings';

const DEFAULTS = {
	locale: 'en',
	runoutTune: '',
	m600Tune: '',
	printCompleteTune: '',
	tempPresets: [
		{ value: 180, label: '180°C' },
		{ value: 200, label: '200°C' },
		{ value: 220, label: '220°C' },
		{ value: 240, label: '240°C' },
		{ value: 260, label: '260°C' },
	],
	setupCompletedOn: '',
	enableDebugLogging: true,
};

let MEM = { ...DEFAULTS };

function storageType() {
	if (typeof browser !== 'undefined' && browser.storage && browser.storage.local)
		return 'browser';
	if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) return 'chrome';
	return 'local';
}

function loadFromStorage() {
	const storageTypeName = storageType();

	if (storageTypeName === 'browser') {
		return browser.storage.local
			.get(SETTINGS_KEY)
			.then((result) => (result && result[SETTINGS_KEY] ? result[SETTINGS_KEY] : {}))
			.catch(() => ({}));
	}

	if (storageTypeName === 'chrome') {
		return new Promise((resolve) => {
			chrome.storage.local.get([SETTINGS_KEY], (result) => {
				resolve(result && result[SETTINGS_KEY] ? result[SETTINGS_KEY] : {});
			});
		});
	}

	try {
		const rawText = localStorage.getItem(SETTINGS_KEY);
		return Promise.resolve(rawText ? JSON.parse(rawText) : {});
	} catch {
		return Promise.resolve({});
	}
}

function saveToStorage(settingsObject) {
	const storageTypeName = storageType();

	if (storageTypeName === 'browser') {
		return browser.storage.local
			.set({ [SETTINGS_KEY]: settingsObject })
			.then(() => true)
			.catch(() => false);
	}

	if (storageTypeName === 'chrome') {
		return new Promise((resolve) => {
			chrome.storage.local.set({ [SETTINGS_KEY]: settingsObject }, () => resolve(true));
		});
	}

	try {
		localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsObject));
		return Promise.resolve(true);
	} catch {
		return Promise.resolve(false);
	}
}

const UserSettings = {
	init() {
		return loadFromStorage().then((stored) => {
			MEM = { ...DEFAULTS, ...(stored || {}) };
			const presets = Array.isArray(MEM.tempPresets) ? MEM.tempPresets : [];
			const normalized = [];
			for (let i = 0; i < presets.length; i++) {
				const item = presets[i];
				if (typeof item === 'number') {
					const n = parseInt(item, 10);
					if (Number.isFinite(n) && n > 0)
						normalized.push({ value: n, label: String(n) });
				} else if (typeof item === 'string') {
					const n = parseInt(item, 10);
					if (Number.isFinite(n) && n > 0)
						normalized.push({ value: n, label: String(n) });
				} else if (item && typeof item === 'object') {
					const n = parseInt(item.value, 10);
					if (Number.isFinite(n) && n > 0) {
						const lbl = item.label ? String(item.label) : String(n);
						normalized.push({ value: n, label: lbl });
					}
				}
			}
			MEM.tempPresets = normalized;
			return true;
		});
	},

	getAll() {
		return { ...MEM };
	},

	defaults: DEFAULTS,

	get(key) {
		if (key in MEM) return MEM[key];
		return DEFAULTS[key];
	},

	set(key, value) {
		if (key === 'tempPresets') {
			const presets = Array.isArray(value) ? value : [];
			const normalized = [];
			for (let i = 0; i < presets.length; i++) {
				const item = presets[i];
				if (typeof item === 'number') {
					const n = parseInt(item, 10);
					if (Number.isFinite(n) && n > 0)
						normalized.push({ value: n, label: String(n) });
				} else if (typeof item === 'string') {
					const n = parseInt(item, 10);
					if (Number.isFinite(n) && n > 0)
						normalized.push({ value: n, label: String(n) });
				} else if (item && typeof item === 'object') {
					const n = parseInt(item.value, 10);
					if (Number.isFinite(n) && n > 0) {
						const lbl = item.label ? String(item.label) : String(n);
						normalized.push({ value: n, label: lbl });
					}
				}
			}
			MEM[key] = normalized;
		} else {
			MEM[key] = value;
		}
		return saveToStorage(MEM).then((success) => !!success);
	},
};

window.UserSettings = UserSettings;
