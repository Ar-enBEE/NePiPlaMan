<!--
	This page displays all tags. It includes a button for creating new tags and a list of all tags.
	The user can click on a tag to view all videos with that tag. The user can also click on the
	edit button to edit the tag name and color or the delete button to delete the tag.
-->
<script lang="ts">
	import { Plus } from '$lib/assets/icons';
	import TagComponent from '$lib/components/Tag.svelte';
	import { tagDropdownStore } from '$lib/stores';
	import { CreateTag } from '$lib/utils';
	import classnames from 'classnames';

	export let data;
	let tags = data.tags ?? [];

	const createTag = async () => {
		const newTag = await CreateTag(tags);
		if (!newTag) return;
		tags = [...tags, newTag];
		tagDropdownStore.update((value) => [...value, newTag]);
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="relative flex flex-col items-center px-[] gap-[1rem] w-full">
	<div
		class={classnames(
			'sticky top-[4.25rem] flex w-[50%] p-[0.5rem] rounded-[0.625rem] justify-center bg-bg-primary z-10',
			'hover:w-[60%] hover:p-[1rem] transition-[width,padding] duration-200 ease-out'
		)}
		on:click={createTag}
	>
		<img src={Plus} alt="add" class="w-[2rem] h-[2rem]" />
	</div>
	{#each tags as tag}
		<TagComponent {tag} full />
	{/each}
</div>
