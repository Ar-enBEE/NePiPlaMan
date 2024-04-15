import db from '$lib/server/Database';
import { getSettings } from '$lib/server/settings';
import type { Stream, Tag } from '$lib/types';
import { error } from '@sveltejs/kit';

/**
 * Loads the streams and tags based on the provided parameters.
 * @param params - The parameters object containing the playlistsOrFeed and id. playlistsOrFeed can be either 'playlists' or 'feed'.
 * @returns - A promise that resolves to an object containing the loaded streams and tags.
 */
export async function load({ params }) {
	const { playlistsOrFeed } = params;
	if (playlistsOrFeed !== 'playlists' && playlistsOrFeed !== 'feed') error(404, 'Not Found');

	let streams: Stream[] = [];
	if (playlistsOrFeed === 'playlists')
		if (params.id) {
			streams = await db.getPlaylistStreams(params.id);
		} else streams = [];
	if (playlistsOrFeed === 'feed')
		if (params.id) error(404, 'Not Found');
		else streams = await db.getFeed();

	const settings = await getSettings(['tags', 'streamTagJoin']);
	const tags = (settings.tags as unknown as Tag[]) ?? [];
	const streamTagJoin = settings.streamTagJoin as unknown as Record<string, string>;

	streams.forEach((stream) => {
		let tag: Tag | undefined;
		if (tags && streamTagJoin) {
			const tagId = streamTagJoin[stream.uid];
			tag = tags.find((tag) => tag.uid == tagId);
		}
		stream.tag = tag;
	});

	return { streams, tags };
}
