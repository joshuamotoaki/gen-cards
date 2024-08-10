<script lang="ts">
  import {
    ChevronUpIcon,
    DocumentUpSolidIcon,
    UploadIcon
  } from "$lib/components/icons/icons";
  import { fieldsToAdd, currentDeck } from "$lib/utils/state";
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

  const csvToFields = async (file: File): Promise<boolean> => {
    const text = await file.text();
    const lines = text
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length < 2) {
      toastStore.trigger({
        message: "Invalid CSV file: not enough lines.",
        background: "variant-filled-error"
      });
      return false;
    }
    const headers = lines[0].split(",");

    // Validate headers
    let areHeadersEqual = true;

    const currentHeaders = $currentDeck?.cards.schema.fields;
    if (!currentHeaders) return false;

    // Headers don't have to be in the same order or case
    const normalize = (input: string[]) =>
      input.map(i => i.trim().toLowerCase());
    const normalizedHeaders = normalize(headers);
    const currentHeadersNormalized = normalize(currentHeaders);

    for (let i = 0; i < currentHeadersNormalized.length; i++) {
      if (currentHeadersNormalized[i] !== normalizedHeaders[i]) {
        areHeadersEqual = false;
        break;
      }
    }

    if (!areHeadersEqual) {
      toastStore.trigger({
        message: "Invalid CSV file: headers do not match deck schema.",
        background: "variant-filled-error"
      });
      return false;
    }

    // Parse the CSV
    const fields: Record<string, string>[] = [];
    let isError = false;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].split(",");
      const card: Record<string, string> = {};

      if (line.length !== headers.length) {
        toastStore.trigger({
          message: `Invalid CSV file: line ${i + 1} has an incorrect number of fields.`,
          background: "variant-filled-error"
        });
        isError = true;
        continue;
      }

      for (let j = 0; j < currentHeaders.length; j++)
        card[currentHeaders[j]] = line[j];
      fields.push(card);
    }

    // If there was an error, don't add the fields
    if (isError) return false;
    fieldsToAdd.set(fields);
    return true;
  };

  const handleFileUpload = async () => {
    fieldsToAdd.set(null);

    // This should theoretically never happen
    if (!files) {
      toastStore.trigger({
        message: "Something went wrong: no file selected.",
        background: "variant-filled-error"
      });
      return;
    }

    // Format and populate the cardsToAdd store
    switch (files[0].name.split(".").pop()) {
      case "csv":
        if (!(await csvToFields(files[0]))) return;
        break;
      default:
        toastStore.trigger({
          message: "Invalid file type. Please upload a CSV or JSON file.",
          background: "variant-filled-error"
        });
        return;
    }

    console.log("Fields to add:", $fieldsToAdd);

    // Open the modal to confirm the upload
    modalStore.trigger({
      type: "component",
      component: "confirmUpload"
    });
  };
</script>

{#if $currentDeck}
  <section class="flex justify-between items-center mb-4">
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
  </section>

  <!-- Card Upload -->
  {#if cardUploadOpen}
    <section
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
            Upload a CSV file to bulk add cards.
          </h3>
        </svelte:fragment>
        <svelte:fragment slot="meta">
          <p class="text-sm text-surface-600-300-token">
            CSV files must match the schema of the deck.
          </p>
        </svelte:fragment>
      </FileDropzone>
    </section>
  {/if}
{/if}
