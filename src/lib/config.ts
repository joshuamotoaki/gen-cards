import { writable } from "svelte/store";
import type { StudyVariables, Theme } from "./types";

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

export const studyVariables = createPersistedWritable<StudyVariables>(
    "studyVariables",
    {
        windowSize: 20,
        repeatRatio: 0.9,
        repetitionSpacing: 4,
        baseRepetitionInHours: 1
    }
);
