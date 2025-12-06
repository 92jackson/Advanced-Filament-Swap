const SETTINGS_KEY = 'afs_user_settings';

const DEFAULTS = {
	locale: 'en',
	runoutTune: '',
	m600Tune: '',
	printCompleteTune: '',
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
		MEM[key] = value;
		return saveToStorage(MEM).then((success) => !!success);
	},
};

window.UserSettings = UserSettings;
