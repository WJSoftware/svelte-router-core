import { getContext, setContext } from "svelte";

const defaultTitle = "Svelte Router:  Live Demo";

export class TitleState {
    #current = $state(defaultTitle);

    constructor() {
        $effect(() => {
            document.title = this.current ? `${this.current} - ${defaultTitle}` : defaultTitle;
        });
    }

    get current() {
        return this.#current;
    }

    set current(v: string) {
        this.#current = v;
    }
}

const titleCtxKey = Symbol();

let titleState: TitleState;

export function initTitleContext() {
    titleState = setContext(titleCtxKey, new TitleState());
}

export function getTitleContext() {
    return getContext<TitleState>(titleCtxKey);
}
