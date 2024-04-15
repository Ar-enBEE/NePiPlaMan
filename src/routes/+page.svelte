<!--
	This page contains instructions for getting started with the NePiPlaMan application.
	It provides information on exporting/importing the NewPipe database, managing playlists, and using various tabs.
-->
<script lang="ts">
	import { Export, Import, Tag, Trash } from '$lib/assets/icons';
</script>

<div
	class="flex flex-col items-center max-w-[35rem] h-full gap-[2rem] pt-[2rem] pb-[10rem] mx-auto"
>
	<h1 class="text-9xl">Welcome!</h1>
	<div class="flex flex-col gap-[1rem]">
		<h2 class="text-4xl">Getting Started</h2>
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
				Upload the .zip file using the <img src={Import} alt="import" class="px-[0.15rem]" /> button
				in the top-left corner.
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
		<h3 class="text-2xl italic">Managing your playlists</h3>
		<p>
			Navigating to the <i>Playlists</i> tab will allow you to manage your playlists.
		</p>
		<p>
			Opening a playlist will display all the videos it contains in the order they appear in
			NewPipe.
		</p>
		<p>
			Drag a video to move it around. <i>Ctrl+Click</i> and
			<i>Shift+Click</i> allow you to select multiple videos at once. Dragging it over a playlist adds
			it to that playlist.
		</p>
		<p class="flex">
			Click the <img src={Tag} alt="tag" class="px-[0.15rem]" /> button to add a custom tag to the video.
		</p>
		<p class="flex">
			Click the <img src={Trash} alt="trash" class="px-[0.15rem]" /> button to remove the video from
			the playlist.
		</p>
		<p>
			Playlist feature various filtering and sorting options including filtering by keywords and
			tags. <br /><em>Note:</em> These options must be disabled to allow re-ordering.
		</p>
		<h3 class="text-2xl italic">Feed</h3>
		<p>
			The <i>Feed</i> tab displays all recently released videos from your subscribed content creators.
			Use it to add videos by your favorite creators to your playlists.
		</p>
		<h3 class="text-2xl italic">My Tags</h3>
		<p>
			The <i>My Tags</i> tab displays all tags you have added to videos. Use it to edit your tags and
			display all videos with a specific tag.
		</p>
	</div>
</div>
