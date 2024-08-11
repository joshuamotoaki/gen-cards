import { writable } from "svelte/store";
import type { Deck, DeckInfo } from "./types";

// All the deck infos.
export const decks = writable<DeckInfo[]>([]);

// The current deck being interacted with.
export const currentDeck = writable<Deck | null>(null);

// Sets of conflicting cards.
export const conflictingCards = writable<Record<number, number[]> | null>(null);

// The fields to add from an uploaded file.
export const fieldsToAdd = writable<Record<string, string>[] | null>(null);

// The previous route (used for handling back button).
export const prevRoute = writable<string | null>(null);
