import { get, writable } from "svelte/store";
import type { Deck, DeckInfo } from "./deck";
import { db } from "./db";

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

const createDeckCache = () => {
  const store = writable<Record<number, Deck>>({});

  return {
    set: store.set,
    update: store.update,
    subscribe: store.subscribe,

    getDeck: (id: number): Deck | undefined => get(store)[id],

    add: async (id: number) => {
      // If the deck is already in the cache, do nothing
      if (id in get(store)) return;

      // Fetch the deck info and cards
      const deckCards = await db.getDeckCards(id);
      const deckInfo = get(decks).find(deck => deck.id === id);
      if (deckInfo === undefined) return;

      store.update(decks => {
        decks[id] = {
          info: deckInfo,
          cards: deckCards
        };
        return decks;
      });
    }
  };
};
export const deckCache = createDeckCache();
