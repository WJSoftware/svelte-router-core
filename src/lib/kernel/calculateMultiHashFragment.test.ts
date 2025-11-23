import { describe, test, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { calculateMultiHashFragment } from "./calculateMultiHashFragment.js";
import { init } from "../init.js";
import { location } from "./Location.js";

describe("calculateMultiHashHref", () => {
    let cleanup: Function;
    
    beforeAll(() => {
        cleanup = init({ hashMode: 'multi' });
    });
    
    afterAll(() => {
        cleanup();
    });

    describe("Basic functionality", () => {
        beforeEach(() => {
            // Reset location to a clean state with multiple hash paths
            location.url.href = "https://example.com#p1=/initial/path;p2=/another/path;p3=/third/path";
        });

        test("Should preserve existing paths not specified in input.", () => {
            // Act
            const result = calculateMultiHashFragment({ p1: "/new/path" });

            // Assert
            expect(result).toBe("p1=/new/path;p2=/another/path;p3=/third/path");
        });

        test("Should update existing paths when specified in input.", () => {
            // Act
            const result = calculateMultiHashFragment({ 
                p2: "/updated/path",
                p3: "/also/updated"
            });

            // Assert
            expect(result).toBe("p1=/initial/path;p2=/updated/path;p3=/also/updated");
        });

        test("Should add new hash paths not present in existing paths.", () => {
            // Act
            const result = calculateMultiHashFragment({ 
                p4: "/new/hash/path",
                p5: "/another/new/path"
            });

            // Assert
            expect(result).toBe("p1=/initial/path;p2=/another/path;p3=/third/path;p4=/new/hash/path;p5=/another/new/path");
        });

        test("Should handle combination of preserving, updating, and adding paths.", () => {
            // Act
            const result = calculateMultiHashFragment({ 
                p2: "/updated/existing",
                p4: "/brand/new",
                p6: "/another/new"
            });

            // Assert
            expect(result).toBe("p1=/initial/path;p2=/updated/existing;p3=/third/path;p4=/brand/new;p6=/another/new");
        });
    });

    describe("Edge cases", () => {
        test("Should handle empty input when existing paths are present.", () => {
            // Arrange
            location.url.href = "https://example.com#p1=/path/one;p2=/path/two";

            // Act
            const result = calculateMultiHashFragment({});

            // Assert
            expect(result).toBe("p1=/path/one;p2=/path/two");
        });

        test("Should handle input when no existing paths are present.", () => {
            // Arrange
            location.url.href = "https://example.com";

            // Act
            const result = calculateMultiHashFragment({ 
                p1: "/first/path",
                p2: "/second/path"
            });

            // Assert
            expect(result).toBe("p1=/first/path;p2=/second/path");
        });

        test("Should handle empty input with no existing paths.", () => {
            // Arrange
            location.url.href = "https://example.com";

            // Act
            const result = calculateMultiHashFragment({});

            // Assert
            expect(result).toBe("");
        });

        test("Should handle single existing path being updated.", () => {
            // Arrange
            location.url.href = "https://example.com#p1=/original/path";

            // Act
            const result = calculateMultiHashFragment({ p1: "/updated/path" });

            // Assert
            expect(result).toBe("p1=/updated/path");
        });

        test("Should handle single new path with no existing paths.", () => {
            // Arrange
            location.url.href = "https://example.com";

            // Act
            const result = calculateMultiHashFragment({ p1: "/new/path" });

            // Assert
            expect(result).toBe("p1=/new/path");
        });
    });

    describe("Path value handling", () => {
        beforeEach(() => {
            location.url.href = "https://example.com#p1=/base/path";
        });

        test("Should handle root paths correctly.", () => {
            // Act
            const result = calculateMultiHashFragment({ 
                p1: "/",
                p2: "/"
            });

            // Assert
            expect(result).toBe("p1=/;p2=/");
        });

        test("Should remove paths when given empty path values.", () => {
            // Act
            const result = calculateMultiHashFragment({ 
                p1: "",
                p2: ""
            });

            // Assert - Empty paths should be completely removed
            expect(result).toBe("");
        });

        test("Should handle complex nested paths.", () => {
            // Act
            const result = calculateMultiHashFragment({ 
                p1: "/users/123/profile/edit",
                p2: "/admin/settings/permissions/advanced"
            });

            // Assert
            expect(result).toBe("p1=/users/123/profile/edit;p2=/admin/settings/permissions/advanced");
        });

        test("Should preserve path parameters and special characters.", () => {
            // Act
            const result = calculateMultiHashFragment({ 
                p1: "/api/users/:id",
                p2: "/path/with-dashes/and_underscores"
            });

            // Assert
            expect(result).toBe("p1=/api/users/:id;p2=/path/with-dashes/and_underscores");
        });
    });

    describe("Empty string path removal", () => {
        beforeEach(() => {
            location.url.href = "https://example.com#p1=/existing/path;p2=/another/existing;p3=/third/existing";
        });

        test("Should remove existing paths when updated with empty string.", () => {
            // Act
            const result = calculateMultiHashFragment({ p2: "" });

            // Assert - p2 should be completely removed
            expect(result).toBe("p1=/existing/path;p3=/third/existing");
        });

        test("Should not add new paths when given empty string.", () => {
            // Act
            const result = calculateMultiHashFragment({ p4: "" });

            // Assert - p4 should not be added at all
            expect(result).toBe("p1=/existing/path;p2=/another/existing;p3=/third/existing");
        });

        test("Should handle mix of valid updates and empty string removals.", () => {
            // Act
            const result = calculateMultiHashFragment({ 
                p1: "/updated/path", // Update existing
                p2: "", // Remove existing
                p4: "/new/path" // Add new valid
            });

            // Assert
            expect(result).toBe("p1=/updated/path;p3=/third/existing;p4=/new/path");
        });

        test("Should handle all existing paths being cleared with empty strings.", () => {
            // Act
            const result = calculateMultiHashFragment({ 
                p1: "",
                p2: "",
                p3: ""
            });

            // Assert - All paths removed, result should be empty
            expect(result).toBe("");
        });

        test("Should distinguish between empty string (removal) and valid root path.", () => {
            // Arrange
            location.url.href = "https://example.com#p1=/existing";

            // Act
            const result = calculateMultiHashFragment({ 
                p1: "/", // Valid root path
                p2: "", // Empty string - should be skipped
                p3: "/valid" // Valid path
            });

            // Assert - Only valid paths should be included
            expect(result).toBe("p1=/;p3=/valid");
        });

        test("Should preserve order when some paths are removed via empty strings.", () => {
            // Arrange
            location.url.href = "https://example.com#a=/path/a;b=/path/b;c=/path/c;d=/path/d;e=/path/e";

            // Act - Remove alternating paths with empty strings
            const result = calculateMultiHashFragment({ 
                a: "/updated/a",
                b: "", // Remove
                c: "/updated/c", 
                d: "", // Remove
                f: "/new/f"
            });

            // Assert - Should maintain original order for kept paths, append new ones
            expect(result).toBe("a=/updated/a;c=/updated/c;e=/path/e;f=/new/f");
        });

        test("Should handle when only empty strings are provided for new paths.", () => {
            // Arrange
            location.url.href = "https://example.com#existing=/kept";

            // Act
            const result = calculateMultiHashFragment({ 
                new1: "",
                new2: "",
                new3: ""
            });

            // Assert - No new paths should be added, only existing preserved
            expect(result).toBe("existing=/kept");
        });
    });

    describe("Hash ID handling", () => {
        beforeEach(() => {
            location.url.href = "https://example.com#main=/main/path;secondary=/secondary/path";
        });

        test("Should handle various hash ID formats.", () => {
            // Act
            const result = calculateMultiHashFragment({ 
                "main": "/updated/main",
                "my-hash": "/new/dash",
                "my_hash": "/new/underscore",
                "hash123": "/numeric/suffix"
            });

            // Assert
            expect(result).toBe("main=/updated/main;secondary=/secondary/path;my-hash=/new/dash;my_hash=/new/underscore;hash123=/numeric/suffix");
        });

        test("Should handle single character hash IDs.", () => {
            // Act
            const result = calculateMultiHashFragment({ 
                "a": "/path/a",
                "x": "/path/x",
                "z": "/path/z"
            });

            // Assert
            expect(result).toBe("main=/main/path;secondary=/secondary/path;a=/path/a;x=/path/x;z=/path/z");
        });
    });

    describe("Order preservation", () => {
        test("Should maintain existing path order and append new paths in input order.", () => {
            // Arrange
            location.url.href = "https://example.com#zebra=/z/path;alpha=/a/path;beta=/b/path";

            // Act
            const result = calculateMultiHashFragment({ 
                gamma: "/g/path",
                alpha: "/updated/a/path",
                delta: "/d/path"
            });

            // Assert
            // Existing paths maintain their original order, new paths are appended in input order
            expect(result).toBe("zebra=/z/path;alpha=/updated/a/path;beta=/b/path;gamma=/g/path;delta=/d/path");
        });

        test("Should preserve order when only adding new paths.", () => {
            // Arrange
            location.url.href = "https://example.com#c=/c/path;a=/a/path;b=/b/path";

            // Act
            const result = calculateMultiHashFragment({ 
                z: "/z/path",
                x: "/x/path",
                y: "/y/path"
            });

            // Assert
            expect(result).toBe("c=/c/path;a=/a/path;b=/b/path;z=/z/path;x=/x/path;y=/y/path");
        });
    });

    describe("Cross-universe redirection use cases", () => {
        test("Should support clearing a source universe path while setting target universe path.", () => {
            // Arrange - simulate having both source and target universes
            location.url.href = "https://example.com#source=/current/source/path;target=/current/target/path";

            // Act - Clear source and redirect to new target
            const result = calculateMultiHashFragment({ 
                source: "", // Clear the source universe with empty string
                target: "/new/target/path" // Set new target path
            });

            // Assert - Source should be completely removed, not left as empty
            expect(result).toBe("target=/new/target/path");
        });

        test("Should support updating multiple universes simultaneously for complex redirection scenarios.", () => {
            // Arrange
            location.url.href = "https://example.com#main=/main/current;sidebar=/sidebar/current;modal=/modal/current";

            // Act - Complex cross-universe update scenario
            const result = calculateMultiHashFragment({ 
                main: "/main/redirected",
                sidebar: "", // Clear sidebar with empty string
                modal: "/modal/new",
                notifications: "/notifications/init" // Add new universe
            });

            // Assert - Sidebar should be completely removed, not left as empty
            expect(result).toBe("main=/main/redirected;modal=/modal/new;notifications=/notifications/init");
        });
    });
});
