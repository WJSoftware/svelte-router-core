<script lang="ts">
	import Card from "../Card.svelte";
	import CardBody from "../CardBody.svelte";
	import CardHeader from "../CardHeader.svelte";
	import FeatureItem from "../FeatureItem.svelte";
	import FeatureList from "../FeatureList.svelte";
</script>

<Card>
    <CardHeader tag="h3">
        <code>Route</code> Features
    </CardHeader>
    <CardBody>
        <FeatureList>
            <FeatureItem>Exact path matching</FeatureItem>
            <FeatureItem>Route parameters</FeatureItem>
            <FeatureItem>Rest parameter</FeatureItem>
            <FeatureItem>Optional parameters</FeatureItem>
            <FeatureItem>Path specification via regular expression or text</FeatureItem>
            <FeatureItem>Additional matching predicate function</FeatureItem>
            <FeatureItem>Optional path to control matching entirely via other conditions</FeatureItem>
            <FeatureItem>Share route keys to display disconnected UI pieces</FeatureItem>
        </FeatureList>
</CardBody>
</Card>
