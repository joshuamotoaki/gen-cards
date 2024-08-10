import { writable } from "svelte/store";
import type { Card, Deck, DeckInfo } from "./types";

export const decks = writable<DeckInfo[]>([]);
export const currentDeck = writable<Deck | null>(null);

export const cardsToAdd = writable<Card[] | null>(null);

export const prevRoute = writable<string | null>(null);
