<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

    type Props = HTMLAttributes<HTMLElement> & {
        divider?: string;
    };

    let {
        divider = ">",
        class: cssClass,
        children,
        ...restProps
    }: Props = $props();
</script>

<nav
    class={["breadcrumb", cssClass]}
    style:--bs-breadcrumb-divider={`'${divider}'`}
    aria-label="breadcrumb"
    {...restProps}
>
    <ol class="breadcrumb">
        {@render children?.()}
    </ol>
</nav>
