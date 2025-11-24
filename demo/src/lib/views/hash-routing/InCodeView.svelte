<script lang="ts">
	import CodeSnippet from '../../CodeSnippet.svelte';
	import Card from '../../Card.svelte';
	import CardHeader from '../../CardHeader.svelte';
	import CardBody from '../../CardBody.svelte';
	import typescript from 'svelte-highlight/languages/typescript';
	import xml from 'svelte-highlight/languages/xml';
	import LinksAndNavigation from './code-samples/links-and-navigation.svelte';

	// Import code samples as raw text
	import basicHashRouterCode from './code-samples/basic-hash-router.txt?raw';
	import multiHashRouterCode from './code-samples/multi-hash-router.txt?raw';
	import pathAndHashCode from './code-samples/path-and-hash.txt?raw';
	import hashUrlExamples from './code-samples/hash-url-examples.ts?raw';
	import linksAndNavigation from './code-samples/links-and-navigation.svelte?raw';
	import Alert from '../../Alert.svelte';
</script>

<div>
    <h1><i class="bi bi-code-slash"></i> In-Code Hash Routing</h1>
    <p class="lead">Explore how to implement hash routing directly within your Svelte components.</p>
	<div class="row mt-4">
		<div class="col-xl-4 col-lg-6">
			<Card border="primary" class="h-100">
				<CardHeader background="primary" textColor="white" tag="h4" class="mb-0">
					✨ Basic Hash Routing
				</CardHeader>
				<CardBody>
					<p>
						Hash routing is perfect for single-page applications. It works without server
						configuration and plays nicely with static hosting!
					</p>
					<CodeSnippet language={xml} code={basicHashRouterCode} title="Basic Hash Router Setup" />
					<div class="mt-3">
						<small class="text-muted">
							💡 Try changing the URL hash to see routing in action!
						</small>
					</div>
				</CardBody>
			</Card>
		</div>
		<div class="col-xl-4 col-lg-6">
			<Card border="success" class="h-100">
				<CardHeader background="success" textColor="white" tag="h4" class="mb-0">
					🎯 URL Examples
				</CardHeader>
				<CardBody>
					<p>See how URLs look in both single and multi-hash modes:</p>
					<CodeSnippet language={typescript} code={hashUrlExamples} title="Hash URL Patterns" />
				</CardBody>
			</Card>
		</div>
		<div class="col-xl-4 col">
			<Card border="danger" class="h-100">
				<CardHeader background="danger" textColor="white" tag="h4" class="mb-0">
					🔗 Links & Navigation
				</CardHeader>
				<CardBody>
					<p>
						You should always stick to <code>Link</code> components when creating navigation links. However,
						hash HREF's in anchor elements work:
					</p>
					<CodeSnippet language={typescript} code={linksAndNavigation} title="Links vs Anchors" />
					<Alert background="info">
						ℹ️ Anchor elements, when clicked, carry the existing history state.
					</Alert>
					<h6>Live Code Sample</h6>
					<LinksAndNavigation />
				</CardBody>
			</Card>
		</div>
	</div>

	<div class="row mt-4">
		<div class="col-lg-6">
			<Card border="warning" class="h-100">
				<CardHeader background="warning" textColor="dark" tag="h4" class="mb-0">
					🔄 Multiple Hash Routers
				</CardHeader>
				<CardBody>
					<p>
						Run multiple independent hash routers simultaneously! Each router gets its own namespace
						in the hash value using key-value pairs.
					</p>
					<CodeSnippet
						language={xml}
						code={multiHashRouterCode}
						title="Multi-Hash Router Example"
					/>
					<div class="alert alert-info mt-3">
						<strong>Cool fact:</strong> Multi-hash mode uses semicolon-separated key/value pairs, so
						`#sidebar=/nav;main=/dashboard` runs two routers independently!
					</div>
					<div class="alert alert-success mt-2">
						<strong>💡 Pro tip:</strong> Keep your multi-hash path names short to prevent URLs from growing
						too long!
					</div>
				</CardBody>
			</Card>
		</div>
		<div class="col-lg-6">
			<Card border="info" class="h-100">
				<CardHeader background="info" textColor="white" tag="h4" class="mb-0">
					🤝 Path + Hash Harmony
				</CardHeader>
				<CardBody>
					<p>
						Mix path and hash routing! Use path routing for main navigation and hash routing for
						modals, tabs, or secondary navigation.
					</p>
					<CodeSnippet
						language={xml}
						code={pathAndHashCode}
						title="Simultaneous Path & Hash Routing"
					/>
					<div class="alert alert-success mt-3">
						<strong>Best practice:</strong> Use path routing for main content and hash routing for overlays
						and temporary UI states.
					</div>
				</CardBody>
			</Card>
		</div>
	</div>
</div>
