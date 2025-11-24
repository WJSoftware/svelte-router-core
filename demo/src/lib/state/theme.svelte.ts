const themeOptions = ['system', 'light', 'dark'] as const;

type ThemeIndex = 0 | 1 | 2;

function indexOfTheme(theme: 'system' | 'light' | 'dark'): ThemeIndex {
    const index = themeOptions.indexOf(theme);
    if (index === -1) {
        throw new Error(`Invalid theme: ${theme}`);
    }
    return index as ThemeIndex;
}

export class ThemeState {
    #current: ThemeIndex = $state(0);

    get current() {
        return themeOptions[this.#current];
    }
    set current(value: 'light' | 'dark' | 'system') {
        this.#current = indexOfTheme(value);
        this.#updateTheme();
    }

    #updateTheme() {
        if (this.#current === 0) {
            document.documentElement.removeAttribute('data-bs-theme');
            return;
        }
        document.documentElement.setAttribute('data-bs-theme', themeOptions[this.#current]);
    }

    nextTheme() {
        this.#current = (this.#current + 1) % themeOptions.length as ThemeIndex;
        this.#updateTheme();
    }
}

export default new ThemeState();
