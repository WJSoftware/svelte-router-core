<script lang="ts">
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';
	import Highlight, { type LanguageType } from 'svelte-highlight';
	import 'svelte-highlight/styles/atelier-dune-light.css';
	// import 'svelte-highlight/styles/github.css';
	import { clsx } from 'clsx';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		language: LanguageType<string>;
		code: string;
		title?: string;
		copyable?: boolean;
	}

	let { language, code, title, copyable = true, class: cssClass, ...restProps }: Props = $props();

	let copied = $state(false);
	let codeNode = $state<HTMLElement | null>(null);

	$effect(() => {
		const root = codeNode?.querySelector('.hljs');
		if (!root) return;
		styleDirectTextChildren(root, 'orphan-text-node');
	});

	function styleDirectTextChildren(root: Node, cssClass: ClassValue) {
		for (const node of root.childNodes) {
			if (node.nodeType === Node.TEXT_NODE && node.nodeValue?.trim()) {
				const span = document.createElement('span');
				span.textContent = node.nodeValue;
				span.classList.add(clsx(cssClass));
				root.replaceChild(span, node);
			}
		}
	}

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(code);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy code: ', err);
		}
	}
</script>

<div class={['code-snippet', cssClass]} {...restProps}>
	{#if title || copyable}
		<div class="code-snippet-header">
			{#if title}
				<span class="code-snippet-title">{title}</span>
			{/if}
			{#if copyable}
				<button
					type="button"
					class="btn btn-sm btn-outline-secondary copy-btn"
					onclick={copyToClipboard}
					disabled={copied}
				>
					{#if copied}
						<i class="bi bi-check"></i> Copied!
					{:else}
						<i class="bi bi-clipboard"></i> Copy
					{/if}
				</button>
			{/if}
		</div>
	{/if}
	<div bind:this={codeNode} class="code-snippet-content">
		<Highlight {language} {code} />
	</div>
</div>

<style>
	.code-snippet {
		border: 1px solid var(--bs-border-color);
		border-radius: var(--bs-border-radius);
		background-color: var(--bs-body-bg);
		margin: 1rem 0;
		overflow: hidden;
	}

	.code-snippet-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 1rem;
		background-color: var(--bs-light);
		border-bottom: 1px solid var(--bs-border-color);
		font-size: 0.875rem;
	}

	:global([data-bs-theme='dark']) .code-snippet-header {
		background-color: var(--bs-gray-800);
	}

	.code-snippet-title {
		font-weight: 600;
		color: var(--bs-secondary);
	}

	.copy-btn {
		font-size: 0.75rem;
		padding: 0.25rem 0.5rem;
		transition: all 0.2s ease;
	}

	.copy-btn:disabled {
		color: var(--bs-success);
		border-color: var(--bs-success);
	}

	.code-snippet-content {
		position: relative;
	}

	.code-snippet-content :global(pre) {
		margin: 0 !important;
		padding: 1rem !important;
		background-color: transparent !important;
		border: none !important;
		border-radius: 0 !important;
	}

	.code-snippet-content :global(code) {
		background-color: transparent !important;
	}

	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.code-snippet-header {
			background-color: var(--bs-gray-800);
		}
	}

	:global .orphan-text-node {
		color: var(--bs-body-color);
	}
</style>
