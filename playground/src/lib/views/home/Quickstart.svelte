<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import Card from "../../Card.svelte";
    import CardHeader from "../../CardHeader.svelte";
    import CardBody from "../../CardBody.svelte";
    import CodeSnippet from "../../CodeSnippet.svelte";
    import bash from "svelte-highlight/languages/bash";
    import typescript from "svelte-highlight/languages/typescript";
    
    type Props = HTMLAttributes<HTMLDivElement>;

    let {
        class: cssClass,
        ...restProps
    }: Props = $props();
</script>

<Card class={["h-100", cssClass]} {...restProps}>
    <CardHeader tag="h2">Quickstart</CardHeader>
    <CardBody>
        <p>Install the package:</p>
        <CodeSnippet 
            language={bash} 
            code="npm install @svelte-router/core"
            title="Installation"
        />
        <p>Then, in your Svelte app:</p>
        <CodeSnippet 
            language={typescript} 
            code={`<scr` + `ipt lang="ts">
    import { Router, Route } from '@svelte-router/core';
    import Hero from './lib/Hero.svelte';
    import Features from './lib/Features.svelte';
</script>

<Router>
    <Route key="home" path="/">
        <Hero />
    </Route>
    <Route key="features" path="/features">
        <Features />
    </Route>
</Router>`}
            title="Basic Usage"
        />
    </CardBody>
</Card>
