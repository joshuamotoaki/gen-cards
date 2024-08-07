export type Theme =
    | "skeleton"
    | "wintry"
    | "modern"
    | "rocket"
    | "seafoam"
    | "vintage"
    | "sahara"
    | "hamlindigo"
    | "gold-nouveau"
    | "crimson";

export type DeckInfo = {
    id: string;
    title: string;
    description: string;
    created_at: string;
    edited_at: string;
    studied_at: string | null;
    card_count: number;
};
