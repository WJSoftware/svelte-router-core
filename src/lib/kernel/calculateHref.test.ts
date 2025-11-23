import { describe, test, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { calculateHref } from "./calculateHref.js";
import * as calculateMultiHashHrefModule from "./calculateMultiHashFragment.js";
import { init } from "../init.js";
import { location } from "./Location.js";
import { ROUTING_UNIVERSES, ALL_HASHES } from "$test/test-utils.js";

describe("calculateHref", () => {
    describe("(...paths) Overload", () => {
        let cleanup: Function;
        beforeAll(() => {
            cleanup = init();
        });
        afterAll(() => {
            cleanup();
        });
        test.each([
            {
                inputPaths: ["path", "anotherPath"],
                expectedHref: "path/anotherPath",
            },
            {
                inputPaths: ["path?a=b", "anotherPath?c=d"],
                expectedHref: "path/anotherPath?a=b&c=d",
            },
            {
                inputPaths: ["path#hash", "anotherPath#hash2"],
                expectedHref: "path/anotherPath#hash",
            }
        ])("Should combine paths $inputPaths as $expectedHref", ({ inputPaths, expectedHref }) => {
            // Act
            const href = calculateHref(...inputPaths);

            // Assert
            expect(href).toBe(expectedHref);
        });
    });

    // Test across all routing universes for comprehensive coverage
    ROUTING_UNIVERSES.forEach((universe) => {
        describe(`(options, ...paths) Overload - ${universe.text}`, () => {
            let cleanup: Function;
            
            beforeAll(() => {
                cleanup = init({ 
                    defaultHash: universe.defaultHash,
                    hashMode: universe.hashMode
                });
            });
            
            afterAll(() => {
                cleanup();
            });
            
            const basePath = "/base/path";
            const baseHash = universe.hashMode === 'multi' 
                ? `#${universe.hash || universe.defaultHash}=path/one;p2=path/two` 
                : "#base/hash";
            
            beforeEach(() => {
                location.url.href = `https://example.com${basePath}${baseHash}`;
            });
            
            describe("Basic navigation", () => {
                test.each([
                    {
                        opts: { hash: universe.hash, preserveHash: false },
                        url: '/sample/path',
                        expectedHref: (() => {
                            if (universe.hash === ALL_HASHES.path) return '/sample/path';
                            if (universe.hash === ALL_HASHES.single) return '#/sample/path';
                            if (universe.hash === ALL_HASHES.implicit) {
                                // Handle implicit routing
                                if (universe.hashMode === 'multi' && typeof universe.defaultHash === 'string') {
                                    // IMHR - implicit multi-hash routing
                                    return `#${universe.defaultHash}=/sample/path;p2=path/two`;
                                }
                                return universe.defaultHash === false ? '/sample/path' : '#/sample/path';
                            }
                            // Multi-hash routing - preserves existing paths and adds/updates the specified hash
                            if (typeof universe.hash === 'string') {
                                // This will preserve existing paths and update/add the new one
                                return `#${universe.hash}=/sample/path;p2=path/two`;
                            }
                            return '/sample/path';
                        })(),
                        text: "create correct href without preserving hash",
                    },
                    {
                        opts: { hash: universe.hash, preserveHash: true },
                        url: '/sample/path',
                        expectedHref: (() => {
                            if (universe.hash === ALL_HASHES.path) return `/sample/path${baseHash}`;
                            if (universe.hash === ALL_HASHES.single) return '#/sample/path';
                            if (universe.hash === ALL_HASHES.implicit) {
                                // Handle implicit routing
                                if (universe.hashMode === 'multi' && typeof universe.defaultHash === 'string') {
                                    // IMHR - implicit multi-hash routing
                                    return `#${universe.defaultHash}=/sample/path;p2=path/two`;
                                }
                                return universe.defaultHash === false ? `/sample/path${baseHash}` : '#/sample/path';
                            }
                            // Multi-hash routing - preserveHash doesn't apply to hash routing
                            if (typeof universe.hash === 'string') {
                                return `#${universe.hash}=/sample/path;p2=path/two`;
                            }
                            return `/sample/path${baseHash}`;
                        })(),
                        text: "handle hash preservation correctly",
                    },
                ])("Should $text in ${universe.text}", ({ opts, url, expectedHref }) => {
                    // Act
                    const href = calculateHref(opts, url);

                    // Assert
                    expect(href).toBe(expectedHref);
                });
            });

            describe("Query string preservation", () => {
                test.each([
                    { preserveQuery: true, text: 'preserve' },
                    { preserveQuery: false, text: 'not preserve' },
                ])("Should $text the query string in ${universe.text}", ({ preserveQuery }) => {
                    // Arrange
                    const newPath = "/sample/path";
                    const query = "a=b&c=d";
                    location.url.search = `?${query}`;
                    
                    const expectedHref = (() => {
                        const baseHref = (() => {
                            if (universe.hash === ALL_HASHES.path) return newPath;
                            if (universe.hash === ALL_HASHES.single) return `#${newPath}`;
                            if (universe.hash === ALL_HASHES.implicit) {
                                // Handle implicit routing
                                if (universe.hashMode === 'multi' && typeof universe.defaultHash === 'string') {
                                    // IMHR - implicit multi-hash routing
                                    return `#${universe.defaultHash}=${newPath};p2=path/two`;
                                }
                                return universe.defaultHash === false ? newPath : `#${newPath}`;
                            }
                            // Multi-hash routing
                            if (typeof universe.hash === 'string') {
                                return `#${universe.hash}=${newPath};p2=path/two`;
                            }
                            return newPath;
                        })();
                        
                        if (!preserveQuery) return baseHref;
                        
                        // Add query string
                        if (baseHref.startsWith('#')) {
                            return `?${query}${baseHref}`;
                        } else {
                            return `${baseHref}?${query}`;
                        }
                    })();

                    // Act
                    const href = calculateHref({ hash: universe.hash, preserveQuery }, newPath);

                    // Assert
                    expect(href).toBe(expectedHref);
                });
            });

            if (universe.hashMode === 'multi') {
                describe("Multi-hash routing integration", () => {
                    test("Should delegate to calculateMultiHashHref for multi-hash calculations", () => {
                        // Arrange
                        const newPath = "/sample/path";
                        const hashId = universe.hash || universe.defaultHash;

                        // Act
                        const href = calculateHref({ hash: hashId }, newPath);

                        // Assert - Verify the result follows multi-hash format
                        expect(href).toMatch(/^#[^;]+=\/sample\/path/);
                        expect(href).toContain(';p2=path/two'); // Should preserve existing paths
                    });
                });
            }

            if (universe.hash === ALL_HASHES.implicit) {
                describe("Implicit hash resolution", () => {
                    test("Should resolve implicit hash according to defaultHash", () => {
                        // Arrange
                        const newPath = "/sample/path";
                        const expectedHref = (() => {
                            if (universe.hashMode === 'multi' && typeof universe.defaultHash === 'string') {
                                // IMHR - implicit multi-hash routing
                                return `#${universe.defaultHash}=${newPath};p2=path/two`;
                            }
                            return universe.defaultHash === false ? newPath : `#${newPath}`;
                        })();

                        // Act
                        const href = calculateHref({ hash: universe.hash }, newPath);

                        // Assert
                        expect(href).toBe(expectedHref);
                    });
                });
            }
        });
    });

    describe("HREF Validation", () => {
        let cleanup: Function;
        
        beforeAll(() => {
            cleanup = init();
        });
        
        afterAll(() => {
            cleanup();
        });

        test("Should reject HREF with http protocol", () => {
            expect(() => calculateHref("http://example.com/path"))
                .toThrow('HREF cannot contain protocol, host, or port. Received: "http://example.com/path"');
        });

        test("Should reject HREF with https protocol", () => {
            expect(() => calculateHref("https://example.com/path"))
                .toThrow('HREF cannot contain protocol, host, or port. Received: "https://example.com/path"');
        });

        test("Should reject HREF with ftp protocol", () => {
            expect(() => calculateHref("ftp://example.com/path"))
                .toThrow('HREF cannot contain protocol, host, or port. Received: "ftp://example.com/path"');
        });

        test("Should reject HREF with protocol-relative URL", () => {
            expect(() => calculateHref("//example.com/path"))
                .toThrow('HREF cannot contain protocol, host, or port. Received: "//example.com/path"');
        });

        test("Should reject HREF with custom protocol", () => {
            expect(() => calculateHref("custom-protocol://example.com/path"))
                .toThrow('HREF cannot contain protocol, host, or port. Received: "custom-protocol://example.com/path"');
        });

        test("Should reject HREF when passed in options overload", () => {
            expect(() => calculateHref({}, "https://example.com/path"))
                .toThrow('HREF cannot contain protocol, host, or port. Received: "https://example.com/path"');
        });

        test("Should reject HREF among multiple valid paths", () => {
            expect(() => calculateHref("/valid/path", "https://example.com/invalid", "/another/valid"))
                .toThrow('HREF cannot contain protocol, host, or port. Received: "https://example.com/invalid"');
        });

        test("Should allow valid relative paths", () => {
            expect(() => calculateHref("/path", "relative/path", "../other/path")).not.toThrow();
        });

        test("Should allow valid paths with query and hash", () => {
            expect(() => calculateHref("/path?query=value", "relative/path#hash")).not.toThrow();
        });

        test("Should allow paths that start with protocol-like strings but are not URLs", () => {
            expect(() => calculateHref("/http-endpoint", "/https-folder")).not.toThrow();
        });
    });

    describe("Integration with calculateMultiHashHref", () => {
        let cleanup: Function;
        
        beforeAll(() => {
            cleanup = init({ hashMode: 'multi' });
        });
        
        afterAll(() => {
            cleanup();
        });

        beforeEach(() => {
            location.url.href = "https://example.com#p1=/existing/path;p2=/another/path";
        });

        test("Should call calculateMultiHashHref when hash is a string (named hash routing)", () => {
            // Arrange
            const spy = vi.spyOn(calculateMultiHashHrefModule, 'calculateMultiHashFragment').mockReturnValue('p1=/new/path;p2=/another/path');
            const newPath = "/new/path";

            // Act
            const href = calculateHref({ hash: 'p1' }, newPath);

            // Assert
            expect(spy).toHaveBeenCalledWith({ p1: newPath });
            expect(href).toBe('#p1=/new/path;p2=/another/path');
            
            spy.mockRestore();
        });

        test("Should not call calculateMultiHashHref when hash is false (path routing)", () => {
            // Arrange
            const spy = vi.spyOn(calculateMultiHashHrefModule, 'calculateMultiHashFragment');
            const newPath = "/new/path";

            // Act
            const href = calculateHref({ hash: false }, newPath);

            // Assert
            expect(spy).not.toHaveBeenCalled();
            expect(href).toBe(newPath);
            
            spy.mockRestore();
        });

        test("Should not call calculateMultiHashHref when hash is true (single hash routing)", () => {
            // Arrange
            const spy = vi.spyOn(calculateMultiHashHrefModule, 'calculateMultiHashFragment');
            const newPath = "/new/path";

            // Act
            const href = calculateHref({ hash: true }, newPath);

            // Assert
            expect(spy).not.toHaveBeenCalled();
            expect(href).toBe('#/new/path');
            
            spy.mockRestore();
        });

        test("Should pass correct parameters to calculateMultiHashHref with joined paths", () => {
            // Arrange
            const spy = vi.spyOn(calculateMultiHashHrefModule, 'calculateMultiHashFragment').mockReturnValue('p1=/path1/path2;p2=/another/path');
            
            // Act
            const href = calculateHref({ hash: 'p1' }, '/path1', '/path2');

            // Assert
            expect(spy).toHaveBeenCalledWith({ p1: '/path1/path2' });
            expect(href).toBe('#p1=/path1/path2;p2=/another/path');
            
            spy.mockRestore();
        });
    });
});
