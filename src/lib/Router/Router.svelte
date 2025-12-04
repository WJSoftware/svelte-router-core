<script lang="ts" module>
	import { RouterEngine } from '$lib/kernel/RouterEngine.svelte.js';
	import { resolveHashValue } from '$lib/kernel/resolveHashValue.js';
	import type { Hash, RouterChildrenContext } from '$lib/types.js';

	const parentCtxKey = Symbol();
	const hashParentCtxKey = Symbol();

	function multiHashSymbol(hash: string) {
		return Symbol.for(`hsh-${hash}`);
	}

	/**
	 * Gets the closest router context.
	 * @param hash Hash value that identifies the desired router context.
	 * @returns The closest router context found for the specified hash, or `undefined` if there is none.
	 */
	export function getRouterContext(hash: Hash) {
		return getContext<RouterEngine | undefined>(getRouterContextKey(hash));
	}

	/**
	 * Only exported for unit testing.
	 */
	export function getRouterContextKey(hash: Hash) {
		return typeof hash === 'string' ? multiHashSymbol(hash) : hash ? hashParentCtxKey : parentCtxKey;
	}

	/**
	 * Sets the router context at the component hierarchy level the function is called.
	 * @param router The router engine instance to set as the context.
	 * @param hash Hash value that identifies the router context.
	 */
	export function setRouterContext(router: RouterEngine, hash?: boolean | string) {
		setContext(
			typeof hash === 'string' ? multiHashSymbol(hash) : hash ? hashParentCtxKey : parentCtxKey,
			router
		);
	}
</script>

<script lang="ts">
	import { getContext, onDestroy, setContext, type Snippet } from 'svelte';

	type Props = {
		/**
		 * Bindable.  Gets or sets the router engine instance to be used by this router.
		 * 
		 * ## Warnings
		 * 
		 * ### Reactivity
		 * 
		 * This property is meant as an easy way to get a hold of the underlying router engine instance through 
		 * binding, or to give a `Router` component a prepared router engine.
		 * 
		 * Because the router is set as context for child routers to pick it up, it cannot be reactively set to 
		 * different instances at will.  If you must do this, destroy and recreate the `Router` component whenever the 
		 * router changes:
		 * 
		 * @example
		 * ```svelte
		 * {#key router}
		 *     <Router {router} />
		 * {/key}
		 * ```
		 * 
		 * ### Disposal
		 * 
		 * The router engine instance is disposed when the `Router` component is destroyed, had it been externally 
		 * given through this property or created by the component.
		 */
		router?: RouterEngine;
		/**
		 * Sets the router's base path, which is a segment of the URL that is implicitly added to all routes.
		 */
		basePath?: string;
		/**
		 * Gives the router an identifier that shows up in `RouterTrace` components.
		 */
		id?: string;
		/**
		 * Sets the hash mode of the router.
		 * 
		 * If `true`, the component will be a router for single hash routing.
		 * 
		 * If a string, the component will be a router for multi hash routing for the specified string identifier.
		 * 
		 * If `false`, the component will be a router for path routing.
		 * 
         * If left undefined, it will resolve to one of the previous values based on the `defaultHash` routing option.
		 * 
		 * **IMPORTANT**:  Because the router is set as context for child routers to pick it up, and the context 
		 * depends on the value of the `hash` prop, it cannot be reactively set to different values at will.  If you
		 * must do this, destroy and recreate the `Router` component whenever the hash changes:
		 * 
		 * @example
		 * ```svelte
		 * {#key hash}
		 * 	   <Router {hash} />
		 * {/key}
		 */
		hash?: Hash;
		/**
		 * Renders the children of the router.
		 *
		 * Children content can be anything, but note that that the "useful" children are the `Route` components.  Any
		 * other content will be rendered regardless of the current route.
		 * @param context The component's context available to children.
		 */
		children?: Snippet<[RouterChildrenContext]>;
	};

	let { router = $bindable(), basePath, id, hash, children }: Props = $props();

	let resolvedHash = resolveHashValue(hash);
	const parentRouter = getRouterContext(resolvedHash);
	if (!router) {
		router = new RouterEngine({
			hash: resolvedHash,
			parent: parentRouter
		});
	}
	setRouterContext(router, resolvedHash)
	
	// Effect to transfer the router's ID to the router engine.
	$effect.pre(() => {
		router.id = id;
	});
	// Effect that synchronizes the base path in the route object.
	$effect.pre(() => {
		// Type coerced because RouterEngine.basePath ensures that basePath is never undefined.
		router.basePath = basePath!;
	});

	onDestroy(() => {
		// See #150.  Let's hope this new runtime behavior doesn't cause issues elsewhere.
		router?.dispose();
	});
</script>

{@render children?.({state: router.state, rs: router.routeStatus})}
