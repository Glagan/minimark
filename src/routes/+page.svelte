<script lang="ts">
	import Highlight from 'svelte-highlight';
	import json from 'svelte-highlight/languages/json';
	import dark from 'svelte-highlight/styles/dark';
	import textToNode, { type Node } from '$lib/Adapter';
	import Minimark from '$lib/Minimark.svelte';
	import '$lib/minimark.css';
	import '../app.css';

	const examples = {
		Text: 'Content',
		'Multiple lines': 'Can be multi-line !\nLike this.',
		Style:
			'Text can be *styled* **easily**, contain {{links|https://github.com/Glagan/minimark}} and even ``code`` !',
		Headers: '# First Header\n## *Second* header\n',
		Customization:
			'You can easily __add__ your own style with the ``addTag()`` function.\nSee {{!https://github.com/Glagan/minimark#tags}} to know how.',
		Images: '![You can add images|/javascript.png]\n---\nAnd you can separate content.'
	};

	const showExample = (example: string) => {
		text = examples[example as keyof typeof examples];
	};

	let codePreviewResult: Node[] = [];
	let generationTime: number = 0;
	let text: string = 'Edit this text to see a live preview !';
	$: {
		const start = performance.now();
		codePreviewResult = textToNode(text);
		generationTime = performance.now() - start;
	}
</script>

<svelte:head>
	{@html dark}
	<title>@glagan/minimark</title>
</svelte:head>

<div class="container mx-auto w-full lg:w-3/5 p-4 pt-0">
	<div class="p-4 flex flex-row flex-nowrap justify-between items-center">
		<div>
			<a
				title="Github Repository"
				target="_blank"
				href="https://github.com/Glagan/minimark"
				rel="noreferrer noopener"
			>
				<span class="inline-block w-full text-lg text-gray-400">Glagan</span>
				<span class="text-xl text-gray-200">
					minimark
					<img
						class="inline-block align-middle"
						height="16"
						width="16"
						src="/github.png"
						alt="Github Logo"
					/>
				</span>
			</a>
		</div>
		<div class="md:block">
			<a href="https://ko-fi.com/Y8Y32X73U" target="_blank">
				<img
					height="36"
					style="border: 0px; height: 36px"
					src="/kofi.png"
					alt="Buy Me a Coffee at ko-fi.com"
				/>
			</a>
		</div>
	</div>
	<div class="mb-4">
		<p class="text-sm">Click on an example to load it</p>
		{#each Object.keys(examples) as example}
			<button on:click={showExample.bind(null, example)}>{example}</button>
		{/each}
	</div>
	<textarea
		name="example"
		id="example"
		cols="30"
		rows="6"
		placeholder="Preview content"
		bind:value={text}
	/>
	<div class="overflow-hidden mt-4 p-4 border-2 border-gray-400 rounded-md bg-gray-600">
		<Minimark {text} />
	</div>
	<div class="relative overflow-x-hidden mt-4 max-h-64 overflow-y-scroll rounded-md">
		<div class="absolute top-1 right-1 px-1 py-0 text-sm rounded-sm border border-gray-400">
			{generationTime}ms
		</div>
		<Highlight language={json} code={JSON.stringify(codePreviewResult, null, 4)} />
	</div>
</div>

<style lang="postcss">
	textarea {
		@apply w-full transition focus:outline-none focus:border-blue-800 focus:ring focus:ring-blue-800 border border-gray-400 rounded-md p-1 text-gray-800;
	}

	button {
		@apply mt-2 mr-2 px-2 py-1 rounded-md border transition focus:outline-none focus:border-blue-800 focus:ring focus:ring-blue-800;
	}

	button:last-of-type {
		@apply mr-0;
	}
</style>
