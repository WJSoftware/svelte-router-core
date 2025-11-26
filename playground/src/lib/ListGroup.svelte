<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

    type Props = HTMLAttributes<HTMLUListElement> & {
        class?: string;
    }

    let {
        class: cssClass,
        children,
        ...restProps
    }: Props = $props();
</script>

<ul class={["list-group list-group-flush", cssClass]} {...restProps}>
    {@render children?.()}
</ul>
