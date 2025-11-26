import { init } from "$lib/init.js";
import { describe, test, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { render } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import Fallback from "./Fallback.svelte";
import { addMatchingRoute, addRoutes, createRouterTestSetup, createTestSnippet, ROUTING_UNIVERSES, ALL_HASHES } from "$test/test-utils.js";
import { flushSync } from "svelte";
import { resetRoutingOptions, setRoutingOptions } from "$lib/kernel/options.js";
import type { ExtendedRoutingOptions, RouterChildrenContext } from "$lib/types.js";
import { location } from "$lib/kernel/Location.js";

function defaultPropsTests(setup: ReturnType<typeof createRouterTestSetup>) {
    const contentText = "Fallback content.";
    const content = createTestSnippet(contentText);

    beforeEach(() => {
        // Fresh router instance for each test
        setup.init();
    });

    afterAll(() => {
        // Clean disposal after all tests
        setup.dispose();
    });

    test("Should render whenever the parent router matches no routes.", async () => {
        // Arrange.
        const { hash, router, context } = setup;

        // Act.
        const { findByText } = render(Fallback, { props: { hash, children: content }, context });

        // Assert.
        await expect(findByText(contentText)).resolves.toBeDefined();
    });

    test("Should not render whenever the parent router matches at least one route.", async () => {
        // Arrange.
        const { hash, router, context } = setup;
        addMatchingRoute(router);

        // Act.
        const { queryByText } = render(Fallback, { props: { hash, children: content }, context });

        // Assert.
        expect(queryByText(contentText)).toBeNull();
    });
}

function explicitPropsTests(setup: ReturnType<typeof createRouterTestSetup>) {
    const contentText = "Fallback content.";
    const content = createTestSnippet(contentText);

    beforeEach(() => {
        // Fresh router instance for each test
        setup.init();
    });

    afterAll(() => {
        // Clean disposal after all tests
        setup.dispose();
    });

    test.each([
        {
            routes: {
                matching: 1
            },
            text: "matching routes"
        },
        {
            routes: {
                nonMatching: 1
            },
            text: "no matching routes"
        }
    ])("Should render when the 'when' predicate returns true when there are $text .", async ({ routes }) => {
        // Arrange.
        const { hash, router, context } = setup;
        addRoutes(router, routes);

        // Act.
        const { findByText } = render(Fallback, {
            props: { hash, when: () => true, children: content },
            context
        });

        // Assert.
        await expect(findByText(contentText)).resolves.toBeDefined();
    });
    test.each([
        {
            routes: {
                matching: 1
            },
            text: "matching routes"
        },
        {
            routes: {
                nonMatching: 1
            },
            text: "no matching routes"
        }
    ])("Should not render when the 'when' predicate returns false when there are $text .", async ({ routes }) => {
        // Arrange.
        const { hash, router, context } = setup;
        addRoutes(router, routes);

        // Act.
        const { queryByText } = render(Fallback, {
            props: { hash, when: () => false, children: content },
            context
        });

        // Assert.
        expect(queryByText(contentText)).toBeNull();
    });
}

function reactivityTests(setup: ReturnType<typeof createRouterTestSetup>) {
    const contentText = "Fallback content.";
    const content = createTestSnippet(contentText);

    beforeEach(() => {
        // Fresh router instance for each test
        setup.init();
    });

    afterAll(() => {
        // Clean disposal after all tests
        setup.dispose();
    });

    test("Should re-render when the 'when' predicate function is exchanged.", async () => {
        // Arrange.
        const { hash, router, context } = setup;
        const { findByText, queryByText, rerender } = render(Fallback, {
            props: { hash, when: () => false, children: content },
            context
        });
        expect(queryByText(contentText)).toBeNull();

        // Act.
        await rerender({ hash, when: () => true, children: content });

        // Assert.
        await expect(findByText(contentText)).resolves.toBeDefined();
    });
    test("Should re-render when the 'when' predicate function reactively changes its return value.", async () => {
        // Arrange.
        const { hash, router, context } = setup;
        let rv = $state(false);
        const { findByText, queryByText, rerender } = render(Fallback, {
            props: { hash, when: () => rv, children: content },
            context
        });
        expect(queryByText(contentText)).toBeNull();

        // Act.
        rv = true;
        flushSync();

        // Assert.
        await expect(findByText(contentText)).resolves.toBeDefined();
    });
}


function fallbackChildrenSnippetContextTests(setup: ReturnType<typeof createRouterTestSetup>) {
    beforeEach(() => {
        // Fresh router instance for each test
        setup.init();
    });

    afterAll(() => {
        // Clean disposal after all tests
        setup.dispose();
    });

    test("Should pass RouterChildrenContext with correct structure to children snippet when fallback activates.", async () => {
        // Arrange.
        const { hash, context } = setup;
        let capturedContext: RouterChildrenContext;
        const content = createRawSnippet<[RouterChildrenContext]>((contextObj) => {
            capturedContext = contextObj();
            return { render: () => '<div>Fallback Context Test</div>' };
        });

        // Act.
        render(Fallback, {
            props: { hash, children: content },
            context
        });

        // Assert.
        expect(capturedContext!).toBeDefined();
        expect(capturedContext!).toHaveProperty('state');
        expect(capturedContext!).toHaveProperty('rs');
        expect(typeof capturedContext!.rs).toBe('object');
    });

    test("Should provide current router state in children snippet context.", async () => {
        // Arrange.
        const { hash, context } = setup;
        let capturedContext: RouterChildrenContext;
        const newState = { msg: "Test State" };
        location.navigate('/', { state: newState });
        const content = createRawSnippet<[RouterChildrenContext]>((contextObj) => {
            capturedContext = contextObj();
            return { render: () => '<div>Fallback State Test</div>' };
        });

        // Act.
        render(Fallback, {
            props: { hash, children: content },
            context
        });

        // Assert.
        expect(capturedContext!.state).toBeDefined();
        expect(capturedContext!.state).toEqual(newState);
    });

    test("Should provide route status record in children snippet context.", async () => {
        // Arrange.
        const { hash, router, context } = setup;
        let capturedContext: RouterChildrenContext;
        const content = createRawSnippet<[RouterChildrenContext]>((contextObj) => {
            capturedContext = contextObj();
            return { render: () => '<div>Fallback RouteStatus Test</div>' };
        });

        // Add some non-matching routes to verify structure
        addRoutes(router, { nonMatching: 2 });

        // Act.
        render(Fallback, {
            props: { hash, children: content },
            context
        });

        // Assert.
        expect(capturedContext!.rs).toBeDefined();
        expect(typeof capturedContext!.rs).toBe('object');
        expect(Object.keys(capturedContext!.rs)).toHaveLength(2);
        // Verify each route status has correct structure
        Object.keys(capturedContext!.rs).forEach(key => {
            expect(capturedContext?.rs[key]).toHaveProperty('match');
            expect(typeof capturedContext?.rs[key].match).toBe('boolean');
        });
    });

    test("Should not render children snippet when parent router has matching routes.", async () => {
        // Arrange.
        const { hash, router, context } = setup;
        let capturedContext: RouterChildrenContext;
        let callCount = 0;
        const content = createRawSnippet<[RouterChildrenContext]>((contextObj) => {
            capturedContext = contextObj();
            callCount++;
            return { render: () => '<div>Should Not Render</div>' };
        });

        // Add matching route to prevent fallback activation
        addMatchingRoute(router);

        // Act.
        render(Fallback, {
            props: { hash, children: content },
            context
        });

        // Assert - snippet should not be called when routes are matching.
        expect(callCount).toBe(0);
    });
}

describe("Routing Mode Assertions", () => {
    const contentText = "Fallback content.";
    const content = createTestSnippet(contentText);
    let cleanup: () => void;

    beforeAll(() => {
        cleanup = init();
    });

    beforeEach(() => {
        resetRoutingOptions();
    });

    afterAll(() => {
        resetRoutingOptions();
        cleanup();
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
    ])("Should throw error when $description and hash=$hash .", ({ options, hash }) => {
        // Arrange
        setRoutingOptions(options);

        // Act & Assert
        expect(() => {
            render(Fallback, {
                props: { hash, children: content },
            });
        }).toThrow();
    });
});

ROUTING_UNIVERSES.forEach(ru => {
    describe(`Fallback - ${ru.text}`, () => {
        const setup = createRouterTestSetup(ru.hash);
        let cleanup: () => void;
        beforeAll(() => {
            cleanup = init({
                defaultHash: ru.defaultHash,
                hashMode: ru.hashMode,
            });
        });
        afterAll(() => {
            cleanup();
        });
        describe("Default Props", () => {
            defaultPropsTests(setup);
        });
        describe("Explicit Props", () => {
            explicitPropsTests(setup);
        });
        describe("Reactivity", () => {
            reactivityTests(setup);
        });

        describe("Children Snippet Context", () => {
            fallbackChildrenSnippetContextTests(setup);
        });
    });
});
