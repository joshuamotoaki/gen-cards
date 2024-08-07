<script>
    import { goto } from "$app/navigation";
    import { currentDeck } from "$lib/state";
</script>

{#if !$currentDeck}
    <div>
        <h2 class="text-2xl mb-2">Something went wrong :(</h2>
        <button
            on:click={() => {
                goto("/");
            }}>
            Go to dashboard
        </button>
    </div>
{:else}
    <div>
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
