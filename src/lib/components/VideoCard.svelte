<!--
Represents a video card component.

@component VideoCard
@param stream - The stream object containing information about the video.
@param tags - An array of tags associated with the video.
@param tagStream - A function to update the tag associated with the video.
@param deleteFn - A function to delete the video.
@param noDropdown - A flag indicating whether to show the dropdown menu.
-->
<script lang="ts">
	import { Tag as TagIcon, Trash } from '$lib/assets/icons';
	import type { Tag, Stream } from '$lib/types';
	import { onMount } from 'svelte';
	import Dropdown from './Dropdown.svelte';
	import { tagDropdownStore } from '$lib/stores';
	import TagComponent from './Tag.svelte';
	import { CreateTag } from '$lib/utils';

	export let stream: Stream;
	export let tags: Tag[];
	export let tagStream: (stream: Stream, tagId: string | undefined) => Promise<void>;
	export let deleteFn: (() => void) | undefined = undefined;
	export let noDropdown = false;

	const currentDate = new Date();
	const uploadDate = new Date(stream.upload_date);
	let sinceUpload = [
		Math.floor((currentDate.getTime() - uploadDate.getTime()) / (1000 * 3600 * 24)),
		0
	];
	if (sinceUpload[0] > 31) sinceUpload = [Math.floor(sinceUpload[0] / 31), 1];
	if (sinceUpload[0] > 12) sinceUpload = [Math.floor(sinceUpload[0] / 12), 2];

	const watchPercentage = Math.round((stream.progress_time! / 1000 / stream.duration) * 100);

	let showDropdown = false;
	const toggleDropdown = () => (showDropdown = !showDropdown);
	let dropdownItems: [string, () => unknown, string?][] = [
		[
			'+ Create New',
			async () => {
				const newTag = await CreateTag(tags);
				if (!newTag) return;
				await tagStream(stream, newTag.uid);
				tags = [...tags, newTag];
				tagDropdownStore.update((value) => [...value, newTag]);
				showDropdown = false;
			}
		],
		[
			'- Remove Tag',
			async () => {
				await tagStream(stream, undefined);
				showDropdown = false;
			}
		]
	];

	onMount(() => {
		const unsub = tagDropdownStore.subscribe(
			(value) =>
				(dropdownItems = [
					...dropdownItems.slice(0, 2),
					...value.map(
						(tag) =>
							[
								tag.name,
								async () => {
									await tagStream(stream, tag.uid);
									showDropdown = false;
								},
								tag.color
							] as [string, () => unknown, string?]
					)
				])
		);
		const closeDropdown = () => (showDropdown = false);
		window.addEventListener('click', closeDropdown);
		return () => {
			unsub();
			window.removeEventListener('click', closeDropdown);
		};
	});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="relative grid grid-cols-[1fr_2fr_1fr_0.5fr_0.5fr_0.5fr] gap-[1rem] p-[0.5rem] items-center group text-center cursor-grab"
	on:click={(e) => {
		if (e.shiftKey || e.ctrlKey) return;
		open(stream.url);
	}}
>
	<img
		src={stream.thumbnail_url}
		alt={stream.title}
		class="rounded-[0.5rem] h-[6rem] pointer-events-none object-contain"
		draggable="false"
	/>
	<h2 class="text-left text-text-vibrant font-semibold line-clamp-2 pointer-events-none">
		{stream.title}
	</h2>
	<p class="pointer-events-none">{stream.uploader}</p>
	<p class="text-sm pointer-events-none">
		{sinceUpload[0] > 0
			? `${sinceUpload[0]} ${['day', 'month', 'year'][sinceUpload[1]] + (sinceUpload[0] > 1 ? 's' : '')} ago`
			: 'Today'}
	</p>
	<TagComponent tag={stream.tag} />
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="flex gap-[0.5rem] justify-center col-start-6" on:click|stopPropagation>
		<p class={`block ${noDropdown && !deleteFn ? '' : 'group-hover:hidden'}`}>{watchPercentage}%</p>
		{#if !noDropdown}
			<button
				on:click|stopPropagation={toggleDropdown}
				tabindex="0"
				class="hidden group-hover:flex relative"
			>
				<img src={TagIcon} alt="tags" />
				<Dropdown
					classOuter="right-0 cursor-default max-w-[15rem]"
					classItems="rounded-[0.5rem] hover:text-text-vibrant hover:bg-text/25 overflow-hidden text-ellipsis"
					items={dropdownItems}
					{showDropdown}
				/>
			</button>
		{/if}
		{#if deleteFn}
			<button on:click|stopPropagation={deleteFn} tabindex="0" class="hidden group-hover:flex">
				<img src={Trash} alt="delete" />
			</button>
		{/if}
	</div>
	<div
		class="absolute bottom-0 h-[0.25rem] bg-[#D04E2A] rounded-[0.25rem]"
		style={`width: ${watchPercentage}%`}
	></div>
</div>
