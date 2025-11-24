<script lang="ts">
	import { activeBehavior, type RouteStatus } from '@svelte-router/core';
	import Breadcrumb from './Breadcrumb.svelte';
	import BreadcrumbItem from './BreadcrumbItem.svelte';

	type Props = {
		rs: Record<string, RouteStatus>;
	};

	let { rs }: Props = $props();
</script>

<Breadcrumb divider="|" class="ps-3">
	<BreadcrumbItem {@attach activeBehavior(rs, { key: 'home', class: ['active', 'bc-active'] })}
		>Home</BreadcrumbItem
	>
	<BreadcrumbItem
		{@attach activeBehavior(rs, { key: 'pathRouting', class: ['active', 'bc-active'] })}
		>Path Routing</BreadcrumbItem
	>
	<BreadcrumbItem
		{@attach activeBehavior(rs, { key: 'hashRouting', class: ['active', 'bc-active'] })}
		>Hash Routing</BreadcrumbItem
	>
</Breadcrumb>

<style>
	:global .bc-active {
		/* font-weight: bold; */
		text-decoration: underline;
	}
</style>
