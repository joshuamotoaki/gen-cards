import { writable } from "svelte/store";
import type { Deck, DeckInfo } from "./types";

export const decks = writable<DeckInfo[]>([]);
export const currentDeck = writable<Deck | null>(null);

export const prevRoute = writable<string | null>(null);
