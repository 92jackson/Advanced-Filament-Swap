/**
 * Logger utility that provides formatted console logging with:
 * - Source-based color coding
 * - Debug logging toggle via user settings
 * - Caller location tracking (when debug enabled)
 * - Three log levels (log, warn, error)
 * - Conditional logging (can force logging regardless of debug setting)
 * @returns {object} Logger object with log, warn, and error methods
 */
window.logger = (() => {
	const sourceColors = {};

	const getRandomColor = () => `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;

	const getColorForSource = (source) => {
		if (!sourceColors[source]) {
			sourceColors[source] = getRandomColor();
		}
		return sourceColors[source];
	};

	const isDebugEnabled = () =>
		typeof window !== 'undefined' &&
		window.UserSettings &&
		typeof window.UserSettings.get === 'function' &&
		!!window.UserSettings.get('enableDebugLogging');

	const shouldLog = (alwaysLog) => !!alwaysLog || isDebugEnabled();

	const getLogLocation = () => {
		const stack = new Error().stack?.split('\n');
		if (!stack || stack.length < 6) return 'unknown';

		for (let frameIndex = 5; frameIndex < stack.length; frameIndex++) {
			const line = stack[frameIndex].trim();
			if (line.includes('logger') || line.includes('format')) continue;

			const match = line.match(/([^\/\s]+)\.js:(\d+):\d+/);
			if (match) return `${match[1]}:${match[2]}`;

			return line.replace(/^at\s+/, '');
		}
		return 'unknown';
	};

	const logCaller = () => (isDebugEnabled() ? getLogLocation() + ' - ' : '');

	const levelStyles = {
		WARN: 'background: #f1c40f; color: black;',
		ERROR: 'background: #e74c3c; color: white;',
	};

	const format = (source, level) => {
		const sourceColor = getColorForSource(source);
		const bgStyle = levelStyles[level] ?? `color: ${sourceColor};`;
		const label = `[AFS] [${logCaller()}${source}]${level ? ` [${level}]` : ''}`;
		const style = `${bgStyle} font-weight: bold; padding: 2px 4px; border-radius: 2px;`;
		return [`%c${label}`, style];
	};

	const extractAlwaysLogFlag = (args) => {
		let alwaysLog = false;
		if (args.length > 0 && typeof args[args.length - 1] === 'boolean') {
			alwaysLog = args.pop();
		}
		return alwaysLog;
	};

	const logFn =
		(level) =>
		(source, message, ...args) => {
			const alwaysLog = extractAlwaysLogFlag(args);
			if (shouldLog(alwaysLog)) {
				const [label, style] = format(source, level);
				console.log(label, style, message, ...args);
			}
		};

	return {
		log: logFn(null),
		warn: logFn('WARN'),
		error: logFn('ERROR'),
	};
})();

window.VersionUtils = {
	/**
	 * Gets the current extension version from manifest
	 * @returns {Promise<string>} Current version string
	 */
	getCurrentVersion: async () => {
		try {
			if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
				// Chrome extension environment
				return chrome.runtime.getManifest().version;
			} else if (
				typeof browser !== 'undefined' &&
				browser.runtime &&
				browser.runtime.getManifest
			) {
				// Firefox extension environment
				return browser.runtime.getManifest().version;
			} else {
				// Fallback: fetch from manifest.json
				const response = await fetch(chrome.runtime.getURL('manifest.json'));
				const manifest = await response.json();
				return manifest.version;
			}
		} catch (error) {
			window.logger.error('VersionUtils', 'Failed to get current version:', error);
			return '0.0.0';
		}
	},

	getCfgVersion: async () => {
		try {
			const cfgUrl =
				typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL
					? chrome.runtime.getURL('assets/adv_filament_swap.cfg')
					: 'assets/adv_filament_swap.cfg';
			const response = await fetch(cfgUrl);
			const text = await response.text();
			const match = text.match(/Cfg\s+version\s+([0-9A-Za-z_.-]+)/i);
			return match ? match[1] : '0.0.0';
		} catch (error) {
			window.logger.error('VersionUtils', 'Failed to get cfg version:', error);
			return '0.0.0';
		}
	},
};

window.StyleUtils = {
	/**
	 * Injects a CSS file into the document head
	 * @param {string} id The ID for the link element (to prevent duplicates)
	 * @param {string} path The path to the CSS file (relative to extension root)
	 */
	inject: (id, path) => {
		if (!document.getElementById(id)) {
			const link = document.createElement('link');
			link.id = id;
			link.rel = 'stylesheet';
			if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
				link.href = chrome.runtime.getURL(path);
			} else {
				link.href = path;
			}
			document.head.appendChild(link);
		}
	},
};
