<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import type { ClassValue } from "svelte/elements";
	import type { BootstrapBackgroundColor, BootstrapTextColor } from "./types.js";

    type Props = HTMLAttributes<HTMLDivElement> & {
        class?: ClassValue;
        tag?: string;
        background?: BootstrapBackgroundColor;
        textColor?: BootstrapTextColor;
    }

    let {
        class: cssClass,
        tag = "div",
        background,
        textColor,
        children,
        ...restProps
    }: Props = $props();

    const classes: ClassValue = $derived([
        "card-header",
        "mb-0", // Remove default margin when used as heading
        background && `bg-${background}`,
        textColor && `text-${textColor}`,
        cssClass
    ]);
</script>

<svelte:element this={tag} class={classes} {...restProps}>
    {@render children?.()}
</svelte:element>

<!--
@component CardHeader
A reusable Bootstrap card header component with semantic HTML support.

Usage examples:
```svelte
<CardHeader>Basic header</CardHeader>
<CardHeader tag="h3">Header as H3</CardHeader>
<CardHeader background="primary" textColor="white">Styled header</CardHeader>
```

Props:
- `tag`: HTML element to render (default: "div")
- `background`: Bootstrap background color
- `textColor`: Bootstrap text color
- `class`: Additional CSS classes
-->
