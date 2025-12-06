/**
 * Utility class for parsing and building AFS configuration files.
 */
class ConfigParser {
	/**
	 * Parses a configuration text and updates the provided configData object.
	 * @param {string} text The raw configuration file content
	 * @param {object} configDefinitions The definitions object (usually window.ConfigDefinitions)
	 * @returns {object} An object containing parsed defaults, originStrings, and statusStrings
	 */
	static parse(text, configDefinitions) {
		// Initialize from Definitions (Deep copy to avoid mutations)
		const result = {
			defaults: configDefinitions.defaults.map((i) => ({
				key: i.key,
				value: i.defaultValue,
			})),
			originStrings: configDefinitions.originStrings.map((i) => ({
				key: i.key,
				value: i.defaultValue,
			})),
			statusStrings: configDefinitions.statusStrings.map((i) => ({
				key: i.key,
				value: i.defaultValue,
			})),
		};

		// Helper to parse a block
		const parseBlock = (blockName) => {
			// Match block content between braces
			const re = new RegExp(`${blockName}:\\s*\\{([\\s\\S]*?)\\n\\s*\\}`, 'm');
			const match = re.exec(text);
			if (!match) return [];

			const lines = match[1].split('\n');
			const blockResult = [];

			lines.forEach((line) => {
				const trim = line.trim();
				if (!trim) return;
				// Match "key": value, # comment
				// Value can be string "..." or number/bool
				const lineRe = /"([^"]+)":\s*([^,]+?)(?:,)?\s*(?:#\s*(.*))?$/;
				const m = lineRe.exec(trim);
				if (m) {
					blockResult.push({
						key: m[1],
						value: m[2].trim(),
					});
				}
			});
			return blockResult;
		};

		// 1. Try parsing new dictionary format
		const foundDefaults = parseBlock('variable_defaults');
		if (foundDefaults.length > 0) {
			foundDefaults.forEach((found) => {
				const idx = result.defaults.findIndex((d) => d.key === found.key);
				if (idx >= 0) {
					result.defaults[idx].value = found.value;
				}
			});
		}

		// 2. Fallback: Parse legacy variables (if dictionary missed some or didn't exist)
		// Regex for `variable_KEY: VALUE`
		const legacyRe = /^\s*(variable_[a-zA-Z0-9_]+):\s*(.*?)(\s*#.*)?$/gm;
		let m;
		while ((m = legacyRe.exec(text)) !== null) {
			const varName = m[1];
			const val = m[2].trim();

			// Find all definitions with this legacy key (in case one legacy var maps to multiple new keys)
			const defs = configDefinitions.defaults.filter((d) => d.legacy === varName);

			if (defs.length > 0) {
				defs.forEach((def) => {
					const idx = result.defaults.findIndex((d) => d.key === def.key);

					// Only overwrite if we haven't already found it in the dict block
					if (idx >= 0 && foundDefaults.length === 0) {
						// Handle legacy 0 => -1 for park_x/park_y
						let finalVal = val;
						if (
							(def.key === 'park_x' || def.key === 'park_y') &&
							parseFloat(val) === 0
						) {
							finalVal = '-1';
						}
						result.defaults[idx].value = finalVal;
					}
				});
			}
		}

		// 3. Parse strings blocks
		const foundOrigin = parseBlock('variable_origin_string_data');
		if (foundOrigin.length > 0) {
			foundOrigin.forEach((found) => {
				const idx = result.originStrings.findIndex((d) => d.key === found.key);
				if (idx >= 0) result.originStrings[idx].value = found.value;
			});
		}

		const foundStatus = parseBlock('variable_status_string_data');
		if (foundStatus.length > 0) {
			foundStatus.forEach((found) => {
				const idx = result.statusStrings.findIndex((d) => d.key === found.key);
				if (idx >= 0) result.statusStrings[idx].value = found.value;
			});
		}

		return result;
	}

	/**
	 * Rebuilds a config block string from data array
	 * @param {string} blockName The variable name of the block
	 * @param {Array} data Array of {key, value} objects
	 * @returns {string} Formatted block string
	 */
	static buildBlock(blockName, data) {
		const lines = data.map((item) => {
			// Indent, key: value
			return `\t\t"${item.key}": ${item.value},`;
		});

		return `${blockName}:\n\t{\n${lines.join('\n')}\n\t}`;
	}

	/**
	 * Extracts the gcode body of a specific macro from the config text.
	 * @param {string} text Full config text
	 * @param {string} macroName Name of the macro (e.g. "AFS_PRE_SWAP")
	 * @returns {string|null} The gcode body (trimmed of common indent) or null if not found
	 */
	static getMacroGcode(text, macroName) {
		const headerRe = new RegExp(`^\\s*\\[gcode_macro\\s+${macroName}\\]`, 'm');
		const match = headerRe.exec(text);
		if (!match) return null;

		const start = match.index + match[0].length;

		// Find "gcode:"
		// We need to search for gcode: *after* the header, but before the next section
		const remaining = text.slice(start);

		// Find next section to limit search
		const nextSectionMatch = /^\s*\[/m.exec(remaining);
		const blockEndIndex = nextSectionMatch ? nextSectionMatch.index : remaining.length;

		const block = remaining.slice(0, blockEndIndex);

		const gcodeRe = /^\s*gcode:\s*$/m;
		const gcodeMatch = gcodeRe.exec(block);

		if (!gcodeMatch) return ''; // Macro exists but no gcode defined

		const gcodeStart = gcodeMatch.index + gcodeMatch[0].length;
		const rawBody = block.slice(gcodeStart);

		// Normalize indentation
		const lines = rawBody.split('\n');
		// Remove empty leading lines
		while (lines.length && !lines[0].trim()) lines.shift();
		// Remove empty trailing lines
		while (lines.length && !lines[lines.length - 1].trim()) lines.pop();

		if (lines.length === 0) return '';

		// Detect indent
		const firstLine = lines[0];
		const indentMatch = firstLine.match(/^\s*/);
		const indent = indentMatch ? indentMatch[0] : '';

		if (!indent) return lines.join('\n');

		return lines.map((l) => (l.startsWith(indent) ? l.slice(indent.length) : l)).join('\n');
	}

	/**
	 * Removes a macro definition from the config text.
	 * @param {string} text Full config text
	 * @param {string} macroName Name of the macro
	 * @returns {string} Updated config text
	 */
	static removeMacro(text, macroName) {
		const headerRe = new RegExp(`^\\s*\\[gcode_macro\\s+${macroName}\\]`, 'm');
		const match = headerRe.exec(text);

		if (!match) return text;

		const start = match.index;
		const remaining = text.slice(start + match[0].length);
		const nextSectionMatch = /^\s*\[/m.exec(remaining);
		const end = nextSectionMatch
			? start + match[0].length + nextSectionMatch.index
			: text.length;

		return (text.slice(0, start).trimEnd() + '\n\n' + text.slice(end).trimStart()).trim();
	}

	/**
	 * Replaces or appends a macro definition in the config text.
	 * @param {string} text Full config text
	 * @param {string} macroName Name of the macro
	 * @param {string} gcodeBody The gcode content
	 * @param {string} description Optional description
	 * @returns {string} Updated config text
	 */
	static injectMacro(text, macroName, gcodeBody, description = '') {
		const headerRe = new RegExp(`^\\s*\\[gcode_macro\\s+${macroName}\\]`, 'm');
		const match = headerRe.exec(text);

		// Indent gcode
		const indentedBody = gcodeBody
			.split('\n')
			.map((l) => (l.trim() ? `\t${l}` : ''))
			.join('\n');

		const newBlock = `[gcode_macro ${macroName}]
${description ? `description: ${description}\n` : ''}gcode:
${indentedBody}
`;

		if (match) {
			// Replace existing
			const start = match.index;
			const remaining = text.slice(start + match[0].length);
			const nextSectionMatch = /^\s*\[/m.exec(remaining);
			const end = nextSectionMatch
				? start + match[0].length + nextSectionMatch.index
				: text.length;

			// Check if there's a newline before the next section, preserve spacing
			return text.slice(0, start) + newBlock + '\n' + text.slice(end).trimStart();
		} else {
			// Append
			return text.trimEnd() + '\n\n\n' + newBlock;
		}
	}
}

window.ConfigParser = ConfigParser;
