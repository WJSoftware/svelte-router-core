<script lang="ts">
	import { RouterTrace } from '@svelte-router/core';
	import type { Snippet } from 'svelte';

    type Props = {
        tag?: string;
        hash?: boolean | string;
        children?: Snippet;
        [x: string]: any;
    };

    let {
        tag = 'div',
        hash,
        children,
        class: cssClass,
        ...restProps
    }: Props = $props();
</script>

<svelte:element this={tag} class={["flex-fill overflow-auto", cssClass]} {...restProps}>
    {@render children?.()}
</svelte:element>
<div class="table-responsive-lg">
    <RouterTrace {hash} class="table table-striped table-hover" />
</div>
