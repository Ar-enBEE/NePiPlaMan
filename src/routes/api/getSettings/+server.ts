import { getSettings } from '$lib/server/settings';
import { json } from '@sveltejs/kit';

export async function GET(req) {
	const url = new URL(req.url);
	const settings = url.searchParams.get('settings')?.split(',') || [''];

	return json(await getSettings(settings));
}
