<script lang="ts">
	import '../app.css';
	import { Header } from '$lib/components';
</script>

<Header />
<main class="p-[0.5rem] flex">
	<slot />
</main>
