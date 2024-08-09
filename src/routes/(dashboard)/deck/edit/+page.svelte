<script lang="ts">
    import { goto } from "$app/navigation";
    import { db } from "$lib/db";
    import { currentDeck } from "$lib/state";
    import {
        getModalStore,
        getToastStore,
        type ToastSettings
    } from "@skeletonlabs/skeleton";
    import DeckWarning from "../DeckWarning.svelte";
    import {
        addFieldToSchema,
        createNewCard,
        refreshDecks,
        removeFieldFromSchema,
        addRelationshipToSchema,
        removeRelationshipFromSchema
    } from "$lib/helpers";
    import { slide } from "svelte/transition";
    import Select from "svelte-select";

    let schemaOpen = true;
    let cardUploadOpen = false;

    const toastStore = getToastStore();
    const deleteToast: ToastSettings = {
        message: "Deck successfully deleted.",
        background: "variant-filled-success"
    };

    const modalStore = getModalStore();
</script>

{#if !$currentDeck}
    <DeckWarning />
{:else}
    <div class="flex-1 p-4 overflow-y-auto">
        <!-- Header Actions -->
        <div class="flex justify-between items-center mb-4">
            <div class="flex items-center gap-2">
                <button
                    class="btn btn-icon"
                    on:click={() => {
                        goto("/deck");
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
                <h1 class="text-2xl font-bold">Edit Deck</h1>
            </div>
            <div class="flex items-center gap-2">
                <button
                    on:click={() => {
                        modalStore.trigger({
                            type: "confirm",
                            title: "Delete Deck",
                            body: `Are you sure you want to delete deck ${$currentDeck.info.title}?`,
                            response: async confirm => {
                                if (confirm) {
                                    if (!$currentDeck?.info) return;
                                    goto("/library");
                                    await db.deleteDeck($currentDeck.info.id);
                                    currentDeck.set(null);
                                    await refreshDecks();
                                    toastStore.trigger(deleteToast);
                                }
                            }
                        });
                    }}
                    id="delete-button"
                    class="btn variant-filled-warning gap-1 btn-icon rounded-container-token">
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
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </button>
                <button
                    class="btn variant-filled-success"
                    on:click={() => {
                        goto("/deck");
                    }}>
                    Done
                </button>
            </div>
        </div>

        <!-- ! Metadata-->
        <form>
            <div class="space-y-2 mb-4">
                <label class="label space-y-0">
                    <span class="text-lg font-semibold"> Title </span>
                    <input
                        value={$currentDeck.info.title}
                        on:input={e => {
                            if (!$currentDeck.info) return;
                            $currentDeck.info.title = e.target.value;
                            db.updateDeckInfo($currentDeck.info);
                        }}
                        class="input p-2"
                        title="title"
                        type="text"
                        placeholder="Input a title" />
                </label>
                <label class="label space-y-0">
                    <span class="text-lg font-semibold"> Description </span>
                    <textarea
                        value={$currentDeck.info.description}
                        on:input={e => {
                            if (!$currentDeck.info) return;
                            $currentDeck.info.description = e.target.value;
                            db.updateDeckInfo($currentDeck.info);
                        }}
                        class="textarea p-2"
                        rows="2"
                        title="description"
                        placeholder="Input a description" />
                </label>
            </div>

            <!-- ! Schema -->
            <section class="mb-4 space-y-4 border-b border-surface-500/30 pb-4">
                <button
                    class="flex items-center btn variant-filled-secondary btn-sm gap-1"
                    on:click={() => {
                        schemaOpen = !schemaOpen;
                    }}>
                    {#if schemaOpen}
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
                                d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                        </svg>
                    {:else}
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
                                d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                    {/if}
                    <h2 class="text-base">Edit Schema</h2>
                </button>
                {#if schemaOpen}
                    <div transition:slide={{ axis: "y", duration: 250 }}>
                        <div>
                            <h2 class="text-lg font-semibold">Fields</h2>
                            <div>
                                <div class="space-y-2">
                                    {#each $currentDeck.cards.schema.fields as field, index}
                                        <div class="flex gap-2">
                                            <input
                                                value={field}
                                                on:input={e => {
                                                    if (
                                                        !$currentDeck.cards
                                                            .schema.fields
                                                    )
                                                        return;
                                                    $currentDeck.cards.schema.fields[
                                                        index
                                                    ] = e.target.value;
                                                    db.updateDeckCards(
                                                        $currentDeck.cards
                                                    );
                                                }}
                                                class="input p-2"
                                                type="text"
                                                placeholder="Input a field" />
                                            <button
                                                on:click={() => {
                                                    modalStore.trigger({
                                                        type: "confirm",
                                                        title: "Delete Deck",
                                                        body: `Are you sure you want to delete field ${field || "(no name)"}?`,
                                                        response:
                                                            async confirm => {
                                                                if (confirm) {
                                                                    await removeFieldFromSchema(
                                                                        $currentDeck,
                                                                        index
                                                                    );
                                                                }
                                                            }
                                                    });
                                                }}
                                                class="btn variant-filled-warning gap-1 btn-icon rounded-container-token">
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
                                                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                </svg>
                                            </button>
                                        </div>
                                    {/each}

                                    <div class="flex justify-end">
                                        <button
                                            on:click={async () => {
                                                await addFieldToSchema(
                                                    $currentDeck,
                                                    ""
                                                );
                                            }}
                                            class="btn variant-filled-primary gap-2">
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
                                            New Field
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h2 class="text-lg font-semibold">Relationships</h2>
                            <div class="space-y-2">
                                {#each $currentDeck.cards.schema.relationships as rel, index}
                                    <div class="flex gap-2">
                                        <div
                                            class="grid grid-cols-2 gap-4 w-full">
                                            <div
                                                class="flex items-center gap-2">
                                                <h3>From:</h3>
                                                <Select
                                                    items={$currentDeck.cards
                                                        .schema.fields}
                                                    value={rel.from}
                                                    placeholder="Select a field" />
                                            </div>
                                            <div
                                                class="flex items-center gap-2">
                                                <h3>To:</h3>
                                                <Select
                                                    items={$currentDeck.cards
                                                        .schema.fields}
                                                    value={rel.to}
                                                    placeholder="Select a field" />
                                            </div>
                                        </div>
                                        <div>
                                            <button
                                                on:click={async () => {
                                                    await removeRelationshipFromSchema(
                                                        $currentDeck,
                                                        index
                                                    );
                                                }}
                                                class="btn variant-filled-warning gap-1 btn-icon rounded-container-token">
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
                                                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                {/each}

                                <div class="flex justify-end">
                                    <button
                                        on:click={async () => {
                                            addRelationshipToSchema(
                                                $currentDeck
                                            );
                                        }}
                                        class="btn variant-filled-primary gap-2">
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
                                        New Relationship
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                {/if}
            </section>

            <!-- ! Cards-->
            <section class="mb-4">
                <div class="flex justify-between items-center mb-2">
                    <h2 class="text-lg font-semibold">
                        Cards ({$currentDeck.cards.cards.length})
                    </h2>
                    <button
                        class="btn btn-sm variant-filled-secondary gap-1"
                        on:click={() => {
                            cardUploadOpen = !cardUploadOpen;
                        }}>
                        {#if cardUploadOpen}
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
                                    d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                            </svg>
                        {:else}
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
                                    d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15" />
                            </svg>
                        {/if}

                        Upload Cards
                    </button>
                </div>

                <!-- Card Upload -->
                {#if cardUploadOpen}
                    <div
                        transition:slide={{ axis: "y", duration: 250 }}
                        class="mb-4">
                        <form
                            class="flex justify-between gap-2"
                            on:submit|preventDefault={() => {
                                console.log("submit");
                            }}>
                            <input class="input" type="file" />
                            <button
                                type="submit"
                                class="btn variant-filled-primary">Add</button>
                        </form>
                    </div>
                {/if}

                <!-- Card List -->
                <div>
                    <div>
                        {#each $currentDeck.cards.cards as card, index}
                            <div class="w-full">
                                {card}
                            </div>
                        {/each}
                    </div>

                    <button
                        class="btn w-full variant-filled-primary gap-2 mt-2"
                        on:click={async () => {
                            if (!$currentDeck.info) return;
                            await createNewCard($currentDeck);
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
                                d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        New Card
                    </button>
                </div>
            </section>

            <!-- Footer Actions -->
            <div>
                <button
                    class="btn variant-filled-success"
                    on:click={() => {
                        goto("/deck");
                    }}>
                    Done
                </button>
            </div>
        </form>
    </div>
{/if}
