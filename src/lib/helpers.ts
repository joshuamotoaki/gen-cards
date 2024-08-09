import { goto } from "$app/navigation";
import { get } from "svelte/store";
import { db } from "./db";
import { currentDeck, decks } from "./state";
import type { Deck } from "./types";

/**
 * Refresh the deck infos. This should be called whenever any deck
 * info is updated.
 */
export const refreshDecks = async () => {
    decks.set(await db.getAllDeckInfos());
};

/**
 * Create a new deck and navigate to the edit page.
 */
export const createNewDeck = async () => {
    const id = (await db.createDeck()).lastInsertId;
    await refreshDecks();

    const deckInfo = get(decks).find(deck => deck.id === id);
    if (deckInfo === undefined) throw new Error("Failed to find deck");
    const deckCards = await db.getDeckCards(id);
    currentDeck.set({
        info: deckInfo,
        cards: deckCards
    });

    goto("/deck/edit");
};

// Generate a new ID for a card in the deck.
const generateIdForCard = (deck: Deck) => {
    const maxId = deck.cards.cards.reduce(
        (max, card) => Math.max(max, card.id),
        0
    );
    return maxId + 1;
};

/**
 * Create a new card in a deck.
 * @param deck Deck to create a new card in
 */
export const createNewCard = async (deck: Deck) => {
    const fields = deck.cards.schema.fields.reduce(
        (acc, field) => {
            acc[field] = "";
            return acc;
        },
        {} as Record<string, string>
    );

    const newCard = {
        id: generateIdForCard(deck),
        level: 0,
        scheduled_at: null,
        studied_at: null,
        priority: 0,
        fields
    };
    deck.cards.cards.push(newCard);
    await db.updateDeckCards(deck.cards);
    await refreshDecks();
    currentDeck.set(deck);
};
