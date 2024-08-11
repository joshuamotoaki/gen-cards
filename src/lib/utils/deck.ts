import { goto } from "$app/navigation";
import { get } from "svelte/store";
import { db } from "./db";
import { conflictingCards, currentDeck, decks } from "./state";
import type { Deck } from "./types";

//----------------------------------------------------------------------
// General
//----------------------------------------------------------------------

/**
 * Refresh the deck infos. This should be called whenever any deck
 * info is updated.
 */
export const refreshDecks = async () => {
  decks.set(await db.getAllDeckInfos());
};

export const refreshConflictingCards = async () => {
  const deck = get(currentDeck);
  if (deck === null) return;
  const deckCards = deck.cards.cards;

  // Create a hash map of fields to card indices
  const hashMap = new Map<string, number[]>();
  for (let i = 0; i < deckCards.length; i++) {
    const card = deckCards[i];

    // Concatenate all the fields into a single string
    const fields = Object.values(card.fields);

    // Skip cards with empty fields
    if (fields.some(field => field === "")) continue;

    // The delimiter is unlikely to appear in the fields
    const combined = fields.join("&^チ@)($#름&*は@)!_ü#@&");

    // If the combined string already exists, add the index to the list
    if (hashMap.has(combined)) hashMap.get(combined)!.push(i);
    // Otherwise, create a new list with the index as the only element
    else hashMap.set(combined, [i]);
  }

  // Find all conflicting cards
  const conflicts: Set<number>[] = [];
  for (const val of hashMap.values())
    if (val.length > 1) conflicts.push(new Set(val));
  conflictingCards.set(conflicts);
};

//----------------------------------------------------------------------
// Create
//----------------------------------------------------------------------

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

/**
 * Create new cards in a deck from an upload.
 * @param deck Deck to add cards to
 * @param toAdd Array of the new fields and values of the cards to add
 */
export const createNewCardsFromUpload = async (
  deck: Deck,
  toAdd: Record<string, string>[]
) => {
  const newCards = toAdd.map(fields => {
    const card = {
      id: generateIdForCard(deck),
      level: 0,
      scheduled_at: null,
      studied_at: null,
      priority: 0,
      fields
    };
    return card;
  });

  deck.cards.cards.push(...newCards);
  await db.updateDeckCards(deck.cards);
  await refreshDecks();
  currentDeck.set(deck);
};

/**
 * Add a field to a deck's schema.
 * @param deck Deck to add a field to
 * @param field Field to add
 */
export const addFieldToSchema = async (deck: Deck, field: string) => {
  deck.cards.schema.fields.push(field);
  deck.cards.cards.forEach(card => {
    card.fields[field] = "";
  });

  await db.updateDeckCards(deck.cards);
  currentDeck.set(deck);
};

export const addRelationshipToSchema = async (deck: Deck) => {
  deck.cards.schema.relationships.push({
    from: "",
    to: ""
  });
  await db.updateDeckCards(deck.cards);
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
  const oldName = deck.cards.schema.fields[index];
  deck.cards.schema.fields[index] = newName;

  // Update the field name in all cards
  deck.cards.cards.forEach(card => {
    card.fields[newName] = card.fields[oldName];
    delete card.fields[oldName];
  });

  // Update relationships
  deck.cards.schema.relationships = deck.cards.schema.relationships.map(rel => {
    if (rel.from === oldName) rel.from = newName;
    if (rel.to === oldName) rel.to = newName;
    return rel;
  });

  await db.updateDeckCards(deck.cards);
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
  if (direction === "down" && oldIndex === deck.cards.schema.fields.length - 1)
    return;

  // Swap the fields' positions
  const newIndex = direction === "up" ? oldIndex - 1 : oldIndex + 1;
  const temp = deck.cards.schema.fields[oldIndex];
  deck.cards.schema.fields[oldIndex] = deck.cards.schema.fields[newIndex];
  deck.cards.schema.fields[newIndex] = temp;

  await db.updateDeckCards(deck.cards);
  currentDeck.set(deck);
};

export const togglePriority = async (deck: Deck, index: number) => {
  deck.cards.cards[index].priority =
    deck.cards.cards[index].priority === 0 ? 1 : 0;
  await db.updateDeckCards(deck.cards);
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
  deck.cards.cards.splice(index, 1);
  await db.updateDeckCards(deck.cards);
  currentDeck.set(deck);
};

/**
 * Remove a field from a deck's schema.
 * @param deck Deck to remove a field from
 * @param index Index of the field to remove
 */
export const removeFieldFromSchema = async (deck: Deck, index: number) => {
  const field = deck.cards.schema.fields[index];
  deck.cards.schema.fields.splice(index, 1);

  // Delete all cards if there are no fields left
  if (deck.cards.schema.fields.length === 0) {
    deck.cards.cards = [];
    deck.cards.schema.relationships = [];
  } else {
    // Remove the field from all cards
    deck.cards.cards.forEach(card => {
      delete card.fields[field];
    });

    // Delete all relationships that involve the field
    deck.cards.schema.relationships = deck.cards.schema.relationships.filter(
      rel => rel.from !== field && rel.to !== field
    );
  }

  await db.updateDeckCards(deck.cards);
  currentDeck.set(deck);
};

export const removeRelationshipFromSchema = async (
  deck: Deck,
  index: number
) => {
  deck.cards.schema.relationships.splice(index, 1);
  await db.updateDeckCards(deck.cards);
  currentDeck.set(deck);
};
