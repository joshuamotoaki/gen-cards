// Config types
export type Theme =
  | "gengoko"
  | "skeleton"
  | "wintry"
  | "modern"
  | "rocket"
  | "seafoam"
  | "vintage"
  | "hamlindigo"
  | "gold-nouveau"
  | "crimson";

export type StudyVariables = {
  windowSize: number;
  repeatRatioReview: number;
  repeatRatioNew: number;
  repetitionSpacing: number;
  baseRepetitionInHours: number;
};

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
  created_at: string;
  edited_at: string;
  studied_at: string | null;
  schema: string;
};

export type DeckInfo = {
  id: number;
  title: string;
  card_count: number;
  description: string;
  created_at: string;
  edited_at: string;
  studied_at: string | null;
  schema: Schema;
};

export type CardInsert = {
  deck_id: number;
  level: number;
  scheduled_at: string | null;
  studied_at: string | null;
  priority: number;
  fields: {
    [key: string]: string;
  };
};

export type CardDB = {
  id: number;
  deck_id: number;
  level: number;
  scheduled_at: string | null;
  studied_at: string | null;
  priority: number;
  fields: string;
};

export type Card = {
  id: number;
  deck_id: number;
  level: number;
  scheduled_at: string | null;
  studied_at: string | null;
  priority: number;
  fields: {
    [key: string]: string;
  };
};

export type Deck = {
  info: DeckInfo;
  cards: Card[];
};
