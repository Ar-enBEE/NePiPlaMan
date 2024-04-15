import db from '$lib/server/Database';
import type { Playlist } from '$lib/types';

export async function PUT(req) {
	const p: Playlist = await req.request.json();
	console.log(`🔶 Updating playlist ${p.uid}`);

	await db.updatePlaylist(p);

	return new Response(null, { status: 204 });
}
