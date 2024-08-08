<script lang="ts">
    // @ts-nocheck
    import { goto } from "$app/navigation";
    import { db } from "$lib/db";
    import { currentDeck, decks } from "$lib/state";
    import {
        getModalStore,
        getToastStore,
        type ToastSettings
    } from "@skeletonlabs/skeleton";
    import DeckWarning from "../DeckWarning.svelte";

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
    <div class="flex-1 p-4">
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
                        const deleteConfirm = {
                            type: "confirm",
                            title: "Delete Deck",
                            body: `Are you sure you want to delete deck ${$currentDeck.info.title}?`,
                            response: async confirm => {
                                if (confirm) {
                                    if (!$currentDeck?.info) return;
                                    goto("/library");
                                    await db.deleteDeck($currentDeck.info.id);
                                    currentDeck.set(null);
                                    decks.set(await db.getAllDeckInfos());
                                    toastStore.trigger(deleteToast);
                                }
                            }
                        };
                        modalStore.trigger(deleteConfirm);
                    }}
                    id="delete-button"
                    class="btn variant-filled-error gap-1 btn-icon">
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

        <form>
            <label class="label space-y-0 mb-2">
                <span class="text-lg"> Title </span>
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
            <label class="label space-y-0 mb-2">
                <span class="text-lg"> Description </span>
                <textarea
                    value={$currentDeck.info.description}
                    on:input={e => {
                        if (!$currentDeck.info) return;
                        $currentDeck.info.description = e.target.value;
                        db.updateDeckInfo($currentDeck.info);
                    }}
                    class="textarea p-2"
                    rows="3"
                    title="description"
                    placeholder="Input a description" />
            </label>
        </form>
    </div>
{/if}
