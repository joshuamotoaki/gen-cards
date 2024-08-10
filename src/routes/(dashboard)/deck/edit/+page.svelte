<script lang="ts">
  import { goto } from "$app/navigation";
  import {
    BackIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    DocumentUpSolidIcon,
    PlusIcon,
    StarIcon,
    StarSolidIcon,
    TrashIcon,
    UploadIcon
  } from "$lib/components/icons/icons";
  import { db } from "$lib/db";
  import {
    addRelationshipToSchema,
    createNewCard,
    refreshDecks,
    removeCard,
    removeFieldFromSchema,
    removeRelationshipFromSchema,
    togglePriority,
    updateFieldIndex
  } from "$lib/helpers";
  import { currentDeck } from "$lib/state";
  import {
    FileDropzone,
    getModalStore,
    getToastStore,
    type ToastSettings
  } from "@skeletonlabs/skeleton";
  import Select from "svelte-select";
  import { slide } from "svelte/transition";
  import DeckWarning from "../DeckWarning.svelte";
  import EditIcon from "$lib/components/icons/EditIcon.svelte";

  // UI State
  let schemaOpen = false;
  let cardUploadOpen = false;

  const toastStore = getToastStore();
  const deleteToast: ToastSettings = {
    message: "Deck successfully deleted.",
    background: "variant-filled-success"
  };

  const modalStore = getModalStore();

  // Reactive in order to update on schema changes
  $: gridCSS = `grid-template-columns: repeat(${$currentDeck && $currentDeck.cards.schema.fields.length}, 1fr);`;

  //--------------------------------------------------------------------
  // Helper Functions
  //--------------------------------------------------------------------

  const deleteDeck = () => {
    if (!$currentDeck) return;
    modalStore.trigger({
      type: "confirm",
      title: "Delete Deck",
      body: `Are you sure you want to delete deck "${$currentDeck.info.title}"?`,
      response: async confirm => {
        if (confirm) {
          if (!$currentDeck?.info) return;
          goto("/library");
          await db.deleteDeck($currentDeck.info.id);
          currentDeck.set(null);
          await refreshDecks();
          toastStore.trigger(deleteToast);
        }
      }
    });
  };

  const deleteField = (field: string, index: number) => {
    if (!$currentDeck) return;
    modalStore.trigger({
      type: "confirm",
      title: "Delete Deck",
      body: `Are you sure you want to delete field "${field}"?`,
      response: async confirm => {
        if (confirm) {
          await removeFieldFromSchema($currentDeck, index);
        }
      }
    });
  };

  const updateMeta = async (key: "title" | "description", value: string) => {
    if (!$currentDeck) return;
    $currentDeck.info[key] = value;
    await db.updateDeckInfo($currentDeck.info);
  };

  const checkAndCreateNewCard = async () => {
    if (!$currentDeck) return;
    if ($currentDeck.cards.schema.fields.length < 2) {
      toastStore.trigger({
        message: "Decks must have at least two fields.",
        background: "variant-filled-error"
      });
      return;
    }

    await createNewCard($currentDeck);
  };

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
</script>

{#if !$currentDeck}
  <DeckWarning />
{:else}
  <div class="flex-1 p-4 overflow-y-auto">
    <!-- Header Actions -->
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center gap-2">
        <button
          class="btn btn-icon"
          on:click={() => {
            goto("/deck");
          }}>
          <BackIcon />
        </button>
        <h1 class="text-2xl font-bold">Edit Deck</h1>
      </div>
      <div class="flex items-center gap-2">
        <button
          on:click={deleteDeck}
          id="delete-button"
          class="btn variant-filled-surface hover:variant-filled-warning
          gap-1 btn-icon rounded-container-token">
          <TrashIcon />
        </button>
        <button
          class="btn variant-filled-success"
          on:click={() => {
            goto("/deck");
          }}>
          Done
        </button>
      </div>
    </div>

    <!-- ! Metadata-->
    <form>
      <div class="space-y-2 mb-4">
        <label class="label space-y-1">
          <span class="text-lg font-semibold"> Title </span>
          <input
            value={$currentDeck.info.title}
            on:input={e => updateMeta("title", e.currentTarget.value)}
            class="input p-2"
            title="title"
            type="text"
            placeholder="Enter a title" />
        </label>
        <label class="label space-y-1">
          <span class="text-lg font-semibold"> Description </span>
          <textarea
            value={$currentDeck.info.description}
            on:input={e => updateMeta("description", e.currentTarget.value)}
            class="textarea p-2"
            rows="2"
            title="description"
            placeholder="Enter a description" />
        </label>
      </div>

      <!-- ! Schema -->
      <section class="mb-4 space-y-4 border-b border-surface-500/30 pb-4">
        <button
          class="flex items-center btn variant-filled-secondary btn-sm gap-1"
          on:click={() => {
            schemaOpen = !schemaOpen;
          }}>
          {#if schemaOpen}
            <ChevronUpIcon />
            <h2 class="text-base">Hide Schema</h2>
          {:else}
            <ChevronDownIcon />
            <h2 class="text-base">Edit Schema</h2>
          {/if}
        </button>
        {#if schemaOpen}
          <div
            class="bg-surface-100-800-token border border-surface-300-600-token
            p-4 rounded-container-token"
            transition:slide={{ axis: "y", duration: 250 }}>
            <!-- Fields -->
            <div>
              <h2 class="text-lg font-semibold mb-1">Fields</h2>
              <div>
                <div class="space-y-2">
                  {#each $currentDeck.cards.schema.fields as field, index}
                    <div
                      class="flex gap-2"
                      transition:slide={{ axis: "y", duration: 100 }}>
                      <button
                        on:click={async () =>
                          updateFieldIndex($currentDeck, index, "up")}
                        disabled={index === 0}
                        class="btn btn-icon gap-1 variant-filled-surface
                        hover:variant-filled-secondary rounded-container-token">
                        <ChevronUpIcon />
                      </button>
                      <button
                        on:click={async () =>
                          updateFieldIndex($currentDeck, index, "down")}
                        disabled={index ===
                          $currentDeck.cards.schema.fields.length - 1}
                        class="btn btn-icon gap-1 variant-filled-surface
                        hover:variant-filled-secondary rounded-container-token">
                        <ChevronDownIcon />
                      </button>

                      <h3
                        class="flex-1 bg-surface-300-600-token rounded-container-token
                                                p-2 flex items-center">
                        {field}
                      </h3>

                      <button
                        class="btn variant-filled-surface
                        hover:variant-filled-warning gap-1 btn-icon rounded-container-token"
                        on:click={() => {
                          modalStore.trigger({
                            type: "component",
                            component: "editField",
                            meta: { field, index }
                          });
                        }}>
                        <EditIcon />
                      </button>
                      <button
                        class="btn variant-filled-surface hover:variant-filled-warning
                        gap-1 btn-icon rounded-container-token"
                        on:click={() => deleteField(field, index)}>
                        <TrashIcon />
                      </button>
                    </div>
                  {/each}

                  {#if $currentDeck.cards.schema.fields.length < 2}
                    <p class="text-red-500">
                      Warning: Decks must have at least two fields.
                    </p>
                  {/if}

                  <div class="flex justify-end">
                    <button
                      on:click={() =>
                        modalStore.trigger({
                          type: "component",
                          component: "addField"
                        })}
                      class="btn variant-soft-primary gap-2 mt-2">
                      <PlusIcon />
                      New Field
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Relationships -->
            <div>
              <h2 class="text-lg font-semibold mb-1">Relationships</h2>
              <div class="space-y-2">
                {#each $currentDeck.cards.schema.relationships as rel, index}
                  <div
                    class="flex gap-2"
                    transition:slide={{ axis: "y", duration: 100 }}>
                    <div class="grid grid-cols-2 gap-4 w-full">
                      <div class="flex items-center gap-2">
                        <h3>From:</h3>
                        <Select
                          on:select={async e => {
                            rel.from = e.detail.value;
                            await db.updateDeckCards($currentDeck.cards);
                          }}
                          items={$currentDeck.cards.schema.fields}
                          value={rel.from}
                          placeholder="Select a field" />
                      </div>
                      <div class="flex items-center gap-2">
                        <h3>To:</h3>
                        <Select
                          on:select={async e => {
                            rel.to = e.detail.value;
                            await db.updateDeckCards($currentDeck.cards);
                          }}
                          items={$currentDeck.cards.schema.fields}
                          value={rel.to}
                          placeholder="Select a field" />
                      </div>
                    </div>
                    <div>
                      <button
                        on:click={async () => {
                          await removeRelationshipFromSchema(
                            $currentDeck,
                            index
                          );
                        }}
                        class="btn variant-filled-surface
                        hover:variant-filled-warning gap-1 btn-icon
                        rounded-container-token">
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                {/each}

                {#if !$currentDeck.cards.schema.relationships.length}
                  <p class="text-red-500">
                    Warning: Decks must have at least one relationship.
                  </p>
                {/if}

                <div class="flex justify-end">
                  <button
                    on:click={async () => {
                      addRelationshipToSchema($currentDeck);
                    }}
                    class="btn variant-soft-primary gap-2 mt-2">
                    <PlusIcon />
                    New Relationship
                  </button>
                </div>
              </div>
            </div>
          </div>
        {/if}
      </section>

      <!-- ! Cards-->
      <section class="mb-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">
            Cards ({$currentDeck.cards.cards.length})
          </h2>
          <button
            class="btn btn-sm variant-filled-secondary gap-1"
            on:click={() => {
              cardUploadOpen = !cardUploadOpen;
            }}>
            {#if cardUploadOpen}
              <ChevronUpIcon />
            {:else}
              <UploadIcon />
            {/if}
            Upload Cards
          </button>
        </div>

        <!-- Card Upload -->
        {#if cardUploadOpen}
          <div
            transition:slide={{ axis: "y", duration: 250 }}
            class="mb-4 bg-surface-100-800-token border
            border-surface-300-600-token
            p-4 rounded-container-token">
            <FileDropzone accept=".csv,.json" name="upload">
              <svelte:fragment slot="lead">
                <div class="flex items-center justify-center">
                  <DocumentUpSolidIcon className="size-8" />
                </div>
              </svelte:fragment>
              <svelte:fragment slot="message">
                <h3 class="text-lg font-semibold text-center">
                  Upload a deckfile to magically add cards.
                </h3>
              </svelte:fragment>
              <svelte:fragment slot="meta">
                <p class="text-sm text-surface-600-300-token">
                  CSV and JSON allowed.
                </p>
              </svelte:fragment>
            </FileDropzone>
          </div>
        {/if}

        <!-- Card List -->
        <div>
          {#if $currentDeck.cards.cards.length > 0}
            <main class="space-y-6">
              {#each $currentDeck.cards.cards as card, index}
                <!-- Visual Container -->
                <div
                  transition:slide={{
                    duration: 100,
                    axis: "y"
                  }}
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
                    <p class="text-surface-600-300-token font-semibold">
                      {index + 1}
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
                          <textarea
                            value={card.fields[field]}
                            on:input={e =>
                              updateCard(index, field, e.currentTarget.value)}
                            on:keydown={() => {
                              autoCreateNewCard(field, index);
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
                </div>
              {/each}
            </main>
          {/if}

          <button
            class="btn w-full variant-filled-primary gap-2 mt-4"
            on:click={checkAndCreateNewCard}>
            <PlusIcon />
            New Card
          </button>
        </div>
      </section>

      <!-- Footer Actions -->
      <div>
        <button
          class="btn variant-filled-success"
          on:click={() => {
            goto("/deck");
          }}>
          Done
        </button>
      </div>
    </form>
  </div>
{/if}
