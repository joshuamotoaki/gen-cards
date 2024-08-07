<script lang="ts">
    import RecentDisplay from "$lib/components/RecentDisplay.svelte";
    import { decks } from "$lib/state";
    import type { DeckInfo } from "$lib/types";
    import { onMount } from "svelte";

    const getSixMostRecentDecks = (decks: DeckInfo[]): DeckInfo[] => {
        const sortedDecks = decks.toSorted((a, b) => {
            const aStudiedAt = a.studied_at
                ? new Date(a.studied_at)
                : new Date(0);
            const bStudiedAt = b.studied_at
                ? new Date(b.studied_at)
                : new Date(0);

            if (aStudiedAt.getTime() === bStudiedAt.getTime()) {
                return a.id - b.id;
            } else return bStudiedAt.getTime() - aStudiedAt.getTime();
        });
        return sortedDecks.slice(0, 6);
    };

    $: recentDecks = getSixMostRecentDecks($decks);

    const RECENT_DECKS_VARIANTS = [
        "variant-glass-primary",
        "variant-glass-secondary",
        "variant-glass-tertiary",
        "variant-glass-success",
        "variant-glass-warning",
        "variant-glass-error"
    ].sort(() => Math.random() - 0.5);
</script>

<div class="flex-1 p-4">
    <section class="w-full">
        <h2 class="text-2xl mb-2">Recent Decks</h2>
        <div class="grid grid-cols-3 w-full gap-4">
            {#each recentDecks as deck, i}
                <RecentDisplay
                    props={deck}
                    variant={RECENT_DECKS_VARIANTS[i % 6]} />
            {:else}
                <p>No decks found. Create a new deck to get started.</p>
            {/each}
        </div>
    </section>
</div>
