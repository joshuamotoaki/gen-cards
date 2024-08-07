import { get, writable } from "svelte/store";
import Database, { type QueryResult } from "tauri-plugin-sql-api";
import { type DeckCards, type DeckInfo, type Schema } from "./types";

type DeckCardsDB = {
    id: number;
    deck_id: number;
    schema: string;
    cards: string;
};

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
            const db = await Database.load("sqlite:app.db");
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
         * Whether the database is ready.
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
         * @returns The result of the query.
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
         * @returns The result of the query.
         */
        select: async (
            query: string,
            params: unknown[] = []
        ): Promise<unknown> => {
            checkDB();
            return get(store)?.select(query, params);
        },

        /**
         * !DANGEROUS! Delete all data from the database.
         * @returns The result of the query
         */
        deleteEverything: async (): Promise<QueryResult> => {
            checkDB();
            const res = get(store)?.execute(`
                BEGIN TRANSACTION;
                DELETE FROM decks;
                DELETE FROM deck_cards;
                COMMIT;
            `);
            if (res === undefined) throw new Error("Failed to clear database");
            return res;
        },

        //--------------------------------------------------------------
        // Application-specific database functions
        //--------------------------------------------------------------

        /**
         * Get all decks in the database.
         * @returns All decks in the database.
         */
        getAllDecks: async (): Promise<DeckInfo[]> => {
            checkDB();
            const res = await get(store)?.select<DeckInfo[]>(
                "SELECT * FROM decks"
            );
            if (res === undefined) throw new Error("Failed to get decks");
            return res;
        },

        /**
         * Create a new deck.
         * @param title The title of the deck
         * @param description The description of the deck
         * @returns The result of the query
         */
        createDeck: async (
            title: string,
            description: string = "",
            schema: Schema
        ): Promise<QueryResult> => {
            checkDB();
            const res = get(store)?.execute(
                `
                BEGIN TRANSACTION;
                INSERT INTO decks (title, description, card_count) VALUES ($1, $2, $3);
                INSERT INTO deck_cards (deck_id, schema, cards) VALUES (last_insert_rowid(), $4, $5);
                COMMIT;
                `,
                [
                    title,
                    description,
                    0,
                    JSON.stringify(schema),
                    JSON.stringify([])
                ]
            );
            if (res === undefined) throw new Error("Failed to create deck");
            return res;
        },

        updateDeck: async (deckInfo: DeckInfo) => {
            checkDB();
            const res = get(store)?.execute(
                `
                UPDATE decks SET title = $1, description = $2, edited_at = CURRENT_TIMESTAMP, card_count = $3, 
                WHERE id = $4"
                `,
                [
                    deckInfo.title,
                    deckInfo.description,
                    deckInfo.card_count,
                    deckInfo.id
                ]
            );

            if (res === undefined) throw new Error("Failed to update deck");
            return res;
        },

        /**
         * Get a deck cards and schema by its ID.
         * @param deckId ID of the deck
         * @returns Deck cards for the given deck ID
         */
        getDeckCards: async (deckId: string): Promise<DeckCards> => {
            checkDB();
            const res = await get(store)?.select<DeckCardsDB[]>(
                "SELECT * FROM deck_cards WHERE deck_id = $1 LIMIT 1",
                [deckId]
            );
            if (res === undefined) throw new Error("Failed to get deck cards");
            const cards = res[0];

            return {
                id: cards.id,
                deck_id: cards.deck_id,
                schema: JSON.parse(cards.schema),
                cards: JSON.parse(cards.cards)
            } as DeckCards;
        },

        /**
         * Update the cards of a deck.
         * @param deckId ID of the deck
         * @param schema Schema of the deck
         * @param cards Cards of the deck
         * @returns The result of the query
         */
        updateDeckCards: async (deckCards: DeckCards): Promise<QueryResult> => {
            checkDB();
            const res = get(store)?.execute(
                `
                BEGIN TRANSACTION;
                UPDATE deck_cards SET schema = $1, cards = $2 WHERE id = $3;
                UPDATE decks SET edited_at = CURRENT_TIMESTAMP WHERE id = $4;
                COMMIT;
                `,
                [
                    deckCards.schema,
                    deckCards.cards,
                    deckCards.id,
                    deckCards.deck_id
                ]
            );
            if (res === undefined)
                throw new Error("Failed to update deck cards");
            return res;
        },

        /**
         * Delete a deck by its ID.
         * @param deckId ID of the deck
         * @returns The result of the query
         */
        deleteDeck: async (deckId: string): Promise<QueryResult> => {
            checkDB();
            const res = get(store)?.execute("DELETE FROM decks WHERE id = $1", [
                deckId
            ]);
            if (res === undefined) throw new Error("Failed to delete deck");
            return res;
        }
    };
};

export const db = createDB();
