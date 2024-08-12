<script lang="ts">
  import { StarIcon, StarSolidIcon, TrashIcon } from "./icons/icons";
  import { createNewCard, removeCard, togglePriority } from "$lib/utils/deck";
  import { currentDeck } from "$lib/utils/state";
  import { db } from "$lib/utils/db";
  import type { Card } from "$lib/utils/types";

  export let card: Card;
  export let index: number;
  export let cardNumber: number;

  const updateCard = async (index: number, field: string, value: string) => {
    if (!$currentDeck) return;
    $currentDeck.cards.cards[index].fields[field] = value;
    await db.updateDeckCards($currentDeck.cards);
  };

  const autoCreateNewCard = async (field: string, index: number) => {
    if (!$currentDeck) return;

    // If the card is the last one, create a new card
    if (
      field ===
        $currentDeck.cards.schema.fields[
          $currentDeck.cards.schema.fields.length - 1
        ] &&
      index === $currentDeck.cards.cards.length - 1
    ) {
      await createNewCard($currentDeck);

      // Tab to the first field in the new card
      const nextField = document.querySelector(
        `textarea[title="${$currentDeck.cards.schema.fields[0] + (index + 1)}"]`
      ) as HTMLTextAreaElement;
      if (nextField) nextField.focus();
    }
  };

  $: gridCSS = `grid-template-columns: repeat(${$currentDeck && $currentDeck.cards.schema.fields.length}, 1fr);`;
</script>

{#if $currentDeck}
  <!-- TODO: Fix sliding visual to slide for individual card instead of entire list -->

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
          {cardNumber}
        </p>
        <!-- {#if conflictList.includes(index) && $conflictingCards}
        <p class="text-warning-700-200-token">
          Conflicts with card{$conflictingCards[index].length === 1
            ? ""
            : "s"}{" "}
          {$conflictingCards[index].map(i => i + 1).join(", ")}
        </p>
      {/if} -->
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
          on:click={async () => {
            if (!$currentDeck.info) return;
            await removeCard($currentDeck, index);
          }}
          class="btn-icon btn-icon-sm text-surface-600-300-token
                  hover:text-warning-700-200-token">
          <TrashIcon className="size-5" />
        </button>
      </div>
    </div>

    <!-- Card Contents -->
    <div style={gridCSS} class="grid gap-4">
      {#each $currentDeck.cards.schema.fields as field}
        <div class="flex items-center">
          <label class="flex flex-col gap-1 w-full">
            <!-- TODO: Figure out how to dynamically change size -->
            <!-- TODO: Tabbing to the next card places cursor at the end-->
            <textarea
              value={card.fields[field]}
              on:input={async e => {
                await updateCard(index, field, e.currentTarget.value);
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
