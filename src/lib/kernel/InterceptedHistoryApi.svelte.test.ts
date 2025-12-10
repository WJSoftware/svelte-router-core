import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { InterceptedHistoryApi } from './InterceptedHistoryApi.svelte.js';
import type { State, BeforeNavigateEvent } from '../types.js';
import { setupBrowserMocks } from '$test/test-utils.js';

describe('InterceptedHistoryApi', () => {
    const initialUrl = 'http://example.com/';
    let historyApi: InterceptedHistoryApi;
    let browserMocks: ReturnType<typeof setupBrowserMocks>;
    let origPushState: typeof globalThis.window.history.pushState;
    let origReplaceState: typeof globalThis.window.history.replaceState;

    beforeEach(() => {
        browserMocks = setupBrowserMocks(initialUrl);
        origPushState = globalThis.window.history.pushState;
        origReplaceState = globalThis.window.history.replaceState;
        historyApi = new InterceptedHistoryApi();
    });

    afterEach(() => {
        historyApi.dispose();
        browserMocks.cleanup();
        vi.resetAllMocks();
    });

    describe('constructor', () => {
        test('Should create a new instance with the expected default values.', () => {
            // Assert.
            expect(historyApi.url.href).toBe(initialUrl);
        });

        test("Should replace window.history's pushState and replaceState methods.", () => {
            // Assert.
            expect(globalThis.window.history.pushState).not.toBe(origPushState);
            expect(globalThis.window.history.replaceState).not.toBe(origReplaceState);
        });

        test('Should use provided initial URL.', () => {
            // Arrange.
            const customUrl = 'http://example.com/custom';

            // Act.
            const customHistoryApi = new InterceptedHistoryApi(customUrl);

            // Assert.
            expect(customHistoryApi.url.href).toBe(customUrl);

            // Cleanup.
            customHistoryApi.dispose();
        });

        test('Should use provided initial state.', () => {
            // Arrange.
            const customState: State = {
                path: { custom: 'data' },
                hash: { single: { test: 'value' } }
            };

            // Act.
            const customHistoryApi = new InterceptedHistoryApi(initialUrl, customState);

            // Assert.
            expect(customHistoryApi.state).toEqual(customState);

            // Cleanup.
            customHistoryApi.dispose();
        });
    });

    describe('Event system', () => {
        describe('on', () => {
            test("Should register the provided callback for the 'beforeNavigate' event.", () => {
                // Arrange.
                const callback = vi.fn();
                const unSub = historyApi.on('beforeNavigate', callback);

                // Act.
                historyApi.pushState(null, '', 'http://example.com/other');

                // Assert.
                expect(callback).toHaveBeenCalledOnce();

                // Cleanup.
                unSub();
            });

            test('Should unregister the provided callback when the returned function is called.', () => {
                // Arrange.
                const callback = vi.fn();
                const unSub = historyApi.on('beforeNavigate', callback);
                historyApi.pushState(null, '', 'http://example.com');
                expect(callback).toHaveBeenCalledOnce();
                callback.mockReset();

                // Act.
                unSub();

                // Assert.
                historyApi.pushState(null, '', 'http://example.com/other');
                expect(callback).not.toHaveBeenCalled();
            });

            test('Should not affect other handlers when unregistering one of the event handlers.', () => {
                // Arrange.
                const callback1 = vi.fn();
                const callback2 = vi.fn();
                const unSub1 = historyApi.on('beforeNavigate', callback1);
                const unSub2 = historyApi.on('beforeNavigate', callback2);

                // Act.
                unSub1();

                // Assert.
                historyApi.pushState(null, '', 'http://example.com/other');
                expect(callback1).not.toHaveBeenCalled();
                expect(callback2).toHaveBeenCalledOnce();

                // Cleanup.
                unSub2();
            });

            test.each<{
                method: 'push' | 'replace';
                stateFn: 'pushState' | 'replaceState';
            }>([
                {
                    method: 'push',
                    stateFn: 'pushState'
                },
                {
                    method: 'replace',
                    stateFn: 'replaceState'
                }
            ])(
                "Should provide the URL, state and method $method via the event object of 'beforeNavigate'.",
                ({ method, stateFn }) => {
                    // Arrange.
                    const callback = vi.fn();
                    const state = { path: { test: 'value' }, hash: {} };
                    const unSub = historyApi.on('beforeNavigate', callback);

                    // Act.
                    historyApi[stateFn](state, '', 'http://example.com/other');

                    // Assert.
                    expect(callback).toHaveBeenCalledWith({
                        url: 'http://example.com/other',
                        method,
                        state,
                        wasCancelled: false,
                        cancelReason: undefined,
                        cancel: expect.any(Function)
                    });

                    // Cleanup.
                    unSub();
                }
            );

            test('Should set wasCancelled to true and cancelReason to the provided reason when the event is cancelled to subsequent callbacks.', () => {
                // Arrange.
                const callback = vi.fn();
                const unSub1 = historyApi.on('beforeNavigate', (event) => event.cancel('test'));
                const unSub2 = historyApi.on('beforeNavigate', callback);

                // Act.
                historyApi.pushState(null, '', 'http://example.com/other');

                // Assert.
                expect(callback).toHaveBeenCalledWith({
                    url: 'http://example.com/other',
                    method: 'push',
                    state: null,
                    wasCancelled: true,
                    cancelReason: 'test',
                    cancel: expect.any(Function)
                });

                // Cleanup.
                unSub1();
                unSub2();
            });

            test('Should ignore cancellation reasons from callbacks if the event has already been cancelled.', () => {
                // Arrange.
                const callback = vi.fn();
                const unSub1 = historyApi.on('beforeNavigate', (event) => event.cancel('test'));
                const unSub2 = historyApi.on('beforeNavigate', (event) => event.cancel('ignored'));
                const unSub3 = historyApi.on('beforeNavigate', callback);

                // Act.
                historyApi.pushState(null, '', 'http://example.com/other');

                // Assert.
                expect(callback).toHaveBeenCalledWith({
                    url: 'http://example.com/other',
                    method: 'push',
                    state: null,
                    wasCancelled: true,
                    cancelReason: 'test',
                    cancel: expect.any(Function)
                });

                // Cleanup.
                unSub1();
                unSub2();
                unSub3();
            });

            test("Should register the provided callback for the 'navigationCancelled' event.", () => {
                // Arrange.
                const callback = vi.fn();
                const unSub1 = historyApi.on('beforeNavigate', (event) => event.cancel());
                const unSub2 = historyApi.on('navigationCancelled', callback);

                // Act.
                historyApi.pushState(null, '', 'http://example.com/other');

                // Assert.
                expect(callback).toHaveBeenCalledOnce();

                // Cleanup.
                unSub1();
                unSub2();
            });

            test("Should transfer the cause of cancellation and the state to the 'navigationCancelled' event.", () => {
                // Arrange.
                const callback = vi.fn();
                const reason = 'test';
                const state = { test: 'value' };
                const unSub1 = historyApi.on('beforeNavigate', (event) => event.cancel(reason));
                const unSub2 = historyApi.on('navigationCancelled', callback);

                // Act.
                historyApi.pushState(state, '', 'http://example.com/other');

                // Assert.
                expect(callback).toHaveBeenCalledWith({
                    url: 'http://example.com/other',
                    method: 'push',
                    state,
                    cause: reason
                });

                // Cleanup.
                unSub1();
                unSub2();
            });
        });
        describe('url', () => {
            test.each(['pushState', 'replaceState'] satisfies (keyof History)[])(
                'Should update whenever an external call to %s is made.',
                (fn) => {
                    // Arrange.
                    const newUrl = 'http://example.com/new';

                    // Act.
                    globalThis.window.history[fn](null, '', newUrl);

                    // Assert.
                    expect(historyApi.url.href).toBe(newUrl);
                }
            );
        });
    });

    describe('Navigation Interception', () => {
        test.each(['pushState' as const, 'replaceState' as const])(
            'Should ultimately push the state data via the %s method set by beforeNavigate handlers in event.state.',
            (stateFn) => {
                // Arrange.
                const state = { path: { test: 'value' }, hash: {} };
                const callback = vi.fn((event: BeforeNavigateEvent) => {
                    event.state = state;
                });
                const unSub = historyApi.on('beforeNavigate', callback);

                // Act.
                historyApi[stateFn](null, '', 'http://example.com/other');

                // Assert.
                expect(callback).toHaveBeenCalledOnce();
                expect(historyApi.state).toEqual(state);

                // Cleanup.
                unSub();
            }
        );

        test.each(['pushState' as const, 'replaceState' as const])(
            'Should preserve the previous valid state whenever %s is called with non-conformant state.',
            (stateFn) => {
                // Arrange.
                const validState = { path: { test: 'value' }, hash: {} };
                historyApi.replaceState(validState, '', 'http://example.com/setup');
                const invalidState = { test: 'value' }; // Non-conformant state

                // Act.
                historyApi[stateFn](invalidState, '', 'http://example.com/other');

                // Assert.
                expect(historyApi.state).toEqual(validState);
            }
        );

        test('Should not call the original history method when navigation is cancelled.', () => {
            // Arrange.
            const originalPushState = vi.spyOn(browserMocks.history, 'pushState');
            const unSub = historyApi.on('beforeNavigate', (event) => event.cancel('cancelled'));

            // Act.
            historyApi.pushState({ path: {}, hash: {} }, '', 'http://example.com/other');

            // Assert.
            expect(originalPushState).not.toHaveBeenCalled();

            // Cleanup.
            unSub();
        });

        test('Should call the original history method when navigation is not cancelled.', () => {
            // Arrange.
            const state = { path: { test: 'value' }, hash: {} };

            // Act.
            historyApi.pushState(state, '', 'http://example.com/other');

            // Assert.
            expect(origPushState).toHaveBeenCalledWith(state, '', 'http://example.com/other');
        });
    });

    describe('State management', () => {
        test('Should properly update state when navigation succeeds.', () => {
            // Arrange.
            const newState = { path: { test: 'data' }, hash: {} };

            // Act.
            historyApi.pushState(newState, '', 'http://example.com/test');

            // Assert.
            expect(historyApi.state).toEqual(newState);
            expect(historyApi.url.href).toBe('http://example.com/test');
        });

        test('Should not update state when navigation is cancelled.', () => {
            // Arrange.
            const originalState = historyApi.state;
            const originalUrl = historyApi.url.href;
            const unSub = historyApi.on('beforeNavigate', (event) => event.cancel());

            // Act.
            historyApi.pushState(
                { path: { test: 'data' }, hash: {} },
                '',
                'http://example.com/test'
            );

            // Assert.
            expect(historyApi.state).toEqual(originalState);
            expect(historyApi.url.href).toBe(originalUrl);

            // Cleanup.
            unSub();
        });
    });

    describe('dispose', () => {
        test('Should clear event subscriptions.', () => {
            // Arrange.
            const callback = vi.fn();
            historyApi.on('beforeNavigate', callback);

            // Act.
            historyApi.dispose();
            historyApi.pushState({}, '', 'http://example.com/test');

            // Assert.
            expect(callback).not.toHaveBeenCalled();
        });

        test('Should restore original window.history methods.', () => {
            // Act.
            historyApi.dispose();

            // Assert.
            expect(globalThis.window.history.pushState).toBe(origPushState);
            expect(globalThis.window.history.replaceState).toBe(origReplaceState);
        });

        test('Should be safe to call multiple times.', () => {
            // Act & Assert.
            expect(() => {
                historyApi.dispose();
                historyApi.dispose();
            }).not.toThrow();
        });

        test('Should call parent dispose method.', () => {
            // Arrange.
            const superDisposeSpy = vi.spyOn(
                Object.getPrototypeOf(Object.getPrototypeOf(historyApi)),
                'dispose'
            );

            // Act.
            historyApi.dispose();

            // Assert.
            expect(superDisposeSpy).toHaveBeenCalled();
        });
    });

    describe('Multiple instances', () => {
        test('Should create a chain of interceptors, where the latest uses the previous as original.', () => {
            // Arrange.
            const historyApi2 = new InterceptedHistoryApi();
            let calledFirst: string | undefined;
            const callback1 = vi.fn(() => {
                calledFirst ??= 'first';
            });
            const callback2 = vi.fn(() => {
                calledFirst ??= 'second';
            });
            historyApi.on('beforeNavigate', callback1);
            historyApi2.on('beforeNavigate', callback2);

            // Act.
            historyApi2.pushState({}, '', 'http://example.com/test');

            // Assert.
            expect(calledFirst).toBe('second');
            expect(callback1).toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();

            // Cleanup.
            historyApi2.dispose();
        });
    });
});
