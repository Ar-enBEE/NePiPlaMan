import db from '$lib/server/Database';
import fs from 'fs';
import JSZip from 'jszip';

export async function GET() {
	// Close the database connection to allow reading the file
	await db.closeDb();

	console.log('🔶 Exporting file...');
	const dbFile = fs.readFileSync('./newpipeDB/newpipe.db');

	// Create a zip file with the database file
	const zip = new JSZip();
	zip.file('newpipe.db', dbFile);
	const blob = await zip.generateAsync({ type: 'blob' });

	// Reconnect to the database
	await db.reconnectDb();

	// Generate a filename with the current date and time
	const now = new Date();
	const formattedDate =
		now.toISOString().slice(0, 10) +
		'T' +
		now.getHours().toString().padStart(2, '0') +
		now.getMinutes().toString().padStart(2, '0');

	return new Response(blob, {
		headers: {
			'Content-Type': 'application/zip',
			'Content-Disposition': `attachment; filename=#NewPipeData-${formattedDate}.zip`
		}
	});
}
