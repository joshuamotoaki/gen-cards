<script>
  import { goto } from "$app/navigation";
  import BackIcon from "$lib/components/icons/BackIcon.svelte";
  import { currentDeck } from "$lib/utils/state";
  import DeckWarning from "../../(dashboard)/deck/DeckWarning.svelte";

  let correct = true;
</script>

{#if !$currentDeck}
  <DeckWarning />
{:else}
  <div class="flex-1 h-screen flex flex-col">
    <header
      class="flex items-center justify-between px-4 py-2
        bg-surface-50-900-token border-b border-surface-500/30
        ">
      <h1 class="text-2xl font-bold">
        {$currentDeck.info.title}
      </h1>

      <button
        class="btn btn-sm variant-soft-surface"
        on:click={() => {
          goto("/deck");
        }}>
        <BackIcon />
        <span> Exit </span>
      </button>
    </header>

    <main class="p-4 flex items-center justify-center flex-col flex-1">
      <section>
        <div class="flex flex-col items-center">
          <h2 class="text-5xl">
            {$currentDeck.cards[2].fields.Term}
          </h2>
          <h3 class="text-xl text-warning-500 mt-2" class:invisible={correct}>
            {$currentDeck.cards[2].fields.Definition}
          </h3>
        </div>
      </section>

      <section class="w-2/3 mx-auto mt-24">
        <input
          autocomplete="off"
          spellcheck="false"
          class="focus:outline-none bg-transparent
                      pt-2 pb-1 resize-none w-full text-center
                      border-b-2
                      {correct ? 'border-surface-500/90' : 'border-warning-500'}
                      "
          type="text" />

        {#if correct}
          <p class="text-surface-500/90 text-center text-sm mt-2">
            Type your answer
          </p>
        {:else}
          <p class="text-warning-500 text-center text-sm mt-2">
            Copy the correct answer
          </p>
        {/if}
      </section>
    </main>

    <footer
      class="p-4 bg-surface-50-900-token border-t border-surface-500/30
    text-sm text-surface-800-100-token flex justify-between items-center">
      <div>
        <p>5 cards completed</p>
      </div>
      <div>5 / 10 Accuracy</div>
    </footer>
  </div>
{/if}
