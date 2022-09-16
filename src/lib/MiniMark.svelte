<script lang="ts">
	import { textToNode } from './Adapter';
	import MiniMarkNode from './MiniMarkNode.svelte';

	export let text: string;
	export let tag: string = 'div';

	$: nodes = textToNode(text);
</script>

<svelte:element this={tag} class="mk" {...$$restProps}>
	<MiniMarkNode {nodes} />
</svelte:element>
