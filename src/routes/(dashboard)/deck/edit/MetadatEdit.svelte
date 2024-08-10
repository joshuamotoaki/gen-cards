<script lang="ts">
  import {
    ChevronDownIcon,
    ChevronUpIcon,
    EditIcon,
    PlusIcon,
    TrashIcon
  } from "$lib/components/icons/icons";
  import { db } from "$lib/utils/db";
  import {
    addRelationshipToSchema,
    removeFieldFromSchema,
    removeRelationshipFromSchema,
    updateFieldIndex
  } from "$lib/utils/deck";

  import { currentDeck } from "$lib/utils/state";
  import { getModalStore } from "@skeletonlabs/skeleton";
  import Select from "svelte-select";
  import { slide } from "svelte/transition";

  const modalStore = getModalStore();

  let schemaOpen = false;

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
</script>

{#if $currentDeck}
  <!-- Metadata -->
  <section class="space-y-2 mb-4">
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
  </section>

  <!-- Schema -->
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
                      await removeRelationshipFromSchema($currentDeck, index);
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
{/if}
