import type { Stream, Tag } from '$lib/types';
import type { DLList } from '.';

/**
 * Tags a stream with a specified tag.
 * @param stream - The stream to be tagged.
 * @param tagId - The ID of the tag to be assigned to the stream.
 * @param selection - A set of stream IDs that are currently selected.
 * @param allStreams - A doubly linked list of all available streams.
 */
export default async function TagStream(
	stream: Stream,
	tagId: string | undefined,
	selection: Set<string>,
	allStreams: DLList<Stream>
) {
	const settingsRes = await fetch('/api/getSettings?settings=streamTagJoin');
	const { streamTagJoin: prevStreamTagJoin } = await settingsRes.json();

	console.log(`Tagging stream #${stream.uid} ${stream.title} with tag ${tagId}`);
	let tag: Tag | undefined;
	await fetch('/api/getTagById?uid=' + tagId)
		.then((res) => res.json())
		.then((data) => {
			tag = data.tag;
		});

	stream.tag = tag;
	const streamTagJoin = { ...prevStreamTagJoin, [stream.uid]: tag ? tag.uid : undefined };

	// Update the tag of all selected streams if the current stream is selected
	if (selection.has(String(stream.uid))) {
		selection.forEach((uid) => {
			const selectedStream = allStreams.find((stream) => stream.uid == uid);
			if (!selectedStream) return;
			streamTagJoin[uid] = tag ? tag.uid : undefined;
			selectedStream.tag = tag;
		});
	}

	await fetch('/api/setSettings', {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ streamTagJoin })
	});
}
