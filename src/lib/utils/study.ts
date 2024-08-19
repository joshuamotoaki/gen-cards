import { writable } from "svelte/store";
import type { Card } from "./types";

export type CardInProgress = {
  card: Card;
  streak: boolean[];
  relationshipIndex: number;
};

export type StudySession = {
  correctCount: number;
  wrongCount: number;
  window: CardInProgress[];
  currentIndex: number;
  queues: {
    review: Card[];
    reviewPriority: Card[];
    new: Card[];
    newPriority: Card[];
  };
};

const createStudySession = () => {
  const store = writable<StudySession | null>(null);

  return {
    set: store.set,
    update: store.update,
    subscribe: store.subscribe
  };
};

export const currentStudySession = createStudySession();
