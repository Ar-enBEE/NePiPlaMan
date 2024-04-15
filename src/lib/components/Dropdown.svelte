<!--
A dropdown component that displays a list of items.

@component Dropdown
@param items - The list of items to display in the dropdown. Each item is represented by a tuple containing the text, action function, and optional color.
@param showDropdown - Determines whether the dropdown is visible or hidden.
@param inputType - The type of input to use for each item in the dropdown. Can be either 'radio' or 'button'.
@param classOuter - Additional CSS classes to apply to the outer container of the dropdown.
@param classItems - Additional CSS classes to apply to each item in the dropdown.
@param selected - The currently selected item in the dropdown (only applicable when inputType is 'radio').
-->
<script lang="ts">
	import classnames from 'classnames';

	export let items: [string, () => unknown, string?][];
	export let showDropdown = false;
	export let inputType: 'radio' | 'button' = 'button';
	export let classOuter = '';
	export let classItems = '';
	export let selected = '';
</script>

<div
	class={classnames(
		'absolute top-full flex flex-col w-max p-[0.5rem] rounded-[0.25rem] gap-[0.25rem] z-10 bg-bg-slate',
		{ '!hidden': !showDropdown },
		classOuter
	)}
>
	<!-- Iterate over each item in the list that was passed in
		and extract the text, action, and optional color -->
	{#each items as [text, action, color]}
		<!-- If the inputType is 'radio', render a radio button -->
		{#if inputType === 'radio'}
			<label class="cursor-pointer">
				<input
					type="radio"
					on:click={action}
					class={classItems}
					name="dropdown"
					value={text}
					bind:group={selected}
				/>
				{text}
			</label>
			<!-- If the inputType is 'button', render a regular button -->
		{:else}
			<input
				type="button"
				on:click={action}
				value={text}
				class={'cursor-pointer ' + classItems}
				style={`color:${color}`}
				tabindex="-1"
			/>
		{/if}
	{/each}
</div>
