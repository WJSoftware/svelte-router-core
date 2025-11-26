<script lang="ts">
	import type { HTMLLiAttributes } from "svelte/elements";

    type Props = HTMLLiAttributes;
    
    let {
        class: cssClass,
        children,
        ...restProps
    }: Props = $props();
</script>

<li class={["breadcrumb-item", cssClass]} {...restProps}>
    {@render children?.()}
</li>
