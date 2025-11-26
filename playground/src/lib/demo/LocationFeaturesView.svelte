<script lang="ts">
	import Card from '../Card.svelte';
	import CardBody from '../CardBody.svelte';
	import CardHeader from '../CardHeader.svelte';
	import FeatureItem from '../FeatureItem.svelte';
	import FeatureList from '../FeatureList.svelte';
</script>

<Card>
	<CardHeader tag="h3">
		<code>Location</code> Features
	</CardHeader>
	<CardBody>
		<FeatureList>
			<FeatureItem>Reactive current URL</FeatureItem>
			<FeatureItem>Reactive query parameters</FeatureItem>
			<FeatureItem>Reactive hash</FeatureItem>
			<FeatureItem>Reactive current state</FeatureItem>
			<FeatureItem>Programatic navigation</FeatureItem>
		</FeatureList>
		<h4>Full Mode</h4>
		<FeatureList>
			<FeatureItem>
				Cancellable <code>beforeNavigate</code> event
			</FeatureItem>
			<FeatureItem>
				<code>navigationCancelled</code> event
			</FeatureItem>
			<FeatureItem>History API interception</FeatureItem>
			<FeatureItem>
				Suitable when mixing routers from different libraries (micro-frontends)
			</FeatureItem>
		</FeatureList>
	</CardBody>
</Card>
