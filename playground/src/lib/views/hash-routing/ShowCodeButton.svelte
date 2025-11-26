<script lang="ts">
    import { location } from "@svelte-router/core";

    function handleClick() {
        location.navigate('', { state: { showCodeDialog: true } });
    }
</script>
<div class="d-flex flex-row gap-2 align-items-baseline">
    <button type="button" class="btn btn-sm btn-outline-primary" onclick={handleClick}>
        📋 Show Code
    </button>
    <div class="alert alert-dark">
        ℹ️ This button uses 
        <a
            href="https://svelte.dev/docs/kit/shallow-routing"
            target="_blank"
            rel="noopener noreferrer"
        >shallow routing</a> to open the code dialog.  You can close or re-open the dialog window using the browser's back/forward buttons.
    </div>
</div>
