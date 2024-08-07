import { get, writable } from "svelte/store";
import Database, { type QueryResult } from "tauri-plugin-sql-api";
import { type DeckInfo } from "./types";

const createDB = () => {
    const store = writable<Database | null>(null);
    let isReady = false;

    return {
        set: store.set,
        update: store.update,
        subscribe: store.subscribe,

        /**
         * Initialize the database connection.
         */
        init: async () => {
            if (isReady) return;
            const db = await Database.load("sqlite:main.db");
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
        execute: async (query: string, params: unknown[] = []) => {
            if (!isReady) throw new Error("Database not ready");
            return get(store)?.execute(query, params);
        },

        /**
         * Execute a SELECT query.
         * @param query The SELECT query to execute.
         * @param params The parameters to pass to the query.
         * @returns The result of the query.
         */
        select: async (query: string, params: unknown[] = []) => {
            if (!isReady) throw new Error("Database not ready");
            return get(store)?.select(query, params);
        },

        //--------------------------------------------------------------
        // Application-specific database functions
        //--------------------------------------------------------------

        /**
         * Get all decks in the database.
         * @returns All decks in the database.
         */
        getAllDecks: async (): Promise<DeckInfo[]> => {
            if (!isReady) throw new Error("Database not ready");
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
            description: string = ""
        ): Promise<QueryResult> => {
            if (!isReady) throw new Error("Database not ready");
            const res = get(store)?.execute(
                "INSERT INTO decks (title, description, card_count) VALUES ($1, $2, $3)",
                [title, description, 0]
            );
            if (res === undefined) throw new Error("Failed to create deck");
            return res;
        }
    };
};

export const db = createDB();
