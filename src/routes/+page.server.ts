import db from '$lib/server/Database';
import { fail } from '@sveltejs/kit';
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import JSZip from 'jszip';

/**
 * Handles the file upload.
 * This action is responsible for submitting a file, extracting the newpipe.db file from it,
 * and saving it to newpipeDB/newpipe.db.
 *
 * @param request - The request object containing the file to upload.
 */
export const actions = {
	default: async ({ request }) => {
		console.log('🔶 Submitting file...');
		const formData = Object.fromEntries(await request.formData());
		const { fileToUpload } = formData as { fileToUpload: File };

		if (
			!(formData.fileToUpload as File).name ||
			(formData.fileToUpload as File).name === 'undefined'
		) {
			return fail(400, {
				error: true,
				message: 'You must provide a file to upload'
			});
		}

		const zip = new JSZip();
		await zip.loadAsync(await fileToUpload.arrayBuffer());
		const dbFile = await zip.file('newpipe.db')?.async('uint8array');

		if (!dbFile) {
			console.log('❌ The uploaded file does not contain the newpipe.db file');
			return fail(400, {
				error: true,
				message: 'The uploaded file does not contain the newpipe.db file'
			});
		}

		if (!existsSync('newpipeDB')) mkdirSync('newpipeDB');
		writeFileSync('newpipeDB/newpipe.db', Buffer.from(dbFile));
		writeFileSync('newpipeDB/newpipe-backup.db', Buffer.from(dbFile));
		console.log('✅ NewPipe file imported successfully');

		await db.reconnectDb();
	}
};
