<script lang="ts">
  import { getModalStore } from "@skeletonlabs/skeleton";
  import { currentDeck, fieldsToAdd } from "$lib/utils/state";

  const modalStore = getModalStore();

  const onFormSubmit = async () => {
    modalStore.close();
  };

  $: gridCSS = `grid-template-columns: repeat(${$fieldsToAdd && $fieldsToAdd.length}, 1fr);`;
</script>

{#if $modalStore[0]}
  <div class="card p-4 w-modal shadow-xl">
    <header class="text-2xl font-semibold mb-1">Cards to Add</header>
    <div class="mb-4">Confirm adding these cards to the deck?</div>
    <form on:submit|preventDefault={onFormSubmit}>
      {#if $fieldsToAdd && $fieldsToAdd.length > 0 && $currentDeck}
        <main>
          {#each $fieldsToAdd as cardFields, index}
            <article style={gridCSS} class="grid">
              {#each $currentDeck?.cards.schema.fields as field}
                {cardFields[field]}
              {/each}
            </article>
          {/each}
        </main>
      {:else}
        <p>Error: No cards to add.</p>
      {/if}
      <footer class="flex justify-end gap-2">
        <button
          type="button"
          class="btn variant-filled-surface"
          on:click={modalStore.close}>Cancel</button>
        <button type="submit" class="btn variant-filled-success"
          >Confirm</button>
      </footer>
    </form>
  </div>
{/if}
