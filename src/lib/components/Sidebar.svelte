<!--
A sidebar component that displays a list of playlists. It includes a dropdown menu for sorting playlists, buttons for creating, editing and deleting playlists, and a resizable handle for adjusting the sidebar width.

@component Sidebar
@param playlistArray - An array of playlist objects to display.
-->
<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import classnames from 'classnames';
	import type { Playlist } from '$lib/types';
	import { EditWhite, Folder, Plus, Sort, Trash } from '$lib/assets/icons';
	import { sidebarWidthStore, isResizingStore, playlistSelectionStore } from '$lib/stores';
	import { DLList, DnDHandler, MergeSort } from '$lib/utils';
	import Dropdown from './Dropdown.svelte';
	import { flip } from 'svelte/animate';
	import { goto } from '$app/navigation';

	export let playlistArray: Playlist[];
	let playlists = new DLList(playlistArray);
	let currentPlaylistId = $page.url.pathname.startsWith('/playlists/') ? $page.params.id : '-1';
	$: currentPlaylistId = $page.url.pathname.startsWith('/playlists/') ? $page.params.id : '-1';

	let selection: Set<string>;
	playlistSelectionStore.subscribe((value) => {
		selection = value;
	});

	let DnD = new DnDHandler(playlists, playlistSelectionStore);
	$: DnD = new DnDHandler(playlists, playlistSelectionStore);

	const renamePlaylist = (uid: string) => {
		const currentPlaylist = playlists.find((playlist) => playlist.uid == uid);
		const newName = prompt(
			'Enter new name:',
			currentPlaylist ? currentPlaylist.name : `New Playlist #${uid}`
		);
		if (newName) {
			currentPlaylist!.name = newName;
		}
		playlists = playlists;
		fetch('/api/updatePlaylist', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(currentPlaylist)
		});
	};

	const createPlaylist = () => {
		const nextId = Math.max(...playlists.map((playlist) => Number(playlist.uid)), 0) + 1;
		const newName = prompt('Enter new playlist name:', `New Playlist #${nextId}`);
		if (newName) {
			const newPlaylist = {
				uid: String(nextId),
				name: newName,
				is_thumbnail_permanent: '0',
				thumbnail_stream_id: '-1'
			};
			playlists.push(newPlaylist);
			playlists = playlists;
			fetch('/api/createPlaylist', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(newPlaylist)
			});
		}
	};

	const deletePlaylist = (uid: string) => {
		const deletedPlaylist = playlists.find((playlist) => playlist.uid == uid);

		if (
			selection.has(String(uid)) &&
			confirm(`Are you sure you want to delete ${selection.size} playlists?`)
		) {
			playlists = playlists.filter((playlist) => !selection.has(String(playlist.uid)));
			selection.forEach((uid) => {
				fetch('/api/deletePlaylist', {
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ uid })
				});
			});
			if (selection.has(currentPlaylistId)) goto('/playlists', { replaceState: true });
			DnD.clearSelection();
		} else if (
			!selection.has(String(uid)) &&
			confirm(`Are you sure you want to delete ${deletedPlaylist?.name}?`)
		) {
			playlists = playlists.filter((playlist) => playlist.uid != uid);
			fetch('/api/deletePlaylist', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ uid })
			});
			if (uid == currentPlaylistId) goto('/playlists', { replaceState: true });
		}
		updatePlaylistOrder();
	};

	const updatePlaylistOrder = () => {
		let playlistOrder: number[] = [];
		playlists.map((p) => playlistOrder.push(parseInt(p.uid)));
		fetch('/api/setSettings', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ playlistOrder })
		});
	};

	const addToPlaylist = async (playlistId: string, streamIds: string[]) => {
		await fetch('/api/addToPlaylist', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ playlistId, streamIds })
		});
	};

	let showDropdown = false;
	let dropdownOption = 'Custom';
	const toggleDropdown = () => (showDropdown = !showDropdown);
	const dropdownItems: [string, () => unknown][] = [
		[
			'Custom',
			() => {
				const res = fetch('/api/getSettings?settings=playlistOrder');
				res
					.then((res) => res.json())
					.then((data) => {
						const order = data.playlistOrder;
						playlists = MergeSort(playlists, (a, b) => {
							const aInd = order.indexOf(a.uid);
							const bInd = order.indexOf(b.uid);
							if (bInd == -1) return true;
							if (aInd == -1) return false;
							return aInd < bInd;
						});
					});
				toggleDropdown();
			}
		],
		[
			'A-Z',
			() => {
				playlists = MergeSort(playlists, (a, b) => a.name.toLowerCase() < b.name.toLowerCase());
				toggleDropdown();
			}
		],
		[
			'Z-A',
			() => {
				playlists = MergeSort(playlists, (a, b) => a.name.toLowerCase() > b.name.toLowerCase());
				toggleDropdown();
			}
		]
	];

	let sidebarWidth: number;
	sidebarWidthStore.subscribe((value) => (sidebarWidth = value));

	let isResizing: boolean;
	isResizingStore.subscribe((value) => (isResizing = value));

	onMount(() => {
		const closeDropdown = () => (showDropdown = false);

		const resizeHandle = document.getElementById('resize-handle');

		const resize = (event: MouseEvent) => {
			if (!isResizing) return;
			event.preventDefault();
			// Clamp sidebar size
			sidebarWidthStore.update(() => Math.min(Math.max(event.pageX, 200), 400));
		};

		const startResize = () => {
			window.addEventListener('mousemove', resize);
			isResizingStore.set(true);
		};

		const stopResize = () => {
			window.removeEventListener('mousemove', resize);
			isResizingStore.set(false);
		};

		resizeHandle!.addEventListener('mousedown', startResize);
		window.addEventListener('mouseup', stopResize);
		window.addEventListener('click', closeDropdown);
		window.addEventListener('click', DnD.clearSelection);

		return () => {
			window.removeEventListener('mousemove', resize);
			resizeHandle!.removeEventListener('mousedown', startResize);
			window.removeEventListener('mouseup', stopResize);
			window.removeEventListener('click', closeDropdown);
			window.removeEventListener('click', DnD.clearSelection);
		};
	});
</script>

<section
	class="sticky top-[4.25rem] flex self-start"
	style={`min-width: ${sidebarWidth}px; width: ${sidebarWidth}px;`}
>
	<nav class="flex flex-col w-full h-[calc(100vh-5.5rem)] rounded-[0.5rem] bg-bg-primary">
		<div class="flex p-[0.5rem] gap-[0.25rem]">
			<button class="relative flex gap-[0.25rem]" on:click|stopPropagation={toggleDropdown}>
				<img src={Sort} alt="sort" />
				<Dropdown
					items={dropdownItems}
					{showDropdown}
					bind:selected={dropdownOption}
					inputType="radio"
				/>
				{dropdownOption}
			</button>
			<button class="relative ml-auto" on:click={createPlaylist}>
				<img src={Plus} alt="plus" />
			</button>
		</div>
		<ul class="flex flex-col overflow-y-auto overflow-x-hidden">
			{#if playlists.size}
				{#each playlists as playlist (playlist.uid)}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
					<li
						class={classnames('flex gap-[0.25rem] hover:bg-text/25 font-semibold group', {
							'text-accent !font-bold': playlist.uid == currentPlaylistId,
							'bg-text text-bg-slate hover:bg-text/75': selection.has(String(playlist.uid))
						})}
						id={playlist.uid}
						draggable="true"
						on:click={DnD.handleCtrlClick}
						on:click={DnD.handleShiftClick}
						on:dragstart={(e) => {
							if (dropdownOption == 'Custom') DnD.handleDragStart(e);
							else alert('Select the "Custom" sort option to enable Drag and Drop.');
						}}
						on:drop={async (e) => {
							if (e.dataTransfer?.types.length == 1 && e.dataTransfer.types[0] == 'text/plain') {
								await addToPlaylist(
									String(playlist.uid),
									JSON.parse(e.dataTransfer.getData('text/plain'))
								);
							} else if (dropdownOption == 'Custom') {
								DnD.handleDrop(e);
								updatePlaylistOrder();
							}
						}}
						on:dragenter={DnD.handleDragEnter}
						on:dragleave={DnD.handleDragLeave}
						on:dragover|preventDefault
						animate:flip={{ duration: 300 }}
					>
						<a
							href={`/playlists/${playlist.uid}`}
							class="flex w-full px-[0.5rem] py-[0.25rem] whitespace-nowrap overflow-hidden"
						>
							<img
								src={Folder}
								alt="folder"
								class={selection.has(String(playlist.uid)) ? 'invert' : ''}
							/>
							{playlist.name}
						</a>
						<button on:click={() => renamePlaylist(String(playlist.uid))} tabindex="-1">
							<img
								src={EditWhite}
								alt="edit"
								class={classnames({
									'hidden group-hover:flex': currentPlaylistId != playlist.uid,
									invert: selection.has(String(playlist.uid))
								})}
							/>
						</button>
						<button on:click={() => deletePlaylist(String(playlist.uid))} tabindex="-1">
							<img
								src={Trash}
								alt="delete"
								class={classnames({
									'hidden group-hover:flex': currentPlaylistId != playlist.uid,
									invert: selection.has(String(playlist.uid))
								})}
							/>
						</button>
					</li>
				{/each}
			{:else}
				<p class="text-center text-text"><em>No playlists found</em></p>
			{/if}
		</ul>
	</nav>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="cursor-col-resize min-w-[0.5rem]" id="resize-handle" />
</section>
