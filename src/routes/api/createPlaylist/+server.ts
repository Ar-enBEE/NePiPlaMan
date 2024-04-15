import db from '$lib/server/Database';
import type { Playlist } from '$lib/types';

export async function POST(req) {
	const p: Playlist = await req.request.json();
	console.log(`🔶 Creating playlist ${p.uid}`);

	await db.createPlaylist(p);

	return new Response(null, { status: 204 });
}
