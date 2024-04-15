import { deepParseJson } from 'deep-parse-json';
import { writeFile, readFile } from 'fs/promises';

// The path to the settings file.
const SETTINGS_FILE_PATH = 'settings.txt';

// Initialize settings.
let settings: Record<string, string> = {};
console.log('🔶 Validating settings');
await loadSettings();
console.log(settings);

/**
 * Retrieves the settings from the text file.
 * @param keys - Optional array of keys to retrieve specific settings. If not provided, all settings will be returned.
 * @returns A promise that resolves to an object containing the requested settings.
 */
export async function getSettings(keys?: string[]) {
	await loadSettings();
	// console.log(`🔶 Getting setting(s) ${keys}`);
	if (!keys) return settings;
	const result: Record<string, string> = {};
	for (const key of keys) {
		result[key] = settings[key];
	}
	return result;
}

/**
 * Loads the settings from a file.
 * If the file exists, it reads the data and parses it as JSON.
 * If the file does not exist, it creates a new settings file.
 * @returns A promise that resolves when the settings are loaded.
 */
export async function loadSettings() {
	// console.log('🔶 Loading settings');
	// load file if it exists else create it
	try {
		const data = await readFile(SETTINGS_FILE_PATH, 'utf-8');
		settings = await deepParseJson(data);
		if (typeof settings !== 'object') settings = {};
	} catch (e) {
		await saveSettings();
	}
}

/**
 * Sets the new settings provided.
 * @param newSettings - The new settings to be set.
 * @returns A Promise that resolves when the settings are saved.
 */
export async function setSettings(newSettings: Record<string, string>) {
	const keys = Object.keys(newSettings);
	// console.log(`🔶 Setting setting(s) ${keys}`);
	for (const k of keys) settings[k] = newSettings[k];
	await saveSettings();
}

/**
 * Saves the settings to the text file.
 * @returns A promise that resolves when the settings are successfully saved.
 */
export async function saveSettings() {
	// console.log('🔶 Saving settings');
	await writeFile(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2));
}
