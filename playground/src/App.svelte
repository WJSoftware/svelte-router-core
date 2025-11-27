<script lang="ts">
	import './app.scss';
	import NavBar from './lib/NavBar.svelte';
	import Tooltip from './lib/Tooltip.svelte';
	import {
		Router,
		Route,
		Fallback,
		RouterTrace,
		Redirector,
		location,
		buildHref
	} from '@svelte-router/core';
	import { calculateHref, calculateState } from '@svelte-router/core/kernel';
	import NotFound from './lib/NotFound.svelte';
	import HomeView from './lib/views/home/HomeView.svelte';
	import PathRoutingView from './lib/views/path-routing/PathRoutingView.svelte';
	import HashRoutingView from './lib/views/hash-routing/HashRoutingView.svelte';
	import DemoBc from './lib/DemoBc.svelte';
	import { initTitleContext } from './lib/state/title.svelte';
	import HrInCodeView from './lib/views/hash-routing/InCodeView.svelte';
	import RedirectedView from './lib/views/redirected/RedirectedView.svelte';
	import { routingMode } from './lib/hash-routing';

	initTitleContext();
	let showNavTooltip = $state(false);
	const redirectedHash = routingMode === 'multi' ? 'redir' : true;
	const redirector = new Redirector();
	redirector.redirections.push({
		path: '/deprecated-path',
		href: () => {
			const pathnamePiece = calculateHref({ hash: false }, '/feat');
			const hashPiece = calculateHref({ hash: redirectedHash }, '/new-path');
			return buildHref(pathnamePiece, hashPiece);
		},
		options: {
			state: calculateState(redirectedHash, { redirected: true })
		},
		goTo: true
	});

	// Show tooltip after a short delay when app loads
	$effect(() => {
		const timer = setTimeout(() => {
			showNavTooltip = true;
		}, 2000);

		// Hide tooltip after 10 seconds or when user interacts
		const hideTimer = setTimeout(() => {
			showNavTooltip = false;
		}, 12000);

		return () => {
			clearTimeout(timer);
			clearTimeout(hideTimer);
		};
	});
</script>

<div class="app">
	<div class="d-flex flex-column h-100">
		<Router id="root">
			{#snippet children({ rs })}
				<header>
					<Tooltip shown={showNavTooltip} placement="bottom">
						{#snippet reference(ref)}
							<NavBar {@attach ref} />
						{/snippet}
						Use these navigation links to test-drive the routing capabilities of @svelte-router/core.
					</Tooltip>
					<DemoBc {rs} />
				</header>
				<main class="d-flex flex-column flex-fill overflow-auto mt-3">
					<div class="container-fluid flex-fill d-flex flex-column">
						<div class="grid flex-fill">
							<Route key="home" path="/">
								<HomeView />
							</Route>
							<Route key="pathRouting" path="/path-routing/*">
								<PathRoutingView basePath="/path-routing" />
							</Route>
							<Route key="hashRouting" path="/hash-routing">
								<HashRoutingView basePath="/hash-routing" />
							</Route>
							<Route key="hr-in-code" path="/hash-routing/in-code">
								<HrInCodeView />
							</Route>
							<Router hash={redirectedHash} id="redirector-router">
								<Route hash={redirectedHash} key="redirected" path="/new-path">
									<RedirectedView />
								</Route>
							</Router>
							<Fallback when={(_, nm) => nm && !location.path.startsWith('/feat')}>
								<NotFound />
							</Fallback>
						</div>
					</div>
				</main>
				{#if !rs.home.match}
					<div class="table-responsive-lg">
						<RouterTrace class="table table-striped table-hover" />
					</div>
				{/if}
			{/snippet}
		</Router>
	</div>
</div>

<style>
	.app {
		height: 100vh;
	}

	.grid {
		display: grid;
		& > :global(*) {
			grid-area: 1/1/2/2;
		}
	}

	:global {
		.trace-bottom {
			--bg-color: rgba(255, 255, 255, 0.7);
			position: fixed;
			bottom: 0;
			width: 100%;
			background-color: var(--bg-color);
			z-index: 1000;

			& caption {
				background-color: var(--bg-color);
			}
		}
	}
</style>
