import db from '$lib/server/Database';
import type { Playlist } from '$lib/types';

export async function DELETE(req) {
	const p: Playlist = await req.request.json();
	console.log(`🔶 Deleting playlist ${p.uid}`);

	await db.deletePlaylist(p.uid);

	return new Response(null, { status: 204 });
}
