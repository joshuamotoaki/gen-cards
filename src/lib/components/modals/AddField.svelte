<script lang="ts">
  import { getModalStore } from "@skeletonlabs/skeleton";
  import { currentDeck } from "$lib/utils/state";
  import { addFieldToSchema } from "$lib/utils/deck";

  const modalStore = getModalStore();

  const validateField = (name: string) => {
    if (!$currentDeck) return false;
    validationError = "";

    if (!name || name.length > 100) {
      validationError =
        "Error: Field name must be between 1 and 100 characters.";
      return false;
    }

    const currentFields = $currentDeck.info.schema.fields;
    if (currentFields.includes(name)) {
      validationError = "Error: Field name already exists.";
      return false;
    }

    return true;
  };

  const onFormSubmit = async () => {
    if (!$currentDeck) return;
    if (!validateField(fieldName)) return;
    await addFieldToSchema($currentDeck, fieldName);
    modalStore.close();
  };

  let fieldName = "";
  let validationError = "";
</script>

{#if $modalStore[0]}
  <div class="card p-4 w-modal shadow-xl">
    <header class="text-2xl font-semibold mb-1">Add Field</header>
    <article class="mb-4">Enter the name of the new field.</article>
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
