<script lang="ts">
  import { getModalStore } from "@skeletonlabs/skeleton";
  import { currentDeck } from "$lib/state";
  import { updateFieldName } from "$lib/deck";

  const modalStore = getModalStore();

  const validateField = (name: string) => {
    if (!$currentDeck) return false;
    validationError = "";

    if (!name || name.length > 100) {
      validationError =
        "Error: Field name must be between 1 and 100 characters.";
      return false;
    }

    const currentFields = $currentDeck.cards.schema.fields;
    if (currentFields.filter((field, i) => i !== index).includes(name)) {
      validationError = "Error: Field name already exists.";
      return false;
    }

    return true;
  };

  const onFormSubmit = async () => {
    if (!$currentDeck) return;
    if (!validateField(fieldName)) return;
    await updateFieldName($currentDeck, index, fieldName);
    modalStore.close();
  };

  let fieldName = $modalStore[0].meta.field;
  let index = $modalStore[0].meta.index;

  let validationError = "";
</script>

{#if $modalStore[0]}
  <div class="card p-4 w-modal shadow-xl">
    <header class="text-2xl font-semibold mb-1">Edit Field</header>
    <article class="mb-4">Edit the name of the field.</article>
    {#if validationError}
      <div class="text-red-500 mb-2">{validationError}</div>
    {/if}
    <form on:submit|preventDefault={onFormSubmit}>
      <input
        class="input p-2 mb-8"
        type="text"
        bind:value={fieldName}
        placeholder="Enter new field name" />

      <footer class="flex justify-end gap-2">
        <button
          type="button"
          class="btn variant-filled-surface"
          on:click={modalStore.close}>Cancel</button>
        <button type="submit" class="btn variant-filled-success">Submit</button>
      </footer>
    </form>
  </div>
{/if}
