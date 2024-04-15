import { getSettings, setSettings } from '$lib/server/settings';
import type { Tag } from '$lib/types';

export async function POST(req) {
	const tag = await req.request.json();
	console.log(`🔶 Creating tag #${tag.uid}: ${tag.name}`);

	const settings = await getSettings(['tags']);
	const prevTags = (settings.tags as unknown as Tag[]) ?? [];

	const tags = { tags: JSON.stringify([...prevTags, tag]) };

	await setSettings(tags);

	return new Response(null, { status: 204 });
}
