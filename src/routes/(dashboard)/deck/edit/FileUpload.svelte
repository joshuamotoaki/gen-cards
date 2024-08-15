<script lang="ts">
  import { UploadIcon } from "$lib/components/icons/icons";
  import { fieldsToAdd, currentDeck } from "$lib/utils/state";
  import {
    FileButton,
    getModalStore,
    getToastStore
  } from "@skeletonlabs/skeleton";

  const toastStore = getToastStore();
  const modalStore = getModalStore();

  let files: FileList | undefined;

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

    const currentHeaders = $currentDeck?.info.schema.fields;
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

  const handleFileUpload = async (e: Event) => {
    // This ensures that the same file can be uploaded twice in a row
    const resetField = () => {
      // @ts-ignore
      e.target.value = null;
    };

    fieldsToAdd.set(null);

    // This should theoretically never happen
    if (!files) {
      toastStore.trigger({
        message: "Something went wrong: no file selected.",
        background: "variant-filled-error"
      });
      resetField();
      return;
    }

    if (!$currentDeck || $currentDeck?.info.schema.fields.length < 2) {
      toastStore.trigger({
        message: "Decks must have at least two fields.",
        background: "variant-filled-error"
      });
      resetField();
      return;
    }

    const file = files[0];

    // Format and populate the cardsToAdd store
    switch (file.name.split(".").pop()) {
      case "csv":
        if (!(await csvToFields(file))) {
          resetField();
          return;
        }
        break;
      default:
        toastStore.trigger({
          message: "Invalid file type. Please upload a CSV file.",
          background: "variant-filled-error"
        });
        resetField();
        return;
    }

    // Open the modal to confirm the upload
    modalStore.trigger({
      type: "component",
      component: "confirmUpload"
    });

    resetField();
  };
</script>

<!-- TODO: Ensure that a double upload (after 1st one being error) succeeds -->
{#if $currentDeck}
  <section class="flex justify-between items-center mb-4">
    <h2 class="text-lg font-semibold">
      Cards ({$currentDeck.cards.length})
    </h2>
    <FileButton
      button="btn btn-sm variant-filled-secondary gap-1"
      name="upload"
      bind:files
      on:change={e => {
        handleFileUpload(e);
      }}>
      <UploadIcon />
      Upload Card CSV
    </FileButton>
  </section>
{/if}
