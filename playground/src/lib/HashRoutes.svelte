<script lang="ts">
    import { location } from '@svelte-router/core';
</script>

<dl>
    {#each Object.entries(location.hashPaths) as [id, path]}
        <dt>{id}</dt>
        <dd>{path}</dd>
    {/each}
</dl>
