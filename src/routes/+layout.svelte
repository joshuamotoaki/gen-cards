<script lang="ts">
    import { onMount } from "svelte";
    import "../app.postcss";
    import { currentTheme } from "$lib/config";
    import { browser } from "$app/environment";
    import { initializeStores, Modal } from "@skeletonlabs/skeleton";
    import type { ModalComponent } from "@skeletonlabs/skeleton";

    // Modal imports
    import Settings from "$lib/components/modals/Settings.svelte";
    // import { SyncLoader } from "svelte-loading-spinners";
    import { db } from "$lib/db";
    import { decks } from "$lib/state";

    // Theme change
    $: {
        if (browser) {
            document.body.setAttribute("data-theme", $currentTheme);
        }
    }

    // Modal Components
    initializeStores();
    const modalRegistry: Record<string, ModalComponent> = {
        settings: { ref: Settings }
    };

    let isReady = false;
    let errorMessage = "";

    onMount(async () => {
        try {
            await db.init();
            decks.set(await db.getAllDeckInfos());
            isReady = true;
        } catch (e: unknown) {
            console.error("Error:", e);
            if (e instanceof Error) {
                errorMessage = e.message;
            } else {
                errorMessage = "An unknown error occurred.";
            }
        }
    });
</script>

<Modal components={modalRegistry} />
{#if errorMessage}
    <div class="flex items-center flex-col justify-center h-screen gap-4">
        <div class="flex items-center gap-4">
            <img src="logo.webp" class="h-24 w-24" alt="GenCards Logo" />
            <h1 class="text-7xl font-light">GenCards</h1>
        </div>
        <div class="flex flex-col items-center p-4">
            <p class="text-2xl mb-2">
                Something went wrong while initializing the app.
            </p>
            <p class="text-lg mb-8">
                Error: {errorMessage}
            </p>
            <button
                class="btn btn-lg variant-filled-primary mx-auto"
                on:click={() => {
                    location.reload();
                }}>
                Reload App
            </button>
        </div>
    </div>
{/if}

{#if isReady}
    <slot />
{/if}
