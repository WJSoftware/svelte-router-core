<script lang="ts">
    import Router from "$lib/Router/Router.svelte";
    import Route from "$lib/Route/Route.svelte";
    import type { Snippet } from "svelte";
    
    interface Props {
        hash?: boolean | string;
        routeKey?: string;
        routePath?: string | RegExp;
        routeAnd?: (params: any) => boolean;
        ignoreForFallback?: boolean;
        caseSensitive?: boolean;
        children?: Snippet;
        routeChildren?: Snippet<[any, any, any]>;
        routerInstance?: any;
        params?: any;
    }
    
    let { 
        hash,
        routeKey = "test-route",
        routePath,  // No default - let it be undefined
        routeAnd,
        ignoreForFallback,
        caseSensitive,
        children,
        routeChildren,
        routerInstance = $bindable(),
        params = $bindable()
    }: Props = $props();
</script>

<Router {hash} bind:router={routerInstance}>
    <Route 
        key={routeKey}
        path={routePath}
        and={routeAnd}
        {ignoreForFallback}
        {caseSensitive}
        {hash}
        bind:params
    >
        {#snippet children({ rp, state, rs })}
            {#if routeChildren}
                {@render routeChildren(rp, state, rs)}
            {:else}
                <div data-testid="route-content" data-params={JSON.stringify(params || {})}>
                    Route Content - Key: {routeKey}
                </div>
            {/if}
        {/snippet}
    </Route>
    {#if children}
        {@render children()}
    {/if}
</Router>
