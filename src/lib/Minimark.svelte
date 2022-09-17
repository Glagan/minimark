<script lang="ts">
	import { textToNode } from './Adapter';
	import MinimarkNode from './MinimarkNode.svelte';

	export let text: string;
	export let tag: string = 'div';

	$: nodes = textToNode(text);
</script>

<svelte:element this={tag} class="mk" {...$$restProps}>
	<MinimarkNode {nodes} />
</svelte:element>
