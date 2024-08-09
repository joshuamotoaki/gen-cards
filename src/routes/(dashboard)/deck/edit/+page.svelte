<script lang="ts">
  import { goto } from "$app/navigation";
  import {
    BackIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    PlusIcon,
    TrashIcon,
    UploadIcon
  } from "$lib/components/icons/icons";
  import { db } from "$lib/db";
  import {
    addRelationshipToSchema,
    createNewCard,
    refreshDecks,
    removeFieldFromSchema,
    removeRelationshipFromSchema,
    updateFieldIndex
  } from "$lib/helpers";
  import { currentDeck } from "$lib/state";
  import {
    getModalStore,
    getToastStore,
    type ToastSettings
  } from "@skeletonlabs/skeleton";
  import Select from "svelte-select";
  import { slide } from "svelte/transition";
  import DeckWarning from "../DeckWarning.svelte";
  import EditIcon from "$lib/components/icons/EditIcon.svelte";

  // UI State
  let schemaOpen = true;
  let cardUploadOpen = false;

  const toastStore = getToastStore();
  const deleteToast: ToastSettings = {
    message: "Deck successfully deleted.",
    background: "variant-filled-success"
  };

  const modalStore = getModalStore();

  const gridCSS = `grid-template-columns: repeat(${$currentDeck && $currentDeck.cards.schema.fields.length}, 1fr);`;
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
          on:click={() => {
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
          }}
          id="delete-button"
          class="btn variant-filled-surface hover:variant-filled-warning gap-1 btn-icon rounded-container-token">
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
            on:input={e => {
              if (!$currentDeck.info) return;
              $currentDeck.info.title = e.target.value;
              db.updateDeckInfo($currentDeck.info);
            }}
            class="input p-2"
            title="title"
            type="text"
            placeholder="Enter a title" />
        </label>
        <label class="label space-y-1">
          <span class="text-lg font-semibold"> Description </span>
          <textarea
            value={$currentDeck.info.description}
            on:input={e => {
              if (!$currentDeck.info) return;
              $currentDeck.info.description = e.target.value;
              db.updateDeckInfo($currentDeck.info);
            }}
            class="textarea p-2"
            rows="2"
            title="description"
            placeholder="Enter a description" />
        </label>
      </div>

      <!-- ! Schema -->
      <section class="mb-4 space-y-4 border-b border-surface-500/30 pb-4">
        <button
          class="flex items-center btn variant-filled-surface hover:variant-filled-secondary btn-sm gap-1"
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
          <div transition:slide={{ axis: "y", duration: 250 }}>
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
                        class="btn btn-icon gap-1 variant-filled-surface hover:variant-filled-secondary rounded-container-token">
                        <ChevronUpIcon />
                      </button>
                      <button
                        on:click={async () =>
                          updateFieldIndex($currentDeck, index, "down")}
                        disabled={index ===
                          $currentDeck.cards.schema.fields.length - 1}
                        class="btn btn-icon gap-1 variant-filled-surface hover:variant-filled-secondary rounded-container-token">
                        <ChevronDownIcon />
                      </button>

                      <h3
                        class="flex-1 bg-surface-300-600-token rounded-container-token
                                                p-2 flex items-center">
                        {field}
                      </h3>

                      <button
                        class="btn variant-filled-surface hover:variant-filled-warning gap-1 btn-icon rounded-container-token"
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
                        class="btn variant-filled-surface hover:variant-filled-warning gap-1 btn-icon rounded-container-token"
                        on:click={() => {
                          modalStore.trigger({
                            type: "confirm",
                            title: "Delete Deck",
                            body: `Are you sure you want to delete field "${field}"?`,
                            response: async confirm => {
                              if (confirm) {
                                await removeFieldFromSchema(
                                  $currentDeck,
                                  index
                                );
                              }
                            }
                          });
                        }}>
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
                        class="btn variant-filled-surface hover:variant-filled-warning gap-1 btn-icon
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
        <div class="flex justify-between items-center mb-2">
          <h2 class="text-lg font-semibold">
            Cards ({$currentDeck.cards.cards.length})
          </h2>
          <button
            class="btn btn-sm variant-filled-surface hover:variant-filled-secondary gap-1"
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
          <div transition:slide={{ axis: "y", duration: 250 }} class="mb-4">
            <form
              class="flex justify-between gap-2"
              on:submit|preventDefault={() => {
                console.log("submit");
              }}>
              <input class="input" type="file" />
              <button type="submit" class="btn variant-filled-primary"
                >Add</button>
            </form>
          </div>
        {/if}

        <!-- Card List -->
        <div>
          <main class="space-y-2">
            <div style={gridCSS} class="grid p-2">
              {#each $currentDeck.cards.schema.fields as field}
                <h4 class="font-semibold">
                  {field}
                </h4>
              {/each}
              <div></div>
            </div>
            {#each $currentDeck.cards.cards as card, index}
              <div class="flex gap-2 items-center">
                <div
                  style={gridCSS}
                  class="grid p-2 flex-1
                bg-surface-300-600-token rounded-container-token gap-2
              ">
                  {#each $currentDeck.cards.schema.fields as field}
                    <div class="flex items-center">
                      <input
                        type="text"
                        class="input p-1"
                        placeholder={"Enter " + field} />
                    </div>
                  {/each}
                </div>
                <div class="flex items-center justify-end">
                  <button
                    class="btn btn-icon variant-filled-surface rounded-container-token">
                    <TrashIcon />
                  </button>
                </div>
              </div>
            {/each}
          </main>

          <button
            class="btn w-full variant-filled-primary gap-2 mt-2"
            on:click={async () => {
              if (!$currentDeck.info) return;

              if ($currentDeck.cards.schema.fields.length < 2) {
                toastStore.trigger({
                  message: "Decks must have at least two fields.",
                  background: "variant-filled-error"
                });
                return;
              }

              await createNewCard($currentDeck);
            }}>
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
