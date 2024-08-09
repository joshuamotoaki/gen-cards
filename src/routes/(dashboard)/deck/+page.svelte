<script lang="ts">
    import { goto } from "$app/navigation";
    import { currentDeck, prevRoute } from "$lib/state";
    import { getToastStore, type ToastSettings } from "@skeletonlabs/skeleton";
    import DeckWarning from "./DeckWarning.svelte";
    import { onMount } from "svelte";
    import { db } from "$lib/db";

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

    let fields: string[] = [];
    $: gridStyleColumns = `grid-template-columns: repeat(${fields.length + 1}, 1fr);`;

    onMount(() => {
        if ($currentDeck) {
            fields = $currentDeck.cards.schema.fields;
        }
    });
</script>

{#if !$currentDeck}
    <DeckWarning />
{:else}
    <div class="p-4 w-full flex-1 overflow-y-auto">
        <!-- Header Info -->
        <div class="mb-4 space-y-2">
            <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                    <button
                        class="btn btn-icon"
                        on:click={() => {
                            currentDeck.set(null);
                            if ($prevRoute) goto($prevRoute);
                            else goto("/library");
                            prevRoute.set(null);
                        }}>
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
                                d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                        </svg>
                    </button>

                    <h1 class="text-2xl font-semibold">
                        {$currentDeck?.info.title
                            ? $currentDeck.info.title
                            : "(no title)"}
                    </h1>
                </div>
                <!-- ! Menu for settings dropdown in the future -->
                <!-- <button class="btn btn-icon">
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
                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </button> -->
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-3 gap-2 mb-4">
                <button
                    class="card card-hover p-1 variant-filled-primary overflow-hidden"
                    on:click={() => {
                        if (isDeckError()) return;
                        goto("/deck/study");
                    }}>
                    Study
                </button>
                <button
                    class="card card-hover p-1 variant-filled-secondary overflow-hidden"
                    on:click={() => {
                        if (isDeckError()) return;
                        goto("/deck/flashcards");
                    }}>
                    Flashcards
                </button>
                <button
                    class="card card-hover p-1 variant-filled-surface overflow-hidden"
                    on:click={() => goto("/deck/edit")}>
                    Edit
                </button>
            </div>
        </div>
        <div class="space-y-1">
            {#if $currentDeck.info.description}
                <p class="text-sm">
                    <span class="font-semibold"> Description: </span>
                    <span>{$currentDeck.info.description}</span>
                </p>
            {/if}
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
            <h2 class="text-lg font-semibold mt-4">Schema</h2>
            {#each $currentDeck.cards.schema.relationships as relationship}
                <div
                    style={gridStyleColumns}
                    class="w-full grid grid-cols-2 text-sm">
                    <div>
                        <span class="font-semibold"> From: </span>
                        {relationship.from}
                    </div>
                    <div>
                        <span class="font-semibold"> To: </span>
                        {relationship.to}
                    </div>
                </div>
            {:else}
                <p class="text-sm">
                    No schema found. Please add a schema before studying.
                </p>
            {/each}
        </div>

        <!-- Cards -->
        <div>
            <h2 class="text-lg font-semibold mt-4">
                {$currentDeck.cards.cards.length}
                Card{$currentDeck.cards.cards.length === 1 ? "" : "s"}
            </h2>
            {#if $currentDeck.cards.cards.length > 0}
                <div id="card-grid" class="w-full grid text-sm">
                    {#each fields as field}
                        <div class="font-semibold">{field}</div>
                    {/each}

                    {#each $currentDeck.cards.cards as card, index}
                        {#each fields as field}
                            <div>
                                {card.fields[field]}
                            </div>
                        {/each}

                        <div>
                            <button
                                class="btn btn-icon"
                                on:click={async () => {
                                    $currentDeck.cards.cards[index].priority ===
                                    0
                                        ? ($currentDeck.cards.cards[
                                              index
                                          ].priority = 1)
                                        : ($currentDeck.cards.cards[
                                              index
                                          ].priority = 0);

                                    await db.updateDeckCards(
                                        $currentDeck.cards
                                    );
                                }}>
                                {#if card.priority === 0}
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
                                            d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                                    </svg>
                                {:else}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        class="size-6">
                                        <path
                                            fill-rule="evenodd"
                                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                                            clip-rule="evenodd" />
                                    </svg>
                                {/if}
                            </button>
                        </div>
                    {/each}
                </div>
            {:else}
                <p class="text-sm">
                    No cards found. Please add cards before studying.
                </p>
            {/if}
        </div>
    </div>
{/if}

<style lang="postcss">
    #card-grid {
        grid-template-columns: var(--grid-template-columns);
    }
</style>
