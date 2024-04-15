import { getSettings } from '$lib/server/settings';
import type { Tag } from '$lib/types';
import { json } from '@sveltejs/kit';

export async function GET(req) {
	const url = new URL(req.url);
	const tagId = url.searchParams.get('uid');
	console.log(`🔶 Getting tag ${tagId}`);

	const settings = await getSettings(['tags']);
	const tags = (settings.tags as unknown as Tag[]) ?? [];
	const tag = tags.find((tag) => tag.uid == tagId);

	return json({ tag });
}
