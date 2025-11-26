<script lang="ts">
  import { location } from '@svelte-router/core';
  
  // For this example, assume we have routing mode state
  let routingMode = $state('single'); // or 'multi'

  // Reactive hash display
  const currentHash = $derived(() => {
    return location.url.hash || '#(empty)';
  });

  // Parse routes for display
  const routes = $derived(() => {
    if (routingMode === 'multi') {
      return location.hashPaths; // All hash paths
    } else {
      return { main: location.hashPaths.single || '' };
    }
  });
</script>

<div class="hash-display">
  <div class="current-hash">
    Current hash: {currentHash}
  </div>
  
  {#each Object.entries(routes) as [key, value]}
    <div class="route-info">
      <strong>{key}:</strong> {value || '(empty)'}
    </div>
  {/each}
</div>
