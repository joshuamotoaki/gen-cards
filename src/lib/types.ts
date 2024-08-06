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
    totalCards: number;
    lastStudied: string;
};
