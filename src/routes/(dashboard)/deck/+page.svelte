<script lang="ts">
    import { goto } from "$app/navigation";
    import { currentDeck } from "$lib/state";
    import { getToastStore, type ToastSettings } from "@skeletonlabs/skeleton";
    import DeckWarning from "./DeckWarning.svelte";

    // Toast handling
    const toastStore = getToastStore();

    const TOAST_TIMEOUT = 5000;
    const noSchemaError: ToastSettings = {
        message: "No schema found.",
        background: "variant-filled-error",
        timeout: TOAST_TIMEOUT
    };

    const noCardsError: ToastSettings = {
        message: "No cards found.",
        background: "variant-filled-error",
        timeout: TOAST_TIMEOUT
    };

    const isDeckError = (): boolean => {
        let isError = false;
        if (!$currentDeck) {
            return true;
        }

        if ($currentDeck.cards.schema.relationships.length === 0) {
            toastStore.trigger(noSchemaError);
            isError = true;
        }

        if ($currentDeck.cards.cards.length === 0) {
            toastStore.trigger(noCardsError);
            isError = true;
        }

        return isError;
    };
</script>

{#if !$currentDeck}
    <DeckWarning />
{:else}
    <div class="p-4 w-full flex-1">
        <!-- Header Info -->
        <div class="mb-4 space-y-2">
            <div>
                <h1 class="text-3xl font-semibold">
                    {$currentDeck?.info.title}
                </h1>
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-3 gap-2 mb-4">
                <button
                    class="card card-hover p-1 variant-filled-primary"
                    on:click={() => {
                        if (isDeckError()) return;
                        goto("/deck/study");
                    }}>
                    Study
                </button>
                <button
                    class="card card-hover p-1 variant-filled-secondary"
                    on:click={() => {
                        if (isDeckError()) return;
                        goto("/deck/flashcards");
                    }}>
                    Flashcards
                </button>
                <button
                    class="card card-hover p-1 variant-filled-surface"
                    on:click={() => goto("/deck/edit")}>
                    Edit
                </button>
            </div>
        </div>
        <div class="space-y-1">
            <p class="text-sm">
                <span class="font-semibold"> Description: </span>
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Mollitia
                est nemo molestias aliquid ut aspernatur, neque rem voluptatum nihil
                veritatis reiciendis dignissimos magnam magni tempora. Sit deleniti
                unde ratione. Ut?
            </p>
            <p class="text-sm">
                <span class="font-semibold"> Last studied: </span>
                <span>
                    {$currentDeck?.info.studied_at
                        ? new Date(
                              $currentDeck?.info.studied_at
                          ).toLocaleDateString()
                        : "Never"}
                </span>
            </p>
        </div>

        <!-- Schema-->
        <div>
            <h2 class="text-xl font-semibold mt-4">Schema</h2>
            {#each $currentDeck.cards.schema.relationships as relationship}
                <div class="w-full grid grid-cols-2">
                    <div class="font-semibold">
                        <span class="font-semibold"> From: </span>
                        {relationship.from}
                    </div>
                    <div>
                        <span class="font-semibold"> To: </span>
                        {relationship.to}
                    </div>
                </div>
            {:else}
                <p>No schema found. Please add a schema before studying.</p>
            {/each}
        </div>

        <!-- Cards -->
        <div></div>
    </div>
{/if}
