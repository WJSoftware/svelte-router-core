<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import type { ClassValue } from "svelte/elements";
	import type { BootstrapColor } from "./types.js";

	type Props = HTMLAttributes<HTMLDivElement> & {
		class?: ClassValue;
		background?: BootstrapColor;
		dismissible?: boolean;
		children?: any;
		onDismiss?: () => void;
	};

	let {
		class: cssClass,
		background = 'primary',
		dismissible = false,
		children,
		onDismiss,
		...restProps
	}: Props = $props();

	let dismissed = $state(false);

	const classes: ClassValue = $derived([
		'alert',
		`alert-${background}`,
		dismissible && 'alert-dismissible',
		cssClass
	]);

	function handleDismiss() {
		dismissed = true;
		onDismiss?.();
	}
</script>

{#if !dismissed}
	<div class={classes} role="alert" {...restProps}>
		{#if children}
			{@render children()}
		{/if}
		
		{#if dismissible}
			<button 
				type="button" 
				class="btn-close" 
				aria-label="Close" 
				onclick={handleDismiss}
			></button>
		{/if}
	</div>
{/if}

<!--
@component

Bootstrap Alert component with type safety and full Bootstrap 5 support.

## Props:
- `background`: Bootstrap color variant (default: 'primary')
- `dismissible`: Whether the alert can be dismissed (default: false)
- `class`: Additional CSS classes (ClassValue type for clsx support)
- `onDismiss`: Callback function when alert is dismissed
- Plus all standard HTML div attributes

## Examples:
```svelte
<Alert background="success">
  Operation completed successfully!
</Alert>

<Alert background="warning" dismissible onDismiss={() => console.log('Alert dismissed')}>
  <strong>Warning!</strong> Please check your input.
</Alert>

<Alert background="info" class="mb-4 shadow">
  <h4 class="alert-heading">Well done!</h4>
  <p>You successfully completed the task.</p>
</Alert>
```
-->
