<script lang="ts">
  import { getModalStore } from "@skeletonlabs/skeleton";
  import { currentDeck, fieldsToAdd } from "$lib/utils/state";

  const modalStore = getModalStore();

  const onFormSubmit = async () => {
    modalStore.close();
  };

  $: gridCSS = `grid-template-columns: repeat(${$currentDeck && $currentDeck.cards.schema.fields.length}, 1fr);`;
</script>

{#if $modalStore[0]}
  {#if $fieldsToAdd && $fieldsToAdd.length > 0 && $currentDeck}
    <div class="card p-4 w-modal-wide shadow-xl">
      <header class="text-2xl font-semibold mb-1">
        <h1>Cards to Add</h1>
      </header>
      <div class="mb-4">
        <p>
          Confirm adding
          <span class="font-semibold">
            {$fieldsToAdd.length} cards
          </span>
          to the deck?
        </p>
      </div>
      <form on:submit|preventDefault={onFormSubmit}>
        <main class="space-y-2 overflow-y-auto max-h-[50vh] pb-2">
          <div
            style={gridCSS}
            class="w-full shadow-sm grid border border-surface-300-600-token gap-2
          bg-surface-400-500-token rounded-container-token p-2 font-semibold">
            {#each $currentDeck.cards.schema.fields as field, j}
              <h3
                class="select-text cursor-text pl-2
                {j !== 0 && 'border-l border-surface-600-300-token'}">
                {field}
              </h3>
            {/each}
          </div>

          {#each $fieldsToAdd as cardFields, index}
            <article
              class="w-full shadow-sm
                border border-surface-300-600-token
            bg-surface-200-700-token rounded-container-token p-2
            ">
              <div style={gridCSS} class="grid gap-2">
                {#each $currentDeck.cards.schema.fields as field, j}
                  <div
                    class="flex items-center select-text cursor-text pl-2
                    {j !== 0 && 'border-l border-surface-400-500-token'}">
                    {cardFields[field]}
                  </div>
                {/each}
              </div>
            </article>
          {/each}
        </main>
        <footer class="flex justify-end gap-2 mt-4">
          <button
            type="button"
            class="btn variant-filled-surface"
            on:click={modalStore.close}>Cancel</button>
          <button type="submit" class="btn variant-filled-success"
            >Confirm</button>
        </footer>
      </form>
    </div>
  {:else}
    <p>Error: No cards to add.</p>
  {/if}
{/if}
