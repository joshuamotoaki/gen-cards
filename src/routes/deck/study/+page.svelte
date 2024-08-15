<script>
  import { currentDeck } from "$lib/utils/state";
  import DeckWarning from "../../(dashboard)/deck/DeckWarning.svelte";
</script>

{#if !$currentDeck}
  <DeckWarning />
{:else}
  <div>Study</div>
{/if}
