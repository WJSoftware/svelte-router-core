<script lang="ts">
	import { Link, LinkContext, Route } from '@svelte-router/core';
	import logo from '@svelte-router/core/logo64';
	import SubNav, { type LinkItem } from './SubNav.svelte';
	import { routingMode } from './hash-routing';
	import type { HTMLAttributes } from 'svelte/elements';
	import ThemeSwitch from './ThemeSwitch.svelte';

	let { ...restProps }: HTMLAttributes<HTMLElement> = $props();

	const pathRoutingLinks = [
		{ text: 'Home', href: '/path-routing' },
		{ text: 'Start Demo', href: '/path-routing/demo' }
	];
	const hashRoutingLinks: LinkItem[] = [
		{ text: 'Home', href: '/hash-routing' },
		{
			text: 'Start Demo',
			href: `#${routingMode === 'multi' ? 'd1=/demo;d2=/demo' : '/demo'}`
		},
		{
			text: 'In Code',
			href: '/hash-routing/in-code',
			activeFor: 'hr-in-code',
			activeState: { class: 'active', aria: { current: 'page' } }
		},
	];
	const redirectedHash = routingMode === 'multi' ? 'redir' : true;
</script>

<nav class="navbar navbar-expand-lg bg-primary-subtle" {...restProps}>
	<div class="container-fluid">
		<Link class="navbar-brand fw-bold" href="/" id="logoLink">
			<img src={logo} alt="N-Savant Compass Logo" style:height="1.7em" />
			webJose's Svelte Router
		</Link>
		<button
			class="navbar-toggler"
			type="button"
			data-bs-toggle="collapse"
			data-bs-target="#navbarNav"
			aria-controls="navbarNav"
			aria-expanded="false"
			aria-label="Toggle navigation"
		>
			<span class="navbar-toggler-icon"></span>
		</button>
		<div class="collapse navbar-collapse" id="navbarNav">
			<LinkContext activeState={{ class: 'active', aria: { current: 'page' } }}>
				<ul class="navbar-nav">
					<li class="nav-item">
						<Link class="nav-link" activeFor="home" href="/" id="homeLink">Home</Link>
					</li>
					<Route key="homeMenuPr">
						{#snippet children({ rs })}
							{#if !rs.pathRouting?.match}
								<li class="nav-item">
									<Link class="nav-link" activeFor="pathRouting" href="/path-routing">
										Path Routing
									</Link>
								</li>
							{/if}
						{/snippet}
					</Route>
					<Route key="pathRouting">
						<SubNav title="Path Routing" links={pathRoutingLinks} />
					</Route>
					<Route key="homeMenuHr">
						{#snippet children({ rs })}
							{#if !rs.hashRouting?.match}
								<li class="nav-item">
									<Link class="nav-link" activeFor="hashRouting" href="/hash-routing">
										Hash Routing
									</Link>
								</li>
							{/if}
						{/snippet}
					</Route>
					<Route key="hashRouting">
						<SubNav title="Hash Routing" links={hashRoutingLinks} />
					</Route>
					<li class="nav-item">
						<Link class="nav-link" activeFor="pricing" href="/pricing">404</Link>
					</li>
					<li class="nav-item">
						<Link class="nav-link" href="/deprecated-path">Deprecated Link</Link>
					</li>
					<li class="nav-item">
						<Link
							class="nav-link"
							activeFor="redirected"
							href="/feat{routingMode === 'multi' ? '#redir=/new-path' : '#/new-path'}"
						>
							New Link
						</Link>
					</li>
					<li class="nav-item">
						<Link class="nav-link disabled" href="/disabled" tabindex={-1} aria-disabled="true">
							Disabled
						</Link>
					</li>
				</ul>
			</LinkContext>
			<div class="ms-auto">
				<ThemeSwitch />
			</div>
		</div>
	</div>
</nav>
