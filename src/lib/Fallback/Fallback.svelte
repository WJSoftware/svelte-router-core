<script lang="ts">
	import { resolveHashValue } from '$lib/kernel/resolveHashValue.js';
	import { getRouterContext } from '$lib/Router/Router.svelte';
	import type { Hash, RouterChildrenContext, WhenPredicate } from '$lib/types.js';
	import { assertAllowedRoutingMode } from '$lib/utils.js';
	import type { Snippet } from 'svelte';

	type Props = {
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
		 * 	   <Fallback {hash} />
		 * {/key}
		 * ```
		 */
		hash?: Hash;
		/**
		 * Overrides the default activation conditions for the fallback content inside the component.
		 *
		 * This is useful in complex routing scenarios, where fallback content is being prevented from showing due to
		 * certain route or routes matching at certain points, leaving no opportunity for the router to be "out of
		 * matching routes".
		 *
		 * **This completely disconnects the `Fallback` component from the router's matching logic.**
		 *
		 * @example
		 * ```svelte
		 * <!--
		 * Here, onlyLayoutRoutesRemain is a function that checks if layout routes are the only ones currently matching.
		 * -->
		 * <Fallback when={(rs) => onlyLayoutRoutesRemain(rs)}>
		 *     ...
		 * </Fallback>
		 * ```
		 */
		when?: WhenPredicate;
		/**
		 * Renders the children of the component.
		 *
		 * This rendering is conditioned to the parent router engine's `fallback` property being `true`.  This means
		 * that the children will only be rendered when no routes match the current location.
		 * @param context The component's context available to children.
		 */
		children?: Snippet<[RouterChildrenContext]>;
	};

	let { hash, when, children }: Props = $props();

	const resolvedHash = resolveHashValue(hash);
	assertAllowedRoutingMode(resolvedHash);

	const router = getRouterContext(resolvedHash);
</script>

{#if (router && when?.(router.routeStatus, router.fallback)) || (!when && router?.fallback)}
	{@render children?.({ state: router.state, rs: router.routeStatus })}
{/if}
