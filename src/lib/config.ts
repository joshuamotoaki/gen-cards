import { writable } from "svelte/store";
import type { Theme } from "./types";

const createPersistedWritable = <T>(key: string, initialValue: T) => {
    const store = writable<T>(
        JSON.parse(localStorage.getItem(key) || JSON.stringify(initialValue))
    );

    return {
        subscribe: store.subscribe,
        update: store.update,
        set: (value: T) => {
            localStorage.setItem(key, JSON.stringify(value));
            store.set(value);
        }
    };
};

export const currentTheme = createPersistedWritable<Theme>(
    "currentTheme",
    "rocket"
);
