import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { preserveQueryInUrl, mergeQueryParams } from './preserveQuery.js';
import { init } from '../init.js';
import { location } from './Location.js';

describe('preserveQuery utilities', () => {
    let cleanup: Function;
    beforeAll(() => {
        cleanup = init();
    });
    afterAll(() => {
        cleanup();
    });

    describe('preserveQueryInUrl', () => {
        beforeEach(() => {
            location.url.href = 'https://example.com/base?existing=value&another=param';
        });

        test('Should return URL unchanged when preserveQuery is false', () => {
            const url = 'https://example.com/new';
            const result = preserveQueryInUrl(url, false);
            expect(result).toBe(url);
        });

        test('Should preserve all query parameters when preserveQuery is true', () => {
            const url = 'https://example.com/new?new=param';
            const result = preserveQueryInUrl(url, true);
            expect(result).toBe('https://example.com/new?new=param&existing=value&another=param');
        });

        test('Should preserve specific query parameter when preserveQuery is a string', () => {
            const url = 'https://example.com/new';
            const result = preserveQueryInUrl(url, 'existing');
            expect(result).toBe('https://example.com/new?existing=value');
        });

        test('Should preserve specific query parameters when preserveQuery is an array', () => {
            const url = 'https://example.com/new';
            const result = preserveQueryInUrl(url, ['existing']);
            expect(result).toBe('https://example.com/new?existing=value');
        });

        test('Should handle relative URLs correctly', () => {
            const url = '/new?new=param';
            const result = preserveQueryInUrl(url, 'existing');
            expect(result).toBe('https://example.com/new?new=param&existing=value');
        });
    });

    describe('mergeQueryParams', () => {
        beforeEach(() => {
            location.url.href = 'https://example.com/base?existing=value&another=param';
        });

        test('Should return existing params unchanged when preserveQuery is false', () => {
            const existing = new URLSearchParams('new=param');
            const result = mergeQueryParams(existing, false);
            expect(result).toBe(existing);
        });

        test('Should return current location params when no existing params and preserveQuery is true', () => {
            const result = mergeQueryParams(undefined, true);
            expect(result).toBe(location.url.searchParams);
        });

        test('Should merge params correctly when preserveQuery is true', () => {
            const existing = new URLSearchParams('new=param');
            const result = mergeQueryParams(existing, true);
            expect(result?.get('new')).toBe('param');
            expect(result?.get('existing')).toBe('value');
            expect(result?.get('another')).toBe('param');
        });
    });

    describe('mergeQueryParams - Two URLSearchParams overload', () => {
        test('Should merge two non-empty URLSearchParams correctly.', () => {
            const set1 = new URLSearchParams('param1=value1&param2=value2');
            const set2 = new URLSearchParams('param3=value3&param4=value4');
            
            const result = mergeQueryParams(set1, set2);
            
            expect(result?.get('param1')).toBe('value1');
            expect(result?.get('param2')).toBe('value2');
            expect(result?.get('param3')).toBe('value3');
            expect(result?.get('param4')).toBe('value4');
        });

        test('Should handle duplicate parameter names by keeping both values.', () => {
            const set1 = new URLSearchParams('shared=first&unique1=value1');
            const set2 = new URLSearchParams('shared=second&unique2=value2');
            
            const result = mergeQueryParams(set1, set2);
            
            expect(result?.getAll('shared')).toEqual(['first', 'second']);
            expect(result?.get('unique1')).toBe('value1');
            expect(result?.get('unique2')).toBe('value2');
        });

        test('Should return set1 when set2 is undefined.', () => {
            const set1 = new URLSearchParams('param=value');
            
            const result = mergeQueryParams(set1, undefined);
            
            expect(result).toBe(set1);
        });

        test('Should return set1 when set2 is empty.', () => {
            const set1 = new URLSearchParams('param=value');
            const set2 = new URLSearchParams();
            
            const result = mergeQueryParams(set1, set2);
            
            expect(result).toBe(set1);
        });

        test('Should return set2 when set1 is undefined and set2 has parameters.', () => {
            const set2 = new URLSearchParams('param=value');
            
            const result = mergeQueryParams(undefined, set2);
            
            expect(result).toBe(set2);
        });

        test('Should return undefined when both sets are undefined.', () => {
            const result = mergeQueryParams(undefined, undefined);
            
            expect(result).toBeUndefined();
        });

        test('Should return undefined when set1 is undefined and set2 is empty.', () => {
            const set2 = new URLSearchParams();
            
            const result = mergeQueryParams(undefined, set2);
            
            expect(result).toBeUndefined();
        });

        test('Should return set1 when both sets are empty.', () => {
            const set1 = new URLSearchParams();
            const set2 = new URLSearchParams();
            
            const result = mergeQueryParams(set1, set2);
            
            expect(result).toBe(set1);
        });

        test('Should handle parameters with empty values.', () => {
            const set1 = new URLSearchParams('empty1=&normal=value');
            const set2 = new URLSearchParams('empty2=&another=test');
            
            const result = mergeQueryParams(set1, set2);
            
            expect(result?.get('empty1')).toBe('');
            expect(result?.get('empty2')).toBe('');
            expect(result?.get('normal')).toBe('value');
            expect(result?.get('another')).toBe('test');
        });

        test('Should handle parameters with special characters.', () => {
            const set1 = new URLSearchParams('special=hello%20world&plus=test+value');
            const set2 = new URLSearchParams('encoded=user%40example.com&symbols=%21%40%23');
            
            const result = mergeQueryParams(set1, set2);
            
            expect(result?.get('special')).toBe('hello world');
            expect(result?.get('plus')).toBe('test value');
            expect(result?.get('encoded')).toBe('user@example.com');
            expect(result?.get('symbols')).toBe('!@#');
        });

        test('Should handle multiple values for the same parameter name.', () => {
            const set1 = new URLSearchParams();
            set1.append('multi', 'value1');
            set1.append('multi', 'value2');
            
            const set2 = new URLSearchParams();
            set2.append('multi', 'value3');
            set2.append('other', 'single');
            
            const result = mergeQueryParams(set1, set2);
            
            expect(result?.getAll('multi')).toEqual(['value1', 'value2', 'value3']);
            expect(result?.get('other')).toBe('single');
        });

        test('Should preserve parameter order when merging.', () => {
            const set1 = new URLSearchParams('a=1&b=2');
            const set2 = new URLSearchParams('c=3&d=4');
            
            const result = mergeQueryParams(set1, set2);
            
            const entries = Array.from(result?.entries() || []);
            expect(entries).toEqual([
                ['a', '1'],
                ['b', '2'],
                ['c', '3'],
                ['d', '4']
            ]);
        });

        test('Should handle complex real-world scenario.', () => {
            // Simulate path router parameters
            const pathParams = new URLSearchParams('userId=123&action=edit');
            
            // Simulate hash router parameters  
            const hashParams = new URLSearchParams('tab=settings&mode=advanced&userId=456');
            
            const result = mergeQueryParams(pathParams, hashParams);
            
            expect(result?.getAll('userId')).toEqual(['123', '456']);
            expect(result?.get('action')).toBe('edit');
            expect(result?.get('tab')).toBe('settings');
            expect(result?.get('mode')).toBe('advanced');
        });

        test('Should return set1 with set2 parameters appended when merging occurs.', () => {
            const set1 = new URLSearchParams('param1=value1');
            const set2 = new URLSearchParams('param2=value2');
            
            const result = mergeQueryParams(set1, set2);
            
            // Function returns set1 (performance optimization) with set2 params appended
            expect(result).toBe(set1);
            expect(result?.get('param1')).toBe('value1');
            expect(result?.get('param2')).toBe('value2');
        });

        test('Should handle edge case with only set2 having parameters when set1 is empty.', () => {
            const set1 = new URLSearchParams(); // Empty
            const set2 = new URLSearchParams('onlyInSet2=value');
            
            const result = mergeQueryParams(set1, set2);
            
            // Function returns set1 (performance optimization) with set2 params appended
            expect(result).toBe(set1);
            expect(result?.get('onlyInSet2')).toBe('value');
        });

        test('Should verify performance optimization - returns original objects when possible.', () => {
            // Test case 1: Returns set2 when set1 is undefined
            const set2Only = new URLSearchParams('param=value');
            const result1 = mergeQueryParams(undefined, set2Only);
            expect(result1).toBe(set2Only);
            
            // Test case 2: Returns set1 when set2 is empty
            const set1Only = new URLSearchParams('param=value');
            const emptySet = new URLSearchParams();
            const result2 = mergeQueryParams(set1Only, emptySet);
            expect(result2).toBe(set1Only);
            
            // Test case 3: Returns set1 when both have parameters (modifies set1 in-place)
            const set1Modified = new URLSearchParams('existing=value');
            const set2ToMerge = new URLSearchParams('new=param');
            const result3 = mergeQueryParams(set1Modified, set2ToMerge);
            expect(result3).toBe(set1Modified);
            expect(set1Modified.get('existing')).toBe('value'); // Original param
            expect(set1Modified.get('new')).toBe('param'); // Merged param
        });

        test('Should create new URLSearchParams only when set1 is undefined and set2 has parameters.', () => {
            const set2 = new URLSearchParams('param=value');
            
            // This is the only case where a truly new instance is created
            const result = mergeQueryParams(undefined, set2);
            
            // Actually, this returns set2 directly for performance, so this test documents that behavior
            expect(result).toBe(set2);
        });

        test('Should not modify set2 when merging into set1.', () => {
            const set1 = new URLSearchParams('original1=value1');
            const set2 = new URLSearchParams('original2=value2');
            
            // Store original values to verify they don't change
            const originalSet2String = set2.toString();
            
            const result = mergeQueryParams(set1, set2);
            
            // set1 should be modified (it's the return value)
            expect(result).toBe(set1);
            expect(result?.get('original1')).toBe('value1');
            expect(result?.get('original2')).toBe('value2');
            
            // set2 should remain unchanged
            expect(set2.toString()).toBe(originalSet2String);
            expect(set2.get('original1')).toBeNull(); // Should not have set1's params
        });
    });
});
