<script lang="ts">
	import Card from '../Card.svelte';
	import CardBody from '../CardBody.svelte';
	import CardHeader from '../CardHeader.svelte';
	import FeatureItem from '../FeatureItem.svelte';
	import FeatureList from '../FeatureList.svelte';
</script>

<Card>
	<CardHeader tag="h3">
		<code>Link</code> Features
	</CardHeader>
	<CardBody>
		<FeatureList>
			<FeatureItem>Drop-in replacement of anchor tags</FeatureItem>
			<FeatureItem>Can set state</FeatureItem>
			<FeatureItem>Active state based on route key</FeatureItem>
			<FeatureItem>Replace or push URL's</FeatureItem>
		</FeatureList>
	</CardBody>
</Card>
