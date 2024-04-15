import type { Playlist, Stream } from '$lib/types';
import sqlite3 from 'sqlite3';

/**
 * Represents a database connection for the newpipe.db file.
 */
export class DB {
	db: sqlite3.Database;
	isConnected: boolean = false;

	/**
	 * Creates a new instance of the DB class.
	 */
	constructor() {
		// Create a new sqlite3 database connection
		this.db = new sqlite3.Database('./newpipeDB/newpipe.db', sqlite3.OPEN_READWRITE, (err) => {
			if (err) {
				console.log(
					'❌ NewPipe database connection failed. Make sure you have imported a valid zipfile containing "newpipe.db".'
				);
				this.isConnected = false;
				return console.error(err.message);
			}
			console.log('✅ NewPipe database connected successfully.');
			this.isConnected = true;
			this.configureDb();
		});
	}

	/**
	 * Retrieves all playlists from the database.
	 * @returns A promise that resolves to an array of Playlist objects.
	 */
	async getPlaylists() {
		const sql = 'SELECT * FROM playlists';

		const queryPromise: Promise<Playlist[]> = new Promise((resolve, reject) => {
			this.db.all(sql, (err, rows: Playlist[]) => {
				if (err) reject(err);
				else resolve(rows);
			});
		});

		return queryPromise;
	}

	/**
	 * Retrieves the streams belonging to the given playlist.
	 * @param playlistId - The ID of the playlist.
	 * @returns A promise that resolves to an array of Stream objects.
	 */
	async getPlaylistStreams(playlistId: string) {
		// SQL query to retrieve streams for a specific playlist
		const sql = `
		SELECT streams.*
		FROM playlists
		JOIN playlist_stream_join ON playlists.uid = playlist_stream_join.playlist_id
		JOIN streams ON playlist_stream_join.stream_id = streams.uid
		WHERE playlists.uid = ?`;

		const queryPromise: Promise<Stream[]> = new Promise((resolve, reject) => {
			this.db.all(sql, [playlistId], (err, rows: Stream[]) => {
				if (err) reject(err);
				else resolve(rows);
			});
		});

		return queryPromise;
	}

	/**
	 * Updates the playlist streams in the database.
	 *
	 * @param playlistId - The ID of the playlist.
	 * @param streams - An ordered array of Stream objects representing the streams to be updated.
	 * @returns A promise that resolves when the update is complete.
	 */
	async updatePlaylistStreams(playlistId: string, streams: Stream[]) {
		// SQL queries to delete existing playlist streams and insert new ones
		const deleteSql = 'DELETE FROM playlist_stream_join WHERE playlist_id = ?';
		const insertSql =
			'INSERT INTO playlist_stream_join (playlist_id, stream_id, join_index) VALUES (?, ?, ?)';

		const queryPromise = new Promise<void>((resolve, reject) => {
			this.db.run(deleteSql, [playlistId], (err) => {
				if (err) reject(err);
				this.db.exec('BEGIN TRANSACTION');
				streams.forEach((stream, index) => {
					this.db.run(insertSql, [playlistId, stream.uid, index], (err) => {
						if (err) reject(err);
					});
				});
				this.db.exec('COMMIT TRANSACTION');
				resolve();
			});
		});

		return queryPromise;
	}

	/**
	 * Creates a new playlist in the database.
	 *
	 * @param playlist - The playlist object containing the details of the playlist.
	 * @returns A promise that resolves when the playlist is successfully created.
	 */
	async createPlaylist(playlist: Playlist) {
		// SQL query to insert a new playlist
		const sql =
			'INSERT INTO playlists (uid, name, is_thumbnail_permanent, thumbnail_stream_id) VALUES (?, ?, ?, ?)';

		const queryPromise: Promise<void> = new Promise((resolve, reject) => {
			this.db.run(
				sql,
				[
					playlist.uid,
					playlist.name,
					playlist.is_thumbnail_permanent,
					playlist.thumbnail_stream_id
				],
				(err) => {
					if (err) reject(err);
					resolve();
				}
			);
		});

		return queryPromise;
	}

	/**
	 * Updates a playlist in the database.
	 *
	 * @param playlist - The playlist object containing the updated information.
	 * @returns A promise that resolves when the update is complete.
	 */
	async updatePlaylist(playlist: Playlist) {
		// SQL query to update a playlist
		const sql =
			'UPDATE playlists SET name = ?, is_thumbnail_permanent = ?, thumbnail_stream_id = ? WHERE uid = ?';

		const queryPromise = new Promise<void>((resolve, reject) => {
			this.db.run(
				sql,
				[
					playlist.name,
					playlist.is_thumbnail_permanent,
					playlist.thumbnail_stream_id,
					playlist.uid
				],
				(err) => {
					if (err) reject(err);
					resolve();
				}
			);
		});

		return queryPromise;
	}

	/**
	 * Deletes a playlist from the database.
	 * @param playlistId - The ID of the playlist to delete.
	 * @returns A promise that resolves when the playlist is deleted.
	 */
	async deletePlaylist(playlistId: string) {
		// SQL queries to delete a playlist and its associated streams
		const deleteSql = 'DELETE FROM playlists WHERE uid = ?';
		const cleanupJoinSql = 'DELETE FROM playlist_stream_join WHERE playlist_id = ?';

		const queryPromise: Promise<void> = new Promise((resolve, reject) => {
			this.db.run(deleteSql, [playlistId], (err) => {
				if (err) reject(err);
				this.db.run(cleanupJoinSql, [playlistId], (err) => {
					if (err) reject(err);
					resolve();
				});
			});
		});

		return queryPromise;
	}

	/**
	 * Retrieves all streams from the database.
	 * @returns A promise that resolves to an array of Stream objects.
	 */
	async getStreams() {
		// SQL query to retrieve all streams
		const sql = 'SELECT * FROM streams';

		const queryPromise: Promise<Stream[]> = new Promise((resolve, reject) => {
			this.db.all(sql, (err, rows: Stream[]) => {
				if (err) reject(err);
				else resolve(rows);
			});
		});

		return queryPromise;
	}

	/**
	 * Retrieves the feed from the database.
	 * @returns A promise that resolves to an array of Stream objects representing the feed.
	 */
	async getFeed() {
		// SQL query to retrieve the feed
		const sql = `
		SELECT streams.*
		FROM streams
		JOIN feed ON streams.uid = feed.stream_id`;

		const queryPromise: Promise<Stream[]> = new Promise((resolve, reject) => {
			this.db.all(sql, (err, rows: Stream[]) => {
				if (err) reject(err);
				else resolve(rows);
			});
		});

		return queryPromise;
	}

	/**
	 * Configures the database by adding a progress column to the streams table
	 * and updating the progress times based on the stream_state table.
	 */
	async configureDb() {
		// SQL queries to add a progress column and update progress times
		const addProgress = `
		ALTER TABLE streams
		ADD COLUMN progress_time`;

		const updateProgress = `
		UPDATE streams
		SET progress_time = (
    SELECT progress_time
    FROM stream_state
    WHERE stream_state.stream_id = streams.uid
		)`;

		this.db.run(addProgress, (err) => {
			if (err) {
				console.log('🔶 Progress column already exists.');
				console.error(err);
			} else {
				console.log('✅ Progress column added successfully.');
			}
		});

		this.db.run(updateProgress, (err) => {
			if (err) {
				console.log('❌ Error updating progress times.');
				console.error(err);
			} else {
				console.log('✅ Progress times updated.');
			}
		});
	}

	/**
	 * Reconnects to the NewPipe database.
	 */
	async reconnectDb() {
		// Reconnect to the database
		this.db = new sqlite3.Database(
			'./newpipeDB/newpipe.db',
			sqlite3.OPEN_READWRITE,
			async (err) => {
				if (err) {
					console.log(
						'❌ NewPipe database connection failed. Make sure you have imported the database file and that it is named correctly - "newpipe.db".'
					);
					this.isConnected = false;
					return console.error(err.message);
				}
				console.log('✅ NewPipe database reconnected successfully.');
				this.isConnected = true;
				await this.configureDb();
			}
		);
	}

	/**
	 * Closes the database connection.
	 * @returns A promise that resolves when the database connection is closed successfully, or rejects with an error if there was an error closing the connection.
	 */
	async closeDb() {
		return new Promise<void>((resolve, reject) => {
			this.db.close((err) => {
				if (err) {
					console.log('❌ Error closing database connection.');
					reject(err);
				} else {
					console.log('✅ NewPipe database connection closed successfully.');
					resolve();
				}
			});
		});
	}
}

export default new DB();
