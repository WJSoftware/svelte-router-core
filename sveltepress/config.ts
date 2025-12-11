import { defaultTheme } from '@sveltepress/theme-default';

export const siteConfig = {
    title: 'Svelte Router',
    description: 'Next-level routing for Svelte and Sveltekit'
};

export const themeConfig = defaultTheme({
    logo: '/logo-64.svg',
    github: 'https://github.com/WJSoftware/svelte-router',
    editLink: 'https://github.com/WJSoftware/svelte-router/edit/main/src/routes/:route',
    themeColor: {
        light: '#ffffff',
        dark: '#121212',
        primary: '#2432ffff',
        hover: '#8523ccff',
        gradient: {
            start: '#4f46e5',
            end: '#3b82f6'
        }
    },
    docsearch: {
        appId: '5C89SA9O1K',
        apiKey: '6e857c9d7153d94114225a2b3a47e5d9',
        indexName: 'Svelte Router'
    },
    navbar: [
        {
            title: 'Docs',
            to: '/docs/intro'
        },
        {
            title: 'API',
            to: '/api/core/router'
        }
    ],
    sidebar: {
        '/docs/': [
            {
                title: 'Introduction',
                collapsible: true,
                items: [
                    {
                        title: 'Introduction',
                        to: '/docs/intro'
                    },
                    {
                        title: 'Library Initialization',
                        to: '/docs/library-initialization'
                    },
                    {
                        title: 'Electron Support',
                        to: '/docs/electron-support'
                    },
                    {
                        title: 'Sveltekit Support',
                        to: '/docs/sveltekit-support'
                    }
                ]
            },
            {
                title: 'Routing Modes',
                collapsible: true,
                items: [
                    {
                        title: 'Routing Modes (Universes)',
                        to: '/docs/routing-modes'
                    },
                    {
                        title: 'Per-Routing Mode Data',
                        to: '/docs/per-routing-mode-data'
                    }
                ]
            },
            {
                title: 'Other',
                collapsible: true,
                items: [
                    {
                        title: 'Library Modes',
                        to: '/docs/library-modes'
                    },
                    {
                        title: 'Reactive Data',
                        to: '/docs/reactive-data'
                    },
                    {
                        title: 'Lines Of Code (LOC)',
                        to: '/docs/loc'
                    }
                ]
            },
            {
                title: 'Routing',
                collapsible: true,
                items: [
                    {
                        title: 'Routing with Components',
                        to: '/docs/routing-with-components'
                    },
                    {
                        title: 'Routing with JavaScript',
                        to: '/docs/routing-with-javascript'
                    }
                ]
            },
            {
                title: 'Navigating',
                collapsible: true,
                items: [
                    {
                        title: 'Navigating with Components',
                        to: '/docs/navigating-with-components'
                    },
                    {
                        title: 'Navigating with JavaScript',
                        to: '/docs/navigating-with-javascript'
                    },
                    {
                        title: 'Redirecting',
                        to: '/docs/redirecting'
                    }
                ]
            },
            {
                title: 'Extension Libraries',
                collapsible: true,
                items: [
                    {
                        title: 'Creating an Extension Package',
                        to: '/docs/creating-an-extension-package'
                    },
                    {
                        title: 'Existing Extension Packages',
                        to: '/docs/existing-extension-packages'
                    }
                ]
            }
        ],
        '/api/': [
            {
                title: '@svelte-router/core',
                collapsible: true,
                items: [
                    {
                        title: 'Components',
                        collapsible: true,
                        items: [
                            {
                                title: 'Router',
                                to: '/api/core/router'
                            },
                            {
                                title: 'Route',
                                to: '/api/core/route'
                            },
                            {
                                title: 'Fallback',
                                to: '/api/core/fallback'
                            },
                            {
                                title: 'Link',
                                to: '/api/core/link'
                            },
                            {
                                title: 'RouterTrace',
                                to: '/api/core/routertrace'
                            },
                            {
                                title: 'LinkContext',
                                to: '/api/core/linkcontext'
                            }
                        ]
                    },
                    {
                        title: 'Objects & Classes',
                        to: '/api/core/objects-and-classes'
                    },
                    {
                        title: 'Functions',
                        to: '/api/core/functions'
                    }
                ]
            },
            {
                title: '@svelte-router/kit',
                collapsible: true,
                items: [
                    {
                        title: 'Components',
                        collapsible: true,
                        items: [
                            {
                                title: 'KitFallback',
                                to: '/api/kit/kitfallback'
                            }
                        ]
                    },
                    {
                        title: 'Objects & Classes',
                        to: '/api/kit/objects-and-classes'
                    },
                    {
                        title: 'Functions',
                        to: '/api/kit/functions'
                    }
                ]
            }
        ]
    },
    preBuildIconifyIcons: {
        'akar-icons': ['github-fill'],
        'skill-icons': ['github-dark']
    },
    highlighter: {
        languages: [
            'svelte',
            'typescript',
            'javascript',
            'json',
            'bash',
            'powershell',
            'css',
            'scss',
            'html'
        ]
    }
});
