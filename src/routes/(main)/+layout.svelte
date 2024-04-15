<script lang="ts">
	import { Sidebar } from '$lib/components';

	export let data;
	const playlists = data.playlists ?? [];
</script>

<Sidebar playlistArray={playlists} />
<slot />
