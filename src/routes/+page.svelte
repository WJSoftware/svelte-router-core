<script module>
	export const frontmatter = {
		description: 'Next-level routing for Svelte and Sveltekit',
		tagline: "Native Svelte v5 router for SPA's and PWA's with simultaneous path and hash routing",
		actions: [
			{
				label: 'Read the docs',
				to: '/docs/intro',
				type: 'primary'
			},
            {
                label: 'API Reference',
                to: '/api/core/router'
            },
            {
                label: "Repository",
                to: 'https://github.com/WJSoftware/svelte-router',
                external: true
            }
		]
	};
</script>

<svelte:head>
	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "SoftwareSourceCode",
			"name": "Svelte Router",
			"url": "https://svelte-router.dev",
			"codeRepository": "https://github.com/WJSoftware/svelte-router",
			"programmingLanguage": "Svelte",
			"license": "https://opensource.org/licenses/MIT",
			"description": "The most unique and flexible client router for Svelte v5 with simultaneous path and hash routing",
			"author": {
				"@type": "Person",
				"name": "José Pablo Ramírez Vargas"
			},
			"keywords": "Svelte Router, Svelte v5, routing, navigation, spa, pwa, Sveltekit"
		}
	</script>
</svelte:head>
