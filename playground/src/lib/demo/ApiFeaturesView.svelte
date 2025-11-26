<script lang="ts">
	import Card from '../Card.svelte';
	import CardBody from '../CardBody.svelte';
	import CardHeader from '../CardHeader.svelte';
	import FeatureItem from '../FeatureItem.svelte';
	import FeatureList from '../FeatureList.svelte';
</script>

<Card>
	<CardHeader tag="h3">
		API
	</CardHeader>
	<CardBody>
		<FeatureList>
			<FeatureItem>
				<code>init()</code>: Initializes the router library.
			</FeatureItem>
			<FeatureItem>
				<code>getRouterContext()</code>: Retrieves the closest router ih the component hierarchy.
			</FeatureItem>
		</FeatureList>
	</CardBody>
</Card>
