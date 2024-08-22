import { writable } from "svelte/store";

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

export type Theme =
  | "gengoko"
  | "skeleton"
  | "wintry"
  | "modern"
  | "rocket"
  | "seafoam"
  | "vintage"
  | "hamlindigo"
  | "gold-nouveau"
  | "crimson";

export const currentTheme = createPersistedWritable<Theme>(
  "currentTheme",
  "gengoko"
);

export type StudyVariables = {
  windowSize: number;
  repeatRatioReview: number;
  repeatRatioNew: number;
  repetitionSpacing: number;
  baseRepetitionInHours: number;
};

export const studyVariables = createPersistedWritable<StudyVariables>(
  "studyVariables",
  {
    windowSize: 20,
    repeatRatioReview: 0.9,
    repeatRatioNew: 0.1,
    repetitionSpacing: 4,
    baseRepetitionInHours: 1
  }
);
