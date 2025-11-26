<script lang="ts">
	import { location } from '@svelte-router/core';
	import Alert from '../../Alert.svelte';
	import { getTitleContext } from '../../state/title.svelte';
	import { routingMode } from '../../hash-routing';

	getTitleContext().current = 'New Feature (Redirector Demo)';
	const redirectedHash = routingMode === 'multi' ? 'redir' : true;
	const redirected = !!location.getState(redirectedHash)?.redirected;
	location.navigate('', { hash: redirectedHash, state: undefined, replace: true });
</script>

<article class="container">
	{#if redirected}
		<Alert background="warning">
			You have been redirected here from a deprecated path. Please update your bookmarks!
		</Alert>
	{:else}
		<Alert background="info">
			Note how the warning alert is not shown when navigating directly to this URL.  This is because the piece 
			of state indicating a redirection is only set when arriving here via the redirection defined in this demo's 
			<code>App.svelte</code> component.
		</Alert>
	{/if}
	<h1>Feature With New URL Goes Here</h1>
	<p>
		This page is accessible via its new path (<code>/new-path</code>), but can also be reached by
		navigating to the old deprecated path (<code>/deprecated-path</code>), which will redirect to
		the new URL.
	</p>
	<p>
		This demonstrates how to set up URL redirections using the <code>Redirector</code> class from
		the <code>@svelte-router/core</code> NPM package.
	</p>
</article>
