<script>
    import { goto } from "$app/navigation";
    import { currentDeck } from "$lib/state";
</script>

{#if !$currentDeck}
    <div class="p-4">
        <h2 class="text-2xl">Something went wrong :(</h2>
        <p class="mb-2">We couldn't find the deck you're looking for.</p>
        <button
            class="btn variant-filled-warning gap-2"
            on:click={() => {
                goto("/");
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
            Go to Dashboard
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
