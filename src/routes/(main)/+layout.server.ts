import db from '$lib/server/Database';
import { getSettings } from '$lib/server/settings';
import { redirect } from '@sveltejs/kit';

/**
 * Checks if the database is connected and redirects to the setup page if it is not.
 * If the database is connected, it loads the playlists data for the Sidebar.
 * @param req - The request object.
 * @returns The playlists data.
 */
export async function load(req) {
	const path = new URL(req.url).pathname;
	if (!db.isConnected && path != '/setup') redirect(302, '/setup');
	const settings = await getSettings(['playlistOrder']);
	const playlistOrder = settings.playlistOrder as unknown as string[] | undefined;

	let playlists = await db.getPlaylists();

	if (playlistOrder) {
		playlists = playlists.sort((a, b) => {
			const aIndex = playlistOrder.indexOf(a.uid);
			const bIndex = playlistOrder.indexOf(b.uid);
			if (aIndex === -1 && bIndex === -1) return 0;
			if (aIndex === -1) return 1;
			if (bIndex === -1) return -1;
			return aIndex - bIndex;
		});
	}

	return { playlists };
}
