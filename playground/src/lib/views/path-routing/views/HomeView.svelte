<script lang="ts">
	import CodeSnippet from '../../../CodeSnippet.svelte';
	import Card from '../../../Card.svelte';
	import CardHeader from '../../../CardHeader.svelte';
	import CardBody from '../../../CardBody.svelte';
	import xml from 'svelte-highlight/languages/xml';
	import typescript from 'svelte-highlight/languages/typescript';
	import { getTitleContext } from '../../../state/title.svelte';

	// Import code samples as raw text
	import basicPathRouterCode from '../code-samples/basic-path-router.txt?raw';
	import linkComponentCode from '../code-samples/link-component.txt?raw';
	import nestedRoutingCode from '../code-samples/nested-routing.txt?raw';
	import routeParametersCode from '../code-samples/route-parameters.txt?raw';
	import urlExamples from '../code-samples/url-examples.ts?raw';
	import routeGuardsCode from '../code-samples/route-guards.txt?raw';

	getTitleContext().current = 'Path Routing';
</script>

<div class="container">
	<h1>🛣️ Path Routing</h1>
	<p class="lead">
		The classic way to navigate! Path routing uses the URL path to determine which components to render, 
		just like traditional web applications but with SPA speed and smoothness.
	</p>

	<!-- Hero Section -->
	<div class="row mt-4">
		<div class="col-lg-6">
			<Card border="primary" class="h-100">
				<CardHeader background="primary" textColor="white" tag="h4">
					🏗️ Basic Path Routing
				</CardHeader>
				<CardBody>
					<p>
						Path routing is the default mode in <code>@svelte-router/core</code>. It feels natural 
						because it works just like regular websites - but faster!
					</p>
					<CodeSnippet 
						language={xml} 
						code={basicPathRouterCode} 
						title="Basic Path Router Setup"
					/>
					<div class="alert alert-info mt-3">
						<strong>SEO Friendly:</strong> Search engines love path-based URLs! They're clean, 
						predictable, and easy to understand.
					</div>
				</CardBody>
			</Card>
		</div>
		<div class="col-lg-6">
			<Card border="success" class="h-100">
				<CardHeader background="success" textColor="white" tag="h4">
					🔗 Link Components
				</CardHeader>
				<CardBody>
					<p>
						Replace <code>&lt;a&gt;</code> tags with <code>&lt;Link&gt;</code> components for 
						smooth navigation without page reloads!
					</p>
					<CodeSnippet 
						language={xml} 
						code={linkComponentCode} 
						title="Using Link Components"
					/>
					<div class="alert alert-warning mt-3">
						<strong>Important:</strong> Regular anchor tags will cause full page reloads. 
						Always use <code>&lt;Link&gt;</code> for internal navigation!
					</div>
				</CardBody>
			</Card>
		</div>
	</div>

	<!-- Advanced Features -->
	<div class="row mt-4">
		<div class="col-lg-6">
			<Card border="warning" class="h-100">
				<CardHeader background="warning" textColor="dark" tag="h4">
					🎯 Route Parameters
				</CardHeader>
				<CardBody>
					<p>
						Capture dynamic values from URLs using parameters. Perfect for user IDs, 
						slugs, and dynamic content!
					</p>
					<CodeSnippet 
						language={xml} 
						code={routeParametersCode} 
						title="Route Parameters & Rest Routes"
					/>
					<div class="alert alert-success mt-3">
						<strong>Pro tip:</strong> Use rest parameters (<code>/*</code>) for file paths 
						and hierarchical navigation!
					</div>
				</CardBody>
			</Card>
		</div>
		<div class="col-lg-6">
			<Card border="info" class="h-100">
				<CardHeader background="info" textColor="white" tag="h4">
					🏢 Nested Routing
				</CardHeader>
				<CardBody>
					<p>
						Build complex layouts with nested routers. Perfect for admin panels, 
						dashboards, and multi-level navigation!
					</p>
					<CodeSnippet 
						language={xml} 
						code={nestedRoutingCode} 
						title="Nested Router Example"
					/>
					<div class="alert alert-info mt-3">
						<strong>Powerful:</strong> Each router can have its own <code>basePath</code> 
						and operates independently within its scope.
					</div>
				</CardBody>
			</Card>
		</div>
	</div>

	<!-- URL Examples -->
	<div class="row mt-4">
		<div class="col-lg-6">
			<Card border="secondary" class="h-100">
				<CardHeader background="secondary" textColor="white" tag="h4">
					🌐 URL Structure
				</CardHeader>
				<CardBody>
					<p>See how different route patterns match real URLs:</p>
					<CodeSnippet 
						language={typescript} 
						code={urlExamples} 
						title="URL Matching Examples"
					/>
					<div class="mt-3">
						<small class="text-muted">
							💡 Notice how parameters and rest routes capture dynamic parts of the URL!
						</small>
					</div>
				</CardBody>
			</Card>
		</div>
		<div class="col-lg-6">
			<Card border="dark" class="h-100">
				<CardHeader background="dark" textColor="white" tag="h4">
					🛡️ Route Guards
				</CardHeader>
				<CardBody>
					<p>
						Control access to routes with the <code>and</code> property. Perfect for 
						authentication and authorization!
					</p>
					<CodeSnippet 
						language={xml} 
						code={routeGuardsCode} 
						title="Route Guard Examples"
					/>
					<div class="alert alert-danger mt-3">
						<strong>Security:</strong> Route guards help protect sensitive areas but 
						always validate permissions on the server too!
					</div>
				</CardBody>
			</Card>
		</div>
	</div>

	<!-- Key Benefits -->
	<div class="row mt-5">
		<div class="col-lg-8 offset-lg-2">
			<Card border="success">
				<CardHeader background="success" textColor="white" class="text-center" tag="h3">
					🎉 Why Path Routing Rocks
				</CardHeader>
				<CardBody>
					<div class="row">
						<div class="col-md-6">
							<h5>🚀 Performance Benefits</h5>
							<ul class="list-unstyled">
								<li>✅ No page reloads</li>
								<li>✅ Instant navigation</li>
								<li>✅ Preserved application state</li>
								<li>✅ Smooth transitions</li>
							</ul>
						</div>
						<div class="col-md-6">
							<h5>🎯 User Experience</h5>
							<ul class="list-unstyled">
								<li>✅ Bookmarkable URLs</li>
								<li>✅ Browser back/forward works</li>
								<li>✅ SEO friendly</li>
								<li>✅ Shareable links</li>
							</ul>
						</div>
					</div>
					<div class="text-center mt-4">
						<p class="lead mb-0">
							<strong>The best of both worlds:</strong> Traditional web navigation with modern SPA performance! 🎯
						</p>
					</div>
				</CardBody>
			</Card>
		</div>
	</div>

	<!-- Call to Action -->
	<div class="row mt-5">
		<div class="col-lg-10 offset-lg-1">
			<div class="alert alert-primary text-center">
				<h4>🎮 Ready to Try Path Routing?</h4>
				<p class="mb-3">
					Click the "Start Demo" link in the navigation above to see path routing in action! 
					Watch how the URL changes as you navigate between different sections.
				</p>
				<p class="mb-0">
					<strong>Pro tip:</strong> Open your browser's developer tools and watch the Network tab - 
					notice how no full page requests are made when navigating! 🎉
				</p>
			</div>
		</div>
	</div>
</div>