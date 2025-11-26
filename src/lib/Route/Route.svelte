<script lang="ts" generics="T extends string | RegExp">
	import { untrack, type Snippet } from 'svelte';
	import { getRouterContext } from '../Router/Router.svelte';
	import { resolveHashValue } from '$lib/kernel/resolveHashValue.js';
	import type { AndUntyped, Hash, RouteChildrenContext, RouteParamsRecord } from '$lib/types.js';
	import { assertAllowedRoutingMode } from '$lib/utils.js';

	type Props = {
		/**
		 * Sets the route's unique key.
		 *
		 * Note that uniqueness is not really enforced, but it is assumed.  Make sure you don't duplicate keys in your
		 * routes, or that you only do it to create disconnected UI pieces that come up under the same routing
		 * conditions.
		 */
		key: string;
		/**
		 * Sets the route's path pattern, or a regular expression used to test and match the browser's URL.
		 *
		 * ## Patterns
		 *
		 * Patterns are strings that can contain parameters.  Parameters are defined by a colon followed by the
		 * parameter's name.  For example, the pattern `'/user/:id'` will match `'/user/123'`, `'/user/abc'`, etc.  The
		 * parameter's value will be stored in the `params` property of the `Route` component.
		 *
		 * The parameters are also made available to the children of the route component via the snippet's first argument.
		 *
		 * ### Rest Parameter
		 *
		 * You can use a rest parameter to capture the rest of the URL.  For example, the pattern `'/user/:id/*'` will
		 * match `'/user/123/abc/def'`, and the `rest` parameter will be `'/abc/def'`.
		 *
		 * Because pattern matching is always **exact**, a rest parameter can be used to attain "starts with" matching.
		 *
		 * ## Regular Expressions
		 *
		 * If a regular expression is used, it must comply with the following rules:
		 *
		 * 1. The regular expression must produce a single match (when it matches).
		 * 2. The regular expression must use named capture groups for parameter detection.  The names of the capture
		 * groups will be used as the parameter names.
		 *
		 * **IMPORTANT**:  A route without `path` or `amd` is not registered in the router.
		 */
		path?: T;
		/**
		 * Sets a function for additional matching conditions.
		 * @param params The route's parameters, if any.
		 * @returns `true` if the route should match, or `false` otherwise.
		 *
		 * This function is only called if the route's pattern or regular expression matches the URL.
		 *
		 * **IMPORTANT**:  A route without `path` or `amd` is not registered in the router.
		 */
		and?: (params: RouteParamsRecord<T> | undefined) => boolean;
		/**
		 * Sets whether the route's match status should be ignored for fallback purposes.
		 *
		 * If `true`, the route will not be considered when determining fallback content visibility.
		 */
		ignoreForFallback?: boolean;
		/**
		 * Sets whether the route's path pattern should be matched case-sensitively.
		 *
		 * This has no effect if `path` is a regular expression.
		 */
		caseSensitive?: boolean;
		/**
		 * Sets the hash mode of the route.
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
		 * 	   <Route {hash} />
		 * {/key}
		 * ```
		 */
		hash?: Hash;
		/**
		 * Bindable.  Provides a way to obtain a route's parameters through property binding.  The binding is
		 * write-only, so incoming changes have no effect.
		 */
		params?: RouteParamsRecord<T>;
		/**
		 * Renders the children of the route.
		 * @param context The component's context available to children.
		 */
		children?: Snippet<[RouteChildrenContext<T>]>;
	};

	let {
		key,
		path,
		and,
		ignoreForFallback = false,
		caseSensitive = false,
		hash,
		params = $bindable(),
		children
	}: Props = $props();

	const resolvedHash = resolveHashValue(hash);
	assertAllowedRoutingMode(resolvedHash);

	const router = getRouterContext(resolvedHash);
	if (!router) {
		throw new Error(
			'Route components must be used inside a Router component that matches the hash setting.'
		);
	}

	// Effect that updates the route object in the parent router.
	$effect.pre(() => {
		if (!path && !and) {
			return;
		}
		// svelte-ignore ownership_invalid_mutation
		untrack(() => router.routes)[key] =
			path instanceof RegExp
				? { regex: path, and: and as AndUntyped, ignoreForFallback }
				: {
						pattern: path,
						and: and as AndUntyped,
						ignoreForFallback,
						caseSensitive
					};
		return () => {
			// svelte-ignore ownership_invalid_mutation
			delete untrack(() => router.routes)[key];
		};
	});
	// Effect that synchronizes the params property with the calculated params.
	$effect.pre(() => {
		params = router.routeStatus[key]?.routeParams as RouteParamsRecord<T> | undefined;
	});
</script>

{#if router.routeStatus[key]?.match ?? (!and && !path)}
	<!--
		Changed use of params for router.routeStatus[key]?.routeParams to work around issues around
		$effect.pre() introduced with async Svelte.

		See:  https://github.com/sveltejs/svelte/pull/16930#issuecomment-3427913259
	-->
	{@render children?.({
		rp: router.routeStatus[key]?.routeParams as RouteParamsRecord<T>,
		state: router.state,
		rs: router.routeStatus
	})}
{/if}
