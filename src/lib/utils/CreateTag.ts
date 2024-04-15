import type { Tag } from '$lib/types';

/**
 * Creates a new tag.
 * @param allTags - An array of existing tags.
 * @returns A promise that resolves to the newly created tag, or null if the creation was cancelled or unsuccessful.
 */
export default async function createTag(allTags: Tag[]): Promise<Tag | null> {
	const newTagName = prompt('Enter new tag name:');
	if (newTagName === null) return null;
	const newColor = prompt('Enter new tag color in HEX format:');
	// validate hex format
	if (!newColor?.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
		alert('Invalid HEX color format. Valid formats are "#..." or "#......".');
		return null;
	}
	const nextId = String(Math.max(...allTags.map((tag) => Number(tag.uid)), 0) + 1);

	const newTag: Tag = { uid: nextId, name: newTagName, color: newColor };

	await fetch('/api/createTag', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(newTag)
	});

	return newTag;
}
