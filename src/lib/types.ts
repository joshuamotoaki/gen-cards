// Config types
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

export type StudyVariables = {
    windowSize: number;
    repeatRatio: number;
    repetitionSpacing: number;
    baseRepetitionInHours: number;
};

// DB types
export type DeckInfo = {
    id: number;
    title: string;
    description: string;
    created_at: string;
    edited_at: string;
    studied_at: string | null;
    card_count: number;
};

export type Relationship = {
    from: string;
    to: string;
};

export type Schema = {
    fields: string[];
    relationships: Relationship[];
};

export type Card = {
    id: number;
    level: number;
    scheduled_at: string | null;
    studied_at: string | null;
    priority: number;
    fields: {
        [key: string]: string;
    };
};

export type DeckCards = {
    id: number;
    deck_id: number;
    schema: Schema;
    cards: Card[];
};

export type Deck = {
    info: DeckInfo;
    cards: DeckCards;
};
