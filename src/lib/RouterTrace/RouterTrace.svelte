<script lang="ts">
	import { traceOptions, getAllChildRouters } from '$lib/kernel/trace.svelte.js';
	import { routePatternsKey, RouterEngine } from '$lib/kernel/RouterEngine.svelte.js';
	import { resolveHashValue } from '$lib/kernel/resolveHashValue.js';
	import { getRouterContext } from '$lib/Router/Router.svelte';
	import type { ClassValue, HTMLTableAttributes } from 'svelte/elements';
	import { assertAllowedRoutingMode } from '$lib/utils.js';
	import type { Hash } from '$lib/types.js';

	type Props = Omit<HTMLTableAttributes, 'children'> & {
		/**
		 * Sets the hash mode of the component.
		 *
		 * If `true`, the component will search for the immediate parent router configured for single hash routing.
		 *
		 * If a string, the component will search for the immediate parent router configured for multi hash routing
		 * that matches the string.
		 *
		 * If `false`, the component will search for the immediate parent router configured for path routing.
		 *
		 * If left undefined, it will resolve to one of the previous values based on the `defaultHash` routing option.
		 *
		 * **IMPORTANT**:  Because the hash value directly affects the search for the parent router, it cannot be
		 * reactively set to different values at will.  If you must do this, destroy and recreate the component
		 * whenever the hash changes:
		 *
		 * @example
		 * ```svelte
		 * {#key hash}
		 * 	   <RouterTrace {hash} />
		 * {/key}
		 * ```
		 *
		 * Unlike other components, the `RouterTrace` component does not need a hash value if a router engine object is
		 * provided in its stead via the `router` property.
		 */
		hash?: Hash;
		/**
		 * Sets the router engine to trace.
		 */
		router?: RouterEngine;
		/**
		 * Sets the position of the router engine's children menu.
		 */
		childrenMenuPosition?: 'top' | 'bottom';
		/**
		 * Enables or disables the dark theme for the component.
		 */
		darkTheme?: boolean;
		/**
		 * Shows or hides a button capable of toggling the component's theme between light and dark themes.
		*/
		themeBtn?: boolean;
		/**
		 * Overrides the default CSS class of all buttons in the component.
		 */
		buttonClass?: ClassValue;
	};

	let {
		hash,
		router = $bindable(),
		childrenMenuPosition = 'top',
		darkTheme = false,
		themeBtn = false,
		class: cssClass,
		buttonClass,
		...restProps
	}: Props = $props();

	if (!router) {
		const resolvedHash = resolveHashValue(hash);
		assertAllowedRoutingMode(resolvedHash);
		router = getRouterContext(resolvedHash);
		if (!router) {
			throw new Error(
				'There is no router to trace.  Make sure a Router component is an ancestor of this RouterTrace component instance, or provide a router using the "router" property.'
			);
		}
	}
	const routingUniverse = $derived(
		typeof router.resolvedHash === 'string'
			? `Named: ${router.resolvedHash}`
			: router.resolvedHash
				? 'Hash'
				: 'Path'
	);
	const routePatterns = $derived(router[routePatternsKey]());
	const childRouterRefs = $derived(traceOptions.routerHierarchy ? getAllChildRouters(router) : []);
	let showChildrenMenu = $state(false);
	const btnClass = $derived(buttonClass ?? 'button');

	function switchToRouter(targetRouter: RouterEngine) {
		router = targetRouter;
		showChildrenMenu = false;
	}
</script>

{#snippet routerId(r: RouterEngine | undefined, noBold = false)}
	{#if r}
		<span class={['router-id', noBold && 'no-bold']}>{r.id ?? '(no ID)'}</span>
		<span class="dimmed">{r.basePath}</span>
	{:else}
		(router unavailable)
	{/if}
{/snippet}

{#snippet childRoutersPicker()}
	<div data-children-picker>
		<button
			type="button"
			class={btnClass}
			disabled={childRouterRefs.length === 0}
			onclick={() => (showChildrenMenu = !showChildrenMenu)}
		>
			Children: <span class="router-property">{childRouterRefs.length}</span>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 200 200"
				style="width: 1em; height: 1em;"
			>
				<g>
					<path d="M50,50 l100,0 l-50,100 Z" fill="currentColor" />
				</g>
			</svg>
		</button>
		{#if showChildrenMenu}
			<ul class={[`children-menu-${childrenMenuPosition}`]} data-menu>
				{#each childRouterRefs as ref}
					{@const childRouter = ref.deref()}
					{#if childRouter}
						<li>
							<button type="button" onclick={() => switchToRouter(childRouter)}>
								{@render routerId(childRouter)}
							</button>
						</li>
					{:else}
						<li>
							<span>(router no longer available)</span>
						</li>
					{/if}
				{/each}
			</ul>
		{/if}
	</div>
{/snippet}

<table
	class={[
		cssClass ?? 'rt-stock',
		darkTheme && 'dark'
	]}
	{...restProps}
>
	<caption>
		<div>
			<div>
				Router ID: <span class="router-property">{router?.id ?? '(no ID)'}</span>
			</div>
			<div>
				Universe: <span class="router-property">{routingUniverse}</span>
			</div>
			<button
				type="button"
				class={btnClass}
				data-parent
				disabled={!router?.parent}
				onclick={() => switchToRouter(router?.parent!)}
			>
				{#if router?.parent}
					Parent: <span class="router-property">{@render routerId(router.parent, true)}</span>
				{:else}
					(No parent)
				{/if}
			</button>
			{#if traceOptions.routerHierarchy}
				{@render childRoutersPicker()}
			{/if}
			<div data-end>
				Base Path: <span class="router-property">{router?.basePath}</span>
			</div>
			<div>
				Test Path: <span class="router-property">{router?.testPath}</span>
			</div>
			<div>
				Fallback: <span class="router-property">{router?.fallback}</span>
			</div>
			{#if themeBtn}
				<div>
					<button
						class={btnClass}
						type="button"
						aria-label="Switch theme on the RouterTrace component."
						onclick={() => (darkTheme = !darkTheme)}
					>
						{#if darkTheme}
							<!-- Moon icon -->
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								style="width: 1em; height: 1em;"
								fill="currentColor"
							>
								<g>
									<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
								</g>
							</svg>
						{:else}
							<!-- Sun icon -->
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 200 200"
								style="width: 1em; height: 1em;"
							>
								<g>
									<circle cx="100" cy="100" r="35" fill="currentColor" />
									<g stroke="currentColor" stroke-width="8" stroke-linecap="round">
										<line x1="100" y1="30" x2="100" y2="45" />
										<line x1="100" y1="155" x2="100" y2="170" />
										<line x1="170" y1="100" x2="155" y2="100" />
										<line x1="45" y1="100" x2="30" y2="100" />
										<line x1="148.5" y1="51.5" x2="138.9" y2="61.1" />
										<line x1="61.1" y1="138.9" x2="51.5" y2="148.5" />
										<line x1="148.5" y1="148.5" x2="138.9" y2="138.9" />
										<line x1="61.1" y1="61.1" x2="51.5" y2="51.5" />
									</g>
								</g>
							</svg>
						{/if}
					</button>
				</div>
			{/if}
		</div>
	</caption>
	<thead>
		<tr>
			<th>Route</th>
			<th>Path</th>
			<th>RegEx</th>
			<th>Matches?</th>
			<th>Route Params</th>
		</tr>
	</thead>
	<tbody>
		{#each Object.entries(router?.routeStatus || {}) as [key, status]}
			<tr>
				<td>{key}</td>
				{#if typeof router?.routes[key].path === 'string'}
					<td>
						<pre>{router?.routes[key].path}</pre>
					</td>
				{/if}
				<td colspan={typeof router?.routes[key].path === 'string' ? 1 : 2}>
					<code>{routePatterns.get(key)?.regex}</code>
				</td>
				<td>
					<span class="match-icon" class:error={!status.match}>
						{#if status.match}
							✔
						{:else}
							✘
						{/if}
					</span>
				</td>
				<td>
					{#if status.routeParams && Object.keys(status.routeParams).length > 0}
						<dl>
							{#each Object.entries(status.routeParams) as [param, value]}
								<dt>{param}</dt>
								<dd>{value}</dd>
							{/each}
						</dl>
					{:else}
						<span>(no params)</span>
					{/if}
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<style lang="scss">
	table {
		--rt-grid-color: #ddd;
		--rt-header-bg-color: #f2f2f2;
		--rt-bg-color: #fafafa;
		--rt-alternate-bg-color: #f5f5f5;
		--rt-hover-bg-color: #e2e2e2;

		&.dark {
			--rt-grid-color: #353535;
			--rt-header-bg-color: #202020;
			--rt-bg-color: #303030;
			--rt-alternate-bg-color: #404040;
			--rt-hover-bg-color: #505050;
		}
	}

	.rt-stock {
		width: 100%;
		border-collapse: collapse;
		background-color: var(--rt-bg-color);

		& th,
		& td {
			border: 1px solid var(--rt-grid-color);
			padding: 8px;
		}

		& th {
			background-color: var(--rt-header-bg-color);
			text-align: left;
		}

		& tr:nth-child(even) {
			background-color: var(--rt-alternate-bg-color);
		}

		& tr:hover {
			background-color: var(--rt-hover-bg-color);
		}

		& td:has(> span.match-icon) {
			text-align: center;
		}
	}

	caption {
		--rtc-button-bg-color: firebrick;
		--rtc-button-hover-bg-color: rgb(201, 38, 38);
		--rtc-button-disabled-bg-color: #ffb8b8;
		--rtc-button-text-color: #fafafa;
		--rtc-prop-bg-color: 0, 0, 0;
		--rtc-prop-bg-opacity: 0.15;
		--rtc-prop-border-color: 0, 0, 0;
		--rtc-prop-border-opacity: 0.5;

		.dark & {
			--rtc-prop-bg-color: 255, 255, 255;
			--rtc-prop-border-color: 255, 255, 255;
			--rtc-button-bg-color: darkred;
			--rtc-button-hover-bg-color: rgb(113, 2, 2);
			--rtc-button-disabled-bg-color: rgb(66, 37, 37);
		}

		padding: 0.5em;
		background-color: var(--rt-header-bg-color);

		& > div {
			display: flex;
			flex-direction: row;
			gap: 1em;
			justify-content: start;
			align-items: baseline;

			& > div[data-end] {
				margin-left: auto;
			}
		}

		& [data-children-picker] {
			position: relative;

			& > [data-menu] {
				position: absolute;
				left: 0;
				width: max-content;
				z-index: 1;
				display: flex;
				flex-direction: column;
				gap: 0.5em;
				background-color: var(--rt-header-bg-color);
				border: 1px solid rgba(var(--rtc-prop-border-color), var(--rtc-prop-border-opacity));
				border-radius: 4px;
				padding: 0.5em 0;
				box-shadow: 0.5em 0.5em 0.35em rgba(var(--rtc-prop-border-color), 0.1);
				margin-bottom: 0.5em;

				& li {
					list-style: none;
					& button {
						border: none;
						background-color: transparent;
						padding: 0.2em 0.7em;
					}
				}

				& li:hover,
				& li button:hover,
				& li button:focus {
					background-color: var(--rt-hover-bg-color);
				}
			}
		}
	}

	.button {
		border: none;
		border-radius: 4px;
		padding: 0.25em 0.65em;
		background-color: var(--rtc-button-bg-color);
		color: var(--rtc-button-text-color);

		&:hover:not(:disabled),
		&:focus {
			background-color: var(--rtc-button-hover-bg-color);
		}

		&:disabled {
			background-color: var(--rtc-button-disabled-bg-color);
			cursor: not-allowed;
		}
	}

	.children-menu-top {
		bottom: 100%;
	}

	.children-menu-bottom {
		top: 100%;
	}

	.router-property {
		font-weight: bolder;
		border-radius: 0.2em;
		background-color: rgba(var(--rtc-prop-bg-color), var(--rtc-prop-bg-opacity));
		padding: 0.1em 0.7em;
		border: rgba(var(--rtc-prop-border-color), var(--rtc-prop-border-opacity)) 1px dashed;
	}

	.error {
		color: #dc3545;
	}

	.router-id {
		font-weight: bolder;
		&.no-bold {
			font-weight: inherit;
		}
	}

	.dimmed {
		opacity: 0.45;
	}
</style>
