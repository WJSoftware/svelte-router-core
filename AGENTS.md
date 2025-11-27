# Svelte Router Routing Library

## Library Architecture Overview

### Routing Universes Concept

The @svelte-router/core routing library supports simultaneous path and hash routing through "routing universes":

- **Path Routing** (`hash: false`): Uses URL pathname
- **Single Hash Routing** (`hash: true`): Uses URL hash as a single path (e.g., `#/path/to/route`)
- **Multi Hash Routing** (`hash: 'p1'`): Uses semicolon-separated hash segments (e.g., `#p1=/path;p2=/other`)
- **Implicit Path Routing** (`hash: undefined`, `defaultHash: false`): Resolves to path routing
- **Implicit Hash Routing** (`hash: undefined`, `defaultHash: true`): Resolves to hash routing
- **Implicit Named Hash Routing** (`hash: undefined`, `defaultHash: <a string>`):  Resolves to named (multi) hash routing

#### Example Multi-Universe Setup
```svelte
<Router>
    <Route path="/hash-feature/*">
        <Router hash>
            <Route hash path="/">
                <RouteHashHome />
            </Route>
            <Route path="/non-hash-route">
                <NonHashContentForSomeReason />
            </Route>
        </Router>
    </Route>
</Router>
```

### Context System

Context is stored per universe using Svelte's `setContext()` with keys from `getRouterContextKey()`:
- Path routing: `parentCtxKey` symbol
- Single hash routing: `hashParentCtxKey` symbol  
- Multi hash routing: `Symbol.for('hsh-${hashId}')` per hash ID

### RouterEngine Core

The `RouterEngine` class is the heart of the routing system:

#### Routes Structure
```typescript
routes: Record<string, RouteInfo>
```

Where `RouteInfo` contains:
- `pattern?: string` or `regex?: RegExp`: For URL matching
- `and?: (routeParams) => boolean`: Additional predicate for additional constraining, like guarded routes
- `ignoreForFallback?: boolean`: Excludes route from fallback calculations

#### Reactive Properties
- `routeStatus`: Per-route match status and extracted parameters
- `fallback`: Boolean indicating NO routes matched (excluding `ignoreForFallback` routes)

### Component Architecture

Except for the `LinkContext` components, all components possess the `hash: Hash` property to specify the routing 
universe they belong to.

#### Router Component
- Creates `RouterEngine` instance
- Sets up context for child components
- Provides `state` and `routeStatus` to children

#### Route Component
- Registers route patterns with parent router
- Uses context to find parent router
- Props: `path` (string pattern/regex) and `and` (predicate function)

#### Fallback Component
- Shows content when no routes match
- Props:
  - `when?: WhenPredicate`: Override default `fallback` behavior
  - `children`: Content snippet

Render logic:
```svelte
{#if (router && when?.(router.routeStatus, router.fallback)) || (!when && router?.fallback)}
  {@render children?.(router.state, router.routeStatus)}
{/if}
```

## Library Initialization

The `init()` function:
- Passes library configuration to global singleton
- Creates new Location implementation instance
- Returns a cleanup function; mainly used in unit testing but valid anywhere as required.
- Required when library configurations change
- Multi hash routing needs cleanup between tests

```typescript
// Standard init
const cleanup = init();

// Multi hash mode
const cleanup = init({ hashMode: 'multi' });

// Always cleanup
afterAll(() => {
    cleanup();
});
```

## Extensibility

This library supports the creation of extension NPM packages by allowing custom implementations of the `Location`, `HistoryApi` and `FullModeHistoryApi` interfaces.

`Location` implementations are in charge of obtaining the current environment URL and keeping it in sync across navigation.  They read the environment's URL and sets up reactive `$state` and `$derived` data for the rest of components and the application that consumes the package.

`HistoryApi` implementations are helpers for the `Location` implementations.  They either tap into or completely replace the environment's history API to fulfill the sought objective.

NPM extension packages may opt to provide custom implementations for any of these interfaces.  They may (and are encouraged to) expose their own initialization functions to provide customized or new options, and to remove stock initialization options that should not be touched by consumers.

Custom initialization functions must ultimately call this package's `initCore()` function with the desired values; NPM extension packages can provide any number of initialization functions.

### Location Implementations

#### LocationLite

- Default library option
- By default, uses the `StockHistoryApi` class as its `HistoryApi` implementation
- Base class for `LocationFull`

#### LocationFull

- By default, uses the `InterceptedHistoryApi` class as its `FullModeHistoryApi` implementation

### HistoryApi and FullModeHistoryApi Implementations

#### StockHistoryApi

- Relays all functionality to the environment's history object
- Synchronizes reactive values as needed while being used

#### InterceptedHistoryApi

- Extends the `StockHistoryApi` class
- Replaces the environment's history object with itself on construction
- Provides the logic for the `beforeNavigate` and `navigationCancelled` events

## Testing Patterns & Best Practices

### Test Structure Categories

#### **1. Default Props Tests**
Test component behavior with minimal/default property values:
```typescript
function defaultPropsTests(setup: ReturnType<typeof createRouterTestSetup>) {
    beforeEach(() => setup.init());
    afterAll(() => setup.dispose());
    
    test("Should behave correctly with default props.", () => {
        // Test with hash: undefined and minimal props
        const { hash, context } = setup;
        render(Component, { props: { hash, children: content }, context });
        // Assert default behavior
    });
}
```

#### **2. Explicit Props Tests**  
Test specific property configurations and overrides:
```typescript
function explicitPropsTests(setup: ReturnType<typeof createRouterTestSetup>) {
    test.each([
        { propValue: value1, scenario: "scenario1" },
        { propValue: value2, scenario: "scenario2" }
    ])("Should handle $scenario .", ({ propValue }) => {
        render(Component, { 
            props: { hash, specificProp: propValue, children: content }, 
            context 
        });
        // Assert specific behavior
    });
}
```

#### **3. Reactivity Tests**
Test two distinct types of reactivity:

**A. Prop Value Changes** (Component prop reactivity):
```typescript
test("Should re-render when prop value changes.", async () => {
    const { rerender } = render(Component, {
        props: { when: () => false, children: content }
    });
    
    // Change the entire prop value
    await rerender({ when: () => true, children: content });
    
    // Assert new behavior
});
```

**B. Reactive State Changes** (Svelte rune reactivity):
```typescript
test("Should re-render when reactive dependency changes.", async () => {
    let reactiveState = $state(false);
    
    render(Component, {
        props: { when: () => reactiveState, children: content } // Same function, reactive dependency
    });
    
    // Change the reactive state
    reactiveState = true;
    flushSync(); // Only use if the assertion depends on Svelte $effect's having run to completion
    
    // Assert reactive behavior
});
```

### Testing Principles

#### **Focus on Observable Behavior, Not Implementation**
```typescript
// ✅ Good - Test what the user sees
test("Should hide content when routes match.", () => {
    addMatchingRoute(router);
    const { queryByText } = render(Component, { props, context });
    expect(queryByText("content")).toBeNull();
});

// ❌ Bad - Test internal implementation
test("Should call router.fallback.", () => {
    const spy = vi.spyOn(router, 'fallback');
    render(Component, { props, context });
    expect(spy).toHaveBeenCalled(); // Testing implementation detail
});
```

#### **Maintain Clear Testing Boundaries**
```typescript
// ✅ Component tests focus on component behavior
test("Component renders when condition is met.", () => {
    // Setup: Create the condition (however that's achieved)
    // Test: Component responds correctly
});

// ✅ Router tests focus on router logic (separate file)
test("Router calculates fallback correctly.", () => {
    // Test router's internal logic
});
```

#### **Ensure Test Isolation**
```typescript
// ✅ Fresh instance for each test
beforeEach(() => {
    setup.init(); // Creates new router
});

// ❌ Reusing router instances
beforeAll(() => {
    setup.init(); // Same router for all tests - bad!
});
```

Use data-driven testing across **all 5 routing universes**:

```typescript
// Import the complete universe definitions
import { ROUTING_UNIVERSES } from "$test/test-utils.js";

ROUTING_UNIVERSES.forEach((ru) => {
    describe(`Component - ${ru.text}`, () => {
        let cleanup: () => void;
        beforeAll(() => {
            cleanup = init({ 
                defaultHash: ru.defaultHash,
                hashMode: ru.hashMode
            });
        });
        afterAll(() => {
            cleanup();
        });
        
        describe("Default Props", () => {
            // Component behavior with minimal/default props
        });
        describe("Explicit Props", () => {
            // Testing specific prop configurations
        });
        describe("Reactivity", () => {
            // Testing dynamic changes and reactive behavior
        });
    });
});
```

See `src/testing/test-utils.ts` for the complete `ROUTING_UNIVERSES` array definition with all universe configurations.

### Context Setup

```typescript
// Full source in src/testing/test-utils.ts
function createRouterTestSetup(hash: Hash | undefined): {
    readonly hash: Hash | undefined;
    readonly router: RouterEngine;
    readonly context: Map<any, any>;
    init: () => void;
    dispose: () => void;
};

// Usage in tests
beforeEach(() => {
    setup.init(); // Fresh router for each test
});

afterAll(() => {
    setup.dispose(); // Clean disposal
});
```

### Route Manipulation

```typescript
// Add a single matching route
addMatchingRoute(router, 'optionalRouteName');

// Add a single non-matching route  
addNonMatchingRoute(router, 'optionalRouteName');

// Add multiple routes at once
addRoutes(router, {
    matching: 2,           // Adds 2 matching routes
    nonMatching: 1         // Adds 1 non-matching route
});

// Add explicit custom routes using rest parameters
addRoutes(router, 
    { matching: 1 },
    { pattern: "/api/:id", name: "api-route" },
    { regex: /^\/test$/ } // Auto-generated name
);

// Manual route addition
router.routes["routeName"] = {
    pattern: "/some/path",
    and: () => true,
    ignoreForFallback: false
};
```

### Testing Library Performance Tips

- **Use `queryByText`** for negative assertions (element should NOT exist)
- **Use `findByText`** for positive assertions (element should exist)
- **Avoid `expect().rejects`** with `findByText` - it waits 1000ms timeout

```typescript
// ❌ Slow - waits 1000ms timeout
await expect(findByText(content)).rejects.toThrow();

// ✅ Fast - immediate result
expect(queryByText(content)).toBeNull();
```

### Testing Bindable Properties

**Bindable properties** (declared with `$bindable()` and used with `bind:` in Svelte) require special testing patterns since they involve two-way data binding between parent and child components.

#### **The Getter/Setter Pattern (Recommended)**

The most effective way to test bindable properties is using getter/setter functions in the `render()` props:

```typescript
test("Should bind property correctly", async () => {
    // Arrange: Set up binding capture
    let capturedValue: any;
    const propertySetter = vi.fn((value) => { capturedValue = value; });

    // Act: Render component with bindable property
    render(Component, {
        props: {
            // Other props...
            get bindableProperty() { return capturedValue; },
            set bindableProperty(value) { propertySetter(value); }
        },
        context
    });

    // Trigger the binding (component-specific logic)
    // e.g., navigate to a route, trigger an event, etc.
    // Might require the use of Svelte's flushSync() function if the update depends on effects running.
    await triggerBindingUpdate();

    // Assert: Verify binding occurred
    expect(propertySetter).toHaveBeenCalled();
    expect(capturedValue).toEqual(expectedValue);
});
```

#### **Testing Across Routing Modes**

For components that work across multiple routing universes, test bindable properties for each mode:

```typescript
function bindablePropertyTests(setup: ReturnType<typeof createRouterTestSetup>, ru: RoutingUniverse) {
    test("Should bind property when condition is met.", async () => {
        const { hash, context } = setup;
        let capturedValue: any;
        const propertySetter = vi.fn((value) => { capturedValue = value; });

        render(Component, {
            props: {
                hash,
                get boundProperty() { return capturedValue; },
                set boundProperty(value) { propertySetter(value); },
                // Other component-specific props
            },
            context
        });

        // Trigger binding based on routing mode
        const shouldUseHash = (ru.defaultHash === true) || (hash === true) || (typeof hash === 'string');
        const url = shouldUseHash ? "http://example.com/#/test" : "http://example.com/test";
        location.url.href = url;
        await vi.waitFor(() => {});

        expect(propertySetter).toHaveBeenCalled();
        expect(capturedValue).toEqual(expectedValue);
    });

    test("Should update binding when conditions change.", async () => {
        // Test binding updates during navigation or state changes
        let capturedValue: any;
        const propertySetter = vi.fn((value) => { capturedValue = value; });

        render(Component, {
            props: {
                hash,
                get boundProperty() { return capturedValue; },
                set boundProperty(value) { propertySetter(value); }
            },
            context
        });

        // First state
        await triggerFirstState();
        expect(capturedValue).toEqual(firstExpectedValue);

        // Second state
        await triggerSecondState();
        expect(capturedValue).toEqual(secondExpectedValue);
    });
}

// Apply to all routing universes
ROUTING_UNIVERSES.forEach((ru) => {
    describe(`Component - ${ru.text}`, () => {
        const setup = createRouterTestSetup(ru.hash);
        // ... setup code ...

        describe("Bindable Properties", () => {
            bindablePropertyTests(setup, ru);
        });
    });
});
```

#### **Handling Mode-Specific Limitations**

Some routing modes may have different behavior or limitations. Handle these gracefully:

```typescript
test("Should handle complex binding scenarios.", async () => {
    let capturedValue: any;
    const propertySetter = vi.fn((value) => { capturedValue = value; });

    render(Component, {
        props: {
            get boundProperty() { return capturedValue; },
            set boundProperty(value) { propertySetter(value); }
        },
        context
    });

    await triggerBinding();

    expect(propertySetter).toHaveBeenCalled();
    
    // Handle mode-specific edge cases
    if (ru.text === 'MHR') {
        // Multi Hash Routing may require different URL format or setup
        // Skip complex assertions that aren't supported yet
        return;
    }
    
    expect(capturedValue).toEqual(expectedComplexValue);
});
```

#### **Type Conversion Awareness**

When testing components that perform automatic type conversion (like RouterEngine), account for expected type changes:

```typescript
test("Should bind with correct type conversion.", async () => {
    let capturedParams: any;
    const paramsSetter = vi.fn((value) => { capturedParams = value; });

    render(RouteComponent, {
        props: {
            path: "/user/:userId/post/:postId",
            get params() { return capturedParams; },
            set params(value) { paramsSetter(value); }
        },
        context
    });

    // Navigate to URL with string parameters
    location.url.href = "http://example.com/user/123/post/456";
    await vi.waitFor(() => {});

    expect(paramsSetter).toHaveBeenCalled();
    // Expect automatic string-to-number conversion
    expect(capturedParams).toEqual({ 
        userId: 123,    // number, not "123"
        postId: 456     // number, not "456"
    });
});
```

#### **Anti-Patterns to Avoid**

❌ **Don't use wrapper components for simple binding tests**:
```typescript
// Bad - overcomplicated
const WrapperComponent = () => {
    let boundValue = $state();
    return `<Component bind:property={boundValue} />`;
};
```

❌ **Don't test binding implementation details**:
```typescript
// Bad - testing internal mechanics
expect(component.$$.callbacks.boundProperty).toHaveBeenCalled();
```

❌ **Don't forget routing mode compatibility**:
```typescript
// Bad - hardcoded to one routing mode
location.url.href = "http://example.com/#/test"; // Only works for hash routing
```

✅ **Use the getter/setter pattern for clean, direct testing**:
```typescript
// Good - direct, simple, effective
render(Component, {
    props: {
        get boundProperty() { return capturedValue; },
        set boundProperty(value) { propertySetter(value); }
    }
});
```

#### **Real-World Example: Route Parameter Binding**

```typescript
test("Should bind route parameters correctly.", async () => {
    // Arrange
    const { hash, context } = setup;
    let capturedParams: any;
    const paramsSetter = vi.fn((value) => { capturedParams = value; });

    // Act
    render(TestRouteWithRouter, {
        props: {
            hash,
            routePath: "/user/:userId",
            get params() { return capturedParams; },
            set params(value) { paramsSetter(value); },
            children: createTestSnippet('<div>User {params?.userId}</div>')
        },
        context
    });

    // Navigate to matching route
    const shouldUseHash = (ru.defaultHash === true) || (hash === true) || (typeof hash === 'string');
    location.url.href = shouldUseHash ? "http://example.com/#/user/42" : "http://example.com/user/42";
    await vi.waitFor(() => {});

    // Assert
    expect(paramsSetter).toHaveBeenCalled();
    expect(capturedParams).toEqual({ userId: 42 }); // Note: number due to auto-conversion
});
```

This pattern provides:
- **Clear test intent**: What binding behavior is being tested
- **Routing mode compatibility**: Works across all universe types
- **Type safety**: Captures actual bound values for verification
- **Maintainability**: Simple, readable test structure

### Required Imports

```typescript
import { init, type Hash } from "$lib/index.js";
import { describe, test, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { render } from "@testing-library/svelte";
import { RouterEngine } from "$lib/kernel/RouterEngine.svelte.js";
import { getRouterContextKey } from "../Router/Router.svelte";
import { createRawSnippet } from "svelte";
import { flushSync } from "svelte"; // For Svelte 5 reactivity testing
import { 
    addMatchingRoute, 
    addRoutes, 
    createRouterTestSetup, 
    createTestSnippet, 
    ROUTING_UNIVERSES 
} from "../testing/test-utils.js"; // Note: moved outside $lib
```

### Snippet Creation for Testing

```typescript
// Using test utility (recommended)
const content = createTestSnippet("Component content text");

// Manual creation
const contentText = "Component content.";
const content = createRawSnippet(() => {
    return {
        render: () => `<div>${contentText}</div>`
    };
});
```

### Test Description Conventions

- Description should be a full English sentence
- Must start capitalized
- Must end with a period
- In data-driven tests (`test.each()()`), ensure the sentence generated is unique among all test cases by interpolating test case data in the sentence
- Feel free to create description-only test case properties in test cases to help build a good description sentence:
    ```typescript
    test.each([
        {
            text1: 'throw',
            text2: 'no'
            ...
        },
        {
            text1: 'not throw',
            text2: 'one or more'
        }
    ])("Should $text1 whenever the array has $text2 items.", ...);
    ```

### Gotcha's

- When the test case is a POJO object and a property is used to build a good description sentence:
    ```typescript
    // Doesn't work:  The ending period cannot "touch" the placeholder identifier or vitest will be confused.
    test.each([...])("Should ... $text.", ...);
    // Workaround:  Add a space before the sentence's ending period.
    test.each([...])("Should ... $text .", ...);
    ```

## Test File Naming for Svelte 5

**Important**: For tests that use Svelte 5 runes (`$state`, `$derived`, etc.), name your test files with `.svelte.test.ts`:

```
✅ Component.svelte.test.ts  // Enables Svelte runes
❌ Component.test.ts         // Standard test file
```

This allows you to use reactive state in tests:
```typescript
test("Should react to state changes.", () => {
    let reactiveValue = $state(false);
    
    render(Component, {
        props: { when: () => reactiveValue }
    });
    
    reactiveValue = true;
    flushSync(); // Ensure reactive updates are processed
});
```

## Component-Specific Testing Notes

### Fallback Component

**Purpose**: Render content when no routes match, with override capability

**Key behaviors to test**:
1. Shows when `router.fallback` is true
2. Hides when routes are matching  
3. Respects `when` predicate override
4. Works across all routing universes

**Common test scenarios**:
- Empty router (no routes) → should show
- Router with matching routes → should hide
- Router with only `ignoreForFallback` routes → should show
- Custom `when` predicate scenarios

### Route Component

**Purpose**: Register route patterns and respond to matches

**Key behaviors to test**:
1. Route registration with parent router
2. Pattern matching (string patterns, regex, parameters)
3. `and` predicate evaluation
4. `ignoreForFallback` behavior

### Router Component

**Purpose**: Create routing context and manage child routes

**Key behaviors to test**:
1. Context creation and propagation
2. Base path handling
3. Route status calculation
4. State management per universe

## Common Gotchas

1. **Context Keys**: Must use correct `getRouterContextKey(hash)` for each universe
2. **Cleanup**: Multi hash routing requires proper `init()` cleanup between test suites
3. **Route Clearing**: Always clear `router.routes` between tests for clean slate
4. **Async Testing**: Use `queryByText` for immediate results vs `findByText` for async waiting
5. **Hash Values**: Ensure hash values match between component props and context setup
6. **File Naming**: Use `.svelte.test.ts` for files that need Svelte runes support
7. **Reactivity**: If a test depends on waiting for a Svelte effect to run, use `flushSync()` after changing reactive state
8. **Prop vs State Reactivity**: Test both prop changes AND reactive dependency changes
9. **Bindable Properties**: Use getter/setter pattern in `render()` props instead of wrapper components for testing two-way binding

## Advanced Testing Infrastructure

### Browser API Mocking

For testing components that rely on `window.location` and `window.history` (like `RouterEngine`), use the comprehensive browser mocking utilities:

```typescript
import { setupBrowserMocks } from "$test/test-utils.js";

describe("Component requiring browser APIs", () => {
    beforeEach(() => {
        // Automatically mocks window.location, window.history, and integrates with library Location
        setupBrowserMocks("/initial/path");
    });
    
    test("Should respond to location changes.", () => {
        // Browser APIs are now mocked and integrated with library
        window.history.pushState({}, "", "/new/path");
        // Test component behavior
    });
});
```

**What `setupBrowserMocks()` provides**:
- Complete `window.location` mock with all properties (href, pathname, hash, search, etc.)
- Full `window.history` mock with `pushState`, `replaceState`, and state management
- Automatic `popstate` event triggering on location changes
- Integration with library's `LocationLite` for synchronized state
- Proper cleanup between tests

### Enhanced Route Management

The `addRoutes()` utility supports multiple approaches for flexible route setup:

```typescript
// Simple route counts
addRoutes(router, { matching: 2, nonMatching: 1 });

// RouteSpecs approach for custom route definitions
addRoutes(router, { 
    matching: { count: 2, specs: { pattern: "/custom/:id" } },
    nonMatching: { count: 1, specs: { pattern: "/other" } }
});

// Rest parameters for explicit route definitions (NEW)
addRoutes(router, 
    { matching: 1, nonMatching: 0 },
    { pattern: "/api/users/:id", name: "user-detail" },
    { regex: /^\/products\/\d+$/, name: "product" },
    { pattern: "/settings" } // Name auto-generated if not provided
);

// Combined approach
addRoutes(router,
    { matching: 2 }, // Generate 2 matching routes
    { pattern: "/custom", name: "custom-route" }, // Add specific route
    { pattern: "/another" } // Add another with auto-generated name
);
```

**Rest Parameters Benefits:**
- **Explicit control**: Define exact routes with specific patterns/regex
- **Named routes**: Optional `name` property for predictable route keys
- **Type safety**: Full IntelliSense support for `RouteInfo` properties
- **Flexible mixing**: Combine generated routes with explicit definitions

Refer to `src/testing/test-utils.ts` for complete function signatures and type definitions.

### Universe-Based Testing Pattern

**Complete test coverage across all 5 routing universes** using the standardized pattern:

```typescript
import { ROUTING_UNIVERSES } from "$test/test-utils.js";

// ✅ Recommended: Test ALL universes with single loop
ROUTING_UNIVERSES.forEach((universe) => {
    describe(`Component (${universe.text})`, () => {
        let cleanup: () => void;
        let setup: ReturnType<typeof createRouterTestSetup>;
        
        beforeAll(() => {
            cleanup = init({ 
                defaultHash: universe.defaultHash,
                hashMode: universe.hashMode
            });
            setup = createRouterTestSetup(universe.hash);
        });
        
        afterAll(() => {
            cleanup();
            setup.dispose();
        });
        
        beforeEach(() => {
            setup.init(); // Fresh router per test
            setupBrowserMocks("/"); // Fresh browser state
        });
        
        test(`Should behave correctly in ${universe.text}`, () => {
            // Test logic that works across all universes
            const { hash, context, router } = setup;
            
            // Use universe.text for concise test descriptions
            expect(universe.text).toMatch(/^(IMP|IMH|PR|HR|MHR)$/);
        });
    });
});
```

**Benefits**:
- **100% Universe Coverage**: Ensures behavior works across all routing modes
- **Consistent Test Structure**: Standardized setup and teardown patterns
- **Efficient Execution**: Vitest's dynamic skipping capabilities maintain performance
- **Clear Reporting**: Each universe shows as separate test suite with meaningful names

### Self-Documenting Test Constants

Use dictionary-based constants for better maintainability:

```typescript
// Import self-documenting hash values
import { ALL_HASHES } from "$test/test-utils.js";

// Usage in tests
test("Should validate hash compatibility.", () => {
    expect(() => {
        new RouterEngine({ hash: ALL_HASHES.single });
    }).not.toThrow();
});
```

See `src/testing/test-utils.ts` for the complete `ALL_HASHES` dictionary definition.

**Dictionary Benefits**:
- **Self-Documentation**: `ALL_HASHES.single` is clearer than `true`
- **Single Source of Truth**: Change values in one place
- **Type Safety**: TypeScript can validate usage
- **Discoverability**: IDE autocomplete shows available options

### Constructor Validation Testing

For components with runtime validation, test all error scenarios systematically:

```typescript
describe("Constructor hash validation", () => {
    test.each([
        { parent: ALL_HASHES.path, child: ALL_HASHES.single, desc: 'path parent vs hash child' },
        { parent: ALL_HASHES.single, child: ALL_HASHES.path, desc: 'hash parent vs path child' },
        { parent: ALL_HASHES.multi, child: ALL_HASHES.path, desc: 'multi-hash parent vs path child' },
        { parent: ALL_HASHES.path, child: ALL_HASHES.multi, desc: 'path parent vs multi-hash child' }
    ])("Should throw error when parent and child have different hash modes: $desc .", ({ parent, child }) => {
        expect(() => {
            const parentRouter = new RouterEngine({ hash: parent });
            new RouterEngine(parentRouter, { hash: child });
        }).toThrow("Parent and child routers must use the same hash mode");
    });
    
    test.each([
        { parent: ALL_HASHES.path, desc: 'path parent' },
        { parent: ALL_HASHES.single, desc: 'hash parent' },
        { parent: ALL_HASHES.multi, desc: 'multi-hash parent' }
    ])("Should allow child router without explicit hash to inherit parent's hash: $desc .", ({ parent }) => {
        expect(() => {
            const parentRouter = new RouterEngine({ hash: parent });
            new RouterEngine(parentRouter);
        }).not.toThrow();
    });
});
```

### Performance Optimizations

**Browser Mock State Synchronization**:
```typescript
// ✅ Automatic state sync - setupBrowserMocks handles this
// Best practice: pass the library's location object for full integration
setupBrowserMocks("/initial", libraryLocationObject);
window.history.pushState({}, "", "/new"); // Automatically triggers popstate

// ❌ Manual sync required (old approach)
mockLocation.pathname = "/new";
window.dispatchEvent(new PopStateEvent('popstate')); // Manual event trigger
```

**Efficient Test Assertions**:
```typescript
// ✅ Fast negative assertions
expect(queryByText("should not exist")).toBeNull();

// ❌ Slow - waits for timeout
await expect(findByText("should not exist")).rejects.toThrow();

// ✅ Use findByText for elements that should exist
const element = await findByText("should exist");
expect(element).toBeInTheDocument();
```

## Test Utilities Location

Test utilities are centralized in `src/testing/test-utils.ts` (moved from `src/lib/testing/` for better organization) and excluded from the published package via the `"files"` property in `package.json`. During development, they build to `dist/testing/` but are not included in `npm pack`.

**Key utilities**:
- `setupBrowserMocks()`: Complete browser API mocking with library integration
- `addRoutes()`: Enhanced route management with RouteSpecs support
- `createRouterTestSetup()`: Standardized router setup with proper lifecycle
- `ROUTING_UNIVERSES`: Complete universe definitions for comprehensive testing
- `ALL_HASHES`: Self-documenting hash value constants
