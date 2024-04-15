import db from '$lib/server/Database';
import type { Stream } from '$lib/types';

export async function PUT(req) {
	const body = await req.request.json();
	const playlistId: string = body.playlistId;
	const streams: Stream[] = body.streams;

	console.log(`🔶 Updating streams for playlist ${playlistId}`);

	await db.updatePlaylistStreams(playlistId, streams);

	return new Response(null, { status: 204 });
}
