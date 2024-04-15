import { getSettings, setSettings } from '$lib/server/settings';
import type { Tag } from '$lib/types';

export async function PUT(req) {
	const tag = await req.request.json();
	console.log(`🔶 Updating tag #${tag.uid}`);

	const settings = await getSettings(['tags']);
	const prevTags = (settings.tags as unknown as Tag[]) ?? [];

	console.log(prevTags);
	prevTags[prevTags.findIndex((t) => t.uid === tag.uid)] = tag;
	console.log(prevTags);
	const tags = { tags: JSON.stringify([...prevTags]) };

	await setSettings(tags);

	return new Response(null, { status: 204 });
}
