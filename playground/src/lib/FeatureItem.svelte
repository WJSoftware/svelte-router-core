<script lang="ts">
	import type { Snippet } from "svelte";

    type Props = {
        children?: Snippet;
    }

    let {
        children,
    }: Props = $props();
</script>

<li>
    <i class="bi bi-check-circle text-success"></i>&nbsp;
    {@render children?.()}
</li>
