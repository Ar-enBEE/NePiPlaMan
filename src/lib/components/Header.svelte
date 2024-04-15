<!--
The Header component displays the header section of the application.
It includes a logo, import and export functionality, and navigation links.

@component Header
-->

<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { Logo, Import, Export } from '$lib/assets/icons';
	import classNames from 'classnames';

	$: currentRoute = $page.url.pathname;

	const handleExport = async () => {
		try {
			const response = await fetch('/api/exportDB');
			if (response.ok) {
				const dbZip = await response.arrayBuffer();
				const filename = response.headers.get('Content-Disposition')?.split('filename=')[1];

				const blob = new Blob([dbZip], { type: 'application/zip' });
				const url = URL.createObjectURL(blob);
				const link = document.createElement('a');

				link.href = url;
				link.download = filename || '#NewPipeData.zip';
				link.click();
				URL.revokeObjectURL(url);
			} else {
				console.error('❌ Error exporting newpipe.db file:', response.status, response.statusText);
			}
		} catch (error) {
			console.error('❌ Error exporting newpipe.db file:', error);
		}
	};

	const submitForm = () => {
		const form = document.getElementById('import-form') as HTMLFormElement;
		form.submit();
	};
</script>

<header
	class="sticky top-0 flex w-full pl-[1.5rem] pr-[2.5rem] py-[0.75rem] rounded-b-[1rem] bg-bg-primary shadow-md z-10"
>
	<div class="flex gap-[1.5rem] items-center">
		<a href="/"><img src={Logo} alt="logo" /></a>
		<form method="POST" action="/" enctype="multipart/form-data" use:enhance id="import-form">
			<label>
				<img src={Import} alt="import" class="cursor-pointer" />
				<input
					type="file"
					id="file-import"
					class="hidden"
					accept=".zip"
					name="fileToUpload"
					on:change={submitForm}
				/>
			</label>
		</form>
		<button class="min-w-max h-fit" on:click={handleExport}
			><img src={Export} alt="export" title="Export" />
		</button>
	</div>
	<nav class="flex ml-auto gap-[1rem] items-center">
		<a
			href="/playlists"
			class={classNames('hover:text-text-vibrant', {
				underline: currentRoute.startsWith('/playlists')
			})}
		>
			Playlists
		</a>
		<a
			href="/feed"
			class={classNames('hover:text-text-vibrant', { underline: currentRoute.startsWith('/feed') })}
		>
			Feed
		</a>
		<a
			href="/tags"
			class={classNames('hover:text-text-vibrant', { underline: currentRoute.startsWith('/tags') })}
		>
			My Tags
		</a>
	</nav>
</header>
