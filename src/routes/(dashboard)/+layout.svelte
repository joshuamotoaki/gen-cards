<script lang="ts">
    import { onMount } from "svelte";
    import Sidebar from "./Sidebar.svelte";
    import { SyncLoader } from "svelte-loading-spinners";

    let isReady = false;

    onMount(async () => {
        setTimeout(() => {
            isReady = true;
        }, 0);
    });
</script>

<div class="flex h-screen overflow-hidden">
    {#if isReady}
        <Sidebar />
        <slot />
    {:else}
        <div
            class="flex items-center flex-col justify-center w-full h-full gap-4">
            <div class="flex items-center gap-4">
                <img src="logo.webp" class="h-24 w-24" alt="GenCards Logo" />
                <h1 class="text-7xl font-light">GenCards</h1>
            </div>
            <div>
                <SyncLoader color="#DA2602" />
            </div>
        </div>
    {/if}
</div>
