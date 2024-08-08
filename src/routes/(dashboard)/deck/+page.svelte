<script>
    import { goto } from "$app/navigation";
    import { currentDeck } from "$lib/state";
    import DeckWarning from "./DeckWarning.svelte";
</script>

{#if !$currentDeck}
    <DeckWarning />
{:else}
    <div class="p-4 w-full">
        <!-- Deck Title -->
        <div class="flex justify-between items-centers mb-4">
            <h1 class="text-3xl">
                {$currentDeck?.info.title}
            </h1>
        </div>

        <!-- Action Buttons -->
        <div class="grid grid-cols-3 gap-2 mb-4">
            <button
                class="card card-hover p-2 variant-filled-primary"
                on:click={() => goto("/deck/study")}>
                Study
            </button>
            <button
                class="card card-hover p-2 variant-filled-secondary"
                on:click={() => goto("/deck/flashcards")}>
                Flashcards
            </button>
            <button
                class="card card-hover p-2 variant-filled-surface"
                on:click={() => goto("/deck/edit")}>
                Edit
            </button>
        </div>

        <!-- Deck Description -->
        <p>
            <span class="font-semibold"> Description: </span>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Mollitia est
            nemo molestias aliquid ut aspernatur, neque rem voluptatum nihil veritatis
            reiciendis dignissimos magnam magni tempora. Sit deleniti unde ratione.
            Ut?
        </p>

        <!-- Schema-->

        <!-- Cards -->
        <div></div>
    </div>
{/if}
