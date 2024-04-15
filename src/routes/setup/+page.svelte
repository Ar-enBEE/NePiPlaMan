<!--
	This page notifies the user that the program failed to connect to a NewPipe database.
	It provides instructions for importing the correct file and exporting/importing the NewPipe database.
-->
<script lang="ts">
	import { Export, Import } from '$lib/assets/icons';
</script>

<div class="flex flex-col items-center h-full gap-[2rem] py-[2rem] mx-auto">
	<h2 class="text-4xl">Have you imported your NewPipe data?</h2>
	<h3 class="text-lg italic">
		You are seeing this page because the program failed to connect to a NewPipe database.
	</h3>
	<h3>Make sure you are importing the correct file: <i>NewPipeData-XXXXXXXX_XXXXXX.zip</i></h3>
	<h4 class="italic">
		Hint: You can try manually placing the extracted newpipe.db file into the newpipeDB folder in
		the project's root directory
	</h4>
	<h3 class="text-2xl italic">Exporting/Importing your NewPipe database</h3>
	<ol class="text-lg list-decimal pl-[1rem]">
		<li>
			Open
			<a
				href="https://newpipe.net/"
				class="italic hover:underline font-semibold text-accent"
				target="_blank"
			>
				NewPipe
			</a>
			on your Android smartphone
		</li>
		<li>Click the three lines in the top-left corner</li>
		<li>Go to Settings → Content</li>
		<li>Scroll down and click <i>Export database</i></li>
		<li>Save the exported NewPipeData .zip file</li>
	</ol>
	<div>
		<p class="flex items-center">
			Upload the .zip file using the <img src={Import} alt="import" class="px-[0.15rem]" /> button in
			the top-left corner.
		</p>
		<p class="flex items-center">
			Afterwards you can download your file using the <img
				src={Export}
				alt="export"
				class="px-[0.15rem]"
			/>
			button.
		</p>
		<p class="flex h-[2.25rem] items-center">
			Import it into NewPipe through Settings → Content →&nbsp<i>Import database</i>.
		</p>
	</div>
</div>
