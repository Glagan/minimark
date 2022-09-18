<script lang="ts">
	import textToNode from './Adapter';
	import MinimarkNode from './MinimarkNode.svelte';

	export let text: string;
	export let tag: string = 'div';

	let classes = 'mk';
	if ($$restProps.class) {
		classes = `mk ${$$restProps.class}`;
	}

	$: nodes = textToNode(text);
</script>

<svelte:element this={tag} {...$$restProps} class={classes} on:click>
	<MinimarkNode {nodes} />
</svelte:element>
