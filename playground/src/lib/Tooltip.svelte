<script lang="ts">
	import { computePosition, offset, arrow, type Placement, type Strategy } from "@floating-ui/dom";
	import { fade } from 'svelte/transition';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		strategy?: Strategy;
		placement?: Placement;
		children?: Snippet;
		reference: Snippet<[(refEl: HTMLElement) => () => void]>;
		shown?: boolean;
	}

	let {
		strategy = 'absolute',
		placement = 'bottom',
		children,
		reference,
		shown = false,
		class: cssClass,
		...restProps
	}: Props = $props();

	let refElement = $state<HTMLElement | null>(null);
	let pos = $state<{ x: number; y: number } | undefined>();

	function setReferenceElement(refEl: HTMLElement) {
		refElement = refEl;
		return () => {
			refElement = null;
			console.log('setReferenceElement cleaned up.');
		}
	}

	function calculateTooltipPos(ttipEl: HTMLElement) {
		console.log('calculateTooltipPos');
		if (!refElement || !shown) {
			return;
		}
		
		computePosition(refElement, ttipEl, {
			strategy,
			placement,
			middleware: [
				offset(8)
			],
		}).then(result => {
			console.log(result);
			pos = {
				x: result.x,
				y: result.y
			};
		});
	}

	// Map floating-ui placement to Bootstrap tooltip classes
	function getTooltipClass(placement: Placement): string {
		if (placement.startsWith('top')) return 'bs-tooltip-top';
		if (placement.startsWith('bottom')) return 'bs-tooltip-bottom';
		if (placement.startsWith('left')) return 'bs-tooltip-start';
		if (placement.startsWith('right')) return 'bs-tooltip-end';
		return 'bs-tooltip-bottom';
	}
</script>

<div>
	{@render reference(setReferenceElement)}
	{#if shown}
		<div
			class={[
				"tooltip",
				getTooltipClass(placement),
				`tooltip-${strategy}`,
				"show"
			]}
			role="tooltip"
			{...restProps}
			style:left="{pos?.x}px"
			style:top="{pos?.y}px"
			{@attach calculateTooltipPos}
			transition:fade={{ duration: 220 }}
		>
			<div class="tooltip-arrow"></div>
			<div class="tooltip-inner">
				{@render children?.()}
			</div>
		</div>
	{/if}
</div>

<style>
	.tooltip {
		z-index: 1070;
		max-width: 200px;
		
		&.tooltip-absolute {
			position: absolute;
		}
		
		&.tooltip-fixed {
			position: fixed;
		}
	}

	/* Ensure Bootstrap tooltip arrow styles are applied */
	:global(.tooltip .tooltip-arrow) {
		position: absolute;
		width: 0.4rem;
		height: 0.4rem;
	}

	/* Force Bootstrap arrow styles for different placements */
	:global(.tooltip.bs-tooltip-bottom .tooltip-arrow) {
		top: 0;
		left: 50%;
		transform: translateX(-50%);
	}

	:global(.tooltip.bs-tooltip-bottom .tooltip-arrow::before) {
		content: "";
		position: absolute;
		border-left: 0.4rem solid transparent;
		border-right: 0.4rem solid transparent;
		border-bottom: 0.4rem solid var(--bs-tooltip-bg, #000);
		top: 0;
		left: 50%;
		transform: translateX(-50%);
	}

	:global(.tooltip.bs-tooltip-top .tooltip-arrow) {
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
	}

	:global(.tooltip.bs-tooltip-top .tooltip-arrow::before) {
		content: "";
		position: absolute;
		border-left: 0.4rem solid transparent;
		border-right: 0.4rem solid transparent;
		border-top: 0.4rem solid var(--bs-tooltip-bg, #000);
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
	}
</style>

<!--
@component
# Tooltip
A custom tooltip component using @floating-ui/dom and Svelte 5 attachments.

## Props
- `strategy` (Strategy, default: 'absolute'): Positioning strategy
- `placement` (Placement, default: 'bottom'): Where to place the tooltip
- `children` (Snippet, optional): Content of the tooltip
- `reference` (Snippet): Snippet that provides the reference element
- `shown` (boolean, default: false): Whether the tooltip is visible

## Usage
```svelte
<script>
    import Tooltip from './lib/Tooltip.svelte';
    let shown = $state(false);
</script>

<Tooltip {shown}>
    {#snippet reference(ref)}
        <button {@attach ref} onmouseenter={() => shown = true} onmouseleave={() => shown = false}>
            Hover me
        </button>
    {/snippet}
    This is the tooltip content!
</Tooltip>
```
-->
