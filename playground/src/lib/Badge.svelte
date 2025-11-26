<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import type { ClassValue } from "svelte/elements";
	import type { BootstrapBackgroundColor, BootstrapTextColor } from "./types.js";

    type Props = HTMLAttributes<HTMLSpanElement> & {
        class?: ClassValue;
        background?: BootstrapBackgroundColor;
        textColor?: BootstrapTextColor;
        pill?: boolean;
        size?: 'sm' | 'lg';
        children?: any;
    };

    let {
        class: cssClass,
        background = 'primary',
        textColor,
        pill = false,
        size,
        children,
        ...restProps
    }: Props = $props();

    const classes: ClassValue = $derived([
        "badge",
        background && `bg-${background}`,
        textColor && `text-${textColor}`,
        pill && "rounded-pill",
        size === 'sm' && "fs-7 px-2 py-1",
        size === 'lg' && "fs-5 px-3 py-2",
        cssClass
    ]);
</script>

<span class={classes} {...restProps}>
    {@render children?.()}
</span>

<!--
@component Badge
A reusable Bootstrap badge component with full type safety.

Usage examples:
```svelte
<Badge>Default</Badge>
<Badge background="success">Success</Badge>
<Badge background="danger" textColor="white">Error</Badge>
<Badge background="primary" pill={true}>Pill Badge</Badge>
<Badge background="info" size="lg">Large Badge</Badge>
<Badge background="warning" size="sm">Small Badge</Badge>
```
-->
