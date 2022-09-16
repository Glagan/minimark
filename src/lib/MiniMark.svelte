<script lang="ts">
	import { textToNode } from './Adapter';
	import MiniMarkNode from './MiniMarkNode.svelte';

	export let text: string;
	export let tag: string = 'div';

	const start = performance.now();
	const nodes = textToNode(text);
	console.log('done in ', performance.now() - start, 'ms');
</script>

<svelte:element this={tag} class="mk" {...$$restProps}>
	<MiniMarkNode {nodes} />
</svelte:element>
