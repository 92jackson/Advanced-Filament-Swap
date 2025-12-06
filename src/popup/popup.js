document.addEventListener('DOMContentLoaded', async () => {
	// Initialize UserSettings
	if (window.UserSettings) {
		await window.UserSettings.init();
	}

	// Set Version
	const versionEl = document.getElementById('version');
	if (window.VersionUtils && window.VersionUtils.getCurrentVersion) {
		const v = await window.VersionUtils.getCurrentVersion();
		versionEl.textContent = `v${v}`;
	}

	// Handle Debug Toggle
	const debugToggle = document.getElementById('debug-toggle');
	if (window.UserSettings) {
		// Set initial state
		const isDebugEnabled = window.UserSettings.get('enableDebugLogging');
		debugToggle.checked = !!isDebugEnabled;

		// Add listener
		debugToggle.addEventListener('change', async (e) => {
			const enabled = e.target.checked;
			await window.UserSettings.set('enableDebugLogging', enabled);
		});
	}
});
