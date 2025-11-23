import { afterAll, afterEach, beforeAll, describe, expect, vi, type MockInstance } from "vitest";
import { testWithEffect as test } from "$test/testWithEffect.svelte.js";
import { ALL_HASHES, ROUTING_UNIVERSES } from "$test/test-utils.js";
import { init } from "$lib/init.js";
import type { Hash, PatternRouteInfo, RedirectedRouteInfo } from "$lib/types.js";
import { resolveHashValue } from "./resolveHashValue.js";
import { Redirector } from "./Redirector.svelte.js";
import { location } from "./Location.js";
import { flushSync } from "svelte";

ROUTING_UNIVERSES.forEach((universe) => {
    describe(`Redirector - ${universe.text}`, () => {
        let cleanup: () => void;
        let resolvedHash: Hash;
        let ruPath: () => string;
        let navigateSpy: MockInstance<typeof location.navigate>;
        let goToSpy: MockInstance<typeof location.goTo>;
        beforeAll(() => {
            cleanup = init(universe);
            resolvedHash = resolveHashValue(universe.hash);
            switch (resolvedHash) {
                case ALL_HASHES.path:
                    ruPath = () => location.path;
                    break;
                case ALL_HASHES.single:
                    ruPath = () => location.hashPaths.single;
                    break;
                case ALL_HASHES.multi:
                    ruPath = () => location.hashPaths[ALL_HASHES.multi];
                    break;
            }
            navigateSpy = vi.spyOn(location, 'navigate');
            goToSpy = vi.spyOn(location, 'goTo');
        });
        afterAll(() => {
            cleanup();
        });
        afterEach(() => {
            location.goTo('/');
            vi.clearAllMocks();
        });

        describe("redirections", () => {
            const tests: (RedirectedRouteInfo & {
                triggerUrl: string;
                expectedPath: string;
                text: string;
            })[] = [
                    {
                        triggerUrl: '/old/path',
                        pattern: '/old/path',
                        href: '/new/path',
                        expectedPath: '/new/path',
                        text: "Static pattern; static href"
                    },
                    {
                        pattern: '/old-path/:id',
                        triggerUrl: '/old-path/123',
                        expectedPath: '/new-path/123',
                        href: (rp) => `/new-path/${rp?.id}`,
                        text: "Parameterized pattern; dynamic href"
                    },
                    {
                        pattern: '/old-path/*',
                        triggerUrl: '/old-path/any/number/of/segments',
                        expectedPath: '/new-path/any/number/of/segments',
                        href: (rp) => `/new-path${rp?.rest}`,
                        text: "Rest parameter; dynamic href"
                    },
                    {
                        pattern: '/conditional/:id',
                        triggerUrl: '/conditional/123',
                        expectedPath: '/allowed/123',
                        href: (rp) => `/allowed/${rp?.id}`,
                        and: (rp) => (rp?.id as number) > 100,
                        text: "Conditional redirection with and predicate (allowed)"
                    },
                ];
            tests.forEach((tc) => {
                test(`Should navigate to ${tc.expectedPath} under conditions: ${tc.text}.`, () => {
                    // Arrange.
                    const newPath = "/new-path/123";
                    location.navigate(tc.triggerUrl, { hash: universe.hash });
                    const redirector = new Redirector(universe.hash);
                    navigateSpy.mockClear();

                    // Act.
                    redirector.redirections.push({
                        ...tc
                    });
                    flushSync();

                    // Assert.
                    expect(navigateSpy).toHaveBeenCalledTimes(1);
                    expect(ruPath()).toBe(tc.expectedPath);
                });
            });
        });
        test("Should use 'goTo' for navigation when specified in redirection info.", () => {
            // Arrange.
            location.navigate('/old-path', { hash: universe.hash });
            navigateSpy.mockClear();
            const redirector = new Redirector(universe.hash);

            // Act.
            redirector.redirections.push({
                pattern: '/old-path',
                href: '/new-path',
                goTo: true,
            });
            flushSync();

            // Assert.
            expect(goToSpy).toHaveBeenCalledTimes(1);
            expect(navigateSpy).toHaveBeenCalledTimes(0);
        });

        test("Should not redirect when 'and' predicate returns false.", () => {
            // Arrange.
            location.navigate('/conditional/50', { hash: universe.hash });
            const redirector = new Redirector(universe.hash);
            navigateSpy.mockClear();

            // Act.
            redirector.redirections.push({
                pattern: '/conditional/:id',
                href: '/not-allowed',
                and: (rp) => (rp?.id as number) > 100,
            });
            flushSync();

            // Assert.
            expect(navigateSpy).toHaveBeenCalledTimes(0);
            expect(ruPath()).toBe('/conditional/50'); // Should stay on original path
        });

        test("Should redirect with first matching redirection when multiple match.", () => {
            // Arrange.
            location.navigate('/multi/test', { hash: universe.hash });
            const redirector = new Redirector(universe.hash);
            navigateSpy.mockClear();

            // Act.
            redirector.redirections.push(
                {
                    pattern: '/multi/*',
                    href: '/first-match',
                },
                {
                    pattern: '/multi/test',
                    href: '/second-match',
                }
            );
            flushSync();

            // Assert.
            expect(navigateSpy).toHaveBeenCalledTimes(1);
            expect(ruPath()).toBe('/first-match'); // Should use first matching redirection
        });

        test("Should respect replace option from constructor.", () => {
            // Arrange.
            location.navigate('/test-replace', { hash: universe.hash });
            const redirector = new Redirector(universe.hash, { replace: false });
            navigateSpy.mockClear();

            // Act.
            redirector.redirections.push({
                pattern: '/test-replace',
                href: '/replaced',
            });
            flushSync();

            // Assert.
            expect(navigateSpy).toHaveBeenCalledWith('/replaced', expect.objectContaining({
                replace: false
            }));
        });

        test("Should pass through redirection options to navigation method.", () => {
            // Arrange.
            location.navigate('/with-options', { hash: universe.hash });
            const redirector = new Redirector(universe.hash);
            navigateSpy.mockClear();

            // Act.
            redirector.redirections.push({
                pattern: '/with-options',
                href: '/target',
                options: { preserveQuery: true, state: { custom: 'data' } }
            });
            flushSync();

            // Assert.
            expect(navigateSpy).toHaveBeenCalledWith('/target', expect.objectContaining({
                preserveQuery: true,
                state: { custom: 'data' }
            }));
        });

        test("Should react to changes in additions to 'redirections' without a URL change.", () => {
            // Arrange.
            location.navigate('/test-reactivity', { hash: universe.hash });
            const redirector = new Redirector(universe.hash);

            // Add initial redirection that won't match
            redirector.redirections.push({
                pattern: '/different-path',
                href: '/not-relevant'
            });
            flushSync();
            navigateSpy.mockClear();

            // Act.
            redirector.redirections.push({
                pattern: '/test-reactivity',
                href: '/should-redirect'
            });
            flushSync();

            // Assert.
            expect(navigateSpy).toHaveBeenCalledTimes(1);
        });

        test("Should react to changes in the values of a redirection.", () => {
            // Arrange.
            location.navigate('/test-reactivity', { hash: universe.hash });
            const redirector = new Redirector(universe.hash);
            redirector.redirections.push({
                pattern: '/different-path',
                href: '/punch-line'
            });
            flushSync();
            navigateSpy.mockClear();

            // Act.
            (redirector.redirections[0] as PatternRouteInfo).pattern = '/test-reactivity';
            flushSync();

            // Assert.
            expect(navigateSpy).toHaveBeenCalledTimes(1);
            expect(ruPath()).toBe('/punch-line');
        });
    });
});

describe("Cross-universe Redirection", () => {
    describe("Path/Hash Scenarios", () => {
        let cleanup: () => void;
        let navigateSpy: MockInstance<typeof location.navigate>;
        let goToSpy: MockInstance<typeof location.goTo>;

        beforeAll(() => {
            // Initialize with path routing as the base universe
            cleanup = init({ defaultHash: false });
            navigateSpy = vi.spyOn(location, 'navigate');
            goToSpy = vi.spyOn(location, 'goTo');
        });

        afterAll(() => {
            cleanup();
        });

        afterEach(() => {
            location.goTo('/');
            vi.clearAllMocks();
        });

        test("Should redirect from path universe to hash universe.", () => {
            // Arrange.
            location.navigate('/old-path-route', { hash: false }); // Path universe navigation
            const redirector = new Redirector(false); // Monitor path universe
            flushSync();
            navigateSpy.mockClear();
            console.debug('Location before redirection:', location.url.href);

            // Act.
            redirector.redirections.push({
                pattern: '/old-path-route',
                href: '/new-hash-route',
                options: { hash: true }
            });
            flushSync();

            // Assert.
            expect(navigateSpy).toHaveBeenCalledWith('/new-hash-route', expect.objectContaining({
                hash: true,
            }));
            expect(location.hashPaths.single).toBe('/new-hash-route');
        });

        test("Should redirect from hash universe to path universe.", () => {
            // Arrange.
            location.navigate('/old-hash-route', { hash: true }); // Hash universe navigation
            const redirector = new Redirector(true); // Monitor hash universe
            navigateSpy.mockClear();

            // Act.
            redirector.redirections.push({
                pattern: '/old-hash-route',
                href: '/new-path-route',
                options: { hash: false } // Target path universe
            });
            flushSync();

            // Assert.
            expect(navigateSpy).toHaveBeenCalledWith('/new-path-route', expect.objectContaining({
                hash: false,
                replace: true
            }));
            expect(location.path).toBe('/new-path-route');
        });
    });
    describe("Multi-Hash Scenarios", () => {
        let cleanup: () => void;
        let navigateSpy: MockInstance<typeof location.navigate>;
        let goToSpy: MockInstance<typeof location.goTo>;

        beforeAll(() => {
            // Initialize with path routing as the base universe
            cleanup = init({ defaultHash: false, hashMode: 'multi' });
            navigateSpy = vi.spyOn(location, 'navigate');
            goToSpy = vi.spyOn(location, 'goTo');
        });

        afterAll(() => {
            cleanup();
        });

        afterEach(() => {
            location.goTo('/');
            vi.clearAllMocks();
        });
        const tests: {
            hash: Hash;
            destinationHash: Hash;
            finalPath: () => string;
            sourceName: string;
            destName: string;
        }[] = [
                {
                    hash: false,
                    destinationHash: 'p1',
                    finalPath: () => location.hashPaths.p1,
                    sourceName: 'the path universe',
                    destName: 'a named hash universe',
                },
                {
                    hash: 'p1',
                    destinationHash: false,
                    finalPath: () => location.path,
                    sourceName: 'a named hash universe',
                    destName: 'the path universe',
                },
                {
                    hash: 'p1',
                    destinationHash: 'p2',
                    finalPath: () => location.hashPaths.p2,
                    sourceName: 'a named hash universe',
                    destName: 'another named hash universe',
                },
            ];
        tests.forEach((tc) => {
            test(`Should redirect from ${tc.sourceName} to ${tc.destName}.`, () => {
                // Arrange.
                location.navigate('/old-path-route', { hash: tc.hash });
                const redirector = new Redirector(tc.hash);
                flushSync();
                navigateSpy.mockClear();

                // Act.
                redirector.redirections.push({
                    pattern: '/old-path-route',
                    href: '/new-hash-route',
                    options: { hash: tc.destinationHash }
                });
                flushSync();

                // Assert.
                expect(navigateSpy).toHaveBeenCalledWith('/new-hash-route', expect.objectContaining({
                    hash: tc.destinationHash,
                }));
                expect(tc.finalPath()).toBe('/new-hash-route');
            });
        });
    });
});
