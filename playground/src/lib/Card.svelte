<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import type { ClassValue } from "svelte/elements";
	import type { BootstrapColor } from "./types.js";

    type Props = HTMLAttributes<HTMLDivElement> & {
        class?: ClassValue;
        hover?: boolean;
        border?: BootstrapColor;
    }

    let {
        class: cssClass,
        hover = true,
        border,
        children,
        ...restProps
    }: Props = $props();

    const classes: ClassValue = $derived([
        "card",
        hover && "card-hover",
        border && `border-${border}`,
        cssClass
    ]);
</script>

<div class={classes} {...restProps}>
    {@render children?.()}
</div>

<style>
    .card-hover {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .card-hover:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
</style>

<!--
@component Card
A reusable Bootstrap card component with hover effects and type-safe styling.

Usage examples:
```svelte
<Card>Basic card</Card>
<Card border="primary" class="h-100">Card with border</Card>
<Card border="success" hover={false}>Card without hover effect</Card>
```

Props:
- `border`: Bootstrap color for card border
- `hover`: Enable/disable hover effect (default: true)
- `class`: Additional CSS classes
-->
