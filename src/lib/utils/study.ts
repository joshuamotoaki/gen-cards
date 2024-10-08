import { get, writable } from "svelte/store";
import { refreshDeck, type Card } from "./deck";
import { currentDeck } from "./state";
import { studyVariables } from "./config";
import { db } from "./db";

export type CardInProgress = {
  card: Card;
  streak: boolean[];
  isCorrect: boolean;
  relationshipIndex: number;
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
  queues: StudyQueues;
};

const createStudySession = () => {
  const store = writable<StudySession | null>(null);

  const findQueueInsertIndex = (queue: Card[], card: Card) => {
    let low = 0;
    let high = queue.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const midTime = new Date(queue[mid].scheduled_at || "").getTime();
      const cardTime = new Date(card.scheduled_at || "").getTime();
      if (midTime < cardTime) high = mid - 1;
      else low = mid + 1;
    }
    return low;
  };

  /**
   * Schedule a card for review
   * @param level Level of the card
   * @param baseRepetition Base repetition (for level 1) in hours
   * @param spacing Spacing factor
   * @returns The time in milliseconds when the card is due
   */
  const schedule = (level: number, baseRepetition: number, spacing: number) => {
    const currentTime = new Date().getTime();
    const br = baseRepetition * 60 * 60 * 1000;
    const time = currentTime + br * Math.pow(spacing, level - 1);
    return new Date(time).getTime();
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
      if (lastElemRQ.scheduled_at && lastElemRQ.scheduled_at < currentTime) {
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
        if (rand < studyVars.repeatRatioNew) return reviewQueuePriority.pop()!;
        else return newQueue.pop()!;
      } else if (reviewQueue.length) {
        const rand = Math.random();
        if (rand < studyVars.repeatRatioNew) return reviewQueue.pop()!;
        else return newQueue.pop()!;
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

      // Ensure reverse-id order
      newQueue.reverse();
      newQueuePriority.reverse();

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
          isCorrect: true,
          relationshipIndex: 0
        })),
        currentIndex: 0,
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

      // Increment index
      if (session.currentIndex === session.window.length - 1) {
        // Shuffle window
        const winCopy = session.window.slice();
        for (let i = winCopy.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [winCopy[i], winCopy[j]] = [winCopy[j], winCopy[i]];
        }
        session.window = winCopy;
        session.currentIndex = 0;
      } else {
        session.currentIndex++;
      }

      // Set so that correct card can be exchanged
      const prevIndex = session.window.findIndex(
        card => card.card.id === currentCard.card.id
      );

      const numRelationships = deck.info.schema.relationships.length;
      // All sides have been studied
      if (currentCard.relationshipIndex === numRelationships - 1) {
        currentCard.streak.push(currentCard.isCorrect);
        currentCard.isCorrect = true;

        const streakLen = currentCard.streak.length;

        // Automatically promote card if correct on first try
        if (streakLen === 1 && currentCard.streak[0]) {
          if (
            !currentCard.card.scheduled_at ||
            new Date().getTime() > currentCard.card.scheduled_at
          ) {
            if (currentCard.card.level === 0) currentCard.card.level = 4;
            else currentCard.card.level++;

            // Schedule new due date
            currentCard.card.scheduled_at = schedule(
              currentCard.card.level,
              studyVars.baseRepetitionInHours,
              studyVars.repetitionSpacing
            );
          }

          // Put old card back into a review queue
          if (currentCard.card.priority === 1) {
            const index = findQueueInsertIndex(
              session.queues.reviewPriority,
              currentCard.card
            );
            session.queues.reviewPriority.splice(index, 0, currentCard.card);
          } else {
            const index = findQueueInsertIndex(
              session.queues.review,
              currentCard.card
            );

            session.queues.review.splice(index, 0, currentCard.card);
          }

          // Exchange card
          const next = nextCard(session.queues);
          if (!next) throw new Error("No next card");
          else
            session.window[prevIndex] = {
              card: next,
              streak: [],
              isCorrect: true,
              relationshipIndex: 0
            };

          // Proceed if 2 subsequent corrects
        } else if (
          streakLen >= 2 &&
          currentCard.streak[streakLen - 1] &&
          currentCard.streak[streakLen - 2]
        ) {
          let numErrors = 0;
          for (let i = 0; i < streakLen; i++)
            if (!currentCard.streak[i]) numErrors++;

          // Don't increment level if a card is studied before its scheduled time
          if (
            !currentCard.card.scheduled_at ||
            new Date().getTime() > currentCard.card.scheduled_at
          ) {
            // Handle level demotion/promotion depending on error count
            if (currentCard.card.level === 0) currentCard.card.level++;
            else {
              switch (numErrors) {
                case 0:
                  currentCard.card.level++;
                  break;
                case 1:
                  // No level change
                  break;
                case 2:
                  if (currentCard.card.level <= 1) break;
                  currentCard.card.level--;
                  break;
                default:
                  currentCard.card.level = 1;
              }
            }

            // Schedule new due date
            currentCard.card.scheduled_at = schedule(
              currentCard.card.level,
              studyVars.baseRepetitionInHours,
              studyVars.repetitionSpacing
            );
          }

          // Put old card back into a review queue
          if (currentCard.card.priority === 1) {
            const index = findQueueInsertIndex(
              session.queues.reviewPriority,
              currentCard.card
            );
            session.queues.reviewPriority.splice(index, 0, currentCard.card);
          } else {
            const index = findQueueInsertIndex(
              session.queues.review,
              currentCard.card
            );

            session.queues.review.splice(index, 0, currentCard.card);
          }

          // Exchange card
          const next = nextCard(session.queues);
          if (!next) throw new Error("No next card");
          else
            session.window[prevIndex] = {
              card: next,
              streak: [],
              isCorrect: true,
              relationshipIndex: 0
            };
        }

        // Reset relationship index
        currentCard.relationshipIndex = 0;
      } else {
        // Move to next relationship if correct
        if (result) currentCard.relationshipIndex++;
      }

      // Update studied_at to now
      currentCard.card.studied_at = new Date().getTime();
      await db.updateCardStudy(currentCard.card);
      await refreshDeck(deck.info.id);

      // Refresh session
      store.set(session);
    }
  };
};

export const currentStudySession = createStudySession();
