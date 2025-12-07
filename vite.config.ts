import { defineConfig } from 'vitest/config';
import { sveltepress } from '@sveltepress/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { siteConfig, themeConfig } from './sveltepress/config.js';

export default defineConfig({
	plugins: [sveltepress({
		siteConfig,
		theme: themeConfig
	}), svelteTesting()],

	test: {
		environment: 'jsdom',
		globals: true,
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
