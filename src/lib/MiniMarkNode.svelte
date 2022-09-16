<script lang="ts">
	import type { Node } from './Adapter';

	const selfClosingTags = [
		'area',
		'base',
		'br',
		'col',
		'embed',
		'hr',
		// 'img', // Images are treated separately
		'input',
		'link',
		'meta',
		'param',
		'source',
		'track',
		'wbr'
	];

	export let nodes: Node[];
</script>

{#each nodes as node}
	{#if !('tag' in node)}
		{#if node.textContent}
			{node.textContent}
		{/if}
		{#if node.childs && node.childs.length > 0}
			<svelte:self nodes={node.childs} />
		{/if}
	{:else if node.tag === 'img'}
		<svelte:element
			this="img"
			href={node.textContent}
			title={node.title}
			class={node.classes}
			{...node.attributes}
		/>
	{:else if selfClosingTags.indexOf(node.tag) >= 0}
		<svelte:element
			this={node.tag}
			href={node.textContent}
			title={node.title}
			class={node.classes}
			{...node.attributes}
		/>
	{:else}
		<svelte:element this={node.tag} class={node.classes} {...node.attributes}>
			{#if node.textContent}
				{node.textContent}
			{/if}
			{#if node.childs && node.childs.length > 0}
				<svelte:self nodes={node.childs} />
			{/if}
		</svelte:element>
	{/if}
{/each}

<style lang="postcss">
</style>
