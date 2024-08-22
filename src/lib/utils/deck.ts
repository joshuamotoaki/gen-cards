import { goto } from "$app/navigation";
import { get } from "svelte/store";
import { db } from "./db";
import { currentDeck, deckCache, decks, prevRoute } from "./state";

//----------------------------------------------------------------------
// Types
//----------------------------------------------------------------------

export type Relationship = {
  from: string;
  to: string;
};

export type Schema = {
  fields: string[];
  relationships: Relationship[];
};

export type DeckInfoDB = {
  id: number;
  title: string;
  description: string;
  card_count: number;
  created_at: number;
  edited_at: number;
  studied_at: number | null;
  schema: string;
};

export type DeckInfo = {
  id: number;
  title: string;
  card_count: number;
  description: string;
  created_at: number;
  edited_at: number;
  studied_at: number | null;
  schema: Schema;
};

export type CardInsert = {
  deck_id: number;
  level: number;
  scheduled_at: number | null;
  studied_at: number | null;
  priority: number;
  fields: {
    [key: string]: string;
  };
};

export type CardDB = {
  id: number;
  deck_id: number;
  level: number;
  scheduled_at: number | null;
  studied_at: number | null;
  priority: number;
  fields: string;
};

export type Card = {
  id: number;
  deck_id: number;
  level: number;
  scheduled_at: number | null;
  studied_at: number | null;
  priority: number;
  fields: {
    [key: string]: string;
  };
};

export type Deck = {
  info: DeckInfo;
  cards: Card[];
};

//----------------------------------------------------------------------
// General
//----------------------------------------------------------------------

/**
 * Go to the deck page.
 * @param row Information about the deck to go to
 * @param prev The previous route to go back to
 */
export const gotoDeck = async (info: DeckInfo, prev: string) => {
  // If in cache, set the current deck and return
  const cached: Deck | undefined = deckCache.getDeck(info.id);
  if (cached !== undefined) {
    currentDeck.set(cached);
  } else {
    const deckCards = await db.getDeckCards(info.id);
    currentDeck.set({
      info: info,
      cards: deckCards
    });
  }

  prevRoute.set(prev);
  goto("/deck");
};

/**
 * Refresh a deck's information.
 * @param deckId Id of the deck to refresh
 */
export const refreshDeck = async (deckId: number) => {
  const deckInfo = await db.getDeck(deckId);
  decks.update(decks => {
    const index = decks.findIndex(d => d.id === deckId);
    if (index === -1) {
      decks.push(deckInfo);
    } else {
      decks[index] = deckInfo;
    }

    return decks;
  });
};

/**
 * Refresh all the deck infos.
 */
export const refreshAllDecks = async () => {
  decks.set(await db.getAllDecks());
};

// export const refreshConflictingCards = () => {
//   const deck = get(currentDeck);
//   if (deck === null) return;
//   const deckCards = deck.cards;

//   // Create a hash map of fields to card indices
//   const hashMap = new Map<string, number[]>();
//   for (let i = 0; i < deckCards.length; i++) {
//     const card = deckCards[i];

//     // Concatenate all the fields into a single string
//     const fields = Object.values(card.fields);

//     // Skip cards with empty fields
//     if (fields.some(field => field === "")) continue;

//     // The delimiter is unlikely to appear in the fields
//     const combined = fields.join("&^チ@)($#름&*は@)!_ü#@&");

//     // If the combined string already exists, add the index to the list
//     if (hashMap.has(combined)) hashMap.get(combined)!.push(i);
//     // Otherwise, create a new list with the index as the only element
//     else hashMap.set(combined, [i]);
//   }

//   // This is trading off space for time
//   const conflicts: Record<number, number[]> = {};
//   for (const val of hashMap.values())
//     if (val.length > 1)
//       for (const index of val)
//         conflicts[index] = val.filter(i => i !== index).sort((a, b) => a - b);
//   conflictingCards.set(conflicts);
// };

//----------------------------------------------------------------------
// Create
//----------------------------------------------------------------------

/**
 * Create a new deck and navigate to the edit page.
 */
export const createNewDeck = async () => {
  const id = (await db.createDeck()).lastInsertId;
  await refreshDeck(id);

  const deckInfo = get(decks).find(deck => deck.id === id);
  if (deckInfo === undefined) throw new Error("Failed to find deck");
  currentDeck.set({
    info: deckInfo,
    cards: []
  });

  goto("/deck/edit");
};

/**
 * Create a new card in a deck.
 * @param deck Deck to create a new card in
 */
export const createNewCard = async (deck: Deck) => {
  const fields = deck.info.schema.fields.reduce(
    (acc, field) => {
      acc[field] = "";
      return acc;
    },
    {} as Record<string, string>
  );

  const newCard = {
    deck_id: deck.info.id,
    level: 0,
    scheduled_at: null,
    studied_at: null,
    priority: 0,
    fields
  } as CardInsert;

  const id = (await db.createCard(newCard, deck.cards.length + 1)).lastInsertId;

  deck.cards.push({
    ...newCard,
    id
  });

  await refreshDeck(deck.info.id);
  currentDeck.set(deck);
};

/**
 * Create new cards in a deck from an upload.
 * @param deck Deck to add cards to
 * @param toAdd Array of the new fields and values of the cards to add
 */
export const createNewCardsFromUpload = async (
  deck: Deck,
  toAdd: Record<string, string>[]
) => {
  const deckId = deck.info.id;

  const newCards: CardInsert[] = toAdd.map(fields => {
    const card = {
      deck_id: deckId,
      level: 0,
      scheduled_at: null,
      studied_at: null,
      priority: 0,
      fields
    };
    return card;
  });

  await db.createCards(deckId, newCards, deck.cards.length + newCards.length);
  deck.cards = await db.getDeckCards(deckId);
  await refreshDeck(deckId);
  currentDeck.set(deck);
};

/**
 * Add a field to a deck's schema.
 * @param deck Deck to add a field to
 * @param field Field to add
 */
export const addFieldToSchema = async (deck: Deck, field: string) => {
  deck.info.schema.fields.push(field);
  deck.cards.forEach(card => {
    card.fields[field] = "";
  });

  await db.updateDeckInfo(deck.info);
  if (deck.cards.length > 0) await db.updateCards(deck.cards);

  await refreshDeck(deck.info.id);
  currentDeck.set(deck);
};

/**
 * Add a relationship to a deck's schema.
 * @param deck Deck to add a relationship to
 */
export const addRelationshipToSchema = async (deck: Deck) => {
  deck.info.schema.relationships.push({
    from: "",
    to: ""
  });
  await db.updateDeckInfo(deck.info);
  await refreshDeck(deck.info.id);
  currentDeck.set(deck);
};

//----------------------------------------------------------------------
// Update
//----------------------------------------------------------------------

/**
 * Update the name of a field in a deck's schema.
 * @param deck Deck to update the field name in
 * @param index Index of the field to update
 * @param newName New name for the field
 */
export const updateFieldName = async (
  deck: Deck,
  index: number,
  newName: string
) => {
  const oldName = deck.info.schema.fields[index];
  deck.info.schema.fields[index] = newName;

  if (deck.cards.length > 0) {
    // Update the field name in all cards
    deck.cards.forEach(card => {
      card.fields[newName] = card.fields[oldName];
      delete card.fields[oldName];
    });
    await db.updateCards(deck.cards);
  }

  // Update relationships
  deck.info.schema.relationships = deck.info.schema.relationships.map(rel => {
    if (rel.from === oldName) rel.from = newName;
    if (rel.to === oldName) rel.to = newName;
    return rel;
  });

  await db.updateDeckInfo(deck.info);

  await refreshDeck(deck.info.id);
  currentDeck.set(deck);
};

/**
 * Update the index of a field in a deck's schema.
 * @param deck Deck to update the field index in
 * @param oldIndex Index of the field to update
 * @param direction Direction to move the field in
 */
export const updateFieldIndex = async (
  deck: Deck,
  oldIndex: number,
  direction: "up" | "down"
) => {
  // Validate the index
  if (direction === "up" && oldIndex === 0) return;
  if (direction === "down" && oldIndex === deck.info.schema.fields.length - 1)
    return;

  // Swap the fields' positions
  const newIndex = direction === "up" ? oldIndex - 1 : oldIndex + 1;
  const temp = deck.info.schema.fields[oldIndex];
  deck.info.schema.fields[oldIndex] = deck.info.schema.fields[newIndex];
  deck.info.schema.fields[newIndex] = temp;

  await db.updateDeckInfo(deck.info);
  await refreshDeck(deck.info.id);
  currentDeck.set(deck);
};

export const togglePriority = async (deck: Deck, index: number) => {
  deck.cards[index].priority = deck.cards[index].priority === 0 ? 1 : 0;
  await db.updateCard(deck.cards[index]);
  currentDeck.set(deck);
};

//----------------------------------------------------------------------
// Delete
//----------------------------------------------------------------------

/**
 * Remove a card from a deck.
 * @param deck Deck to remove a card from
 * @param index Index of the card to remove
 */
export const removeCard = async (deck: Deck, index: number) => {
  const oldCard = deck.cards.splice(index, 1);
  await db.deleteCard(oldCard[0].id, deck.cards.length, deck.info.id);

  await refreshDeck(deck.info.id);
  currentDeck.set(deck);
};

/**
 * Remove a field from a deck's schema.
 * @param deck Deck to remove a field from
 * @param index Index of the field to remove
 */
export const removeFieldFromSchema = async (deck: Deck, index: number) => {
  const field = deck.info.schema.fields[index];
  deck.info.schema.fields.splice(index, 1);

  // Delete all cards if there are no fields left
  if (deck.info.schema.fields.length === 0) {
    deck.cards = [];
    deck.info.schema.relationships = [];
  } else {
    // Remove the field from all cards
    deck.cards.forEach(card => {
      delete card.fields[field];
    });

    // Delete all relationships that involve the field
    deck.info.schema.relationships = deck.info.schema.relationships.filter(
      rel => rel.from !== field && rel.to !== field
    );
  }

  await db.updateDeckInfo(deck.info);
  currentDeck.set(deck);
};

/**
 * Remove a relationship from a deck's schema.
 * @param deck Deck to remove a relationship from
 * @param index Index of the relationship to remove
 */
export const removeRelationshipFromSchema = async (
  deck: Deck,
  index: number
) => {
  deck.info.schema.relationships.splice(index, 1);
  await db.updateDeckInfo(deck.info);
  currentDeck.set(deck);
};
