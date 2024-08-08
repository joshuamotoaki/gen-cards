<script lang="ts">
    import { goto } from "$app/navigation";
    import { db } from "$lib/db";
    import { currentDeck, prevRoute } from "$lib/state";
    import type { DeckInfo } from "$lib/types";

    export let props: DeckInfo;
    export let variant: string = "variant-glass-surface";
</script>

<button
    class="block card card-hover overflow-clip {variant}"
    on:click={async () => {
        const deckCards = await db.getDeckCards(props.id);

        currentDeck.set({
            info: props,
            cards: deckCards
        });

        prevRoute.set("/");
        goto("/deck");
    }}>
    <section class="p-4 text-left">
        <h2 class="text-xl font-semibold">
            {props.title ? props.title : "(no title)"}
        </h2>
        <p class="mt-1 text-sm font-normal">
            {props.description}
        </p>
    </section>
    <footer class="card-footer flex justify-between items-center font-normal">
        <span class="text-sm">
            {props.card_count} cards
        </span>
        <span class="text-sm">
            Last studied: {props.studied_at || "Never"}
        </span>
    </footer>
</button>
