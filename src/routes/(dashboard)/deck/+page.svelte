<script lang="ts">
  import { goto } from "$app/navigation";
  import { currentDeck, prevRoute } from "$lib/state";
  import { getToastStore, type ToastSettings } from "@skeletonlabs/skeleton";
  import DeckWarning from "./DeckWarning.svelte";
  import { db } from "$lib/db";
  import {
    EditIcon,
    StarIcon,
    StarSolidIcon
  } from "$lib/components/icons/icons";
  import { togglePriority } from "$lib/helpers";

  // Toast handling
  const toastStore = getToastStore();

  const TOAST_TIMEOUT = 5000;
  const noSchemaError: ToastSettings = {
    message: "No schema found.",
    background: "variant-filled-error",
    timeout: TOAST_TIMEOUT
  };

  const noCardsError: ToastSettings = {
    message: "No cards found.",
    background: "variant-filled-error",
    timeout: TOAST_TIMEOUT
  };

  const isDeckError = (): boolean => {
    let isError = false;
    if (!$currentDeck) {
      return true;
    }

    if ($currentDeck.cards.schema.relationships.length === 0) {
      toastStore.trigger(noSchemaError);
      isError = true;
    }

    if ($currentDeck.cards.cards.length === 0) {
      toastStore.trigger(noCardsError);
      isError = true;
    }

    return isError;
  };

  // Reactive in order to update on schema changes
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
              if ($prevRoute) goto($prevRoute);
              else goto("/library");
              prevRoute.set(null);
            }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
          </button>

          <h1 class="text-2xl font-semibold">
            {$currentDeck?.info.title ? $currentDeck.info.title : "(no title)"}
          </h1>
        </div>
        <!-- ! Menu for settings dropdown in the future -->
        <!-- <button class="btn btn-icon">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-6">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </button> -->
      </div>

      <!-- Action Buttons -->
      <div class="grid grid-cols-3 gap-2 mb-4">
        <button
          class="card card-hover p-1 variant-filled-primary overflow-hidden"
          on:click={() => {
            if (isDeckError()) return;
            goto("/deck/study");
          }}>
          Study
        </button>
        <button
          class="card card-hover p-1 variant-filled-secondary overflow-hidden"
          on:click={() => {
            if (isDeckError()) return;
            goto("/deck/flashcards");
          }}>
          Flashcards
        </button>
        <button
          class="card card-hover p-1 variant-filled-surface overflow-hidden"
          on:click={() => goto("/deck/edit")}>
          Edit
        </button>
      </div>
    </div>
    <div class="space-y-1">
      {#if $currentDeck.info.description}
        <p>
          <span class="font-semibold"> Description: </span>
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
    <div>
      <h2 class="text-lg font-semibold mt-4">
        Relationships ({$currentDeck.cards.schema.relationships.length})
      </h2>
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
        <p class="text-sm">
          No relationship found. Please add field relationships before studying.
        </p>
      {/each}
    </div>

    <!-- Cards -->
    <div>
      <h2 class="text-lg font-semibold mt-4">
        Cards ({$currentDeck.cards.cards.length})
      </h2>
      {#if $currentDeck.cards.cards.length > 0}
        <div class="space-y-3">
          <div class="flex gap-2">
            <div style={gridCSS} class="grid flex-1">
              {#each $currentDeck.cards.schema.fields as field}
                <h3 class="font-semibold select-text cursor-text ml-2">
                  {field}
                </h3>
              {/each}
            </div>
            <h3 class="w-[43px] flex justify-end">Priority</h3>
          </div>

          {#each $currentDeck.cards.cards as card, index}
            <div class="flex gap-2">
              <div
                style={gridCSS}
                class="grid flex-1 rounded-container-token p-2 h-12 shadow-sm
                border border-surface-300-600-token
                {card.priority === 1
                  ? 'bg-primary-200-700-token'
                  : 'bg-surface-200-700-token'}
              ">
                {#each $currentDeck.cards.schema.fields as field, index}
                  <p
                    class="flex items-center select-text cursor-text pl-2
                    {index !== 0 && 'border-l border-surface-400-500-token'}
                  ">
                    {card.fields[field]}
                  </p>
                {/each}
              </div>
              <!-- Priority Toggle Button -->
              <div>
                <button
                  class="btn btn-icon h-12 w-12
                  {card.priority === 1
                    ? 'variant-filled-primary'
                    : 'variant-filled-surface hover:variant-filled-primary'}
                   rounded-container-token"
                  on:click={() => togglePriority($currentDeck, index)}>
                  {#if card.priority === 0}
                    <StarIcon />
                  {:else}
                    <StarSolidIcon />
                  {/if}
                </button>
              </div>
            </div>
          {/each}

          <button
            class="w-full btn gap-2 variant-soft-primary"
            on:click={() => goto("/deck/edit")}>
            <EditIcon />
            Edit Cards
          </button>
        </div>
      {:else}
        <p class="text-sm">No cards found. Please add cards before studying.</p>
      {/if}
    </div>
  </div>
{/if}
