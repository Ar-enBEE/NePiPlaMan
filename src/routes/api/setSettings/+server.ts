import { setSettings } from '$lib/server/settings';

export async function PUT(req) {
	const setting = await req.request.json();

	await setSettings(setting);

	return new Response(null, { status: 204 });
}
