import { getSettings, setSettings } from '$lib/server/settings';
import type { Tag } from '$lib/types';

export async function DELETE(req) {
	const tag = await req.request.json();
	console.log(`🔶 Deleting tag #${tag.uid}`);

	const settings = await getSettings(['tags', 'streamTagJoin']);
	const prevTags = (settings.tags as unknown as Tag[]) ?? [];
	const prevStreamTagJoin = (settings.streamTagJoin as unknown as Record<string, string>) ?? {};

	const deleteIndex = prevTags.findIndex((t) => t.uid === tag.uid);
	prevTags.splice(deleteIndex, 1);

	const newStreamTagJoin: Record<string, string> = {};
	for (const streamId in prevStreamTagJoin) {
		if (prevStreamTagJoin[streamId] != String(tag.uid)) {
			newStreamTagJoin[streamId] = prevStreamTagJoin[streamId];
		}
	}

	const newSettings = {
		tags: JSON.stringify(prevTags),
		streamTagJoin: JSON.stringify(newStreamTagJoin)
	};
	await setSettings(newSettings);

	return new Response(null, { status: 204 });
}
