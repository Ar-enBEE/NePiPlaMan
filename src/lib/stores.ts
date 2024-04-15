import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { Tag } from './types';

let tags: Tag[] = [];
if (browser) {
	await fetch('/api/getSettings?settings=tags')
		.then((res) => res.json())
		.then((data) => (tags = data.tags ?? []));
}

export const sidebarWidthStore = writable(250);
export const isResizingStore = writable(false);
export const streamSelectionStore = writable(new Set<string>());
export const playlistSelectionStore = writable(new Set<string>());
export const tagDropdownStore = writable(tags);
