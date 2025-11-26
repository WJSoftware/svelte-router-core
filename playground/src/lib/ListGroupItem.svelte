<script lang="ts">
	import type { HTMLLiAttributes } from "svelte/elements";

    type Props = HTMLLiAttributes & {
        class?: string;
    }

    let {
        class: cssClass,
        children,
        ...restProps
    }: Props = $props();
</script>

<li class={["list-group-item", cssClass]} {...restProps}>
    {@render children?.()}
</li>
