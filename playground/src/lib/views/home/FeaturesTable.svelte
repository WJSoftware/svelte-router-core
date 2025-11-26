<script lang="ts">
	import Card from '../../Card.svelte';
	import CardHeader from '../../CardHeader.svelte';
	import CardBody from '../../CardBody.svelte';

	interface Feature {
		name: string;
		liteMode: boolean;
		fullMode: boolean;
	}

	const features: Feature[] = [
		{
			name: "Always-on path and hash routing",
			liteMode: true,
			fullMode: true
		},
		{
			name: "Multi hash routing",
			liteMode: true,
			fullMode: true
		},
		{
			name: "Multiple route matching",
			liteMode: true,
			fullMode: true
		},
		{
			name: "Router base paths",
			liteMode: true,
			fullMode: true
		},
		{
			name: "Nesting routers",
			liteMode: true,
			fullMode: true
		},
		{
			name: "Exact path matching",
			liteMode: true,
			fullMode: true
		},
		{
			name: "Path specification via regular expression",
			liteMode: true,
			fullMode: true
		},
		{
			name: "Route parameters",
			liteMode: true,
			fullMode: true
		},
		{
			name: "Rest parameter",
			liteMode: true,
			fullMode: true
		},
		{
			name: "Optional parameters",
			liteMode: true,
			fullMode: true
		},
		{
			name: "Additional matching logic",
			liteMode: true,
			fullMode: true
		},
		{
			name: "Disconnected UI pieces for routes and fallback",
			liteMode: true,
			fullMode: true
		},
		{
			name: "Automatic active state in Link components",
			liteMode: true,
			fullMode: true
		},
		{
			name: "Router tracing",
			liteMode: true,
			fullMode: true
		},
		{
			name: "Reactive URL",
			liteMode: true,
			fullMode: true
		},
		{
			name: "Reactive state",
			liteMode: true,
			fullMode: true
		},
		{
			name: "Reactive hash paths",
			liteMode: true,
			fullMode: true
		},
		{
			name: "Programmatic navigation",
			liteMode: true,
			fullMode: true
		},
		{
			name: "Dynamic Routes",
			liteMode: true,
			fullMode: true
		},
		{
			name: "Electron Support",
			liteMode: true,
			fullMode: true
		},
		{
			name: "Extension packages",
			liteMode: true,
			fullMode: true
		},
		{
			name: "Cancellable beforeNavigate event",
			liteMode: false,
			fullMode: true
		},
		{
			name: "navigationCancelled event",
			liteMode: false,
			fullMode: true
		},
		{
			name: "History API interception",
			liteMode: false,
			fullMode: true
		}
	];
</script>

<Card class="h-100">
	<CardHeader tag="h3">Features</CardHeader>
	<CardBody>
		<div class="table-responsive">
			<table class="table table-striped">
				<thead>
					<tr>
						<th>Feature</th>
						<th>Lite Mode</th>
						<th>Full Mode</th>
					</tr>
				</thead>
				<tbody>
					{#each features as feature}
						<tr>
							<td>{feature.name}</td>
							<td class={["feature-status", { 'table-success': feature.liteMode, 'table-danger': !feature.liteMode }]}>
								{feature.liteMode ? '✔' : '✘'}
							</td>
							<td class={["feature-status", { 'table-success': feature.fullMode, 'table-danger': !feature.fullMode }]}>
								{feature.fullMode ? '✔' : '✘'}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</CardBody>
</Card>

<style>
	.feature-status {
		text-align: center;
		font-weight: bold;
	}
</style>
