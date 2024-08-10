<script lang="ts">
  import RecentDisplay from "$lib/components/RecentDisplay.svelte";
  import { createNewDeck } from "$lib/deck";
  import { decks } from "$lib/state";
  import type { DeckInfo } from "$lib/types";

  const NUMBER_OF_RECENT_DECKS = 6;
  const getMostRecentDecks = (decks: DeckInfo[], n: number): DeckInfo[] => {
    const sortedDecks = decks.toSorted((a, b) => {
      const aStudiedAt = a.studied_at ? new Date(a.studied_at) : new Date(0);
      const bStudiedAt = b.studied_at ? new Date(b.studied_at) : new Date(0);

      if (aStudiedAt.getTime() === bStudiedAt.getTime()) {
        return b.id - a.id;
      } else return bStudiedAt.getTime() - aStudiedAt.getTime();
    });
    return sortedDecks.slice(0, n);
  };

  $: recentDecks = getMostRecentDecks($decks, NUMBER_OF_RECENT_DECKS);

  const RECENT_DECKS_VARIANTS = [
    "variant-glass-primary",
    "variant-glass-secondary",
    "variant-glass-tertiary",
    "variant-glass-success",
    "variant-glass-warning",
    "variant-glass-error"
  ].sort(() => Math.random() - 0.5);
</script>

<div class="flex-1 p-4 overflow-y-auto">
  <section class="w-full">
    <h2 class="text-2xl mb-2">Recent Decks</h2>
    {#if recentDecks.length > 0}
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 w-full gap-4">
        {#each recentDecks as deck, i}
          <RecentDisplay props={deck} variant={RECENT_DECKS_VARIANTS[i % 6]} />
        {/each}
      </div>
    {:else}
      <p class="text-lg mb-2">
        No decks found. Create a new deck to get started!
      </p>
      <button
        class="btn variant-filled-success flex gap-2 items-center"
        on:click={createNewDeck}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        New Deck
      </button>
    {/if}
  </section>
</div>
