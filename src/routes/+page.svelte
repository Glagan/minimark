<script lang="ts">
	import MiniMark from '$lib/MiniMark.svelte';
	import '$lib/minimark.css';

	const tests = [
		'Content',
		'Can be multi-line !\nLike this.',
		'Text can be *styled* **easily**, contain {{links|https://minimark.nikurasu.org/}} and even ``code`` !',
		'# First Header\n## *Second* header\n',
		'You can also easily __add__ your own style with ``mk.addTag()``.\nSee {{!https://github.com/Glagan/mini-mark#text-tag}} to know how.',
		'![You can also have other images|/javascript.png]\n---\nAnd you can separate content.',
		'The other notification will close with a fadeout thanks to ``notification.close()``.',
		"Buttons can be **disabled** after the timer expired.\nYou can also choose to hide the notification, or change a lot of it's content.",
		"This notification will be updated after it's *death* with nice buttons.\nLet it die to see it."
	];
</script>

{#each tests as test}
	<div class="wrapper">
		<MiniMark text={test} />
	</div>
{/each}

<style>
	.wrapper {
		border-bottom: 1px solid red;
	}
</style>
