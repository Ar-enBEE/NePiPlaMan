import db from '$lib/server/Database';

export async function PUT(req) {
	const body = await req.request.json();
	const playlistId: string = body.playlistId;
	let streamIds: string[] = body.streamIds;
	if (!playlistId || !streamIds)
		return new Response('Missing required parameters', { status: 400 });

	// Get the streams already in the playlist
	const streamsAlreadyInPlaylist = await db.getPlaylistStreams(playlistId);
	const alreadyStreamIds = streamsAlreadyInPlaylist.map((stream) => String(stream.uid));
	streamIds = streamIds.filter((streamId) => !alreadyStreamIds.includes(streamId));

	const insertSql =
		'INSERT INTO playlist_stream_join (playlist_id, stream_id, join_index) VALUES (?, ?, ?)';

	// Get the next join index offset
	const joinIndexOffset: number = await new Promise((resolve, reject) => {
		db.db.get(
			'SELECT MAX(join_index) AS maxIndex FROM playlist_stream_join WHERE playlist_id = ?',
			[playlistId],
			(err, row: { maxIndex: number }) => {
				if (err) reject(err);
				resolve(row.maxIndex == null ? 0 : row.maxIndex + 1);
			}
		);
	});

	console.log(`🔶 Adding stream(s) ${streamIds} to playlist ${playlistId}`);

	const stmt = db.db.prepare(insertSql);
	db.db.exec('BEGIN TRANSACTION');
	streamIds.forEach((streamId, index) => {
		stmt.run(playlistId, streamId, joinIndexOffset + index);
		console.log(
			`✅ Added stream ${streamId} to playlist ${playlistId} at index ${joinIndexOffset + index}`
		);
	});
	db.db.exec('COMMIT TRANSACTION');
	stmt.finalize();

	// Update the playlist thumbnail if it is the default thumbnail
	const thumbnailSql =
		'UPDATE playlists SET thumbnail_stream_id = ? WHERE uid = ? AND thumbnail_stream_id = -1';
	db.db.run(thumbnailSql, [streamIds[0], playlistId]);

	return new Response(null, { status: 204 });
}
