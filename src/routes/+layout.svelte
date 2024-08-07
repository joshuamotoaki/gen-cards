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

    onMount(async () => {
        await db.init();

        isReady = true;
    });
</script>

<Modal components={modalRegistry} />
{#if isReady}
    <slot />

    <!-- This can be added if there's substansial init delay (there isn't right now )-->
    <!-- {:else}
    <div class="flex items-center flex-col justify-center h-screen gap-4">
        <div class="flex items-center gap-4">
            <img src="logo.webp" class="h-24 w-24" alt="GenCards Logo" />
            <h1 class="text-7xl font-light">GenCards</h1>
        </div>
        <div>
            <SyncLoader color="#DA2602" />
        </div>
    </div> -->
{/if}
