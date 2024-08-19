import { get, writable } from "svelte/store";
import type { Card } from "./types";
import { currentDeck } from "./state";
import { studyVariables } from "./config";

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
    subscribe: store.subscribe,

    /**
     * Initialize a new study session from the current deck
     */
    init: () => {
      const deck = get(currentDeck);
      if (!deck) return;

      const newQueue: Card[] = [];
      const newQueuePriority: Card[] = [];
      const reviewQueue: Card[] = [];
      const reviewQueuePriority: Card[] = [];

      for (let i = 0; i < deck.cards.length; i++) {
        const card = deck.cards[i];

        if (card.priority === 1) {
          if (card.scheduled_at) reviewQueuePriority.push(card);
          else newQueuePriority.push(card);
        } else {
          if (card.scheduled_at) reviewQueue.push(card);
          else newQueue.push(card);
        }
      }

      // Sort by scheduled_at for review cards (high to low)
      const sortByScheduledAt = (a: Card[]) => {
        a.sort(
          (a, b) =>
            new Date(b.scheduled_at || "").getTime() -
            new Date(a.scheduled_at || "").getTime()
        );
      };
      sortByScheduledAt(reviewQueue);
      sortByScheduledAt(reviewQueuePriority);

      // Populate initial window
      const studyVars = get(studyVariables);
      if (!studyVars) throw new Error("Study variables not set");

      const currentTime = new Date().getTime();
      const window: Card[] = [];

      for (let i = 0; i < studyVars.windowSize; i++) {
        // If a card is due in RQP
        if (reviewQueuePriority.length) {
          const lastElemRQP =
            reviewQueuePriority[reviewQueuePriority.length - 1];
          const lastElemRQPTime = new Date(
            lastElemRQP.scheduled_at || ""
          ).getTime();
          if (lastElemRQPTime < currentTime) {
            window.push(reviewQueuePriority.pop()!);
            continue;
          }
        }

        // If a card is in NQP
        if (newQueuePriority.length) {
          window.push(newQueuePriority.pop()!);
          continue;
        }

        // If a card is due in RQ
        if (reviewQueue.length) {
          const lastElemRQ = reviewQueue[reviewQueue.length - 1];
          const lastElemRQTime = new Date(
            lastElemRQ.scheduled_at || ""
          ).getTime();
          if (lastElemRQTime < currentTime) {
            if (newQueue.length) {
              const rand = Math.random();
              if (rand < studyVars.repeatRatioReview)
                window.push(reviewQueue.pop()!);
              else window.push(newQueue.pop()!);
            } else {
              window.push(reviewQueue.pop()!);
            }
            continue;
          }
        }

        // If a card is in NQ
        if (newQueue.length) {
          if (reviewQueuePriority.length) {
            const rand = Math.random();
            if (rand < studyVars.repeatRatioNew) window.push(newQueue.pop()!);
            else window.push(reviewQueuePriority.pop()!);
          } else if (reviewQueue.length) {
            const rand = Math.random();
            if (rand < studyVars.repeatRatioNew) window.push(newQueue.pop()!);
            else window.push(reviewQueue.pop()!);
          } else {
            window.push(newQueue.pop()!);
          }
          continue;
        }

        // If there are no more cards to study, pull randomly from
        // RQP (if available), then RQ
        if (reviewQueuePriority.length) {
          const randIndex = Math.floor(
            Math.random() * reviewQueuePriority.length
          );
          window.push(reviewQueuePriority[randIndex]);
          reviewQueuePriority.splice(randIndex, 1);
          continue;
        } else if (reviewQueue.length) {
          const randIndex = Math.floor(Math.random() * reviewQueue.length);
          window.push(reviewQueue[randIndex]);
          reviewQueue.splice(randIndex, 1);
          continue;
        }

        // There are no cards left, so break (deckSize < windowSize)
        break;
      }

      store.set({
        correctCount: 0,
        wrongCount: 0,
        window: window.map(card => ({
          card,
          streak: [],
          relationshipIndex: 0
        })),
        currentIndex: 0,
        queues: {
          review: reviewQueue,
          reviewPriority: reviewQueuePriority,
          new: newQueue,
          newPriority: newQueuePriority
        }
      });
    }
  };
};

export const currentStudySession = createStudySession();
