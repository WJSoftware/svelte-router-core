<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import type { ClassValue } from "svelte/elements";

    type Props = HTMLAttributes<HTMLDivElement> & {
        class?: ClassValue;
    }

    let {
        class: cssClass,
        children,
        ...restProps
    }: Props = $props();

    const classes: ClassValue = $derived([
        "card-body",
        cssClass
    ]);
</script>

<div class={classes} {...restProps}>
    {@render children?.()}
</div>

<!--
@component CardBody
A reusable Bootstrap card body component.

Usage examples:
```svelte
<CardBody>Card content goes here</CardBody>
<CardBody class="text-center">Centered content</CardBody>
```

Props:
- `class`: Additional CSS classes
-->
