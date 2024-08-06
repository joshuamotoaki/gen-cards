<script lang="ts">
    import type { SvelteComponent } from "svelte";
    import { getModalStore, LightSwitch } from "@skeletonlabs/skeleton";
    export let parent: SvelteComponent;

    const modalStore = getModalStore();
</script>

<!-- @component This example creates a simple form modal. -->

{#if $modalStore[0]}
    <div class="card p-4 w-modal shadow-xl space-y-4">
        <header class="text-2xl font-bold">Settings</header>
        <article>
            <div>
                <LightSwitch />
            </div>
        </article>
        <footer class="modal-footer {parent.regionFooter}">
            <button
                class="btn {parent.buttonPositive}"
                on:click={() => modalStore.close()}>Close</button>
        </footer>
    </div>
{/if}
