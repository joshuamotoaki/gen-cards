import { get, writable } from "svelte/store";
import Database from "tauri-plugin-sql-api";

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
         * Whether the database is ready.
         * @returns Whether the database is ready.
         */
        isReady: () => isReady,

        /**
         * Execute a SQL query.
         * @param query The SQL query to execute.
         * @param params The parameters to pass to the query.
         * @returns The result of the query.
         */
        execute: async (query: string, params: unknown[] = []) => {
            if (!isReady) throw new Error("Database not ready");
            return get(store)?.execute(query, params);
        }
    };
};

export const db = createDB();
