import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

const config = defineConfig({
	plugins: [sveltekit()],
	test: {
		globals: true
	},
	optimizeDeps: {
		include: ['highlight.js', 'highlight.js/lib/core']
	}
});

export default config;
