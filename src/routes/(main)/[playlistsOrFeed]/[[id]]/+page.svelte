<!--
	This page displays all videos in a playlist or feed. It includes a list of all videos with the ability to sort and filter them.
	The user can click on a video to open it in a new tab, tag it, or delete it.
	The user can also drag and drop videos to add them to a playlist or reorder them 
	(reordering is disabled on the feed page or when filters are active).
-->
<script lang="ts">
	import { VideoCard } from '$lib/components';
	import type { Stream } from '$lib/types';
	import { DLList, DnDHandler, MergeSort, TagStream } from '$lib/utils';
	import classnames from 'classnames';
	import { flip } from 'svelte/animate';
	import { streamSelectionStore } from '$lib/stores';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Filter } from '$lib/assets/icons';
	import Dropdown from '$lib/components/Dropdown.svelte';

	export let data;
	let displayedStreams = new DLList(data.streams);
	let allStreams = new DLList(data.streams);
	$: displayedStreams = new DLList(data.streams);
	$: allStreams = new DLList(data.streams);
	let tags = data.tags;
	$: tags = data.tags;

	let currentPlaylistId = $page.params.id;
	$: currentPlaylistId = $page.params.id;
	let isPlaylistPage = $page.params.playlistsOrFeed === 'playlists';
	$: isPlaylistPage = $page.params.playlistsOrFeed === 'playlists';
	$: useFlip = isPlaylistPage ? flip : () => ({});

	let selection: Set<string> = new Set();
	let DnD = new DnDHandler(displayedStreams, streamSelectionStore);
	$: DnD = new DnDHandler(displayedStreams, streamSelectionStore);

	const updatePlaylistStreams = (streams: DLList<Stream>) => {
		fetch('/api/updateStreams', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ playlistId: currentPlaylistId, streams: streams.toArray() })
		});
	};

	const deleteStream = (uid: string) => {
		const deletedStream = allStreams.find((stream) => stream.uid == uid);
		if (
			selection.has(String(uid)) &&
			confirm(`Are you sure you want to remove ${selection.size} videos?`)
		) {
			allStreams = allStreams.filter((stream) => !selection.has(String(stream.uid)));
			displayedStreams = displayedStreams.filter((stream) => !selection.has(String(stream.uid)));
			DnD.clearSelection();
		} else if (
			!selection.has(String(uid)) &&
			confirm(`Are you sure you want to remove ${deletedStream?.title}?`)
		) {
			allStreams = allStreams.filter((stream) => stream.uid != uid);
			displayedStreams = displayedStreams.filter((stream) => stream.uid != uid);
		}
		updatePlaylistStreams(allStreams);
	};

	let sortOption = 'All';
	let sortReverse = false;
	$: $page.params.id, (sortOption = 'All');
	/**
	 * Sorts the streams based on the selected option. Clicking the same option reverses the order.
	 * @param sortingBy - The option to sort by
	 * @param sortFn - The sorting function
	 */
	const sortStreams = (sortingBy: string, sortFn: (a: Stream, b: Stream) => boolean) => {
		if (sortOption != sortingBy) {
			displayedStreams = MergeSort(displayedStreams, sortFn);
			sortOption = sortingBy;
			sortReverse = false;
		} else if (sortOption == sortingBy && !sortReverse) {
			displayedStreams.reverse();
			displayedStreams = new DLList(displayedStreams.toArray());
			sortReverse = true;
		} else {
			displayedStreams = allStreams.filter(
				(stream) => displayedStreams.find((s) => s.uid == stream.uid) != null
			);
			sortOption = 'All';
			sortReverse = false;
		}
	};

	let showDropdown = false;
	let filterOptions = new Set();
	$: $page.params.id, (filterOptions = new Set());
	const toggleDropdown = () => (showDropdown = !showDropdown);
	let dropdownItems: [string, () => unknown][] = [
		[
			'All / Reset filters',
			() => {
				filterOptions = new Set();
				sortOption = 'All';
				displayedStreams = allStreams;
			}
		],
		[
			'Progress% >',
			() => {
				const progressThresholdInput = prompt('Show streams with progress % greater than:', '0');
				if (progressThresholdInput == null) return;
				const progressThreshold = parseInt(progressThresholdInput);
				if (progressThreshold < 0 || progressThreshold > 100 || isNaN(progressThreshold)) {
					alert('Progress % must be a number between 0 and 100');
					return;
				}
				filterOptions = new Set([...filterOptions, 'Progress% >']);
				sortOption = 'All';
				displayedStreams = displayedStreams.filter((stream) => {
					if (stream.progress_time == null) return false;
					const watchPercentage = Math.round((stream.progress_time / 1000 / stream.duration) * 100);
					return watchPercentage >= progressThreshold;
				});
			}
		],
		[
			'Progress% <',
			() => {
				const progressThresholdInput = prompt('Show streams with progress % less than:', '0');
				if (progressThresholdInput == null) return;
				const progressThreshold = parseInt(progressThresholdInput);
				if (progressThreshold < 0 || progressThreshold > 100 || isNaN(progressThreshold)) {
					alert('Progress % must be a number between 0 and 100');
					return;
				}
				filterOptions = new Set([...filterOptions, 'Progress% <']);
				sortOption = 'All';
				displayedStreams = displayedStreams.filter((stream) => {
					if (stream.progress_time == null) return true;
					const watchPercentage = Math.round((stream.progress_time / 1000 / stream.duration) * 100);
					return watchPercentage <= progressThreshold;
				});
			}
		],
		[
			'Keywords',
			() => {
				const keywords = prompt('Enter keywords to filter by:', '')?.split(' ');
				if (keywords == null) return;
				filterOptions = new Set([...filterOptions, 'Keywords']);
				sortOption = 'All';
				displayedStreams = displayedStreams.filter((stream) => {
					for (const keyword of keywords)
						if (
							stream.title.toLowerCase().includes(keyword.toLowerCase()) ||
							stream.uploader.toLowerCase().includes(keyword.toLowerCase())
						)
							return true;
					return false;
				});
			}
		],
		[
			'Tags',
			() => {
				const tagKeywords = prompt('Enter comma-separated tags to filter by:', '')?.split(',');
				if (tagKeywords == null) return;
				filterOptions = new Set([...filterOptions, 'Tags']);
				sortOption = 'All';
				displayedStreams = displayedStreams.filter((stream) => {
					for (const keyword of tagKeywords)
						if (stream.tag?.name.toLowerCase().includes(keyword.toLowerCase())) return true;
					return false;
				});
			}
		]
	];

	const tagStream = async (stream: Stream, tagId: string | undefined) => {
		await TagStream(stream, tagId, selection, allStreams);
		displayedStreams = new DLList(displayedStreams.toArray());
	};

	onMount(() => {
		const unsub = streamSelectionStore.subscribe((value) => {
			selection = value;
		});
		const closeDropdown = () => (showDropdown = false);
		window.addEventListener('click', DnD.clearSelection);
		window.addEventListener('click', closeDropdown);
		return () => {
			unsub();
			window.removeEventListener('click', DnD.clearSelection);
			window.removeEventListener('click', closeDropdown);
		};
	});
</script>

{#if isPlaylistPage && $page.params.id == undefined}
	<div class="flex flex-col justify-between pb-[30%] pt-[0.25rem] w-full">
		<h3 class="text-lg">← Or create a new one</h3>
		<h1 class="text-5xl text-text-vibrant">← Select a playlist from the sidebar</h1>
	</div>
{:else}
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="w-full h-full">
		<ul class="flex flex-col" id="video-list" on:click|stopPropagation>
			<li
				class={classnames(
					'sticky z-10 top-[4.25rem] grid grid-cols-[1fr_2fr_1fr_0.5fr_0.5fr_0.5fr] gap-[1rem] px-[1rem] py-[0.25rem]',
					'rounded-[0.5rem] items-center bg-bg-primary text-accent text-center font-semibold'
				)}
			>
				<!-- Filter options dropdown -->
				<button
					class="relative w-full flex gap-[0.25rem]"
					on:click|stopPropagation={toggleDropdown}
				>
					<img src={Filter} alt="filter" class="h-[1.5rem]" />
					<Dropdown items={dropdownItems} {showDropdown} />
					<p class="w-full text-left">
						{filterOptions.size ? Array.from(filterOptions).join(', ') : 'All'}
					</p>
				</button>
				<!-- Sort options -->
				<button on:click={() => sortStreams('Title', (a, b) => a.title < b.title)}>
					<span class={sortOption == 'Title' ? 'underline' : ''}>Title</span>
				</button>
				<button on:click={() => sortStreams('Author', (a, b) => a.uploader < b.uploader)}>
					<span class={sortOption == 'Author' ? 'underline' : ''}>Author</span>
				</button>
				<button on:click={() => sortStreams('Released', (a, b) => a.upload_date > b.upload_date)}>
					<span class={sortOption == 'Released' ? 'underline' : ''}>Released</span>
				</button>
				<button
					on:click={() =>
						sortStreams('Tag', (a, b) => {
							if (a.tag == null) return false;
							if (b.tag == null) return true;
							return a.tag.name < b.tag.name;
						})}
				>
					<span class={sortOption == 'Tag' ? 'underline' : ''}>Tag</span>
				</button>
				<button
					on:click={() =>
						sortStreams('Progress', (a, b) => {
							if (a.progress_time == null) return true;
							if (b.progress_time == null) return false;
							const watchPercentageA = Math.round((a.progress_time / 1000 / a.duration) * 100);
							const watchPercentageB = Math.round((b.progress_time / 1000 / b.duration) * 100);
							return watchPercentageA < watchPercentageB;
						})}
				>
					<span class={sortOption == 'Progress' ? 'underline' : ''}>Progress</span>
				</button>
			</li>
			{#if displayedStreams.size === 0}
				<p class="text-center my-auto">
					<em>
						{isPlaylistPage
							? 'No videos found. Drag here videos from other playlists or the feed or check the filters.'
							: 'No videos found. Make sure your feed is not empty or check your filters.'}
					</em>
				</p>
			{:else}
				<!-- Render each video card -->
				{#each displayedStreams as stream (stream.uid)}
					<li
						class={classnames('flex flex-col hover:bg-bg-primary rounded-[0.75rem]', {
							'hover:!bg-accent/50 bg-accent/35': selection.has(String(stream.uid))
						})}
						id={stream.uid}
						draggable="true"
						on:click={DnD.handleCtrlClick}
						on:click={DnD.handleShiftClick}
						on:drag={DnD.handleDrag}
						on:dragstart={(e) => {
							DnD.handleDragStart(e);
							e.dataTransfer?.setData('text/plain', JSON.stringify(Array.from(selection)));
						}}
						on:drop={isPlaylistPage
							? (e) => {
									if (filterOptions.size || sortOption != 'All')
										return alert(
											'Turn off all filters and sorting options to enable video reordering.'
										);
									DnD.handleDrop(e);
									updatePlaylistStreams(displayedStreams);
								}
							: undefined}
						on:dragenter={isPlaylistPage
							? (e) => {
									if (filterOptions.size || sortOption != 'All') return;
									DnD.handleDragEnter(e);
								}
							: undefined}
						on:dragleave={DnD.handleDragLeave}
						on:dragover={isPlaylistPage ? (e) => e.preventDefault() : undefined}
						animate:useFlip={{ duration: 300 }}
					>
						<VideoCard
							{stream}
							{tags}
							{tagStream}
							deleteFn={isPlaylistPage ? () => deleteStream(stream.uid) : undefined}
						/>
					</li>
				{/each}
			{/if}
		</ul>
	</div>
{/if}
