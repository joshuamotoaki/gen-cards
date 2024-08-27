<script lang="ts">
  import BackIcon from "$lib/components/icons/BackIcon.svelte";
  import { currentDeck } from "$lib/utils/state";
  import { currentStudySession } from "$lib/utils/study";
  import DeckWarning from "$lib/components/deck/DeckWarning.svelte";
  import { currentRoute } from "$lib/utils/config";

  let correct = true;
  let input = "";

  const areEqual = (input: string, answer: string): boolean => {
    const potentialAnswers = answer.split("|");
    const normInput = input.trim().toLowerCase();

    for (const potentialAnswer of potentialAnswers) {
      if (normInput === potentialAnswer.trim().toLowerCase()) {
        return true;
      }
    }

    return false;
  };

  $: currentCard =
    $currentStudySession!.window[$currentStudySession!.currentIndex];

  $: currentRelationship =
    $currentDeck!.info.schema.relationships[
      $currentStudySession!.relationshipIndex
    ];

  $: question = currentCard.card.fields[currentRelationship.from];
  $: answer = currentCard.card.fields[currentRelationship.to];

  // For footer display
  $: totalCards =
    $currentStudySession!.correctCount + $currentStudySession!.wrongCount;
  $: accuracy =
    Math.round(($currentStudySession!.correctCount / totalCards) * 100) || 0;
</script>

{#if !$currentDeck || !$currentStudySession}
  <DeckWarning />
{:else}
  <div class="flex-1 h-screen flex flex-col">
    <header
      class="flex items-center justify-between px-4 py-2
          bg-surface-50-900-token border-b border-surface-500/30
          ">
      <h1 class="text-xl font-semibold">
        {$currentDeck.info.title}
      </h1>

      <button
        class="btn btn-sm variant-soft-surface"
        on:click={() => {
          currentRoute.set("/deck");
        }}>
        <BackIcon />
        <span> Exit </span>
      </button>
    </header>

    <main
      class="p-4 flex items-center justify-center flex-col flex-1 select-text">
      <section>
        <div class="flex flex-col items-center">
          <h2 class="text-5xl">
            {question}
          </h2>
          <h3 class="text-xl text-warning-500 mt-2" class:invisible={correct}>
            {#each Object.keys(currentCard.card.fields).filter(x => x !== currentRelationship.from) as field}
              {field}: {currentCard.card.fields[field]} {"  "}
            {/each}
          </h3>
        </div>
      </section>

      <section class="w-2/3 mx-auto mt-24 flex flex-col items-center">
        <input
          on:keydown={e => {
            if (e.key === "Enter") {
              const correctAnswer = areEqual(input, answer);

              // Copy mode (after first attempt)
              if (!correct && correctAnswer) {
                currentStudySession.progressCard(false);
                correct = true;
              }

              // First attempt
              else {
                if (correctAnswer) {
                  currentStudySession.progressCard(true);
                } else {
                  $currentStudySession.wrongCount++;
                  correct = false;
                }
              }

              // Reset the input
              input = "";
            }
          }}
          bind:value={input}
          autocomplete="off"
          spellcheck="false"
          class="focus:outline-none bg-transparent
                        pt-2 pb-1 resize-none w-full text-center
                        border-b-2 text-xl
                        {correct
            ? 'border-surface-500/90'
            : 'border-warning-500'}
                        "
          type="text" />

        {#if correct}
          <p class="text-surface-500 text-center mt-2">
            Type the {currentRelationship.to}
          </p>
        {:else}
          <p class="text-warning-500 text-center mt-2">
            Copy the {currentRelationship.to}
          </p>
        {/if}
        <button
          on:click={() => {
            currentStudySession.progressCard(true);
            correct = true;
            $currentStudySession.wrongCount--;
            input = "";
          }}
          class:invisible={correct}
          class="btn variant-soft-secondary w-fit rounded-lg px-4 py-2 mt-8 duration-0">
          Override Correct
        </button>
      </section>
    </main>

    <footer
      class="p-4 bg-surface-50-900-token border-t border-surface-500/30
      text-sm text-surface-800-100-token flex justify-between items-center">
      <div>
        <p>{totalCards} card{totalCards !== 1 ? "s" : ""} completed</p>
      </div>

      {#if $currentDeck.info.schema.relationships.length > 1}
        <div
          class="bg-surface-300-600-token rounded-full px-4
          text-surface-700-200-token text-sm">
          Side {$currentStudySession.relationshipIndex + 1} of {$currentDeck
            .info.schema.relationships.length}
        </div>
      {/if}
      <div>
        {accuracy}% Accuracy ({$currentStudySession.correctCount}/{totalCards})
      </div>
    </footer>
  </div>
{/if}
