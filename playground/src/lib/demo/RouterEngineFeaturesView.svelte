<script lang="ts">
	import Card from '../Card.svelte';
	import CardBody from '../CardBody.svelte';
	import CardHeader from '../CardHeader.svelte';
	import FeatureItem from '../FeatureItem.svelte';
	import FeatureList from '../FeatureList.svelte';
</script>

<Card>
	<CardHeader tag="h3">
		<code>RouterEngine</code> Features
	</CardHeader>
	<CardBody>
		<FeatureList>
			<FeatureItem>
				Class that powers the <code>Router</code> component
			</FeatureItem>
			<FeatureItem>Allows programatic route definition and evaluation</FeatureItem>
			<FeatureItem>Can be used to create custom routing solutions</FeatureItem>
		</FeatureList>
	</CardBody>
</Card>
