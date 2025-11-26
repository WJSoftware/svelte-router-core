<script lang="ts">
	import { Router, Route } from '@svelte-router/core';
	import HomeView from './views/HomeView.svelte';
	import ViewSkeleton from '../ViewSkeleton.svelte';
	import DemoView from '../../demo/DemoView.svelte';

	type Props = {
		basePath: string;
	};

	let { basePath }: Props = $props();
</script>

<div class="d-flex flex-column flex-fill overflow-auto">
	<Router id="path-routing" {basePath}>
		<HomeView />
		<ViewSkeleton>
			<Route key="demo" path="/demo/*">
				<DemoView basePath="/demo" />
			</Route>
		</ViewSkeleton>
	</Router>
</div>
