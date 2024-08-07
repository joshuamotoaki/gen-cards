<script lang="ts">
    import { goto } from "$app/navigation";
    import { decks } from "$lib/state";
    import type { DeckInfo } from "$lib/types";

    export let props: DeckInfo;
    export let variant: string = "variant-glass-surface";
</script>

<button
    class="block card card-hover overflow-clip {variant}"
    on:click={() => {
        goto("/deck");
    }}>
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
            {props.card_count} cards
        </span>
        <span class="text-sm">
            Last studied: {props.studied_at || "Never"}
        </span>
    </footer>
</button>
