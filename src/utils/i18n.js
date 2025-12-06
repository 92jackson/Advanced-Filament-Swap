class I18n {
	constructor() {
		this.locale = 'en';
		this.listeners = [];
		this.translations = window.I18nTranslations || {};
	}

	init() {
		if (window.UserSettings) {
			const settings = window.UserSettings.getAll();
			this.locale = settings.locale || 'en';
		}
	}

	t(key, params = {}) {
		const keys = key.split('.');
		let value = this.translations[this.locale];
		for (const k of keys) {
			value = value ? value[k] : undefined;
		}

		if (!value) {
			// Fallback to English
			value = this.translations['en'];
			for (const k of keys) {
				value = value ? value[k] : undefined;
			}
		}

		if (!value) return key;

		// Simple replacement for {param}
		return value.replace(/\{(\w+)\}/g, (_, k) => {
			return params[k] !== undefined ? params[k] : `{${k}}`;
		});
	}

	setLocale(locale) {
		if (!this.translations[locale]) {
			console.warn(`Locale ${locale} not found, falling back to en`);
			locale = 'en';
		}
		this.locale = locale;
		if (window.UserSettings) {
			window.UserSettings.set('locale', locale);
		}
		this.notify();
	}

	getAvailableLocales() {
		return Object.keys(this.translations).map((key) => ({
			code: key,
			name: this.translations[key].name || key,
		}));
	}

	onChange(callback) {
		this.listeners.push(callback);
	}

	notify() {
		this.listeners.forEach((cb) => cb(this.locale));
	}
}

window.I18n = new I18n();
