import { describe, expect, test } from 'vitest';
import { routingOptions } from './kernel/options.js';
import { location } from './kernel/Location.js';

describe('index', () => {
    test('Should export exactly the expected objects.', async () => {
        // Arrange.
        const expectedList = [
            'Link',
            'LinkContext',
            'Route',
            'Router',
            'Fallback',
            'location',
            'RouterTrace',
            'init',
            'initFull',
            'getRouterContext',
            'setRouterContext',
            'isRouteActive',
            'activeBehavior',
            'Redirector',
            'buildHref',
            'joinPaths',
            'RouterEngine',
            'isConformantState',
            'calculateHref',
            'calculateState',
            'initCore',
            'LocationState',
            'StockHistoryApi',
            'InterceptedHistoryApi',
            'LocationLite',
            'LocationFull',
            'preserveQueryInUrl',
            'calculateMultiHashFragment'
        ];

        // Act.
        const lib = await import('./index.js');

        // Assert.
        for (let item of expectedList) {
            expect(item in lib, `The expected object ${item} is not exported.`).toEqual(true);
        }
        for (let key of Object.keys(lib)) {
            expect(
                expectedList.includes(key),
                `The library exports object ${key}, which is not expected.`
            ).toEqual(true);
        }
    });

    test('Should have default routing options in uninitialized state.', () => {
        // Assert.
        expect(routingOptions.hashMode).toBe('single');
        expect(routingOptions.defaultHash).toBe(false);
    });

    test('Should have no location in uninitialized state.', () => {
        // Assert.
        expect(location).toBeUndefined();
    });
});
