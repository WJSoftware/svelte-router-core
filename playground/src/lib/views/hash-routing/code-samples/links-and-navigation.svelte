<script lang="ts">
    import { Link } from "@svelte-router/core";
    import { routingMode } from "../../../hash-routing";

    const href = $derived(routingMode === 'single' ?
        '#/demo' :
        '#d1=/demo;d2=/demo'
    );
</script>

<Link {href} hash={false} class="btn btn-secondary">
    Start Demo
</Link>
 <a {href} class="btn btn-info">
    Start Demo (anchor link)
</a>
