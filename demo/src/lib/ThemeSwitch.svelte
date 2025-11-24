<script lang="ts">
    import theme from "./state/theme.svelte.js";
    import { fly } from "svelte/transition";

    const themeIcons = {
        light: "bi-sun-fill",
        dark: "bi-moon-stars-fill",
        system: "bi-tv-fill",
    };

    let label = $derived(`${theme.current} theme`);
</script>

<button class="btn btn-sm" onclick={() => theme.nextTheme()} aria-label={label} title={label}>
	{#key theme.current}
		<i class={['fas', themeIcons[theme.current]]} transition:fly={{ y: 30, duration: 600 }}></i>
	{/key}
</button>

<style>
	button {
		display: grid;
		padding: 0.7em;
		& > i {
			grid-area: 1 / 1 / 2 / 2;
		}
	}
</style>
