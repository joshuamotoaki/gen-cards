<script lang="ts">
  import { goto } from "$app/navigation";
  import { currentDeck, prevRoute } from "$lib/utils/state";
  import { getToastStore, Paginator } from "@skeletonlabs/skeleton";
  import DeckWarning from "$lib/components/deck/DeckWarning.svelte";
  import {
    EditIcon,
    SearchIcon,
    StarIcon,
    StarSolidIcon,
    BackIcon,
    TrashIcon
  } from "$lib/components/icons/icons";
  import { createNewCard, togglePriority, removeCard } from "$lib/utils/deck";
  import InfoIcon from "$lib/components/icons/InfoIcon.svelte";
  import { currentStudySession } from "$lib/utils/study";
  import { db } from "$lib/utils/db";
  import CheckIcon from "$lib/components/icons/CheckIcon.svelte";

  const toastStore = getToastStore();

  const isDeckError = (): boolean => {
    if (!$currentDeck) return true;

    let isError = false;
    const TOAST_TIMEOUT = 5000;

    // There must be at least one relationship
    if ($currentDeck.info.schema.relationships.length === 0) {
      toastStore.trigger({
        message: "No relationship found.",
        background: "variant-filled-error",
        timeout: TOAST_TIMEOUT
      });
      isError = true;
    }

    // There must be at least one card
    if ($currentDeck.cards.length === 0) {
      toastStore.trigger({
        message: "No cards found.",
        background: "variant-filled-error",
        timeout: TOAST_TIMEOUT
      });
      isError = true;
    }

    // There must be no empty fields
    if (
      $currentDeck.cards.some(card =>
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

  const updateCard = async (index: number, field: string, value: string) => {
    if (!$currentDeck) return;
    $currentDeck.cards[index].fields[field] = value;
    await db.updateCard($currentDeck.cards[index]);
  };

  const autoCreateNewCard = async (field: string, index: number) => {
    if (!$currentDeck) return;

    // If the card is the last one, create a new card
    if (
      field ===
        $currentDeck.info.schema.fields[
          $currentDeck.info.schema.fields.length - 1
        ] &&
      index === $currentDeck.cards.length - 1
    ) {
      await createNewCard($currentDeck);

      // Tab to the first field in the new card
      const nextField = document.querySelector(
        `textarea[title="${$currentDeck.info.schema.fields[0] + (index + 1)}"]`
      ) as HTMLTextAreaElement;
      if (nextField) nextField.focus();
    }
  };

  let editArr = new Array($currentDeck?.cards.length).fill(false);

  // Ex. 8/20/2024 12:00 PM
  const formatDateTime = (date: number) => {
    const day = new Date(date).toLocaleDateString();
    const time = new Date(date).toLocaleTimeString();

    const [hour, minute] = time.split(":").slice(0, 2);
    const [ampm] = time.split(" ").slice(1);

    return `${day} ${hour}:${minute} ${ampm}`;
  };

  // Pagination and Search

  let searchInput = "";

  $: filteredCards = $currentDeck?.cards.filter(card =>
    Object.values(card.fields).some(field =>
      field.toLowerCase().includes(searchInput.toLowerCase())
    )
  );

  let paginationSettings = {
    page: 0,
    limit: 50,
    size: $currentDeck?.cards.length || 0,
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
  $: gridCSS = `grid-template-columns: repeat(${$currentDeck && $currentDeck.info.schema.fields.length}, 1fr);`;
</script>

{#if !$currentDeck}
  <DeckWarning />
{:else}
  <div class="p-4 w-full flex-1 overflow-y-auto">
    <!-- Header Info -->
    <div class="mb-4 space-y-2">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2 overflow-hidden">
          <button
            class="btn btn-icon"
            on:click={() => {
              currentDeck.set(null);
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
              currentStudySession.init();
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

      {#each $currentDeck.info.schema.relationships as relationship}
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
        Cards ({$currentDeck.cards.length})
      </h2>

      {#if $currentDeck.cards.length > 0}
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
            {#if !editArr[index]}
              <!-- ! VIEW -->
              <article
                class="border border-surface-300-600-token rounded-container-token
                p-2 shadow-sm bg-surface-200-700-token">
                <div
                  class="border-b border-surface-500/30 text-sm
                    grid grid-cols-[1fr_auto_1fr] gap-4 items-center pb-2 mb-2
                    ">
                  <p class="font-semibold text-surface-600-300-token">
                    {paginationSettings.page * paginationSettings.limit +
                      index +
                      1}
                  </p>
                  <div
                    class="
                      {card.scheduled_at &&
                    card.scheduled_at < new Date().getTime() &&
                    card.level > 0
                      ? 'bg-primary-100-800-token'
                      : 'bg-surface-300-600-token'}
                      rounded-full px-2 py-1
                      text-surface-700-200-token text-sm
                      flex items-center gap-4">
                    <p>
                      {card.level === 0 ? "Not Studied" : "Level " + card.level}
                    </p>
                    {#if card.level > 0}
                      <p class="hidden md:block">
                        {card.scheduled_at
                          ? "Scheduled: " + formatDateTime(card.scheduled_at)
                          : "Not Scheduled"}
                      </p>
                    {/if}
                  </div>
                  <div class="flex items-center gap-2 justify-end">
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
                      on:click={() => {
                        editArr[index] = true;
                      }}
                      class="btn-icon btn-icon-sm text-surface-600-300-token
                      hover:text-secondary-700-200-token">
                      <EditIcon className="size-5" />
                    </button>
                  </div>
                </div>
                <div style={gridCSS} class="grid flex-1 py-1">
                  {#each $currentDeck.info.schema.fields as field, index}
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
              </article>
            {:else}
              <!-- ! EDIT -->
              <article
                class="flex-1 shadow-sm border
                    bg-surface-200-700-token rounded-container-token p-4
                    {Object.values(card.fields).some(field => field === '')
                  ? 'border-warning-300-600-token'
                  : 'border-surface-300-600-token'}
                    ">
                <!-- Card Actions -->
                <div
                  class="border-b-2 border-surface-300-600-token
                          flex justify-between items-center text-sm pb-1 mb-2">
                  <div class="flex items-center gap-4">
                    <p class="text-surface-600-300-token font-semibold">
                      {paginationSettings.page * paginationSettings.limit +
                        index +
                        1}
                    </p>
                  </div>
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
                      tabindex="-1"
                      on:click={async e => {
                        if (!$currentDeck.info) return;
                        editArr.splice(index, 1);
                        await removeCard($currentDeck, index);
                      }}
                      class="btn-icon btn-icon-sm text-surface-600-300-token
                            hover:text-warning-700-200-token">
                      <TrashIcon className="size-5" />
                    </button>
                    <button
                      tabindex="-1"
                      on:click={() => {
                        editArr[index] = false;
                      }}
                      class="btn-icon btn-icon-sm text-surface-600-300-token
                            hover:text-success-700-200-token">
                      <CheckIcon className="size-5" />
                    </button>
                  </div>
                </div>

                <!-- Card Contents -->
                <div style={gridCSS} class="grid gap-4">
                  {#each $currentDeck.info.schema.fields as field}
                    <div class="flex items-center">
                      <label class="flex flex-col gap-1 w-full">
                        <!-- TODO: Figure out how to dynamically change size -->
                        <!-- TODO: Tabbing to the next card places cursor at the end-->
                        <textarea
                          autocapitalize="off"
                          autocorrect="off"
                          autocomplete="off"
                          spellcheck="false"
                          value={card.fields[field]}
                          on:input={async e => {
                            await updateCard(
                              index,
                              field,
                              e.currentTarget.value
                            );
                          }}
                          on:keydown={e => {
                            if (e.key === "Tab") {
                              autoCreateNewCard(field, index);
                            }
                          }}
                          title={field + index}
                          rows="1"
                          class="focus:outline-none bg-transparent
                                pt-2 pb-1 resize-none w-full
                                border-b-2 border-surface-700-200-token
                                focus:border-primary-500-400-token"
                          placeholder={"Enter " + field} />
                        <span class="text-sm text-surface-600-300-token">
                          {field}
                        </span>
                      </label>
                    </div>
                  {/each}
                </div>
              </article>
            {/if}
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
