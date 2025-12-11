import {
    ROUTING_UNIVERSES,
    setupBrowserMocks,
    type RoutingUniverse
} from '../testing/test-utils.js';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { RouteHelper } from './RouteHelper.svelte.js';
import { resolveHashValue } from './resolveHashValue.js';
import { location } from './Location.js';
import { init } from '$lib/init.js';
import type { Hash } from '$lib/types.js';

ROUTING_UNIVERSES.forEach((universe) => {
    describe(`RouteHelper - ${universe.text}`, () => {
        let cleanup: () => void;
        let resolvedHash: Hash;
        let routeHelper: RouteHelper;
        beforeAll(() => {
            cleanup = init(universe);
            resolvedHash = resolveHashValue(universe.hash ?? universe.defaultHash);
        });
        afterAll(() => {
            cleanup();
        });
        beforeEach(() => {
            routeHelper = new RouteHelper(resolvedHash);
        });

        describe('testPath', () => {
            describe('Existing Path', () => {
                const expectedPath = '/some/path';
                const unexpectedPath = '/unexpected/stuff';
                let cleanup: () => void;
                beforeAll(() => {
                    const testPaths = {
                        IPR: `${expectedPath}#${unexpectedPath}`,
                        PR: `${expectedPath}#${unexpectedPath}`,
                        IHR: `${unexpectedPath}#${expectedPath}`,
                        HR: `${unexpectedPath}#${expectedPath}`,
                        IMHR: `${unexpectedPath}#unrelated=/a/b;${resolvedHash}=${expectedPath}`,
                        MHR: `${unexpectedPath}#unrelated=/a/b;${resolvedHash}=${expectedPath}`
                    } as const;
                    const initialPath = `http://example.com${testPaths[universe.text]}`;
                    const mocks = setupBrowserMocks(initialPath, location);
                    cleanup = mocks.cleanup;
                });
                afterAll(() => {
                    cleanup();
                });

                test('Should return the expected path.', () => {
                    expect(routeHelper.testPath).toBe(expectedPath);
                });
            });
            describe('No Path', () => {
                const unexpectedPath = '/unexpected/stuff';
                let routeHelper: RouteHelper;
                let cleanup: () => void;
                beforeAll(() => {
                    const testPaths = {
                        IPR: `#/${unexpectedPath}`,
                        PR: `#/${unexpectedPath}`,
                        IHR: `${unexpectedPath}`,
                        HR: `${unexpectedPath}`,
                        IMHR: `${unexpectedPath}#unrelated=/a/b`,
                        MHR: `${unexpectedPath}#unrelated=/a/b`
                    } as const;
                    const initialPath = `http://example.com${testPaths[universe.text]}`;
                    const mocks = setupBrowserMocks(initialPath, location);
                    cleanup = mocks.cleanup;
                });
                afterAll(() => {
                    cleanup();
                });
                beforeEach(() => {
                    routeHelper = new RouteHelper(resolvedHash);
                });

                test('Should return a single slash when no path exists.', () => {
                    expect(routeHelper.testPath).toBe('/');
                });
            });
            describe('No trailing slash', () => {
                const expectedPath = '/some/path';
                let routeHelper: RouteHelper;
                let cleanup: () => void;
                beforeAll(() => {
                    const testPaths = {
                        IPR: `${expectedPath}/#trailing/slash/`,
                        PR: `${expectedPath}/#trailing/slash/`,
                        IHR: `trailing/slash/#${expectedPath}/`,
                        HR: `trailing/slash/#${expectedPath}/`,
                        IMHR: `trailing/slash/#unrelated=/a/b;${resolvedHash}=${expectedPath}/`,
                        MHR: `trailing/slash/#unrelated=/a/b;${resolvedHash}=${expectedPath}/`
                    } as const;
                    const initialPath = `http://example.com${testPaths[universe.text]}`;
                    const mocks = setupBrowserMocks(initialPath, location);
                    cleanup = mocks.cleanup;
                });
                afterAll(() => {
                    cleanup();
                });
                beforeEach(() => {
                    routeHelper = new RouteHelper(resolvedHash);
                });
                test('Should return the expected path without trailing slash.', () => {
                    expect(routeHelper.testPath).toBe(expectedPath);
                });
            });
            describe('Reactivity', () => {
                let mocks: ReturnType<typeof setupBrowserMocks>;
                const initialPath = '/initial/path';
                const unexpectedPath = '/unexpected/stuff';
                let testPaths: Record<RoutingUniverse['text'], string>;
                beforeAll(() => {
                    testPaths = {
                        IPR: `${initialPath}#${unexpectedPath}`,
                        PR: `${initialPath}#${unexpectedPath}`,
                        IHR: `${unexpectedPath}#${initialPath}`,
                        HR: `${unexpectedPath}#${initialPath}`,
                        IMHR: `${unexpectedPath}#unrelated=/a/b;${resolvedHash}=${initialPath}`,
                        MHR: `${unexpectedPath}#unrelated=/a/b;${resolvedHash}=${initialPath}`
                    };
                    mocks = setupBrowserMocks(
                        `http://example.com${testPaths[universe.text]}`,
                        location
                    );
                });
                afterAll(() => {
                    mocks.cleanup();
                });
                afterEach(() => {
                    location.goTo(`${testPaths[universe.text]}`);
                });

                test('Should update when location changes.', () => {
                    expect(routeHelper.testPath).toBe(initialPath);
                    const newPath = '/new/path/value';
                    location.navigate(newPath, { hash: universe.hash });
                    expect(routeHelper.testPath).toBe(newPath);
                });
            });
        });
    });
});

describe('RouteHelper', () => {
    let routeHelper: RouteHelper;

    beforeEach(() => {
        // Use path routing (false) for these universe-independent tests
        routeHelper = new RouteHelper(false);
    });

    describe('parseRoutePattern', () => {
        describe('Default Props', () => {
            test('Should return empty regex when pattern is not provided.', () => {
                // Arrange
                const routeInfo = { and: undefined, ignoreForFallback: false };

                // Act
                const result = routeHelper.parseRoutePattern(routeInfo);

                // Assert
                expect(result.regex).toBeUndefined();
                expect(result.and).toBeUndefined();
                expect(result.ignoreForFallback).toBe(false);
            });

            test('Should set ignoreForFallback to false by default when not provided.', () => {
                // Arrange
                const routeInfo = { path: '/test' };

                // Act
                const result = routeHelper.parseRoutePattern(routeInfo);

                // Assert
                expect(result.ignoreForFallback).toBe(false);
            });

            test('Should preserve and predicate function when provided.', () => {
                // Arrange
                const andPredicate = () => true;
                const routeInfo = { pattern: '/test', and: andPredicate };

                // Act
                const result = routeHelper.parseRoutePattern(routeInfo);

                // Assert
                expect(result.and).toBe(andPredicate);
            });
        });

        describe('Explicit Props', () => {
            test.each([
                { pattern: '/', expectedRegex: '^\\/$', description: 'root path' },
                { pattern: '/test', expectedRegex: '^\\/test$', description: 'simple path' },
                {
                    pattern: '/test/path',
                    expectedRegex: '^\\/test\\/path$',
                    description: 'nested path'
                },
                {
                    pattern: '/api/v1/users',
                    expectedRegex: '^\\/api\\/v1\\/users$',
                    description: 'multi-segment path'
                }
            ])('Should create correct regex for $description .', ({ pattern, expectedRegex }) => {
                // Arrange
                const routeInfo = { path: pattern };

                // Act
                const result = routeHelper.parseRoutePattern(routeInfo);

                // Assert
                expect(result.regex?.source).toBe(expectedRegex);
                expect(result.regex?.flags).toBe('i'); // Case insensitive by default
            });

            test.each([
                {
                    pattern: '/:id',
                    expectedRegex: '^\\/(?<id>[^/]+)$',
                    description: 'single parameter'
                },
                {
                    pattern: '/user/:userId',
                    expectedRegex: '^\\/user\\/(?<userId>[^/]+)$',
                    description: 'parameter in path'
                },
                {
                    pattern: '/:category/:id',
                    expectedRegex: '^\\/(?<category>[^/]+)\\/(?<id>[^/]+)$',
                    description: 'multiple parameters'
                },
                {
                    pattern: '/api-:version',
                    expectedRegex: '^\\/api-(?<version>[^/]+)$',
                    description: 'parameter with prefix'
                },
                {
                    pattern: '/user-:id/profile',
                    expectedRegex: '^\\/user-(?<id>[^/]+)\\/profile$',
                    description: 'parameter with prefix and suffix'
                }
            ])('Should create correct regex for $description .', ({ pattern, expectedRegex }) => {
                // Arrange
                const routeInfo = { path: pattern };

                // Act
                const result = routeHelper.parseRoutePattern(routeInfo);

                // Assert
                expect(result.regex?.source).toBe(expectedRegex);
            });

            test.each([
                {
                    pattern: '/:id?',
                    expectedRegex: '^\\/?(?:(?<id>[^/]+))?$',
                    description: 'optional parameter'
                },
                {
                    pattern: '/user/:id?',
                    expectedRegex: '^\\/user\\/?(?:(?<id>[^/]+))?$',
                    description: 'optional parameter with leading slash'
                },
                {
                    pattern: '/:category/:id?',
                    expectedRegex: '^\\/(?<category>[^/]+)\\/?(?:(?<id>[^/]+))?$',
                    description: 'required and optional parameters'
                },
                {
                    pattern: '/:category?/:id',
                    expectedRegex: '^\\/?(?:(?<category>[^/]+))?\\/(?<id>[^/]+)$',
                    description: 'optional then required parameters'
                }
            ])('Should create correct regex for $description .', ({ pattern, expectedRegex }) => {
                // Arrange
                const routeInfo = { path: pattern };

                // Act
                const result = routeHelper.parseRoutePattern(routeInfo);

                // Assert
                expect(result.regex?.source).toBe(expectedRegex);
            });

            test.each([
                {
                    pattern: '/files/*',
                    expectedRegex: '^\\/files(?<rest>\\/.*)$',
                    description: 'rest parameter'
                },
                {
                    pattern: '/api/v1/*',
                    expectedRegex: '^\\/api\\/v1(?<rest>\\/.*)$',
                    description: 'rest parameter in nested path'
                },
                {
                    pattern: '/*',
                    expectedRegex: '^(?<rest>\\/.*)$',
                    description: 'root rest parameter'
                }
            ])('Should create correct regex for $description .', ({ pattern, expectedRegex }) => {
                // Arrange
                const routeInfo = { path: pattern };

                // Act
                const result = routeHelper.parseRoutePattern(routeInfo);

                // Assert
                expect(result.regex?.source).toBe(expectedRegex);
            });

            test.each([
                { caseSensitive: true, expectedFlags: '', description: 'case sensitive' },
                { caseSensitive: false, expectedFlags: 'i', description: 'case insensitive' }
            ])(
                'Should create regex with correct flags for $description .',
                ({ caseSensitive, expectedFlags }) => {
                    // Arrange
                    const routeInfo = { path: '/test', caseSensitive };

                    // Act
                    const result = routeHelper.parseRoutePattern(routeInfo);

                    // Assert
                    expect(result.regex?.flags).toBe(expectedFlags);
                }
            );

            test.each([
                { ignoreForFallback: true, expected: true, description: 'explicit true' },
                { ignoreForFallback: false, expected: false, description: 'explicit false' }
            ])(
                'Should set ignoreForFallback correctly when $description .',
                ({ ignoreForFallback, expected }) => {
                    // Arrange
                    const routeInfo = { pattern: '/test', ignoreForFallback };

                    // Act
                    const result = routeHelper.parseRoutePattern(routeInfo);

                    // Assert
                    expect(result.ignoreForFallback).toBe(expected);
                }
            );
        });

        describe('Base Path Integration', () => {
            test.each([
                {
                    basePath: '/',
                    pattern: '/test',
                    expectedRegex: '^\\/test$',
                    description: 'root base path'
                },
                {
                    basePath: '/api',
                    pattern: '/users',
                    expectedRegex: '^\\/api\\/users$',
                    description: 'simple base path'
                },
                {
                    basePath: '/api/v1',
                    pattern: '/users/:id',
                    expectedRegex: '^\\/api\\/v1\\/users\\/(?<id>[^/]+)$',
                    description: 'nested base path with parameters'
                },
                {
                    basePath: '/app',
                    pattern: '/',
                    expectedRegex: '^\\/app$',
                    description: 'root pattern with base path'
                },
                {
                    basePath: '/api/',
                    pattern: '/users/',
                    expectedRegex: '^\\/api\\/users$',
                    description: 'trailing slashes handled'
                }
            ])(
                'Should join base path correctly for $description .',
                ({ basePath, pattern, expectedRegex }) => {
                    // Arrange
                    const routeInfo = { path: pattern };

                    // Act
                    const result = routeHelper.parseRoutePattern(routeInfo, basePath);

                    // Assert
                    expect(result.regex?.source).toBe(expectedRegex);
                }
            );
        });

        describe('Special Characters Escaping', () => {
            test.each([
                {
                    pattern: '/test.html',
                    expectedRegex: '^\\/test\\.html$',
                    description: 'dot character'
                },
                {
                    pattern: '/api+v1',
                    expectedRegex: '^\\/api\\+v1$',
                    description: 'plus character'
                },
                {
                    pattern: '/query^start',
                    expectedRegex: '^\\/query\\^start$',
                    description: 'caret character'
                },
                {
                    pattern: '/data$end',
                    expectedRegex: '^\\/data\\$end$',
                    description: 'dollar character'
                },
                {
                    pattern: '/path{test}',
                    expectedRegex: '^\\/path\\{test\\}$',
                    description: 'curly braces'
                },
                {
                    pattern: '/file(1)',
                    expectedRegex: '^\\/file\\(1\\)$',
                    description: 'parentheses'
                },
                {
                    pattern: '/arr[0]',
                    expectedRegex: '^\\/arr\\[0\\]$',
                    description: 'square brackets'
                },
                {
                    pattern: '/back\\slash',
                    expectedRegex: '^\\/back\\\\slash$',
                    description: 'backslash'
                }
            ])('Should escape $description correctly .', ({ pattern, expectedRegex }) => {
                // Arrange
                const routeInfo = { path: pattern };

                // Act
                const result = routeHelper.parseRoutePattern(routeInfo);

                // Assert
                expect(result.regex?.source).toBe(expectedRegex);
            });
        });
    });

    describe('testRoute', () => {
        // Note: The testRoute method uses this.testPath internally, which is a derived value
        // that depends on location.path. Since proper location setup is complex and the location
        // is tested separately in other test files, we focus on testing the core logic that
        // doesn't depend on the testPath property.

        describe('Default Props', () => {
            test('Should match when no regex is provided.', () => {
                // Arrange
                const routeMatchInfo = {};

                // Act
                const [match, params] = routeHelper.testRoute(routeMatchInfo);

                // Assert
                expect(match).toBe(true);
                expect(params).toBeUndefined();
            });
        });

        describe('And Predicate Integration', () => {
            test('Should match with and predicate when no regex provided.', () => {
                // Arrange
                const andPredicate = vi.fn(() => true);
                const routeMatchInfo = { and: andPredicate };

                // Act
                const [match, params] = routeHelper.testRoute(routeMatchInfo);

                // Assert
                expect(match).toBe(true);
                expect(andPredicate).toHaveBeenCalledWith(undefined);
                expect(params).toBeUndefined();
            });

            test('Should not match with and predicate when no regex provided and predicate returns false.', () => {
                // Arrange
                const andPredicate = vi.fn(() => false);
                const routeMatchInfo = { and: andPredicate };

                // Act
                const [match, params] = routeHelper.testRoute(routeMatchInfo);

                // Assert
                expect(match).toBe(false);
                expect(andPredicate).toHaveBeenCalledWith(undefined);
                expect(params).toBeUndefined();
            });
        });

        describe('Regex Execution Logic', () => {
            // These tests verify the core regex matching and parameter parsing logic
            // by creating a mock RouteHelper with a fixed testPath

            class MockRouteHelper extends RouteHelper {
                readonly mockTestPath: string;

                constructor(mockTestPath: string) {
                    super(false);
                    this.mockTestPath = mockTestPath;
                    // Override the derived testPath by replacing it
                    Object.defineProperty(this, 'testPath', {
                        get: () => this.mockTestPath,
                        enumerable: true,
                        configurable: true
                    });
                }
            }

            test.each([
                {
                    testPath: '/user/123',
                    regex: /^\/user\/(?<id>\d+)$/,
                    expectedMatch: true,
                    expectedParams: { id: 123 },
                    description: 'numeric parameter matching'
                },
                {
                    testPath: '/user/abc',
                    regex: /^\/user\/(?<id>[^/]+)$/,
                    expectedMatch: true,
                    expectedParams: { id: 'abc' },
                    description: 'string parameter matching'
                },
                {
                    testPath: '/post/123/comment/456',
                    regex: /^\/post\/(?<postId>\d+)\/comment\/(?<commentId>\d+)$/,
                    expectedMatch: true,
                    expectedParams: { postId: 123, commentId: 456 },
                    description: 'multiple numeric parameters'
                },
                {
                    testPath: '/files/docs/readme.txt',
                    regex: /^\/files(?<rest>\/.*)/,
                    expectedMatch: true,
                    expectedParams: { rest: '/docs/readme.txt' },
                    description: 'rest parameter matching'
                },
                {
                    testPath: 'files-v2/docs/readme.txt',
                    regex: /^\/files(?<rest>\/.*)/,
                    expectedMatch: false,
                    expectedParams: undefined,
                    description: 'rest param + similar text in path (#182)'
                },
                {
                    testPath: '/abc/def',
                    regex: /^(?<rest>\/.*)/,
                    expectedMatch: true,
                    expectedParams: { rest: '/abc/def' },
                    description: 'root path regex (#182)'
                },
                {
                    testPath: '/',
                    regex: /^(?<rest>\/.*)/,
                    expectedMatch: true,
                    expectedParams: { rest: '/' },
                    description: 'root path regex + root test path (#182)'
                },
                {
                    testPath: '/abc/def/ghi/jkl',
                    regex: /^\/abc(?<rest>\/.*)\/(?<last>[^/]+)/,
                    expectedMatch: true,
                    expectedParams: { rest: '/def/ghi', last: 'jkl' },
                    description: 'rest parameter in middle of path'
                },
                {
                    testPath: '/different',
                    regex: /^\/user\/(?<id>\d+)$/,
                    expectedMatch: false,
                    expectedParams: undefined,
                    description: 'non-matching path'
                }
            ])(
                'Should handle $description correctly .',
                ({ testPath, regex, expectedMatch, expectedParams }) => {
                    // Arrange
                    const mockHelper = new MockRouteHelper(testPath);
                    const routeMatchInfo = { regex };

                    // Act
                    const [match, params] = mockHelper.testRoute(routeMatchInfo);

                    // Assert
                    expect(match).toBe(expectedMatch);
                    expect(params).toEqual(expectedParams);
                }
            );

            test.each([
                { value: '123', expected: 123, description: 'string number to number' },
                { value: 'true', expected: true, description: 'string true to boolean' },
                { value: 'false', expected: false, description: 'string false to boolean' },
                { value: 'hello', expected: 'hello', description: 'regular string unchanged' },
                { value: '', expected: '', description: 'empty string unchanged' }
            ])('Should parse parameter values correctly: $description .', ({ value, expected }) => {
                // Arrange
                const mockHelper = new MockRouteHelper(`/test/${value}`);
                const regex = /^\/test\/(?<param>.*)$/;
                const routeMatchInfo = { regex };

                // Act
                const [match, params] = mockHelper.testRoute(routeMatchInfo);

                // Assert
                expect(match).toBe(true);
                expect(params?.param).toBe(expected);
            });

            test('Should decode URI components in parameters.', () => {
                // Arrange
                const encodedValue = 'hello%20world%21'; // "hello world!"
                const expectedValue = 'hello world!';
                const mockHelper = new MockRouteHelper(`/test/${encodedValue}`);
                const regex = /^\/test\/(?<param>[^/]+)$/;
                const routeMatchInfo = { regex };

                // Act
                const [match, params] = mockHelper.testRoute(routeMatchInfo);

                // Assert
                expect(match).toBe(true);
                expect(params?.param).toBe(expectedValue);
            });

            test('Should remove undefined parameters from result.', () => {
                // Arrange
                const mockHelper = new MockRouteHelper('/user/123');
                const regex = /^\/user\/(?<id>\d+)(?:\/(?<optional>[^/]+))?$/;
                const routeMatchInfo = { regex };

                // Act
                const [match, params] = mockHelper.testRoute(routeMatchInfo);

                // Assert
                expect(match).toBe(true);
                expect(params).toEqual({ id: 123 });
                expect(params).not.toHaveProperty('optional');
            });

            test('Should handle empty route groups correctly.', () => {
                // Arrange
                const mockHelper = new MockRouteHelper('/test');
                const regex = /^\/test$/; // No groups
                const routeMatchInfo = { regex };

                // Act
                const [match, params] = mockHelper.testRoute(routeMatchInfo);

                // Assert
                expect(match).toBe(true);
                expect(params).toBeUndefined(); // No groups means no params
            });

            test('Should pass parameters to and predicate.', () => {
                // Arrange
                const mockHelper = new MockRouteHelper('/user/123');
                const regex = /^\/user\/(?<id>\d+)$/;
                const andPredicate = vi.fn(() => true);
                const routeMatchInfo = { regex, and: andPredicate };

                // Act
                const [match, params] = mockHelper.testRoute(routeMatchInfo);

                // Assert
                expect(match).toBe(true);
                expect(andPredicate).toHaveBeenCalledWith({ id: 123 });
                expect(params).toEqual({ id: 123 });
            });

            test('Should not match when and predicate returns false.', () => {
                // Arrange
                const mockHelper = new MockRouteHelper('/user/123');
                const regex = /^\/user\/(?<id>\d+)$/;
                const andPredicate = vi.fn(() => false);
                const routeMatchInfo = { regex, and: andPredicate };

                // Act
                const [match, params] = mockHelper.testRoute(routeMatchInfo);

                // Assert
                expect(match).toBe(false);
                expect(andPredicate).toHaveBeenCalledWith({ id: 123 });
                expect(params).toEqual({ id: 123 });
            });

            test("Should not call and predicate when regex doesn't match.", () => {
                // Arrange
                const mockHelper = new MockRouteHelper('/different');
                const regex = /^\/user\/(?<id>\d+)$/;
                const andPredicate = vi.fn(() => true);
                const routeMatchInfo = { regex, and: andPredicate };

                // Act
                const [match, params] = mockHelper.testRoute(routeMatchInfo);

                // Assert
                expect(match).toBe(false);
                expect(andPredicate).not.toHaveBeenCalled();
                expect(params).toBeUndefined();
            });
        });
    });
});
