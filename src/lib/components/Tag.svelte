<!--
Component for displaying a tag.

@component Tag
@param tag - The tag object to display.
@param full - Whether to display the tag in full size or not (edit and delete buttons are shown when full).
@fires editTag - Callback function for the edit button.
@fires deleteTag - Callback function for the trash button.
-->

<script lang="ts">
	import { Edit, Trash } from '$lib/assets/icons';
	import { tagDropdownStore } from '$lib/stores';
	import type { Tag } from '$lib/types';
	import classnames from 'classnames';

	export let tag: Tag | undefined;
	export let full = false;

	const editTag = async () => {
		if (!tag) return;
		const newName = prompt('Enter new name:', tag.name);
		if (newName === null) return;
		const newColor = prompt('Enter new color in HEX format:', tag.color);
		if (!newColor?.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
			alert('Invalid HEX color format. Valid formats are "#..." or "#......".');
			return;
		}

		const newTag = { uid: tag.uid, name: newName, color: newColor };
		await fetch('/api/updateTag', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(newTag)
		});
		tag = newTag;
		tagDropdownStore.update((value) => value.map((t) => (t.uid === tag?.uid ? tag : t)));
	};

	const deleteTag = () => {
		if (!tag) return;
		const shortenedName = tag.name.length > 100 ? tag.name.slice(0, 100) + '...' : tag.name;
		if (confirm(`Are you sure you want to delete tag #${tag.uid} "${shortenedName}"?`)) {
			fetch('/api/deleteTag', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(tag)
			});
			tagDropdownStore.update((value) => value.filter((t) => t.uid !== tag?.uid));
			tag = undefined;
		}
	};

	function getContrastColor(hex: string) {
		if (hex.indexOf('#') === 0) hex = hex.slice(1);
		if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
		if (hex.length !== 6) throw new Error('Invalid HEX color.');

		const hexToRgb = (hex: string) => {
			const bigint = parseInt(hex, 16);
			const r = (bigint >> 16) & 255;
			const g = (bigint >> 8) & 255;
			const b = bigint & 255;
			return [r / 255, g / 255, b / 255];
		};

		const [r, g, b] = hexToRgb(hex);
		const lum = 0.299 * r + 0.587 * g + 0.114 * b;

		return lum > 0.5 ? '#2F2F2F' : '#F2F2F2';
	}
</script>

{#if tag}
	<a
		href="/tags/{tag.uid}"
		class={classnames(
			'relative flex rounded-[0.625rem] w-full p-[0.25rem] justify-center overflow-hidden group',
			{ 'p-[1rem]': full }
		)}
		style={`background-color: ${tag?.color}`}
		on:click|stopPropagation
	>
		<p
			class={classnames('font-bold italic text-ellipsis overflow-hidden', {
				'text-sm whitespace-nowrap': !full,
				'text-xl group-hover:invisible': full
			})}
			style={`color: ${getContrastColor(tag.color)}`}
		>
			{tag?.name}
		</p>
		{#if full}
			<div
				class="absolute top-[50%] bottom-[50%] hidden items-center group-hover:flex gap-[0.75rem]"
			>
				<button on:click|preventDefault={editTag} tabindex="0">
					<img
						src={Edit}
						alt="edit"
						class={`brightness-0 ${getContrastColor(tag.color) == '#F2F2F2' ? 'invert' : ''}`}
					/>
				</button>
				<button on:click|preventDefault={deleteTag} tabindex="0">
					<img
						src={Trash}
						alt="delete"
						class={`brightness-0 ${getContrastColor(tag.color) == '#F2F2F2' ? 'invert' : ''}`}
					/>
				</button>
			</div>
		{/if}
	</a>
{/if}
