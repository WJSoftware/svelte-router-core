import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { buildHref } from './buildHref.js';
import { init } from '../init.js';
import { location } from './Location.js';

describe('buildHref', () => {
    let cleanup: Function;
    beforeAll(() => {
        cleanup = init();
    });
    afterAll(() => {
        cleanup();
    });

    beforeEach(() => {
        // Reset to a clean base URL for each test
        location.url.href = 'https://example.com/current?currentParam=value';
    });

    describe('Basic functionality', () => {
        test('Should combine path from first HREF and hash from second HREF.', () => {
            const pathPiece = 'https://example.com/new-path';
            const hashPiece = 'https://example.com/any-path#new-hash';
            
            const result = buildHref(pathPiece, hashPiece);
            
            expect(result).toBe('/new-path#new-hash');
        });

        test('Should handle relative URLs correctly.', () => {
            const pathPiece = '/relative-path';
            const hashPiece = '/any-path#relative-hash';
            
            const result = buildHref(pathPiece, hashPiece);
            
            expect(result).toBe('/relative-path#relative-hash');
        });

        test('Should work when pathPiece has no path component.', () => {
            const pathPiece = 'https://example.com/';
            const hashPiece = 'https://example.com/#hash-only';
            
            const result = buildHref(pathPiece, hashPiece);
            
            expect(result).toBe('/#hash-only');
        });

        test('Should work when hashPiece has no hash component.', () => {
            const pathPiece = 'https://example.com/path-only';
            const hashPiece = 'https://example.com/any-path';
            
            const result = buildHref(pathPiece, hashPiece);
            
            expect(result).toBe('/path-only');
        });

        test('Should handle empty hash correctly.', () => {
            const pathPiece = 'https://example.com/path';
            const hashPiece = 'https://example.com/any-path#';
            
            const result = buildHref(pathPiece, hashPiece);
            
            expect(result).toBe('/path');
        });
    });

    describe('Query parameter merging', () => {
        test('Should merge query parameters from both pieces.', () => {
            const pathPiece = 'https://example.com/path?pathParam=pathValue';
            const hashPiece = 'https://example.com/any-path?hashParam=hashValue#hash';
            
            const result = buildHref(pathPiece, hashPiece);
            
            expect(result).toBe('/path?pathParam=pathValue&hashParam=hashValue#hash');
        });

        test('Should handle query parameters in pathPiece only.', () => {
            const pathPiece = 'https://example.com/path?onlyPath=value';
            const hashPiece = 'https://example.com/any-path#hash';
            
            const result = buildHref(pathPiece, hashPiece);
            
            expect(result).toBe('/path?onlyPath=value#hash');
        });

        test('Should handle query parameters in hashPiece only.', () => {
            const pathPiece = 'https://example.com/path';
            const hashPiece = 'https://example.com/any-path?onlyHash=value#hash';
            
            const result = buildHref(pathPiece, hashPiece);
            
            expect(result).toBe('/path?onlyHash=value#hash');
        });

        test('Should handle duplicate parameter names by keeping both values.', () => {
            const pathPiece = 'https://example.com/path?shared=pathValue';
            const hashPiece = 'https://example.com/any-path?shared=hashValue#hash';
            
            const result = buildHref(pathPiece, hashPiece);
            
            expect(result).toBe('/path?shared=pathValue&shared=hashValue#hash');
        });

        test('Should handle multiple parameters in both pieces.', () => {
            const pathPiece = 'https://example.com/path?param1=value1&param2=value2';
            const hashPiece = 'https://example.com/any-path?param3=value3&param4=value4#hash';
            
            const result = buildHref(pathPiece, hashPiece);
            
            expect(result).toBe('/path?param1=value1&param2=value2&param3=value3&param4=value4#hash');
        });

        test('Should work with empty query strings.', () => {
            const pathPiece = 'https://example.com/path?';
            const hashPiece = 'https://example.com/any-path?#hash';
            
            const result = buildHref(pathPiece, hashPiece);
            
            expect(result).toBe('/path#hash');
        });
    });

    describe('preserveQuery option', () => {
        beforeEach(() => {
            // Set up current URL with query parameters to preserve
            location.url.href = 'https://example.com/current?preserve1=value1&preserve2=value2&preserve3=value3';
        });

        test('Should preserve all current query parameters when preserveQuery is true.', () => {
            const pathPiece = 'https://example.com/path?new=param';
            const hashPiece = 'https://example.com/any-path#hash';
            
            const result = buildHref(pathPiece, hashPiece, { preserveQuery: true });
            
            expect(result).toBe('/path?new=param&preserve1=value1&preserve2=value2&preserve3=value3#hash');
        });

        test('Should preserve specific query parameter when preserveQuery is a string.', () => {
            const pathPiece = 'https://example.com/path';
            const hashPiece = 'https://example.com/any-path#hash';
            
            const result = buildHref(pathPiece, hashPiece, { preserveQuery: 'preserve2' });
            
            expect(result).toBe('/path?preserve2=value2#hash');
        });

        test('Should preserve specific query parameters when preserveQuery is an array.', () => {
            const pathPiece = 'https://example.com/path';
            const hashPiece = 'https://example.com/any-path#hash';
            
            const result = buildHref(pathPiece, hashPiece, { preserveQuery: ['preserve1', 'preserve3'] });
            
            expect(result).toBe('/path?preserve1=value1&preserve3=value3#hash');
        });

        test('Should not preserve any parameters when preserveQuery is false.', () => {
            const pathPiece = 'https://example.com/path?new=param';
            const hashPiece = 'https://example.com/any-path#hash';
            
            const result = buildHref(pathPiece, hashPiece, { preserveQuery: false });
            
            expect(result).toBe('/path?new=param#hash');
        });

        test('Should not preserve any parameters when preserveQuery is not specified.', () => {
            const pathPiece = 'https://example.com/path?new=param';
            const hashPiece = 'https://example.com/any-path#hash';
            
            const result = buildHref(pathPiece, hashPiece);
            
            expect(result).toBe('/path?new=param#hash');
        });

        test('Should handle preserveQuery with existing merged parameters.', () => {
            const pathPiece = 'https://example.com/path?fromPath=pathVal';
            const hashPiece = 'https://example.com/any-path?fromHash=hashVal#hash';
            
            const result = buildHref(pathPiece, hashPiece, { preserveQuery: 'preserve2' });
            
            expect(result).toBe('/path?fromPath=pathVal&fromHash=hashVal&preserve2=value2#hash');
        });

        test('Should handle non-existent preserve parameter gracefully.', () => {
            const pathPiece = 'https://example.com/path';
            const hashPiece = 'https://example.com/any-path#hash';
            
            const result = buildHref(pathPiece, hashPiece, { preserveQuery: 'nonExistent' });
            
            expect(result).toBe('/path#hash');
        });
    });

    describe('Edge cases', () => {
        test('Should handle both pieces being the same URL.', () => {
            const sameUrl = 'https://example.com/same?param=value#hash';
            
            const result = buildHref(sameUrl, sameUrl);
            
            expect(result).toBe('/same?param=value&param=value#hash');
        });

        test('Should handle URLs with different domains.', () => {
            const pathPiece = 'https://other-domain.com/path?param=value';
            const hashPiece = 'https://another-domain.com/any-path#hash';
            
            const result = buildHref(pathPiece, hashPiece);
            
            expect(result).toBe('/path?param=value#hash');
        });

        test('Should handle URLs with special characters in parameters.', () => {
            const pathPiece = 'https://example.com/path?special=hello%20world';
            const hashPiece = 'https://example.com/any-path?encoded=test%2Bvalue#hash%20with%20spaces';
            
            const result = buildHref(pathPiece, hashPiece);
            
            expect(result).toBe('/path?special=hello+world&encoded=test%2Bvalue#hash%20with%20spaces');
        });

        test('Should handle root paths correctly.', () => {
            const pathPiece = 'https://example.com/';
            const hashPiece = 'https://example.com/#root-hash';
            
            const result = buildHref(pathPiece, hashPiece);
            
            expect(result).toBe('/#root-hash');
        });

        test('Should handle complex hash fragments.', () => {
            const pathPiece = 'https://example.com/path';
            const hashPiece = 'https://example.com/any-path#/complex/hash/route?hashParam=value';
            
            const result = buildHref(pathPiece, hashPiece);
            
            expect(result).toBe('/path#/complex/hash/route?hashParam=value');
        });
    });

    describe('Cross-universe redirection use case', () => {
        test('Should support typical cross-universe redirection scenario.', () => {
            // Simulate getting path piece from path router and hash piece from hash router
            const pathUniverseHref = 'https://example.com/users/profile?pathParam=value';
            const hashUniverseHref = 'https://example.com/current#/dashboard/settings?hashParam=value';
            
            const result = buildHref(pathUniverseHref, hashUniverseHref);
            
            expect(result).toBe('/users/profile?pathParam=value#/dashboard/settings?hashParam=value');
        });

        test('Should handle preserving current query in cross-universe scenario.', () => {
            location.url.href = 'https://example.com/current?globalParam=global&session=active';
            
            const pathUniverseHref = 'https://example.com/users/profile';
            const hashUniverseHref = 'https://example.com/current#/dashboard';
            
            const result = buildHref(pathUniverseHref, hashUniverseHref, { preserveQuery: ['session'] });
            
            expect(result).toBe('/users/profile?session=active#/dashboard');
        });
    });

    describe('Additional edge cases', () => {
        test('Should handle URL fragments with encoded characters.', () => {
            const pathPiece = 'https://example.com/path';
            const hashPiece = 'https://example.com/any#%20encoded%20hash';
            
            const result = buildHref(pathPiece, hashPiece);
            
            expect(result).toBe('/path#%20encoded%20hash');
        });

        test('Should handle when both pieces have same domain but different protocols.', () => {
            const pathPiece = 'http://example.com/path';
            const hashPiece = 'https://example.com/other#hash';
            
            const result = buildHref(pathPiece, hashPiece);
            
            expect(result).toBe('/path#hash');
        });

        test('Should handle query parameters with empty values.', () => {
            const pathPiece = 'https://example.com/path?empty=';
            const hashPiece = 'https://example.com/other?also=&blank=#hash';
            
            const result = buildHref(pathPiece, hashPiece);
            
            expect(result).toBe('/path?empty=&also=&blank=#hash');
        });

        test('Should handle preserveQuery with empty current URL query.', () => {
            location.url.href = 'https://example.com/current'; // No query parameters
            
            const pathPiece = 'https://example.com/path?new=param';
            const hashPiece = 'https://example.com/other#hash';
            
            const result = buildHref(pathPiece, hashPiece, { preserveQuery: true });
            
            expect(result).toBe('/path?new=param#hash');
        });

        test('Should handle complex multi-hash routing fragment.', () => {
            const pathPiece = 'https://example.com/app';
            const hashPiece = 'https://example.com/other#main=/dashboard;sidebar=/menu';
            
            const result = buildHref(pathPiece, hashPiece);
            
            expect(result).toBe('/app#main=/dashboard;sidebar=/menu');
        });
    });
});