import { describe, expect, test, beforeEach } from "vitest";
import { resetRoutingOptions, routingOptions, setRoutingOptions } from "./options.js";

describe("options", () => {
    test("Should have correct default value for hashMode option.", () => {
        expect(routingOptions.hashMode).toBe('single');
    });

    test("Should have correct default value for defaultHash option.", () => {
        expect(routingOptions.defaultHash).toBe(false);
    });

    test("Should have correct default value for disallowPathRouting option.", () => {
        expect(routingOptions.disallowPathRouting).toBe(false);
    });

    test("Should have correct default value for disallowHashRouting option.", () => {
        expect(routingOptions.disallowHashRouting).toBe(false);
    });

    test("Should have correct default value for disallowMultiHashRouting option.", () => {
        expect(routingOptions.disallowMultiHashRouting).toBe(false);
    });

    test("Should allow modification of hashMode option.", () => {
        const originalValue = routingOptions.hashMode;
        routingOptions.hashMode = 'multi';
        expect(routingOptions.hashMode).toBe('multi');

        // Restore original value
        routingOptions.hashMode = originalValue;
    });

    test("Should allow modification of defaultHash option.", () => {
        const originalValue = routingOptions.defaultHash;
        routingOptions.defaultHash = true;
        expect(routingOptions.defaultHash).toBe(true);

        // Restore original value
        routingOptions.defaultHash = originalValue;
    });

    test("Should contain all required properties as non-nullable.", () => {
        expect(routingOptions.hashMode).toBeDefined();
        expect(routingOptions.defaultHash).toBeDefined();
        expect(typeof routingOptions.hashMode).toBe('string');
        expect(typeof routingOptions.defaultHash).toBe('boolean');
    });

    describe('setRoutingOptions', () => {
        beforeEach(() => {
            // Reset to defaults before each test
            resetRoutingOptions();
        });

        test("Should merge options with current values when partial options provided.", () => {
            // Arrange - Set initial non-default values
            routingOptions.hashMode = 'multi';
            routingOptions.defaultHash = 'customHash';

            // Act - Set only one option
            setRoutingOptions({ disallowPathRouting: true });

            // Assert - Only specified option changed, others preserved
            expect(routingOptions.hashMode).toBe('multi');
            expect(routingOptions.defaultHash).toBe('customHash');
            expect(routingOptions.disallowPathRouting).toBe(true);
            expect(routingOptions.disallowHashRouting).toBe(false);
        });

        test("Should set all options when full configuration provided.", () => {
            // Arrange & Act
            setRoutingOptions({
                hashMode: 'multi',
                defaultHash: 'namedHash',
                disallowPathRouting: true,
                disallowHashRouting: true,
                disallowMultiHashRouting: false
            });

            // Assert
            expect(routingOptions.hashMode).toBe('multi');
            expect(routingOptions.defaultHash).toBe('namedHash');
            expect(routingOptions.disallowPathRouting).toBe(true);
            expect(routingOptions.disallowHashRouting).toBe(true);
            expect(routingOptions.disallowMultiHashRouting).toBe(false);
        });

        test("Should do nothing when called with undefined options.", () => {
            // Arrange - Set initial values
            const original = structuredClone(routingOptions);

            // Act
            setRoutingOptions(undefined);

            // Assert - No changes
            expect(routingOptions).deep.equal(original);
        });

        test("Should do nothing when called with empty options.", () => {
            // Arrange - Set initial values
            const original = structuredClone(routingOptions);

            // Act
            setRoutingOptions({});

            // Assert - No changes
            expect(routingOptions).deep.equal(original);
        });

        describe('Runtime validation', () => {
            test("Should throw error when hashMode is 'single' and defaultHash is a string.", () => {
                // Arrange & Act & Assert
                expect(() => {
                    setRoutingOptions({
                        hashMode: 'single',
                        defaultHash: 'namedHash'
                    });
                }).toThrow("Using a named hash path as the default path can only be done when 'hashMode' is set to 'multi'.");
            });

            test("Should throw error when hashMode is 'multi' and defaultHash is true.", () => {
                // Arrange & Act & Assert
                expect(() => {
                    setRoutingOptions({
                        hashMode: 'multi',
                        defaultHash: true
                    });
                }).toThrow("Using classic hash routing as default can only be done when 'hashMode' is set to 'single'.");
            });

            test("Should throw error when existing hashMode is 'single' and setting defaultHash to string.", () => {
                // Arrange
                routingOptions.hashMode = 'single';

                // Act & Assert
                expect(() => {
                    setRoutingOptions({ defaultHash: 'namedHash' });
                }).toThrow("Using a named hash path as the default path can only be done when 'hashMode' is set to 'multi'.");
            });

            test("Should throw error when existing defaultHash is true and setting hashMode to 'multi'.", () => {
                // Arrange
                routingOptions.defaultHash = true;

                // Act & Assert
                expect(() => {
                    setRoutingOptions({ hashMode: 'multi' });
                }).toThrow("Using classic hash routing as default can only be done when 'hashMode' is set to 'single'.");
            });

            test.each([
                { hashMode: 'single' as const, defaultHash: false, scenario: 'single hash mode with defaultHash false' },
                { hashMode: 'single' as const, defaultHash: true, scenario: 'single hash mode with defaultHash true' },
                { hashMode: 'multi' as const, defaultHash: false, scenario: 'multi hash mode with defaultHash false' },
                { hashMode: 'multi' as const, defaultHash: 'namedHash', scenario: 'multi hash mode with named hash' }
            ])("Should allow valid combination: $scenario .", ({ hashMode, defaultHash }) => {
                // Arrange & Act & Assert
                expect(() => {
                    setRoutingOptions({ hashMode, defaultHash });
                }).not.toThrow();

                expect(routingOptions.hashMode).toBe(hashMode);
                expect(routingOptions.defaultHash).toBe(defaultHash);
            });
        });
    });

    describe('resetRoutingOptions', () => {
        test("Should reset all options to defaults when resetRoutingOptions is called.", () => {
            // Arrange - First reset to ensure we start from defaults, then capture the baseline
            resetRoutingOptions();
            const expectedDefaults = structuredClone(routingOptions);
            
            // Modify all options to non-default values
            routingOptions.hashMode = 'multi';
            routingOptions.defaultHash = true;
            routingOptions.disallowPathRouting = true;
            routingOptions.disallowHashRouting = true;
            routingOptions.disallowMultiHashRouting = true;

            // Act.
            resetRoutingOptions();

            // Assert.
            expect(routingOptions).deep.equal(expectedDefaults);
        });
    });
});
