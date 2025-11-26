<script>
    import { location } from "@svelte-router/core";
</script>

<div class="text-center">
    <h1 class="text-danger">This Is Not What You're Looking For</h1>
    <p>The URL <code>{location.url}</code> is not mapped to anything.</p>
</div>
