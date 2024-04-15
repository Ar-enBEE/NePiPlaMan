import { getSettings } from '$lib/server/settings';
import type { Tag } from '$lib/types';

/**
 * Loads the tags from the settings.
 * @returns An object containing the loaded tags.
 */
export async function load() {
	const settings = await getSettings(['tags']);
	const tags = settings.tags as unknown as Tag[];
	return { tags };
}
