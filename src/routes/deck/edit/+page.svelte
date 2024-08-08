<script>
    import { goto } from "$app/navigation";
    import { currentDeck } from "$lib/state";
    import DeckWarning from "../DeckWarning.svelte";
</script>

{#if !$currentDeck}
    <DeckWarning />
{:else}
    <div>
        EDIT DECK
        <h1>
            {$currentDeck?.info.title}
        </h1>
        <p>
            {$currentDeck?.info.description}
        </p>

        <p>
            {$currentDeck?.info.id}
        </p>

        <button
            on:click={() => {
                goto("/");
                currentDeck.set(null);
            }}>
            Go to dashboard
        </button>
    </div>
{/if}
