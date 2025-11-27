import { describe, test, expect, beforeAll, afterAll, afterEach, vi, beforeEach } from "vitest";
import { routePatternsKey, RouterEngine } from "./RouterEngine.svelte.js";
import { init } from "../init.js";
import { registerRouter } from "./trace.svelte.js";
import { location } from "./Location.js";
import type { State, RouteInfo, ExtendedRoutingOptions } from "../types.js";
import { setupBrowserMocks, addRoutes, ROUTING_UNIVERSES, ALL_HASHES } from "$test/test-utils.js";
import { resetRoutingOptions, setRoutingOptions } from "./options.js";

describe("RouterEngine", () => {
    describe('constructor', () => {
        const { registerRouterMock } = vi.hoisted(() => {
            return { registerRouterMock: vi.fn() };
        });
        vi.mock("./trace.svelte.js", async (originalImport) => {
            return {
                ...await originalImport(),
                registerRouter: registerRouterMock,
            };
        });
        test("Should throw an error if the library hasn't been initialized.", () => {
            // Act.
            const act = () => new RouterEngine();

            // Assert.
            expect(act).toThrowError();
        });
        test("Should register the router if traceOptions.routerHierarchy is true.", () => {
            // Arrange.
            const cleanup = init({ trace: { routerHierarchy: true } });

            // Act.
            const router = new RouterEngine();

            // Assert.
            expect(registerRouter).toHaveBeenCalled();

            // Cleanup.
            cleanup();
        });
    });

    describe('constructor hash validation', () => {
        let cleanupFn: (() => void) | null = null;

        afterEach(() => {
            if (cleanupFn) {
                cleanupFn();
                cleanupFn = null;
            }
        });

        test.each([
            { parentHash: ALL_HASHES.path, childHash: ALL_HASHES.single, mode: 'single' as const, description: "path parent vs hash child" },
            { parentHash: ALL_HASHES.single, childHash: ALL_HASHES.path, mode: 'single' as const, description: "hash parent vs path child" },
            { parentHash: ALL_HASHES.multi, childHash: ALL_HASHES.path, mode: 'multi' as const, description: "multi-hash parent vs path child" },
            { parentHash: ALL_HASHES.path, childHash: ALL_HASHES.multi, mode: 'multi' as const, description: "path parent vs multi-hash child" },
        ])("Should throw error when parent and child have different hash modes: $description", ({ parentHash, childHash, mode }) => {
            // Arrange
            cleanupFn = init({ hashMode: mode });

            // Act & Assert
            expect(() => {
                const parent = new RouterEngine({ hash: parentHash });
                new RouterEngine({ parent, hash: childHash });
            }).toThrowError("The parent router's hash mode must match the child router's hash mode.");
        });

        test.each([
            { parentHash: ALL_HASHES.path, mode: 'single' as const, description: "path parent" },
            { parentHash: ALL_HASHES.single, mode: 'single' as const, description: "hash parent" },
            { parentHash: ALL_HASHES.multi, mode: 'multi' as const, description: "multi-hash parent" },
        ])("Should allow child router without explicit hash to inherit parent's hash: $description", ({ parentHash, mode }) => {
            // Arrange
            cleanupFn = init({ hashMode: mode });

            // Act & Assert
            expect(() => {
                const parent = new RouterEngine({ hash: parentHash });
                const child = new RouterEngine(parent); // No explicit hash - should inherit
                expect(child).toBeDefined();
            }).not.toThrow();
        });

        test("Should throw error when using hash path ID without multi hash mode", () => {
            // Arrange
            cleanupFn = init({ hashMode: 'single' });

            // Act & Assert
            expect(() => {
                new RouterEngine({ hash: ALL_HASHES.multi });
            }).toThrowError("A hash path ID was given, but is only allowed when the library's hash mode has been set to 'multi'.");
        });

        test("Should throw error when using non-string hash in multi hash mode", () => {
            // Arrange
            cleanupFn = init({ hashMode: 'multi' });

            // Act & Assert
            expect(() => {
                new RouterEngine({ hash: ALL_HASHES.single }); // boolean not allowed in multi mode
            }).toThrowError("The specified hash value is not valid for the 'multi' hash mode.  Either don't specify a hash for path routing, or correct the hash value.");
        });

        test("Should allow valid hash path ID in multi hash mode", () => {
            // Arrange
            cleanupFn = init({ hashMode: 'multi' });

            // Act & Assert
            expect(() => {
                const router = new RouterEngine({ hash: ALL_HASHES.multi });
                expect(router).toBeDefined();
            }).not.toThrow();
        });
    });

    describe('Routing Mode Assertions', () => {
        let cleanupFn: (() => void) | null = null;

        afterEach(() => {
            resetRoutingOptions();
            cleanupFn?.();
            cleanupFn = null;
        });

        test.each<{
            options: Partial<ExtendedRoutingOptions>;
            hash: typeof ALL_HASHES[keyof typeof ALL_HASHES];
            description: string;
        }>([
            {
                options: { disallowHashRouting: true },
                hash: ALL_HASHES.single,
                description: 'hash routing is disallowed'
            },
            {
                options: { disallowMultiHashRouting: true },
                hash: ALL_HASHES.multi,
                description: 'multi-hash routing is disallowed'
            },
            {
                options: { disallowPathRouting: true },
                hash: ALL_HASHES.path,
                description: 'path routing is disallowed'
            }
        ])("Should throw error when $description and hash=$hash in constructor.", ({ options, hash }) => {
            // Arrange
            setRoutingOptions(options);
            cleanupFn = init();

            // Act & Assert
            expect(() => {
                new RouterEngine({ hash });
            }).toThrow();
        });

        test("Should not throw error when all routing modes are allowed in constructor.", () => {
            // Arrange
            cleanupFn = init();

            // Act & Assert
            expect(() => {
                new RouterEngine({ hash: ALL_HASHES.path });
            }).not.toThrow();
            expect(() => {
                new RouterEngine({ hash: ALL_HASHES.single });
            }).not.toThrow();

            cleanupFn();
            cleanupFn = init({ hashMode: 'multi' });
            expect(() => {
                new RouterEngine({ hash: ALL_HASHES.multi });
            }).not.toThrow();
        });

        test("Should throw error when parent router violates restrictions.", () => {
            // Arrange
            setRoutingOptions({ disallowHashRouting: true });
            cleanupFn = init();

            // Act & Assert - Parent router creation should fail
            expect(() => {
                const parent = new RouterEngine({ hash: ALL_HASHES.single });
                new RouterEngine(parent); // Child inherits from parent
            }).toThrow();
        });
    });
});

// ========================================
// Comprehensive Universe-Based Tests
// ========================================

ROUTING_UNIVERSES.forEach(universe => {
    describe(`RouterEngine (${universe.text})`, () => {
        let cleanup: () => void;
        let browserMocks: ReturnType<typeof setupBrowserMocks>;

        beforeAll(() => {
            browserMocks = setupBrowserMocks("http://example.com/", location);
            cleanup = init({
                hashMode: universe.hashMode,
                defaultHash: universe.defaultHash
            });
        });

        beforeEach(() => {
            location.url.href = "http://example.com/";
            browserMocks.setUrl(location.url.href);
        });

        afterAll(() => {
            cleanup();
            browserMocks.cleanup();
        });

        describe('constructor', () => {
            test("Should create router with correct hash configuration", () => {
                // Act.
                const router = new RouterEngine({ hash: universe.hash });

                // Assert.
                expect(router).toBeDefined();
                // Additional assertions could check internal hash configuration
            });
        });

        describe('basePath', () => {
            test("Should be '/' by default", () => {
                // Act.
                const router = new RouterEngine({ hash: universe.hash });

                // Assert.
                expect(router.basePath).toBe('/');
            });

            test("Should be the parent's basePath plus the router's basePath", () => {
                // Arrange.
                const parent = new RouterEngine({ hash: universe.hash });
                parent.basePath = '/parent';
                const router = new RouterEngine(parent);
                router.basePath = '/child';

                // Act.
                const basePath = router.basePath;

                // Assert.
                expect(basePath).toBe('/parent/child');
            });

            test("Should remove the trailing slash.", () => {
                // Arrange.
                const router = new RouterEngine({ hash: universe.hash });
                router.basePath = '/abc/';

                // Act.
                const basePath = router.basePath;

                // Assert.
                expect(basePath).toBe('/abc');
            });
        });

        describe('url', () => {
            test("Should return the current URL.", () => {
                // Arrange.
                const router = new RouterEngine({ hash: universe.hash });
                location.url.href = "http://example.com/path?query#hash";

                // Act.
                const url = router.url;

                // Assert.
                expect(url).toBe(location.url);
            });
        });

        describe('state', () => {
            test("Should return the current state for the routing universe", () => {
                // Arrange.
                const router = new RouterEngine({ hash: universe.hash });
                const state: State = { path: 1, hash: { single: 2, p1: 3 } };

                // Act.
                browserMocks.history.pushState(state, '', 'http://example.com/other');
                browserMocks.triggerPopstate(state);

                // Assert.
                let expectedState: any;
                if (universe.hash === false) {
                    expectedState = state.path;
                } else if (universe.hash === true) {
                    expectedState = state.hash.single;
                } else if (typeof universe.hash === 'string') {
                    expectedState = state.hash[universe.hash];
                } else {
                    // For implicit modes (hash === undefined), the behavior depends on defaultHash
                    if (universe.defaultHash === false) {
                        expectedState = state.path;
                    } else if (universe.defaultHash === true) {
                        expectedState = state.hash.single;
                    } else if (typeof universe.defaultHash === 'string') {
                        expectedState = state.hash[universe.defaultHash];
                    }
                }
                expect(router.state).toBe(expectedState);
            });
        });

        describe('routes', () => {
            test("Should recalculate the route patterns whenever a new route is added.", () => {
                // Arrange.
                const router = new RouterEngine({ hash: universe.hash });
                const route: RouteInfo = {
                    path: '/path',
                    caseSensitive: false,
                };
                expect(Object.keys(router.routes).length).toBe(0);

                // Act.
                router.routes['route'] = route;

                // Assert.
                expect(router[routePatternsKey]().has('route')).toBe(true);
            });

            test("Should recalculate the route patterns whenever a route is removed.", () => {
                // Arrange.
                const router = new RouterEngine({ hash: universe.hash });
                const route: RouteInfo = {
                    path: '/path',
                    caseSensitive: false,
                };
                router.routes['route'] = route;
                expect(Object.keys(router.routes).length).toBe(1);

                // Act.
                delete router.routes['route'];

                // Assert.
                expect(router[routePatternsKey]().has('route')).toBe(false);
            });

            test("Should recalculate the route patterns whenever a route is updated.", () => {
                // Arrange.
                const router = new RouterEngine({ hash: universe.hash });
                const route: RouteInfo = {
                    path: '/path',
                    caseSensitive: false,
                };
                router.routes['route'] = route;
                expect(Object.keys(router.routes).length).toBe(1);

                // Act.
                router.routes['route'].path = '/other';

                // Assert.
                expect(router[routePatternsKey]().has('route')).toBe(true);
                expect(router[routePatternsKey]().get('route')!.regex!.test('/other')).toBe(true);
            });

            describe('Route Patterns', () => {
                test.each(
                    [
                        {
                            pattern: '/path',
                            testPathname: '/path',
                            text: 'zero parameters',
                        },
                        {
                            pattern: '/:one',
                            testPathname: '/path',
                            text: '1 parameter',
                            params: {
                                one: 'path',
                            }
                        },
                        {
                            pattern: '/:one/:two',
                            testPathname: '/path/value',
                            text: '2 parameters',
                            params: {
                                one: 'path',
                                two: 'value',
                            }
                        },
                        {
                            pattern: '/some-:one/:two',
                            testPathname: '/some-path/value',
                            text: '2 parameters',
                            params: {
                                one: 'path',
                                two: 'value',
                            }
                        },
                        {
                            pattern: '/path/:one',
                            testPathname: '/path/value',
                            text: '1 parameter',
                            params: {
                                one: 'value',
                            }
                        },
                        {
                            pattern: '/path/:one/sub/:two',
                            testPathname: '/path/value/sub/other',
                            text: '2 parameters',
                            params: {
                                one: 'value',
                                two: 'other',
                            }
                        },
                        {
                            pattern: '/:one/sub/:two',
                            testPathname: '/value/sub/other',
                            text: '2 parameters',
                            params: {
                                one: 'value',
                                two: 'other',
                            }
                        },
                        {
                            pattern: '/path-to.:one/sub/:two',
                            testPathname: '/path-to.value/sub/other',
                            text: '2 parameters',
                            params: {
                                one: 'value',
                                two: 'other',
                            }
                        },
                        {
                            pattern: '/*',
                            testPathname: '/value',
                            text: '1 parameter',
                            params: {
                                rest: '/value',
                            }
                        },
                        {
                            pattern: '/*',
                            testPathname: '/value/two',
                            text: '1 parameter',
                            params: {
                                rest: '/value/two',
                            }
                        },
                        {
                            pattern: '/path/*',
                            testPathname: '/path/two',
                            text: '1 parameter',
                            params: {
                                rest: '/two',
                            }
                        },
                        {
                            pattern: '/path/:one/*',
                            testPathname: '/path/to/two',
                            text: '2 parameters',
                            params: {
                                one: 'to',
                                rest: '/two',
                            }
                        },
                        {
                            pattern: '/path-:one/*',
                            testPathname: '/path-to/two',
                            text: '2 parameters',
                            params: {
                                one: 'to',
                                rest: '/two',
                            }
                        },
                    ] as { pattern: string; testPathname: string; text: string; params?: Record<string, string> }[]
                )("Should identify $text in pattern $pattern testing with $testPathname .", ({ pattern, testPathname, params }) => {
                    // Arrange.
                    const router = new RouterEngine({ hash: universe.hash });
                    const route: RouteInfo = {
                        path: pattern,
                        caseSensitive: false,
                    };
                    router.routes['route'] = route;

                    // Act.
                    const matches = router[routePatternsKey]().get('route')!.regex?.exec(testPathname);

                    // Assert.
                    expect(matches).toBeDefined();
                    if (params) {
                        expect(matches!.groups).toBeDefined();
                        expect(Object.keys(matches!.groups!).length).toBe(Object.keys(params).length);
                        for (let key in params) {
                            expect(matches!.groups![key]).toBe(params[key]);
                        }
                    }
                });

                test.each([
                    {
                        pattern: '/path',
                        testPathname: '/other',
                    },
                    {
                        pattern: '/:one',
                        testPathname: '/path/other',
                    },
                    {
                        pattern: '/:one/:two',
                        testPathname: '/path',
                    },
                    {
                        pattern: '/path/:one',
                        testPathname: '/path',
                    },
                    {
                        pattern: '/path/:one/sub/:two',
                        testPathname: '/path/value/sub',
                    },
                    {
                        pattern: '/:one/sub/:two',
                        testPathname: '/value/sub',
                    },
                    {
                        pattern: '/path/*',
                        testPathname: '/value',
                    },
                    {
                        pattern: '/path/*',
                        testPathname: '/other/two',
                    },
                ])("Should not match pattern $pattern with pathname $testPathname .", ({ pattern, testPathname }) => {
                    // Arrange.
                    const router = new RouterEngine({ hash: universe.hash });
                    const route: RouteInfo = {
                        path: pattern,
                        caseSensitive: false,
                    };
                    router.routes['route'] = route;

                    // Act.
                    const matches = router[routePatternsKey]().get('route')!.regex?.exec(testPathname);

                    // Assert.
                    expect(matches).toBeNull();
                });

                test.each([
                    {
                        pattern: '/:one?',
                        testPathname: '/path',
                        text: '1 parameter',
                        willMatch: true,
                        params: {
                            one: 'path',
                        },
                    },
                    {
                        pattern: '/:one?',
                        testPathname: '/',
                        text: '0 parameters',
                        willMatch: true,
                    },
                    {
                        pattern: '/:one?',
                        testPathname: '/abc/def',
                        text: '0 parameters',
                        willMatch: false,
                    },
                    {
                        pattern: '/:one/:two?',
                        testPathname: '/abc/def',
                        text: '2 parameters',
                        willMatch: true,
                        params: {
                            one: 'abc',
                            two: 'def',
                        },
                    },
                    {
                        pattern: '/:one/or%20:two?',
                        testPathname: '/abc/or%20def',
                        text: '2 parameters',
                        willMatch: true,
                        params: {
                            one: 'abc',
                            two: 'def',
                        },
                    },
                    {
                        pattern: '/:one/:two?',
                        testPathname: '/abc/',
                        text: '2 parameters',
                        willMatch: true,
                        params: {
                            one: 'abc',
                            two: undefined,
                        },
                    },
                    {
                        pattern: '/:one/:two?',
                        testPathname: '/abc',
                        text: '2 parameters',
                        willMatch: true,
                        params: {
                            one: 'abc',
                            two: undefined,
                        },
                    },
                    {
                        pattern: '/:one?/:two',
                        testPathname: '/abc',
                        text: '2 parameters',
                        willMatch: true,
                        params: {
                            one: undefined,
                            two: 'abc',
                        },
                    },
                    {
                        pattern: '/:one?/:two',
                        testPathname: '/abc/def',
                        text: '2 parameters',
                        willMatch: true,
                        params: {
                            one: 'abc',
                            two: 'def',
                        },
                    },
                    {
                        pattern: '/maybe-:one?/:two',
                        testPathname: '/maybe-/def',
                        text: '2 parameters',
                        willMatch: true,
                        params: {
                            one: undefined,
                            two: 'def',
                        },
                    },
                ] as {
                    pattern: string;
                    testPathname: string;
                    text: string;
                    willMatch: boolean;
                    params?: Record<string, string>;
                }[])("Should match $text in pattern $pattern with pathname $testPathname .", ({ pattern, testPathname, willMatch, params }) => {
                    // Arrange.
                    const router = new RouterEngine({ hash: universe.hash });
                    const route: RouteInfo = {
                        path: pattern,
                        caseSensitive: false,
                    };
                    router.routes['route'] = route;

                    // Act.
                    const matches = router[routePatternsKey]().get('route')!.regex?.exec(testPathname);

                    // Assert.
                    expect(!!matches).toBe(willMatch);
                    if (willMatch && params) {
                        expect(matches!.groups).toBeDefined();
                        expect(Object.keys(matches!.groups!).length).toBe(Object.keys(params).length);
                        for (let key in params) {
                            expect(matches!.groups![key]).toBe(params[key]);
                        }
                    }
                });
            });
        });

        describe('fallback', () => {
            test("Should be true whenever there are no routes registered.", () => {
                // Act.
                const router = new RouterEngine({ hash: universe.hash });

                // Assert.
                expect(router.fallback).toBe(true);
            });

            test("Should be true whenever there are no matching routes.", () => {
                // Arrange.
                const router = new RouterEngine({ hash: universe.hash });

                // Act.
                router.routes['route'] = {
                    path: '/:one/:two?',
                    caseSensitive: false,
                };

                // Assert.
                expect(router.fallback).toBe(true);
            });

            test.each([
                {
                    text: "is",
                    routeCount: 1,
                    totalRoutes: 5
                },
                {
                    text: "are",
                    routeCount: 2,
                    totalRoutes: 5
                },
                {
                    text: "are",
                    routeCount: 5,
                    totalRoutes: 5
                },
            ])("Should be false whenever there $text $routeCount matching route(s) out of $totalRoutes route(s).", ({ routeCount, totalRoutes }) => {
                // Arrange.
                const router = new RouterEngine({ hash: universe.hash });
                const nonMatchingCount = totalRoutes - routeCount;

                // Act.
                addRoutes(router, { matching: routeCount, nonMatching: nonMatchingCount });

                // Assert.
                expect(router.fallback).toBe(false);
            });

            test.each([
                1, 2, 5
            ])("Should be true whenever the %d matching route(s) are ignored for fallback.", (routeCount) => {
                // Arrange.
                const router = new RouterEngine({ hash: universe.hash });

                // Act.
                addRoutes(router, {
                    matching: {
                        count: routeCount,
                        specs: { ignoreForFallback: true }
                    }
                });

                // Assert.
                expect(router.fallback).toBe(true);
            });
        });
    });
});
