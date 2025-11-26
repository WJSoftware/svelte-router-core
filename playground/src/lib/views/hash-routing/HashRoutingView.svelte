<script lang="ts">
	import { getTitleContext } from '../../state/title.svelte';
	import HashRoutingDemo from './HashRoutingDemo.svelte';

	let {
		basePath
	}: {
		basePath?: string;
	} = $props();

	getTitleContext().current = 'Hash Routing';
</script>

<div>
	<h1>🚀 Hash Routing</h1>
	<p class="lead">
		Navigate your app using URL fragments! Hash routing uses the portion after the `#` character to
		determine routes, perfect for client-side navigation that works everywhere.
	</p>
	<HashRoutingDemo />
</div>
