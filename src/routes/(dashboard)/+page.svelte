<script lang="ts">
    import RecentDisplay from "$lib/components/RecentDisplay.svelte";
    import type { DeckInfo } from "$lib/types";

    const RECENT_DECKS: DeckInfo[] = [
        {
            id: "1",
            title: "Deck 1",
            description: "This is a description of the deck",
            totalCards: 20,
            lastStudied: new Date().toISOString()
        },
        {
            id: "2",
            title: "Deck 2",
            description: "This is a description of the deck",
            totalCards: 30,
            lastStudied: new Date().toISOString()
        },
        {
            id: "3",
            title: "Deck 3",
            description: "This is a description of the deck",
            totalCards: 40,
            lastStudied: new Date().toISOString()
        },
        {
            id: "4",
            title: "Deck 4",
            description: "This is a description of the deck",
            totalCards: 50,
            lastStudied: new Date().toISOString()
        },
        {
            id: "5",
            title: "Deck 5",
            description: "This is a description of the deck",
            totalCards: 60,
            lastStudied: new Date().toISOString()
        },
        {
            id: "6",
            title: "Deck 6",
            description: "This is a description of the deck",
            totalCards: 70,
            lastStudied: new Date().toISOString()
        }
    ];

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
            {#each RECENT_DECKS as deck, i}
                <RecentDisplay
                    props={deck}
                    variant={RECENT_DECKS_VARIANTS[i % 6]} />
            {/each}
        </div>
    </section>
</div>
