import { get, writable } from "svelte/store";
import Database, { type QueryResult } from "tauri-plugin-sql-api";
import type { Card, CardDB, CardInsert, DeckInfo, DeckInfoDB } from "./deck";

const createDB = () => {
  const store = writable<Database | null>(null);
  let isReady = false;

  const checkDB = () => {
    if (!isReady) throw new Error("Database not ready");
  };

  return {
    set: store.set,
    update: store.update,
    subscribe: store.subscribe,

    /**
     * Initialize the database connection.
     */
    init: async () => {
      if (isReady) return;
      const db = await Database.load("sqlite:gen.db");
      store.set(db);
      isReady = true;
    },

    /**
     * Close the database connection.
     */
    close: async () => {
      if (!isReady) return;
      get(store)?.close();
      store.set(null);
      isReady = false;
    },

    /**
     * @returns Whether the database is ready.
     */
    isReady: () => isReady,

    //--------------------------------------------------------------
    // General database functions
    //--------------------------------------------------------------

    /**
     * Execute a SQL query.
     * @param query The SQL query to execute.
     * @param params The parameters to pass to the query.
     */
    execute: async (
      query: string,
      params: unknown[] = []
    ): Promise<QueryResult> => {
      checkDB();
      const res = get(store)?.execute(query, params);
      if (res === undefined) throw new Error("Failed to execute query");
      return res;
    },

    /**
     * Execute a SELECT query.
     * @param query The SELECT query to execute.
     * @param params The parameters to pass to the query.
     */
    select: async (query: string, params: unknown[] = []): Promise<unknown> => {
      checkDB();
      return get(store)?.select(query, params);
    },

    /**
     * !DANGEROUS! Delete all data from the database.
     */
    deleteEverything: async (): Promise<QueryResult> => {
      checkDB();
      const res = get(store)?.execute(`
                BEGIN TRANSACTION;
                DELETE FROM decks;
                DELETE FROM cards;
                COMMIT;
            `);
      if (res === undefined) throw new Error("Failed to clear database");
      return res;
    },

    //--------------------------------------------------------------
    // Application-specific database functions
    //--------------------------------------------------------------

    // ! Create

    /**
     * Create a new deck.
     * @param title The title of the deck
     * @param description The description of the deck
     */
    createDeck: async (): Promise<QueryResult> => {
      checkDB();
      const res = get(store)?.execute(
        `
          INSERT INTO decks (title, description, card_count, schema, created_at, edited_at) VALUES ($1, $2, $3, $4, $5, $5);
        `,
        [
          "My Deck",
          "",
          0,
          JSON.stringify({
            fields: ["Term", "Definition"],
            relationships: [
              {
                from: "Definition",
                to: "Term"
              }
            ]
          }),
          new Date().getTime()
        ]
      );
      if (res === undefined) throw new Error("Failed to create deck");
      return res;
    },

    /**
     * Create a new card in a deck.
     * @param deckId Id of the deck to create a card in
     */
    createCard: async (
      card: CardInsert,
      cardCount: number
    ): Promise<QueryResult> => {
      checkDB();
      const res = get(store)?.execute(
        `
          BEGIN TRANSACTION;
          INSERT INTO cards (deck_id, level, scheduled_at, studied_at, priority, fields)
          VALUES ($1, $2, $3, $4, $5, $6);
          UPDATE decks SET card_count = $7, edited_at = $8 WHERE id = $1;
          COMMIT;
        `,
        [
          card.deck_id,
          card.level,
          card.scheduled_at,
          card.studied_at,
          card.priority,
          JSON.stringify(card.fields),
          cardCount,
          new Date().getTime()
        ]
      );

      if (res === undefined) throw new Error("Failed to create card");
      return res;
    },

    /**
     * Create multiple cards in a deck.
     * @param deckId ID of the deck to create cards in
     * @param cards Cards to create
     */
    createCards: async (
      deckId: number,
      cards: CardInsert[],
      cardCount: number
    ): Promise<QueryResult> => {
      checkDB();
      const res = get(store)?.execute(
        `
          BEGIN TRANSACTION;
          INSERT INTO cards (deck_id, level, scheduled_at, studied_at, priority, fields)
          VALUES ${cards.map(card => `(${deckId}, ${card.level}, ${card.scheduled_at}, ${card.studied_at}, ${card.priority}, '${JSON.stringify(card.fields)}')`).join(",")};
          UPDATE decks SET card_count = $1, edited_at = $2 WHERE id = ${deckId};
          COMMIT;
        `,
        [cardCount, new Date().getTime()]
      );

      if (res === undefined) throw new Error("Failed to create cards");
      return res;
    },

    // ! Read

    /**
     * Get a deck by its ID.
     * @param deckId Id of the deck to get
     */
    getDeck: async (deckId: number): Promise<DeckInfo> => {
      checkDB();
      const res = await get(store)?.select<DeckInfoDB[]>(
        "SELECT * FROM decks WHERE id = $1",
        [deckId]
      );
      if (res === undefined) throw new Error("Failed to get deck");

      const deck = res[0];
      return {
        id: deck.id,
        title: deck.title,
        card_count: deck.card_count,
        description: deck.description,
        created_at: deck.created_at,
        edited_at: deck.edited_at,
        studied_at: deck.studied_at,
        schema: JSON.parse(deck.schema)
      };
    },

    /**
     * Get all decks in the database.
     * @returns All decks in the database.
     */
    getAllDecks: async (): Promise<DeckInfo[]> => {
      checkDB();
      const res = await get(store)?.select<DeckInfoDB[]>("SELECT * FROM decks");
      if (res === undefined) throw new Error("Failed to get decks");

      const normalized = res.map(deck => {
        return {
          id: deck.id,
          title: deck.title,
          card_count: deck.card_count,
          description: deck.description,
          created_at: deck.created_at,
          edited_at: deck.edited_at,
          studied_at: deck.studied_at,
          schema: JSON.parse(deck.schema)
        };
      }) as DeckInfo[];

      return normalized;
    },

    /**
     * Get a deck cards and schema by its ID.
     * @param deckId ID of the deck
     */
    getDeckCards: async (deckId: number): Promise<Card[]> => {
      checkDB();
      const res = await get(store)?.select<CardDB[]>(
        "SELECT * FROM cards WHERE deck_id = $1",
        [deckId]
      );
      if (res === undefined) throw new Error("Failed to get deck cards");

      const normalized = res.map(card => {
        return {
          id: card.id,
          deck_id: card.deck_id,
          level: card.level,
          scheduled_at: card.scheduled_at,
          studied_at: card.studied_at,
          priority: card.priority,
          fields: JSON.parse(card.fields)
        };
      }) as Card[];

      return normalized;
    },

    // ! Update

    /**
     * Update a deck's information.
     * @param deckInfo Updated deck information
     */
    updateDeckInfo: async (deckInfo: DeckInfo) => {
      checkDB();
      const res = get(store)?.execute(
        `
          UPDATE decks SET title = $1, description = $2, edited_at = $6, card_count = $3, schema = $5
          WHERE id = $4;
        `,
        [
          deckInfo.title,
          deckInfo.description,
          deckInfo.card_count,
          deckInfo.id,
          JSON.stringify(deckInfo.schema),
          new Date().getTime()
        ]
      );

      if (res === undefined) throw new Error("Failed to update deck");
      return res;
    },

    /**
     * Update a card's information.
     * @param card Card to update
     */
    updateCard: async (card: Card): Promise<QueryResult> => {
      checkDB();
      const res = get(store)?.execute(
        `
          BEGIN TRANSACTION;
          UPDATE cards SET level = $1, scheduled_at = $2, priority = $3, fields = $4
          WHERE id = $5;
          UPDATE decks SET edited_at = $7 WHERE id = $6;
          COMMIT;
        `,
        [
          card.level,
          card.scheduled_at,
          card.priority,
          JSON.stringify(card.fields),
          card.id,
          card.deck_id,
          new Date().getTime()
        ]
      );
      if (res === undefined) throw new Error("Failed to update card");
      return res;
    },

    /**
     * Update multiple cards.
     * @param cards Updated cards
     */
    updateCards: async (cards: Card[]): Promise<QueryResult> => {
      checkDB();
      const res = get(store)?.execute(
        `
          BEGIN TRANSACTION;
          ${cards
            .map(
              card => `
            UPDATE cards SET level = ${card.level}, scheduled_at = ${card.scheduled_at}, priority = ${card.priority}, fields = '${JSON.stringify(card.fields)}'
            WHERE id = ${card.id};
          `
            )
            .join("")}
          UPDATE decks SET edited_at = $1 WHERE id = ${cards[0].deck_id};
          COMMIT;
        `,
        [new Date().getTime()]
      );
      if (res === undefined) throw new Error("Failed to update cards");
      return res;
    },

    /**
     * Update a card due to studying.
     * @param Card Updated card
     */
    updateCardStudy: async (card: Card): Promise<QueryResult> => {
      checkDB();
      const res = get(store)?.execute(
        `
          BEGIN TRANSACTION;
          UPDATE card SET level = $1, scheduled_at = $2, studied_at = $3
          UPDATE decks SET studied_at = $3 WHERE id = $4;
          COMMIT; 
        `,
        [card.level, card.scheduled_at, card.studied_at, card.deck_id]
      );
      if (res === undefined) throw new Error("Failed to update deck cards");
      return res;
    },

    // ! Delete

    /**
     * Delete a deck by its ID.
     * @param deckId ID of the deck
     */
    deleteDeck: async (deckId: number): Promise<QueryResult> => {
      checkDB();
      const res = get(store)?.execute("DELETE FROM decks WHERE id = $1", [
        deckId
      ]);
      if (res === undefined) throw new Error("Failed to delete deck");
      return res;
    },

    /**
     * Delete a card by its ID.
     * @param cardId ID of the card
     */
    deleteCard: async (
      cardId: number,
      deckId: number,
      cardCount: number
    ): Promise<QueryResult> => {
      checkDB();
      const res = get(store)?.execute(
        `
          BEGIN TRANSACTION;
          DELETE FROM cards WHERE id = $1;
          UPDATE decks SET card_count = $2, edited_at = $4 WHERE id = $3;
          COMMIT;
        `,
        [cardId, cardCount, deckId, new Date().getTime()]
      );
      if (res === undefined) throw new Error("Failed to delete card");
      return res;
    }
  };
};

export const db = createDB();
