import { writable } from "svelte/store";
import type { Theme } from "./types";

export const currentTheme = writable<Theme>("modern");
