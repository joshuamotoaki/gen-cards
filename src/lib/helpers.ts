import { goto } from "$app/navigation";
import { get } from "svelte/store";
import { db } from "./db";
import { currentDeck, decks } from "./state";

export const createNewDeck = async () => {
    const id = (await db.createDeck()).lastInsertId;
    decks.set(await db.getAllDeckInfos());

    const deckInfo = get(decks).find(deck => deck.id === id);
    if (deckInfo === undefined) throw new Error("Failed to find deck");
    const deckCards = await db.getDeckCards(id);
    currentDeck.set({
        info: deckInfo,
        cards: deckCards
    });

    goto("/deck");
};
