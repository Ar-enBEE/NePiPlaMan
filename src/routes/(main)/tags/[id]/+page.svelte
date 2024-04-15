<!--
	This page displays all videos with a specific tag. It includes a list of all videos with that tag.
	The user can remove videos from the tag by clicking the trash icon on the video card.
-->
<script lang="ts">
	import { VideoCard } from '$lib/components';
	import { streamSelectionStore } from '$lib/stores';
	import type { Stream } from '$lib/types';
	import { DLList, DnDHandler, TagStream } from '$lib/utils';
	import classnames from 'classnames';
	import { onMount } from 'svelte';
	import { flip } from 'svelte/animate';

	export let data;
	let streams = new DLList<Stream>(data.streams);

	let selection = new Set<string>();
	let DnD = new DnDHandler(streams, streamSelectionStore);
	$: DnD = new DnDHandler(streams, streamSelectionStore);

	const removeStream = async (stream: Stream) => {
		await TagStream(stream, undefined, selection, streams);
		if (selection.has(String(stream.uid)))
			streams = streams.filter((s) => !selection.has(String(s.uid)));
		else streams = streams.filter((s) => s.uid !== stream.uid);
	};

	onMount(() => {
		const unsub = streamSelectionStore.subscribe((value) => {
			selection = value;
		});
		return unsub;
	});
</script>

<div class="w-full flex">
	{#if streams.isEmpty()}
		<p>
			<em>No streams found under this tag. Visit a playlist or the feed and tag some videos.</em>
		</p>
	{:else}
		<ul class="w-full">
			{#each streams as stream (stream.uid)}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
				<li
					class={classnames('flex flex-col hover:bg-bg-primary rounded-[0.75rem]', {
						'hover:!bg-accent/50 bg-accent/35': selection.has(String(stream.uid))
					})}
					id={stream.uid}
					draggable="true"
					on:click={DnD.handleCtrlClick}
					on:click={DnD.handleShiftClick}
					on:dragstart={(e) => {
						DnD.handleDragStart(e);
						e.dataTransfer?.setData('text/plain', JSON.stringify(Array.from(selection)));
					}}
					animate:flip={{ duration: 300 }}
				>
					<VideoCard
						{stream}
						deleteFn={() => removeStream(stream)}
						noDropdown
						tags={[]}
						tagStream={() => new Promise(() => {})}
					/>
				</li>
			{/each}
		</ul>
	{/if}
</div>
