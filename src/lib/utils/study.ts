import { get, writable } from "svelte/store";
import type { Card } from "./deck";
import { currentDeck } from "./state";
import { studyVariables } from "./config";
import { db } from "./db";

export type CardInProgress = {
  card: Card;
  streak: boolean[];
  isCorrect: boolean;
};

// Note - these "queues" are technically priority queues. However,
// since there is the ability to mark a card as "priority", the naming
// can get very confusing and verbose, hence just "queues".
type StudyQueues = {
  review: Card[];
  reviewPriority: Card[];
  new: Card[];
  newPriority: Card[];
};

export type StudySession = {
  correctCount: number;
  wrongCount: number;
  window: CardInProgress[];
  currentIndex: number;
  relationshipIndex: number;
  queues: StudyQueues;
};

const createStudySession = () => {
  const store = writable<StudySession | null>(null);

  const schedule = (level: number, baseRepetition: number, spacing: number) => {
    const currentTime = new Date().getTime();
    const time = currentTime + baseRepetition * Math.pow(spacing, level - 1);
    return new Date(time).toISOString();
  };

  // Return the next card to add to the window, or null if no cards found
  // Note - Queues must be passed in so init() can work
  const nextCard = (queues: StudyQueues): Card | null => {
    const deck = get(currentDeck);
    if (!deck) return null;
    const studyVars = get(studyVariables);
    if (!studyVars) throw new Error("Study variables not set");

    const newQueue = queues.new;
    const newQueuePriority = queues.newPriority;
    const reviewQueue = queues.review;
    const reviewQueuePriority = queues.reviewPriority;

    const currentTime = new Date().getTime();

    // If a card is due in RQP
    if (reviewQueuePriority.length) {
      const lastElemRQP = reviewQueuePriority[reviewQueuePriority.length - 1];
      const lastElemRQPTime = new Date(
        lastElemRQP.scheduled_at || ""
      ).getTime();
      if (lastElemRQPTime < currentTime) {
        return reviewQueuePriority.pop()!;
      }
    }

    // If a card is in NQP
    if (newQueuePriority.length) {
      return newQueuePriority.pop()!;
    }

    // If a card is due in RQ
    if (reviewQueue.length) {
      const lastElemRQ = reviewQueue[reviewQueue.length - 1];
      const lastElemRQTime = new Date(lastElemRQ.scheduled_at || "").getTime();
      if (lastElemRQTime < currentTime) {
        if (newQueue.length) {
          const rand = Math.random();
          if (rand < studyVars.repeatRatioReview) return reviewQueue.pop()!;
          else return newQueue.pop()!;
        } else {
          return reviewQueue.pop()!;
        }
      }
    }

    // If a card is in NQ
    if (newQueue.length) {
      if (reviewQueuePriority.length) {
        const rand = Math.random();
        if (rand < studyVars.repeatRatioNew) return newQueue.pop()!;
        else return reviewQueuePriority.pop()!;
      } else if (reviewQueue.length) {
        const rand = Math.random();
        if (rand < studyVars.repeatRatioNew) return newQueue.pop()!;
        else return reviewQueue.pop()!;
      } else {
        return newQueue.pop()!;
      }
    }

    // If there are no more cards to study, pull randomly from
    // RQP (if available), then RQ
    if (reviewQueuePriority.length) {
      const randIndex = Math.floor(Math.random() * reviewQueuePriority.length);
      const toRet = reviewQueuePriority[randIndex];
      reviewQueuePriority.splice(randIndex, 1);
      return toRet;
    } else if (reviewQueue.length) {
      const randIndex = Math.floor(Math.random() * reviewQueue.length);
      const toRet = reviewQueue[randIndex];
      reviewQueue.splice(randIndex, 1);
      return toRet;
    }

    // There are no cards left, so return null (deckSize < windowSize)
    return null;
  };

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

      const queues = {
        review: reviewQueue,
        reviewPriority: reviewQueuePriority,
        new: newQueue,
        newPriority: newQueuePriority
      };
      const window: Card[] = [];
      for (let i = 0; i < studyVars.windowSize; i++) {
        const next = nextCard(queues);
        if (!next) break;
        else window.push(next);
      }

      store.set({
        correctCount: 0,
        wrongCount: 0,
        window: window.map(card => ({
          card,
          streak: [],
          isCorrect: true
        })),
        currentIndex: 0,
        relationshipIndex: 0,
        queues
      });
    },

    progressCard: async (result: boolean) => {
      const session = get(store);
      if (!session) return;
      const deck = get(currentDeck);
      if (!deck) return;

      const studyVars = get(studyVariables);
      if (!studyVars) throw new Error("Study variables not set");

      const currentCard = session.window[session.currentIndex];
      if (!result) currentCard.isCorrect = false;

      const numRelationships = deck.info.schema.relationships.length;
      // All sides have been studied
      if (session.relationshipIndex === numRelationships - 1) {
        currentCard.streak.push(currentCard.isCorrect);
        currentCard.isCorrect = true;

        // Proceed if 2 subsequent corrects
        const streakLen = currentCard.streak.length;
        if (
          streakLen >= 2 &&
          currentCard.streak[streakLen - 1] &&
          currentCard.streak[streakLen - 2]
        ) {
          let numErrors = 0;
          for (let i = 0; i < streakLen; i++)
            if (!currentCard.streak[i]) numErrors++;

          // Handle level demotion/promotion depending on error count
          switch (numErrors) {
            case 0:
              currentCard.card.level++;
              break;
            case 1:
              // No level change
              break;
            case 2:
              if (currentCard.card.level === 1) break;
              currentCard.card.level--;
              break;
            default:
              currentCard.card.level = 1;
          }

          // Schedule new due date
          currentCard.card.scheduled_at = schedule(
            currentCard.card.level,
            studyVars.baseRepetitionInHours,
            studyVars.repetitionSpacing
          );

          // Update studied_at to now
          currentCard.card.studied_at = new Date().toISOString();
          currentDeck.update(deck => {
            if (!deck) return deck;
            deck.info.studied_at = new Date().toISOString();
            return deck;
          });

          // Push to DB
          await db.updateCard(currentCard.card);
          await db.updateDeckInfo(deck.info);

          // Increment index
          const prevIndex = session.currentIndex;
          session.currentIndex =
            (session.currentIndex + 1) % session.window.length;

          // TODO - Put old card back into a queue

          // Exchange card
          const next = nextCard(session.queues);
          if (!next) throw new Error("No next card");
          else
            session.window[prevIndex] = {
              card: next,
              streak: [],
              isCorrect: true
            };
        } else {
          // Increment index
          session.currentIndex =
            (session.currentIndex + 1) % session.window.length;
        }
      }

      // More sides need to be studied
      else session.relationshipIndex++;
    }
  };
};

export const currentStudySession = createStudySession();
