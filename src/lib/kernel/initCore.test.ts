import type { Location } from "../types.js";
import { describe, test, expect, afterEach, vi } from 'vitest';
import { initCore } from './initCore.js';
import { SvelteURL } from "svelte/reactivity";
import { location } from "./Location.js";
import { defaultTraceOptions, traceOptions } from "./trace.svelte.js";
import { defaultRoutingOptions, resetRoutingOptions, routingOptions } from "./options.js";
import { logger } from "./Logger.js";

const initialUrl = 'http://example.com/';
const locationMock: Location = {
    url: new SvelteURL(initialUrl),
    hashPaths: {},
    back: vi.fn(),
    dispose: vi.fn(),
    forward: vi.fn(),
    getState: vi.fn(),
    goTo: vi.fn(),
    on: vi.fn(),
    go: vi.fn(),
    navigate: vi.fn(),
    get path() { return this.url.pathname; },
};

describe('initCore', () => {
    let cleanup: (() => void) | undefined;
    afterEach(() => {
        vi.resetAllMocks();
        cleanup?.();
        resetRoutingOptions();
    });
    test("Should initialize with all the expected default values.", () => {
        // Act.
        cleanup = initCore(locationMock);

        // Assert.
        expect(location).toBe(locationMock);
        expect(traceOptions).toEqual(defaultTraceOptions);
        expect(routingOptions).toEqual(defaultRoutingOptions);
        expect(logger).toBe(globalThis.console);
    });
    test("Should throw an error when no location object is provided.", () => {
        // Act.
        const act = () => initCore(null as unknown as Location);

        // Assert.
        expect(act).toThrow();
    });
    test("Should initialize with custom options and rollback properly.", async () => {
        // Arrange.
        const customLogger = {
            debug: () => { },
            log: () => { },
            warn: () => { },
            error: () => { }
        };

        // Act - Initialize with custom options (use valid combo)
        cleanup = initCore(locationMock, {
            hashMode: 'multi',
            defaultHash: 'customHash',
            logger: customLogger,
            trace: {
                routerHierarchy: true
            }
        });

        // Assert - Check that options were applied
        expect(logger).toBe(customLogger);
        expect(routingOptions.hashMode).toBe('multi');
        expect(routingOptions.defaultHash).toBe('customHash');
        expect(traceOptions.routerHierarchy).toBe(true);
        expect(location).toBeDefined();

        // Act - Cleanup
        cleanup();
        cleanup = undefined;

        // Assert - Check that everything was rolled back to library defaults
        expect(logger).not.toBe(customLogger); // Should revert to offLogger
        expect(routingOptions.hashMode).toBe(defaultRoutingOptions.hashMode);
        expect(routingOptions.defaultHash).toBe(defaultRoutingOptions.defaultHash);
        expect(traceOptions.routerHierarchy).toBe(defaultTraceOptions.routerHierarchy);
        expect(location).toBeNull();
    });
    test("Should throw an error when called a second time without proper prior cleanup.", () => {
        // Arrange.
        cleanup = initCore(locationMock);

        // Act.
        const act = () => initCore(locationMock);

        // Assert.
        expect(act).toThrow();
    });
    describe('cleanup', () => {
        test("Should rollback everything to defaults.", async () => {
            // Arrange - Initialize with custom options
            cleanup = initCore(locationMock, {
                hashMode: 'multi',
                defaultHash: 'abc',
                trace: {
                    routerHierarchy: !defaultTraceOptions.routerHierarchy
                }
            });
            // Verify options were applied (no type conversion occurs)
            expect(routingOptions.hashMode).toBe('multi');
            expect(routingOptions.defaultHash).toBe('abc');
            expect(logger).toBe(globalThis.console); // Default logger when none specified
            expect(traceOptions.routerHierarchy).toBe(!defaultTraceOptions.routerHierarchy);

            // Act - Cleanup
            cleanup();
            cleanup = undefined;

            // Assert - Check that all options were reset to library defaults
            expect(routingOptions.hashMode).toBe(defaultRoutingOptions.hashMode);
            expect(routingOptions.defaultHash).toBe(defaultRoutingOptions.defaultHash);
            expect(logger).not.toBe(globalThis.console); // Reverts to offLogger (uninitialized state)
            expect(traceOptions).toEqual(defaultTraceOptions);
        });
        test("Should handle multiple init/cleanup cycles properly.", async () => {
            // Capture initial logger state for comparison
            const initialLogger = logger;
            
            // First cycle
            cleanup = initCore(locationMock, {
                logger: { debug: () => { }, log: () => { }, warn: () => { }, error: () => { } }
            });
            expect(logger).not.toBe(initialLogger);
            expect(location).toBeDefined();
            
            cleanup();
            cleanup = undefined;
            expect(logger).toBe(initialLogger); // Back to initial state
            expect(location).toBeNull();
            
            // Second cycle
            cleanup = initCore(locationMock, { hashMode: 'multi' });
            expect(routingOptions.hashMode).toBe('multi');
            expect(location).toBeDefined();

            // Act - Final cleanup
            cleanup();
            cleanup = undefined;

            // Assert - Should revert to library defaults
            expect(routingOptions.hashMode).toBe(defaultRoutingOptions.hashMode);
            expect(location).toBeNull();
        });
    });
});
