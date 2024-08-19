// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_sql::{Migration, MigrationKind};

fn main() {
    let migrations = vec![Migration {
        version: 1,
        description: "create_initial_tables",
        kind: MigrationKind::Up,
        sql: "
                CREATE TABLE decks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT NOT NULL,
                    card_count INTEGER,
                    created_at INTEGER,
                    edited_at INTEGER,
                    studied_at INTEGER,
                    schema TEXT NOT NULL
                );

                CREATE TABLE cards (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    level INTEGER NOT NULL,
                    scheduled_at INTEGER,
                    studied_at INTEGER,
                    priority INTEGER,
                    fields TEXT NOT NULL,
                    deck_id INTEGER,
                    FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
                );
            ",
    }];

    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:gen.db", migrations)
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
