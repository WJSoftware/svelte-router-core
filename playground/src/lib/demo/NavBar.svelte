<script lang="ts">
	import { Link, LinkContext } from '@svelte-router/core';

	type Props = {
		hash?: boolean | string;
	};

	let { hash }: Props = $props();
</script>

<nav class="navbar navbar-expand-md bg-warning-subtle">
	<div class="container-fluid">
		<h3 class="navbar-brand"><strong>DEMO:</strong>&nbsp;Library Features</h3>
		<button
			class="navbar-toggler"
			type="button"
			data-bs-toggle="collapse"
			data-bs-target="#demonavbar"
			aria-controls="demonavbar"
			aria-expanded="false"
			aria-label="Toggle navigation"
		>
			<span class="navbar-toggler-icon"></span>
		</button>
		<div class="navbar-collapse collapse">
			<LinkContext activeState={{ class: 'active', aria: { 'aria-current': 'step' } }}>
				<ul class="navbar-nav" id="demonavbar">
					<li class="nav-item">
						<Link
							{hash}
							activeFor="router"
							class="nav-link"
							href="/router"
							prependBasePath>Router</Link
						>
					</li>
					<li class="nav-item">
						<Link
							{hash}
							activeFor="route"
							class="nav-link"
							href="/route"
							prependBasePath>Route</Link
						>
					</li>
					<li class="nav-item">
						<Link
							{hash}
							activeFor="link"
							class="nav-link"
							href="/link"
							prependBasePath>Link</Link
						>
					</li>
					<li class="nav-item">
						<Link
							{hash}
							activeFor="location"
							class="nav-link"
							href="/location"
							prependBasePath>location</Link
						>
					</li>
					<li class="nav-item">
						<Link
							{hash}
							activeFor="routerEngine"
							class="nav-link"
							href="/router-engine"
							prependBasePath>Router Engine</Link
						>
					</li>
					<li class="nav-item">
						<Link
							{hash}
							activeFor="api"
							class="nav-link"
							href="/api"
							prependBasePath>API</Link
						>
					</li>
				</ul>
			</LinkContext>
		</div>
	</div>
</nav>
