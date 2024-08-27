<script lang="ts">
  import { goto } from "$app/navigation";
  import { BackIcon, TrashIcon } from "$lib/components/icons/icons";
  import { db } from "$lib/utils/db";
  import { refreshAllDecks } from "$lib/utils/deck";
  import { currentDeck } from "$lib/utils/state";
  import { getModalStore, getToastStore } from "@skeletonlabs/skeleton";

  import DeckWarning from "$lib/components/deck/DeckWarning.svelte";
  import FileUpload from "$lib/components/deck/FileUpload.svelte";
  import MetadatEdit from "$lib/components/deck/MetadatEdit.svelte";
  import CardInput from "$lib/components/deck/CardInput.svelte";

  const toastStore = getToastStore();
  const modalStore = getModalStore();

  const deleteDeck = () => {
    if (!$currentDeck) return;
    modalStore.trigger({
      type: "confirm",
      title: "Delete Deck",
      body: `Are you sure you want to delete deck "${$currentDeck.info.title}"?`,
      response: async confirm => {
        if (confirm) {
          if (!$currentDeck?.info) return;
          goto("/library");
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
            goto("/deck");
          }}>
          <BackIcon />
        </button>
        <h1 class="text-2xl font-bold">Edit Deck</h1>
      </div>
      <div class="flex items-center gap-2">
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
            goto("/deck");
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
            goto("/deck");
          }}>
          Done
        </button>
      </footer>
    </div>
  </div>
{/if}
