<script lang="ts">
	import Badge from "../../Badge.svelte";
	import Card from "../../Card.svelte";
	import CardBody from "../../CardBody.svelte";
	import CardHeader from "../../CardHeader.svelte";
	import { routingMode, toggleRoutingMode } from "../../hash-routing";
    import { Route, Router, location } from "@svelte-router/core";
	import ViewSkeleton from "../ViewSkeleton.svelte";
	import DemoView from "../../demo/DemoView.svelte";
	import CodeSnippet from "../../CodeSnippet.svelte";
	import xml from "svelte-highlight/languages/xml";
	import liveHashCode from './code-samples/live-hash-display.svelte?raw';
	import ShowCodeButton from "./ShowCodeButton.svelte";

	// Parsed routes for display
	const parsedRoutes = $derived.by(() => {
		if (routingMode === 'multi') {
			// Return all hash paths in multi mode
			return location.hashPaths;
		} else {
			// Return single hash as main route
			return { main: location.hashPaths.single || '' };
		}
	});
</script>

{#snippet demo(hash: boolean | string)}
	<Router {hash} id="hash-demo{typeof hash === 'string' ? `-${hash}` : ''}">
		<ViewSkeleton {hash}>
			<Route {hash} key="demo" path="/demo/*">
				<DemoView basePath="/demo" {hash} />
			</Route>
		</ViewSkeleton>
	</Router>
{/snippet}

<!-- Live Demo -->
<div class="mt-5">
	<h2 class="text-center mb-4">🎪 Live Demo</h2>
	{#if routingMode === 'multi'}
		<div class="row g-4">
			<div class="col-xl-6">
				<Card>
					<CardHeader>
						<h5 class="mb-0">🎯 Demo Router "d1"</h5>
						<small class="text-muted">Hash key: d1</small>
					</CardHeader>
					<CardBody>
						{@render demo('d1')}
					</CardBody>
				</Card>
			</div>
			<div class="col-xl-6">
				<Card>
					<CardHeader>
						<h5 class="mb-0">🎪 Demo Router "d2"</h5>
						<small class="text-muted">Hash key: d2</small>
					</CardHeader>
					<CardBody>
						{@render demo('d2')}
					</CardBody>
				</Card>
			</div>
		</div>
		<div class="alert alert-info mt-4">
			<h6>🔍 Live URL Hash</h6>
			<p class="mb-2">
				Watch how the URL hash updates in real-time as you navigate through both demos:
			</p>
			<div class="bg-dark text-light p-2 rounded font-monospace">
				Current hash: <span class="text-warning">{location.url.hash || '#(empty)'}</span>
			</div>
			{#if Object.keys(parsedRoutes).length > 0}
				<div class="mt-2">
					<small><strong>Parsed routes:</strong></small>
					<ul class="mb-0 mt-1">
						{#each Object.entries(parsedRoutes) as [key, value]}
							<li><code>{key}</code>: <span class="text-success">{value || '(empty)'}</span></li>
						{/each}
					</ul>
				</div>
			{/if}
			<div class="mt-3">
				<ShowCodeButton />
			</div>
		</div>
	{:else}
		<Card>
			<CardHeader>
				<h5 class="mb-0">🎯 Single Hash Demo</h5>
				<small class="text-muted">The entire hash represents one route</small>
			</CardHeader>
			<CardBody>
				{@render demo(true)}
			</CardBody>
		</Card>
		<div class="alert alert-info mt-4">
			<h6>🔍 Live URL Hash</h6>
			<p class="mb-2">In single mode, the entire hash represents one route:</p>
			<div class="bg-dark text-light p-2 rounded font-monospace">
				Current hash: <span class="text-warning">{location.url.hash || '#(empty)'}</span>
			</div>
			{#if parsedRoutes.main}
				<div class="mt-2">
					<small
						><strong>Current route:</strong>
						<span class="text-success">{parsedRoutes.main}</span></small
					>
				</div>
			{/if}
			<div class="mt-3">
				<ShowCodeButton />
			</div>
		</div>
	{/if}
</div>

<!-- Interactive Demo Section -->
<div class="row mt-5">
	<div class="col-lg-8 offset-lg-2">
		<Card border="dark">
			<CardHeader background="dark" textColor="white" class="text-center" tag="h3">
				🎮 Interactive Demo
			</CardHeader>
			<CardBody class="text-center">
				<div class="mb-4">
					<Badge
						background={routingMode === 'single' ? 'primary' : 'success'}
						class="fs-6 px-3 py-2"
					>
						Current Mode: <code class="text-white">{routingMode}</code>
					</Badge>
				</div>
				<p class="lead">Experience the difference between single and multi-hash routing modes!</p>
				<p>
					Currently in <strong>{routingMode}</strong> mode.
					{#if routingMode === 'single'}
						The entire hash value represents one route.
					{:else}
						The hash contains multiple key/value pairs for independent routers.
					{/if}
				</p>
				<button
					type="button"
					class="btn btn-lg btn-{routingMode === 'single' ? 'success' : 'primary'}"
					onclick={() => toggleRoutingMode()}
				>
					🔄 Switch to {routingMode === 'single' ? 'Multi' : 'Single'} Mode
				</button>
				<div class="mt-3">
					<small class="text-muted"> ⚠️ Note: The page will reload to apply the new mode. </small>
				</div>
			</CardBody>
		</Card>
	</div>
</div>

<!-- Code Modal -->
{#if location.getState(false)?.showCodeDialog}
	<div class="modal fade show" style="display: block;" tabindex="-1">
		<div class="modal-dialog modal-lg">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">💻 Live Hash Display Code</h5>
					<button 
						type="button" 
						class="btn-close" 
						onclick={() => location.back()}
						aria-label="Close this dialog box"
					></button>
				</div>
				<div class="modal-body">
					<p class="mb-3">
						Here's a simplified example showing how to create a live hash display using 
						<code>@svelte-router/core</code>'s reactive location object:
					</p>
					<CodeSnippet 
						language={xml} 
						code={liveHashCode} 
						title="Live Hash Display Component"
						copyable={true}
					/>
					<div class="alert alert-info mt-3">
						<strong>💡 Key points:</strong>
						<ul class="mb-0 mt-2">
							<li><code>location.url.hash</code> <Badge background="success">reactive</Badge> updates automatically</li>
							<li><code>location.hashPaths</code> <Badge background="success">reactive</Badge> provides parsed hash routes</li>
							<li><code>$derived()</code> creates reactive computed values</li>
							<li><strong>✨ No manual event listeners needed!</strong></li>
						</ul>
					</div>
				</div>
				<div class="modal-footer">
					<button 
						type="button" 
						class="btn btn-primary" 
						onclick={() => location.back()}
					>
						Got it! 👍
					</button>
				</div>
			</div>
		</div>
	</div>
	<div class="modal-backdrop fade show"></div>
{/if}
