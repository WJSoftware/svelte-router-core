<script lang="ts">
	import Card from "../Card.svelte";
	import CardBody from "../CardBody.svelte";
	import CardHeader from "../CardHeader.svelte";
	import FeatureItem from "../FeatureItem.svelte";
	import FeatureList from "../FeatureList.svelte";
</script>

<Card>
    <CardHeader tag="h3">
        <code>Router</code> Features
    </CardHeader>
    <CardBody>
        <FeatureList>
            <FeatureItem>Multiple route matches</FeatureItem>
            <FeatureItem>
                Non-root serving via <code>Router.basePath</code>
            </FeatureItem>
            <FeatureItem>Nesting routers</FeatureItem>
            <FeatureItem>
                Fallback content via the <code>Fallback</code> component
            </FeatureItem>
        </FeatureList>
</CardBody>
</Card>
