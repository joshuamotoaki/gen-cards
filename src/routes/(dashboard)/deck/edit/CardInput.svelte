<script lang="ts">
  import CardEdit from "$lib/components/CardEdit.svelte";
  import { PlusIcon } from "$lib/components/icons/icons";
  import { createNewCard } from "$lib/utils/deck";

  import { currentDeck } from "$lib/utils/state";
  import { getToastStore, Paginator } from "@skeletonlabs/skeleton";

  const toastStore = getToastStore();

  const checkAndCreateNewCard = async () => {
    if (!$currentDeck) return;
    if ($currentDeck.info.schema.fields.length < 2) {
      toastStore.trigger({
        message: "Decks must have at least two fields.",
        background: "variant-filled-error"
      });
      return;
    }

    // Push pagination to the last page
    paginationSettings.page = Math.floor(
      $currentDeck.cards.length / paginationSettings.limit
    );

    await createNewCard($currentDeck);
  };

  // Pagination
  let paginationSettings = {
    page: 0,
    limit: 50,
    size: $currentDeck?.cards.length || 0,
    amounts: [10, 25, 50, 100]
  };

  $: cards = $currentDeck ? $currentDeck.cards : [];

  $: paginationSettings.size = cards.length;

  $: paginatedCards = cards.slice(
    paginationSettings.page * paginationSettings.limit,
    (paginationSettings.page + 1) * paginationSettings.limit
  );
</script>

{#if $currentDeck}
  {#if $currentDeck.cards.length > 0}
    <div class="space-y-6">
      <Paginator
        showFirstLastButtons={true}
        showPageButtons={true}
        bind:settings={paginationSettings} />
      {#each paginatedCards as card, index}
        <!-- Visual Container -->
        <CardEdit
          {card}
          cardNumber={paginationSettings.page * paginationSettings.limit +
            index +
            1} />
      {/each}
      <Paginator
        showFirstLastButtons={true}
        showPageButtons={true}
        bind:settings={paginationSettings} />
    </div>
  {/if}

  <button
    class="btn w-full variant-filled-primary gap-2 mt-4"
    on:click={checkAndCreateNewCard}>
    <PlusIcon />
    New Card
  </button>
{/if}
