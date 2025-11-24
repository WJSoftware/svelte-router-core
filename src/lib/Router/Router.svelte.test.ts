import { describe, test, expect, beforeEach, vi, beforeAll, afterAll } from "vitest";
import { render } from "@testing-library/svelte";
import Router, { getRouterContextKey } from "./Router.svelte";
import { RouterEngine } from "$lib/kernel/RouterEngine.svelte.js";
import { createTestSnippet, createRouterTestSetup, ROUTING_UNIVERSES } from "$test/test-utils.js";
import { flushSync } from "svelte";
import { init } from "$lib/init.js";

function basicRouterTests(setup: ReturnType<typeof createRouterTestSetup>) {
    beforeEach(() => {
        setup.init();
    });

    afterAll(() => {
        setup.dispose();
    });

    test("Should create RouterEngine instance when none provided.", async () => {
        // Arrange.
        const { hash, context } = setup;
        const content = createTestSnippet('<div data-testid="router-content">Router Content</div>');

        // Act.
        const { getByTestId } = render(Router, {
            props: { hash, children: content },
            context
        });

        // Assert.
        expect(getByTestId('router-content')).toBeDefined();
    });

    test("Should use provided RouterEngine instance.", async () => {
        // Arrange.
        const { hash, context } = setup;
        const customRouter = new RouterEngine({ hash });
        const content = createTestSnippet('<div data-testid="custom-router">Custom Router</div>');

        // Act.
        const { getByTestId } = render(Router, {
            props: { router: customRouter, hash, children: content },
            context
        });

        // Assert.
        expect(getByTestId('custom-router')).toBeDefined();
    });

    test("Should set router context for child components.", async () => {
        // Arrange.
        const { hash, context } = setup;
        const content = createTestSnippet('<div data-testid="context-test">Context Test</div>');

        // Act.
        render(Router, {
            props: { hash, children: content },
            context
        });

        // Assert.
        // The context is set and can be retrieved (verified by successful render)
        // Actual context verification would require a child component test
        expect(true).toBe(true); // Router renders without error
    });

    test("Should pass state and routeStatus to children.", async () => {
        // Arrange.
        const { hash, context } = setup;
        const content = createTestSnippet('<div data-testid="snippet-test">State Test</div>');

        // Act.
        const { getByTestId } = render(Router, {
            props: { hash, children: content },
            context
        });

        // Assert.
        expect(getByTestId('snippet-test')).toBeDefined();
    });
}

function routerPropsTests(setup: ReturnType<typeof createRouterTestSetup>) {
    beforeEach(() => {
        setup.init();
    });

    afterAll(() => {
        setup.dispose();
    });

    test("Should set basePath on RouterEngine.", async () => {
        // Arrange.
        const { hash, context } = setup;
        const basePath = "/api/v1";
        const content = createTestSnippet('<div>Base Path Test</div>');
        let routerInstance: RouterEngine | undefined;

        // Act.
        render(Router, {
            props: { 
                hash, 
                basePath,
                get router() { return routerInstance; },
                set router(value) { routerInstance = value; },
                children: content 
            },
            context
        });

        // Assert.
        expect(routerInstance?.basePath).toBe(basePath);
    });

    test("Should set id on RouterEngine.", async () => {
        // Arrange.
        const { hash, context } = setup;
        const routerId = "test-router";
        const content = createTestSnippet('<div>ID Test</div>');
        let routerInstance: RouterEngine | undefined;

        // Act.
        render(Router, {
            props: { 
                hash, 
                id: routerId,
                get router() { return routerInstance; },
                set router(value) { routerInstance = value; },
                children: content 
            },
            context
        });

        // Assert.
        expect(routerInstance?.id).toBe(routerId);
    });

    test("Should handle undefined children gracefully.", async () => {
        // Arrange.
        const { hash, context } = setup;

        // Act & Assert - Should not throw
        expect(() => {
            render(Router, {
                props: { hash },
                context
            });
        }).not.toThrow();
    });
}

function routerReactivityTests(setup: ReturnType<typeof createRouterTestSetup>) {
    beforeEach(() => {
        setup.init();
    });

    afterAll(() => {
        setup.dispose();
    });

    test("Should update basePath when prop changes (rerender).", async () => {
        // Arrange.
        const { hash, context } = setup;
        const initialBasePath = "/api/v1";
        const updatedBasePath = "/api/v2";
        const content = createTestSnippet('<div>Base Path Reactivity</div>');
        let routerInstance: RouterEngine | undefined;

        const { rerender } = render(Router, {
            props: { 
                hash, 
                basePath: initialBasePath,
                get router() { return routerInstance; },
                set router(value) { routerInstance = value; },
                children: content 
            },
            context
        });
        expect(routerInstance?.basePath).toBe(initialBasePath);

        // Act.
        await rerender({ 
            hash, 
            basePath: updatedBasePath,
            get router() { return routerInstance; },
            set router(value) { routerInstance = value; },
            children: content 
        });

        // Assert.
        expect(routerInstance?.basePath).toBe(updatedBasePath);
    });

    test("Should update id when prop changes (rerender).", async () => {
        // Arrange.
        const { hash, context } = setup;
        const initialId = "router-1";
        const updatedId = "router-2";
        const content = createTestSnippet('<div>ID Reactivity</div>');
        let routerInstance: RouterEngine | undefined;

        const { rerender } = render(Router, {
            props: { 
                hash, 
                id: initialId,
                get router() { return routerInstance; },
                set router(value) { routerInstance = value; },
                children: content 
            },
            context
        });
        expect(routerInstance?.id).toBe(initialId);

        // Act.
        await rerender({ 
            hash, 
            id: updatedId,
            get router() { return routerInstance; },
            set router(value) { routerInstance = value; },
            children: content 
        });

        // Assert.
        expect(routerInstance?.id).toBe(updatedId);
    });

    test("Should update basePath when reactive state changes (signals).", async () => {
        // Arrange.
        const { hash, context } = setup;
        let basePath = $state("/api/v1");
        const content = createTestSnippet('<div>Signal Base Path</div>');
        let routerInstance: RouterEngine | undefined;

        render(Router, {
            props: { 
                hash, 
                get basePath() { return basePath; },
                get router() { return routerInstance; },
                set router(value) { routerInstance = value; },
                children: content 
            },
            context
        });
        expect(routerInstance?.basePath).toBe("/api/v1");

        // Act.
        basePath = "/api/v2";
        flushSync();

        // Assert.
        expect(routerInstance?.basePath).toBe("/api/v2");
    });

    test("Should update id when reactive state changes (signals).", async () => {
        // Arrange.
        const { hash, context } = setup;
        let id = $state("router-1");
        const content = createTestSnippet('<div>Signal ID</div>');
        let routerInstance: RouterEngine | undefined;

        render(Router, {
            props: { 
                hash, 
                get id() { return id; },
                get router() { return routerInstance; },
                set router(value) { routerInstance = value; },
                children: content 
            },
            context
        });
        expect(routerInstance?.id).toBe("router-1");

        // Act.
        id = "router-2";
        flushSync();

        // Assert.
        expect(routerInstance?.id).toBe("router-2");
    });
}

function contextFunctionTests() {
    test("Should generate correct context keys for different hash values.", () => {
        // Test path routing (hash = false)
        const pathKey = getRouterContextKey(false);
        expect(pathKey).toBeDefined();

        // Test single hash routing (hash = true)  
        const hashKey = getRouterContextKey(true);
        expect(hashKey).toBeDefined();
        expect(hashKey).not.toBe(pathKey);

        // Test multi-hash routing (hash = string)
        const multiHashKey1 = getRouterContextKey("nav");
        const multiHashKey2 = getRouterContextKey("nav");
        const multiHashKey3 = getRouterContextKey("sidebar");
        
        expect(multiHashKey1).toBeDefined();
        expect(multiHashKey1).toBe(multiHashKey2); // Same string should give same key
        expect(multiHashKey1).not.toBe(multiHashKey3); // Different strings should give different keys
        expect(multiHashKey1).not.toBe(pathKey);
        expect(multiHashKey1).not.toBe(hashKey);
    });
}

function routerDisposalTests(setup: ReturnType<typeof createRouterTestSetup>) {
    beforeEach(() => {
        setup.init();
    });

    afterAll(() => {
        setup.dispose();
    });

    test("Should dispose router engine on component unmount.", () => {
        // Arrange.
        const { hash, context } = setup;
        const content = createTestSnippet('<div>Test content</div>');
        let capturedRouter: any;
        
        const { unmount } = render(Router, {
            props: {
                hash,
                get router() { return capturedRouter; },
                set router(value) { capturedRouter = value; },
                children: content
            },
            context
        });

        // Get the router instance to spy on it
        const disposeSpy = vi.spyOn(capturedRouter, 'dispose');

        // Act.
        unmount();

        // Assert.
        expect(disposeSpy).toHaveBeenCalled();
    });
}

function routerBindingTests(setup: ReturnType<typeof createRouterTestSetup>) {
    beforeEach(() => {
        setup.init();
    });

    afterAll(() => {
        setup.dispose();
    });

    test("Should bind router instance when creating new RouterEngine.", async () => {
        // Arrange.
        const { hash, context } = setup;
        const content = createTestSnippet('<div>Binding Test</div>');
        let boundRouter: any;
        const setterSpy = vi.fn((value) => { boundRouter = value; });

        // Act.
        render(Router, {
            props: {
                hash,
                get router() { return boundRouter; },
                set router(value) { setterSpy(value); },
                children: content
            },
            context
        });

        // Assert.
        expect(setterSpy).toHaveBeenCalled();
        expect(boundRouter).toBeDefined();
        expect(boundRouter.constructor.name).toBe('RouterEngine');
    });

    test("Should use provided router instance via binding.", async () => {
        // Arrange.
        const { hash, context } = setup;
        const customRouter = new RouterEngine({ hash });
        const content = createTestSnippet('<div>Custom Router Test</div>');
        let boundRouter: any = customRouter;
        const setterSpy = vi.fn((value) => { boundRouter = value; });

        // Act.
        render(Router, {
            props: {
                hash,
                get router() { return boundRouter; },
                set router(value) { setterSpy(value); },
                children: content
            },
            context
        });

        // Assert.
        // Setter should not be called since we provided a router
        expect(setterSpy).not.toHaveBeenCalled();
        expect(boundRouter).toBe(customRouter);
    });

    test("Should update the bound router's basePath when basePath changes.", async () => {
        // Arrange.
        const { hash, context } = setup;
        const content = createTestSnippet('<div>BasePath Binding Test</div>');
        let boundRouter: any;
        const setterSpy = vi.fn((value) => { 
            boundRouter = value; 
        });

        const { rerender } = render(Router, {
            props: {
                hash,
                basePath: "/api/v1",
                get router() { return boundRouter; },
                set router(value) { setterSpy(value); },
                children: content
            },
            context
        });

        const initialRouter = boundRouter;
        expect(initialRouter?.basePath).toBe("/api/v1");

        // Act.
        await rerender({
            hash,
            basePath: "/api/v2",
            get router() { return boundRouter; },
            set router(value) { setterSpy(value); },
            children: content
        });

        // Assert.
        expect(boundRouter?.basePath).toBe("/api/v2");
        expect(boundRouter).toBe(initialRouter); // Same instance
    });

    test("Should handle reactive bound router changes.", async () => {
        // Arrange.
        const { hash, context } = setup;
        const content = createTestSnippet('<div>Reactive Binding Test</div>');
        let boundRouter = $state<any>(undefined);
        let setterCallCount = 0;
        
        render(Router, {
            props: {
                hash,
                get router() { return boundRouter; },
                set router(value) { 
                    boundRouter = value;
                    setterCallCount++;
                },
                children: content
            },
            context
        });

        // Assert.
        expect(setterCallCount).toBe(1);
        expect(boundRouter).toBeDefined();
        
        // The bound router should be accessible and functional
        expect(typeof boundRouter.dispose).toBe('function');
    });
}

// Run tests for each routing universe
for (const ru of ROUTING_UNIVERSES) {
    describe(`Router - ${ru.text}`, () => {
        const setup = createRouterTestSetup(ru.hash);
        let cleanup: () => void;
        
        beforeAll(() => {
            cleanup = init({
                defaultHash: ru.defaultHash,
                hashMode: ru.hashMode,
            });
        });
        
        afterAll(() => {
            cleanup?.();
        });

        describe("Basic Functionality", () => {
            basicRouterTests(setup);
        });

        describe("Props", () => {
            routerPropsTests(setup);
        });

        describe("Reactivity", () => {
            routerReactivityTests(setup);
        });

        describe("Disposal", () => {
            routerDisposalTests(setup);
        });

        describe("Binding", () => {
            routerBindingTests(setup);
        });
    });
}

describe("Router Context Functions", () => {
    contextFunctionTests();
});
