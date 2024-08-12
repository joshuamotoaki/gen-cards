<script lang="ts">
  import { goto } from "$app/navigation";
  import { conflictingCards, currentDeck, prevRoute } from "$lib/utils/state";
  import { getToastStore, Paginator } from "@skeletonlabs/skeleton";
  import DeckWarning from "./DeckWarning.svelte";
  import {
    EditIcon,
    SearchIcon,
    StarIcon,
    StarSolidIcon,
    BackIcon
  } from "$lib/components/icons/icons";
  import { togglePriority } from "$lib/utils/deck";
  import InfoIcon from "$lib/components/icons/InfoIcon.svelte";

  const toastStore = getToastStore();

  const isDeckError = (): boolean => {
    if (!$currentDeck) return true;

    let isError = false;
    const TOAST_TIMEOUT = 5000;

    // There must be at least one relationship
    if ($currentDeck.cards.schema.relationships.length === 0) {
      toastStore.trigger({
        message: "No relationship found.",
        background: "variant-filled-error",
        timeout: TOAST_TIMEOUT
      });
      isError = true;
    }

    // There must be at least one card
    if ($currentDeck.cards.cards.length === 0) {
      toastStore.trigger({
        message: "No cards found.",
        background: "variant-filled-error",
        timeout: TOAST_TIMEOUT
      });
      isError = true;
    }

    // There must be no empty fields
    if (
      $currentDeck.cards.cards.some(card =>
        Object.values(card.fields).some(field => !field)
      )
    ) {
      toastStore.trigger({
        message: "Empty fields found.",
        background: "variant-filled-error",
        timeout: TOAST_TIMEOUT
      });
      isError = true;
    }

    return isError;
  };

  // Pagination and Search

  let searchInput = "";

  $: filteredCards = $currentDeck?.cards.cards.filter(card =>
    Object.values(card.fields).some(field =>
      field.toLowerCase().includes(searchInput.toLowerCase())
    )
  );

  let paginationSettings = {
    page: 0,
    limit: 50,
    size: $currentDeck?.cards.cards.length || 0,
    amounts: [10, 25, 50, 100]
  };

  // TODO - Ensure that this behavior is correct
  $: {
    paginationSettings.size = filteredCards ? filteredCards.length : 0;

    if (
      paginationSettings.page * paginationSettings.limit >
      paginationSettings.size
    ) {
      paginationSettings.page = 0;
    }
  }

  $: paginatedCards = filteredCards
    ? filteredCards.slice(
        paginationSettings.page * paginationSettings.limit,
        (paginationSettings.page + 1) * paginationSettings.limit
      )
    : [];

  // Style
  $: gridCSS = `grid-template-columns: repeat(${$currentDeck && $currentDeck.cards.schema.fields.length}, 1fr);`;
</script>

{#if !$currentDeck}
  <DeckWarning />
{:else}
  <div class="p-4 w-full flex-1 overflow-y-auto">
    <!-- Header Info -->
    <div class="mb-4 space-y-2">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <button
            class="btn btn-icon"
            on:click={() => {
              currentDeck.set(null);
              conflictingCards.set(null);
              if ($prevRoute) goto($prevRoute);
              else goto("/library");
              prevRoute.set(null);
            }}>
            <BackIcon />
          </button>

          <h1 class="text-2xl font-semibold">
            {$currentDeck?.info.title ? $currentDeck.info.title : "(no title)"}
          </h1>
        </div>

        <div class="flex items-center gap-2">
          <button class="btn btn-icon">
            <InfoIcon />
          </button>
          <button class="btn btn-icon" on:click={() => goto("/deck/edit")}>
            <EditIcon />
          </button>
          <button
            class="card card-hover px-8 py-1 variant-filled-primary overflow-hidden"
            on:click={() => {
              if (isDeckError()) return;
              goto("/deck/study");
            }}>
            Study
          </button>
        </div>
      </div>
    </div>
    <div class="space-y-1">
      {#if $currentDeck.info.description}
        <p>
          <span>{$currentDeck.info.description}</span>
        </p>
      {/if}
      <p>
        <span class="font-semibold"> Last studied: </span>
        <span>
          {$currentDeck?.info.studied_at
            ? new Date($currentDeck?.info.studied_at).toLocaleDateString()
            : "Never"}
        </span>
      </p>
    </div>

    <!-- Schema-->
    <div class="border-b border-surface-500/30 pb-4 mb-4">
      <h2 class="text-lg font-semibold mt-4">Relationships</h2>

      {#each $currentDeck.cards.schema.relationships as relationship}
        <div class="w-full grid grid-cols-2">
          <div>
            <span class="font-semibold"> From: </span>
            {relationship.from}
          </div>
          <div>
            <span class="font-semibold"> To: </span>
            {relationship.to}
          </div>
        </div>
      {:else}
        <p>
          No relationship found. Please add field relationships before studying.
        </p>
      {/each}
    </div>

    <!-- Cards -->
    <div>
      <h2 class="text-lg font-semibold mb-2">
        Cards ({$currentDeck.cards.cards.length})
      </h2>

      {#if $currentDeck.cards.cards.length > 0}
        <div class="space-y-3">
          <Paginator
            showFirstLastButtons={true}
            showPreviousNextButtons={true}
            bind:settings={paginationSettings} />

          <div class="input-group input-group-divider grid-cols-[auto_1fr]">
            <div class="input-group-shim">
              <SearchIcon />
            </div>
            <input
              class="input p-2 border-none outline-none bg-transparent focus:bg-transparent hover:bg-transparent"
              type="search"
              placeholder="Search..."
              bind:value={searchInput} />
          </div>

          {#each paginatedCards as card, index}
            <div
              class="border border-surface-300-600-token rounded-container-token
              p-2 shadow-sm
                {card.priority === 1
                ? 'bg-primary-200-700-token'
                : 'bg-surface-200-700-token'}">
              <div
                class="border-b border-surface-500/30 flex items-center justify-between text-sm">
                <p class="font-semibold text-surface-600-300-token">
                  {paginationSettings.page * paginationSettings.limit +
                    index +
                    1}
                </p>
                <div class="flex items-center gap-2">
                  <button
                    tabindex="-1"
                    class="btn-icon btn-icon-sm
                          {card.priority === 1
                      ? 'text-primary-700-200-token'
                      : 'text-surface-600-300-token hover:text-primary-700-200-token'}
                          "
                    on:click={() => togglePriority($currentDeck, index)}>
                    {#if card.priority === 1}
                      <StarSolidIcon className="size-5" />
                    {:else}
                      <StarIcon className="size-5" />
                    {/if}
                  </button>

                  <button
                    class="btn-icon btn-icon-sm text-surface-600-300-token
                  hover:text-secondary-700-200-token">
                    <EditIcon className="size-5" />
                  </button>
                </div>
              </div>
              <div style={gridCSS} class="grid flex-1 py-1">
                {#each $currentDeck.cards.schema.fields as field, index}
                  <div>
                    <p
                      class="flex items-center select-text cursor-text
                    {index !== 0 && 'border-surface-400-500-token'}
                  ">
                      {card.fields[field]}
                    </p>
                    <p class="text-sm text-surface-600-300-token">
                      {field}
                    </p>
                  </div>
                {/each}
              </div>
            </div>
          {/each}

          {#if paginationSettings.size > 20}
            <Paginator
              showFirstLastButtons={true}
              showPreviousNextButtons={true}
              bind:settings={paginationSettings} />
          {/if}

          <button
            class="w-full btn gap-2 variant-filled-secondary"
            on:click={() => goto("/deck/edit")}>
            <EditIcon />
            Edit Cards
          </button>
        </div>
      {:else}
        <p>No cards found. Please add cards before studying.</p>
      {/if}
    </div>
  </div>
{/if}
