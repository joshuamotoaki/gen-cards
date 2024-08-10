<script lang="ts">
  import {
    ChevronUpIcon,
    DocumentUpSolidIcon,
    UploadIcon
  } from "$lib/components/icons/icons";
  import { currentDeck } from "$lib/utils/state";
  import {
    FileDropzone,
    getModalStore,
    getToastStore
  } from "@skeletonlabs/skeleton";
  import { slide } from "svelte/transition";

  const toastStore = getToastStore();
  const modalStore = getModalStore();

  let files: FileList;
  let cardUploadOpen = false;

  const handleFileUpload = () => {
    if (!files) {
      toastStore.trigger({
        message: "Something went wrong: no file selected.",
        background: "variant-filled-error"
      });
      return;
    }

    if (!files[0].name.endsWith(".csv") && !files[0].name.endsWith(".json")) {
      toastStore.trigger({
        message: "Invalid file type. Please upload a CSV or JSON file.",
        background: "variant-filled-error"
      });
      return;
    }

    modalStore.trigger({
      type: "component",
      component: "confirmUpload"
    });
  };
</script>

{#if $currentDeck}
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-lg font-semibold">
      Cards ({$currentDeck.cards.cards.length})
    </h2>
    <button
      class="btn btn-sm variant-filled-secondary gap-1"
      on:click={() => {
        cardUploadOpen = !cardUploadOpen;
      }}>
      {#if cardUploadOpen}
        <ChevronUpIcon />
      {:else}
        <UploadIcon />
      {/if}
      Upload Cards
    </button>
  </div>

  <!-- Card Upload -->
  {#if cardUploadOpen}
    <div
      transition:slide={{ axis: "y", duration: 250 }}
      class="mb-4 bg-surface-100-800-token border
      border-surface-300-600-token
      p-4 rounded-container-token">
      <FileDropzone name="upload" bind:files on:change={handleFileUpload}>
        <svelte:fragment slot="lead">
          <div class="flex items-center justify-center">
            <DocumentUpSolidIcon className="size-8" />
          </div>
        </svelte:fragment>
        <svelte:fragment slot="message">
          <h3 class="text-lg font-semibold text-center">
            Upload a deckfile to magically add cards.
          </h3>
        </svelte:fragment>
        <svelte:fragment slot="meta">
          <p class="text-sm text-surface-600-300-token">
            CSV and JSON allowed.
          </p>
        </svelte:fragment>
      </FileDropzone>
    </div>
  {/if}
{/if}
