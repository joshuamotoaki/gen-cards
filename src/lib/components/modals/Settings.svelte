<script lang="ts">
    import type { SvelteComponent } from "svelte";
    import {
        getModalStore,
        LightSwitch,
        Tab,
        TabGroup
    } from "@skeletonlabs/skeleton";
    import { currentTheme } from "$lib/config";
    export let parent: SvelteComponent;

    const modalStore = getModalStore();

    let tabSet: number = 2;
</script>

{#if $modalStore[0]}
    <div class="card p-4 w-modal shadow-xl space-y-4">
        <header class="text-2xl font-bold">Settings</header>
        <article>
            <TabGroup>
                <Tab bind:group={tabSet} name="general" value={0}>
                    <div class="flex items-center gap-1">
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
                                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>

                        General
                    </div>
                </Tab>
                <Tab bind:group={tabSet} name="general" value={1}>
                    <div class="flex items-center gap-1">
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
                                d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                        </svg>

                        Config
                    </div>
                </Tab>
                <Tab bind:group={tabSet} name="general" value={2}>
                    <div class="flex items-center gap-1">
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
                                d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z" />
                        </svg>
                        Style
                    </div>
                </Tab>
                <svelte:fragment slot="panel">
                    {#if tabSet === 0}
                        General Settings
                    {:else if tabSet === 1}
                        Config Settings
                    {:else if tabSet === 2}
                        <div>
                            <div class="flex gap-4 mb-4">
                                <label for="light-switch" class="text-xl"
                                    >Dark Mode</label>
                                <LightSwitch />
                            </div>
                            <div class="mb-2">
                                <label class="text-xl" for="theme">Theme</label>
                            </div>
                            <div class="grid grid-cols-3 gap-2">
                                <button
                                    class="card card-hover
                                    {$currentTheme === 'skeleton'
                                        ? 'from-gray-600 to-blue-600 text-white'
                                        : 'from-gray-200 to-blue-200 text-black'}
                                    "
                                    on:click={() =>
                                        currentTheme.set("skeleton")}>
                                    💀 Skeleton
                                </button>
                                <button
                                    class="card card-hover
                                    {$currentTheme === 'wintry'
                                        ? 'from-blue-600 to-blue-400 text-white'
                                        : 'from-blue-200 to-white text-black'}
                                    "
                                    on:click={() => currentTheme.set("wintry")}>
                                    🌨️ Wintry
                                </button>
                                <button
                                    class="card card-hover
                                    {$currentTheme === 'modern'
                                        ? 'from-pink-600 to-indigo-600 text-white'
                                        : 'from-pink-200 to-indigo-200 text-black'}
                                    "
                                    on:click={() => currentTheme.set("modern")}>
                                    🤖 Modern
                                </button>
                                <button
                                    class="card card-hover
                                    {$currentTheme === 'rocket'
                                        ? 'from-red-600 to-blue-600 text-white'
                                        : 'from-red-200 to-blue-200 text-black'}
                                    "
                                    on:click={() => currentTheme.set("rocket")}>
                                    🚀 Rocket
                                </button>
                                <button
                                    class="card card-hover
                                    {$currentTheme === 'seafoam'
                                        ? 'from-cyan-600 to-blue-600 text-white'
                                        : 'from-cyan-200 to-blue-200 text-black'}
                                    "
                                    on:click={() =>
                                        currentTheme.set("seafoam")}>
                                    🧜‍♀️ Seafoam
                                </button>
                                <button
                                    class="card card-hover
                                    {$currentTheme === 'vintage'
                                        ? 'from-amber-600 to-orange-600 text-white'
                                        : 'from-amber-200 to-orange-200 text-black'}
                                    "
                                    on:click={() =>
                                        currentTheme.set("vintage")}>
                                    📺 Vintage
                                </button>
                                <button
                                    class="card card-hover
                                    {$currentTheme === 'sahara'
                                        ? 'from-red-600 to-yellow-600 text-white'
                                        : 'from-red-200 to-yellow-200 text-black'}
                                    "
                                    on:click={() => currentTheme.set("sahara")}>
                                    🏜️ Sahara
                                </button>
                                <button
                                    class="card card-hover
                                    {$currentTheme === 'hamlindigo'
                                        ? 'from-indigo-600 to-purple-600 text-white'
                                        : 'from-indigo-200 to-purple-200 text-black'}
                                    "
                                    on:click={() =>
                                        currentTheme.set("hamlindigo")}>
                                    👔 Hamlindigo
                                </button>
                                <button
                                    class="card card-hover
                                    {$currentTheme === 'gold-nouveau'
                                        ? 'from-yellow-600 to-red-600 text-white'
                                        : 'from-yellow-200 to-red-200 text-black'}
                                    "
                                    on:click={() =>
                                        currentTheme.set("gold-nouveau")}>
                                    💫 Gold Nouveau
                                </button>
                                <button
                                    class="card card-hover
                                    {$currentTheme === 'crimson'
                                        ? 'from-red-600 to-pink-600 text-white'
                                        : 'from-red-200 to-pink-200 text-black'}
                                    "
                                    on:click={() =>
                                        currentTheme.set("crimson")}>
                                    ⭕ Crimson
                                </button>
                            </div>
                        </div>
                    {/if}
                </svelte:fragment>
            </TabGroup>
        </article>
        <footer class="modal-footer {parent.regionFooter}">
            <button
                class="btn {parent.buttonPositive}"
                on:click={() => modalStore.close()}>Close</button>
        </footer>
    </div>
{/if}

<style lang="postcss">
    .card {
        @apply p-4 bg-gradient-to-br;
    }
</style>
