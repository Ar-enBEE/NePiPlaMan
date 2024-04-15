import db from '$lib/server/Database';
import { getSettings } from '$lib/server/settings';
import type { Tag } from '$lib/types';
import { error } from '@sveltejs/kit';

/**
 * Loads the streams associated with a specific tag.
 *
 * @param params - The parameters object containing the tag ID.
 * @returns An object containing the streams associated with the tag.
 * @throws If the tag is not found.
 */
export async function load({ params }) {
	const tagId = params.id;
	const setting = await getSettings(['tags', 'streamTagJoin']);
	const tags = (setting.tags as unknown as Tag[]) ?? [];
	const streamTagJoin = (setting.streamTagJoin as unknown as Record<string, string>) ?? {};

	const tag = tags.find((t) => t.uid == tagId);
	if (!tag) error(404, 'Tag not found');

	const streamIds = Object.keys(streamTagJoin).filter(
		(streamId) => streamTagJoin[streamId] == tagId
	);
	const allStreams = await db.getStreams();

	const streams = allStreams
		.filter((stream) => streamIds.includes(String(stream.uid)))
		.map((stream) => {
			return { ...stream, tag };
		});

	return { streams };
}
