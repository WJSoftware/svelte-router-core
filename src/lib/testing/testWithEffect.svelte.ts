import { test } from "vitest";

export function testWithEffect(name: string, fn: () => void | Promise<void>) {
    test(name, () => {
        let promise!: void | Promise<void>;
        const cleanup = $effect.root(() => {
            promise = fn();
        });
        if (promise) {
            return promise.finally(cleanup);
        }
        else {
            cleanup();
        }
    });
}
