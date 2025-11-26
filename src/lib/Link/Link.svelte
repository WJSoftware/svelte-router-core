<script lang="ts">
	import { calculateHref } from '$lib/kernel/calculateHref.js';
	import { calculateState } from '$lib/kernel/calculateState.js';
	import { location } from '$lib/kernel/Location.js';
	import { resolveHashValue } from '$lib/kernel/resolveHashValue.js';
	import { getLinkContext, type ILinkContext } from '$lib/LinkContext/LinkContext.svelte';
	import { isRouteActive } from '$lib/public-utils.js';
	import { getRouterContext } from '$lib/Router/Router.svelte';
	import type { Hash, LinkChildrenContext } from '$lib/types.js';
	import { assertAllowedRoutingMode, expandAriaAttributes, joinStyles } from '$lib/utils.js';
	import { type Snippet } from 'svelte';
	import type { AriaAttributes, HTMLAnchorAttributes } from 'svelte/elements';

	type Props = HTMLAnchorAttributes &
		ILinkContext & {
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
			 * 	   <Link {hash} />
			 * {/key}
			 * ```
			 *
			 * Unlike other components, the `Link` component does not need a parent router to function.  It can be used
			 * anywhere in the application.  The following features, however, will not work:
			 *
			 * - The `activeState` property:  It depends on the parent router to set its active state reactively when a
			 * route becomes active.
			 * - The `prependBasePath` property:  It depends on the parent router to set the base path for the link.
			 */
			hash?: Hash;
			/**
			 * Sets the URL to navigate to.  Never use a full URL; always use relative or absolute paths.
			 */
			href: string;
			/**
			 * Sets the state object to pass to the browser's History API when pushing or replacing the URL.
			 *
			 * If a function is provided, it will be called and its return value will be used as the state object.
			 */
			state?: any;
			/**
			 * Sets the route key that the link will use to determine if it should render as active.
			 */
			activeFor?: string;
			/**
			 * Renders the children of the component.
			 * @param context The component's context available to children.
			 */
			children?: Snippet<[LinkChildrenContext]>;
		};

	let {
		hash,
		href,
		replace,
		state,
		activeFor,
		activeState,
		class: cssClass,
		style,
		prependBasePath,
		preserveQuery,
		children,
		onclick: incomingOnclick,
		...restProps
	}: Props = $props();

	const resolvedHash = resolveHashValue(hash);
	assertAllowedRoutingMode(resolvedHash);
	const router = getRouterContext(resolvedHash);
	const linkContext = getLinkContext();
	const calcReplace = $derived(replace ?? linkContext?.replace ?? false);
	const calcPreserveQuery = $derived(preserveQuery ?? linkContext?.preserveQuery ?? false);
	const calcPrependBasePath = $derived(prependBasePath ?? linkContext?.prependBasePath ?? false);
	const calcActiveState = $derived.by(() => {
		if (!activeState) {
			return linkContext?.activeState;
		}
		const result = { ...activeState };
		result.class ??= linkContext?.activeState?.class;
		result.style ??= linkContext?.activeState?.style;
		return result;
	});
	const calcActiveStateAria = $derived.by(() => {
		if (!linkContext?.activeStateAria && !activeState?.aria) {
			return { 'aria-current': 'page' } as AriaAttributes;
		}
		const localAria = expandAriaAttributes(activeState?.aria);
		return {
			...linkContext?.activeStateAria,
			...localAria
		};
	});
	const isActive = $derived(isRouteActive(router, activeFor));
	const calcHref = $derived(
		href === ''
			? location.url.href
			: calculateHref(
					{
						hash: resolvedHash,
						preserveQuery: calcPreserveQuery
					},
					calcPrependBasePath ? router?.basePath : undefined,
					href
				)
	);

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLAnchorElement }) {
		incomingOnclick?.(event);
		if (event.defaultPrevented) return;
		event.preventDefault();
		const newState = calculateState(resolvedHash, typeof state === 'function' ? state() : state);
		location.goTo(calcHref, { state: newState, replace: calcReplace });
	}
</script>

<a
	href={calcHref}
	class={[cssClass, (isActive && calcActiveState?.class) || undefined]}
	style={isActive ? joinStyles(style, calcActiveState?.style) : style}
	onclick={handleClick}
	{...isActive ? calcActiveStateAria : undefined}
	{...restProps}
>
	{@render children?.({ state: location.getState(resolvedHash), rs: router?.routeStatus })}
</a>
