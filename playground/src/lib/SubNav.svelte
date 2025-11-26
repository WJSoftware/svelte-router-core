<script lang="ts" module>
	export type LinkItem = {
		href: string;
		text: string;
		activeFor?: string;
		activeState?: ActiveState;
	};
</script>

<script lang="ts">
	import { Link, type ActiveState } from '@svelte-router/core';
	import { slide } from 'svelte/transition';

	type Props = {
		title: string;
		links: LinkItem[];
	};

	let { title, links }: Props = $props();
</script>

<li class="sub-nav rounded px-3" in:slide={{ axis: 'x', duration: 200 }}>
	<ul class="navbar-nav align-items-baseline">
		<li class="nav-item">
			<span class="navbar-text fw-bold">
				{title}
			</span>
		</li>
		{#each links as link}
			<li class="nav-item">
				<Link class="nav-link" href={link.href} activeFor={link.activeFor} activeState={link.activeState}>
					{link.text}
				</Link>
			</li>
		{/each}
	</ul>
</li>

<style>
	.sub-nav {
		/* background-color: rgba(0, 0, 0, 0.15); */
		background-color: rgba(255, 255, 255, 0.35);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}
    .sub-nav * {
		/* word-break: keep-all; */
        text-wrap: nowrap;
    }
	:global([data-bs-theme=dark]) .sub-nav {
		background-color: rgba(0, 0, 0, 0.09);
		box-shadow: 0 4px 8px rgba(255, 255, 255, 0.2);
	}
	
	@media (prefers-color-scheme: dark) {
		.sub-nav {
			background-color: rgba(0, 0, 0, 0.09);
			box-shadow: 0 4px 8px rgba(255, 255, 255, 0.2);
		}
	}
</style>
