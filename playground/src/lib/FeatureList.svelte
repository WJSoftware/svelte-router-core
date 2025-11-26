<script lang="ts">
	import type { Snippet } from "svelte";

    type Props = {
        children?: Snippet;
    }

    let {
        children,
    }: Props = $props();
</script>

<ul class="list-unstyled">
    {@render children?.()}
</ul>

<style>
    .list-unstyled {
        padding-left: 0;
        list-style: none;
    }
</style>
