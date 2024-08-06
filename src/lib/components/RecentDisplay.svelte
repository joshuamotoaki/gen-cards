<script lang="ts">
    import type { DeckInfo } from "$lib/types";

    export let props: DeckInfo = {
        id: "1",
        title: "Deck 1",
        description: "This is a description of the deck",
        totalCards: 20,
        lastStudied: new Date().toISOString()
    };
    export let variant: string = "variant-glass-surface";
</script>

<a
    class="block card card-hover overflow-clip {variant}"
    href={`decks/${props.id}`}>
    <!-- <header class="card-header h-12 bg-red-500">
        {#if props.imageUrl}
            <img src={props.imageUrl} alt={props.title} />
        {/if}
    </header> -->
    <section class="p-4">
        <h3 class="text-xl font-semibold">{props.title}</h3>
        <p class="mt-2 font-normal">{props.description}</p>
    </section>
    <footer class="card-footer flex justify-between items-center font-normal">
        <span class="text-sm">
            {props.totalCards} cards
        </span>
        <span class="text-sm">
            Last studied: {new Date(props.lastStudied).toLocaleDateString()}
        </span>
    </footer>
</a>
