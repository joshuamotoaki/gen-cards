<script lang="ts">
  import { BackIcon, TrashIcon } from "$lib/components/icons/icons";
  import { db } from "$lib/utils/db";
  import { refreshAllDecks, refreshDeck } from "$lib/utils/deck";
  import { currentDeck, decks } from "$lib/utils/state";
  import { getModalStore, getToastStore } from "@skeletonlabs/skeleton";

  import DeckWarning from "$lib/components/deck/DeckWarning.svelte";
  import FileUpload from "$lib/components/deck/FileUpload.svelte";
  import MetadatEdit from "$lib/components/deck/MetadatEdit.svelte";
  import CardInput from "$lib/components/deck/CardInput.svelte";
  import { currentRoute } from "$lib/utils/config";
  import WarningIcon from "$lib/components/icons/WarningIcon.svelte";

  const toastStore = getToastStore();
  const modalStore = getModalStore();

  const resetDeck = () => {
    if (!$currentDeck) return;
    modalStore.trigger({
      type: "confirm",
      title: "Reset Deck",
      body: `Are you sure you want to reset the progress of deck "${$currentDeck.info.title}"?`,
      response: async confirm => {
        if (confirm) {
          if (!$currentDeck?.info) return;
          await db.resetDeck($currentDeck.info.id);
          await refreshDeck($currentDeck.info.id);
          currentDeck.set({
            info: $currentDeck.info,
            cards: await db.getDeckCards($currentDeck.info.id)
          });
          toastStore.trigger({
            message: "Deck successfully reset.",
            background: "variant-filled-success"
          });
        }
      }
    });
  };

  const deleteDeck = () => {
    if (!$currentDeck) return;
    modalStore.trigger({
      type: "confirm",
      title: "Delete Deck",
      body: `Are you sure you want to delete deck "${$currentDeck.info.title}"?`,
      response: async confirm => {
        if (confirm) {
          if (!$currentDeck?.info) return;
          currentRoute.set("/library");
          await db.deleteDeck($currentDeck.info.id);
          currentDeck.set(null);
          await refreshAllDecks();
          toastStore.trigger({
            message: "Deck successfully deleted.",
            background: "variant-filled-success"
          });
        }
      }
    });
  };
</script>

{#if !$currentDeck}
  <DeckWarning />
{:else}
  <div class="flex-1 p-4 overflow-y-auto">
    <header class="flex justify-between items-center mb-4">
      <div class="flex items-center gap-2">
        <button
          class="btn btn-icon"
          on:click={() => {
            currentRoute.set("/deck");
          }}>
          <BackIcon />
        </button>
        <h1 class="text-2xl font-bold">Edit Deck</h1>
      </div>
      <div class="flex items-center gap-2">
        <button
          on:click={resetDeck}
          id="warning-button"
          class="btn variant-filled-surface hover:variant-filled-error
          gap-1 btn-icon rounded-container-token">
          <WarningIcon />
        </button>
        <button
          on:click={deleteDeck}
          id="delete-button"
          class="btn variant-filled-surface hover:variant-filled-warning
          gap-1 btn-icon rounded-container-token">
          <TrashIcon />
        </button>
        <button
          class="btn variant-filled-success"
          on:click={() => {
            currentRoute.set("/deck");
          }}>
          Done
        </button>
      </div>
    </header>

    <div>
      <MetadatEdit />

      <main class="mb-4">
        <FileUpload />
        <CardInput />
      </main>

      <footer>
        <button
          class="btn variant-filled-success"
          on:click={() => {
            currentRoute.set("/deck");
          }}>
          Done
        </button>
      </footer>
    </div>
  </div>
{/if}
