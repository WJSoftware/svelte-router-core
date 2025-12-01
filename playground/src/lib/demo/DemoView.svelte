<script lang="ts">
	import { Route, Router, RouterTrace } from '@svelte-router/core';
	import NavBar from './NavBar.svelte';
	import RouterFeaturesView from './RouterFeaturesView.svelte';
	import RouteFeaturesView from './RouteFeaturesView.svelte';
	import LinkFeaturesView from './LinkFeaturesView.svelte';
	import LocationFeaturesView from './LocationFeaturesView.svelte';
	import RouterEngineFeaturesView from './RouterEngineFeaturesView.svelte';
	import ApiFeaturesView from './ApiFeaturesView.svelte';
	import themeSvelte from '../state/theme.svelte';

	type Props = {
		hash?: boolean | string;
		basePath?: string;
	};

	let { hash, basePath }: Props = $props();
</script>

<Router {basePath} {hash} id="demo{typeof hash === 'string' ? `-${hash}` : ''}">
	<NavBar {hash} />
	<div class="container mt-3">
		<div class="row">
			<div class="col-xl-4">
				<Route
					{hash}
					key="router"
					path="/*"
					and={(params) => params?.rest === '/router' || !params?.rest}
				>
					<RouterFeaturesView />
				</Route>
				<Route {hash} key="route" path="/route">
					<RouteFeaturesView />
				</Route>
				<Route {hash} key="link" path="/link">
					<LinkFeaturesView />
				</Route>
				<Route {hash} key="location" path="/location">
					<LocationFeaturesView />
				</Route>
				<Route {hash} key="routerEngine" path="/router-engine">
					<RouterEngineFeaturesView />
				</Route>
				<Route {hash} key="api" path="/api">
					<ApiFeaturesView />
				</Route>
			</div>
			<div class="col-xl-8">
				<div class="table-responsive-lg">
					<RouterTrace
						{hash}
						class="table table-striped table-hover"
						buttonClass="btn btn-sm btn-outline-primary"
						darkTheme={themeSvelte.current === 'dark'}
					/>
				</div>
			</div>
		</div>
	</div>
</Router>
