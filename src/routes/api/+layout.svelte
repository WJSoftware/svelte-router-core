<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { LayoutData } from './$types.js';
    import techArticleMeta from './techArticleMetaData.json' with { type: 'json' };
    import { page } from '$app/state';

    let { data, children }: { data: LayoutData; children: Snippet } = $props();

    const taData = $derived(
        (techArticleMeta as Record<string, { headline: string; description: string }>)[
            page.url.pathname
        ]
    );
    const techArticle = $derived.by(() => {
        if (!taData) return undefined;
        return `<${'script'} type="application/ld+json">
    ${JSON.stringify(
        {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: taData.headline,
            description: taData.description,
            author: {
                '@type': 'Person',
                name: 'José Pablo Ramírez Vargas'
            },
            publisher: {
                '@type': 'Person',
                name: 'José Pablo Ramírez Vargas',
                url: 'https://github.com/webJose'
            },
            mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `https://svelte-router.dev${page.url.pathname}`
            }
        },
        null,
        2
    )}
</${'script'}>`;
    });

    $effect(() => {
        if (!taData) {
            console.warn(`TechArticle metadata not found for path: ${page.url.pathname}`);
        }
    });
</script>

<svelte:head>
    {@html techArticle}
</svelte:head>

{@render children()}
