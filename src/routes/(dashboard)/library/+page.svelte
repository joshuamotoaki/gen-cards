<script lang="ts">
    import { DataHandler } from "@vincjo/datatables";
    import Search from "$lib/components/datatable/Search.svelte";
    import ThSort from "$lib/components/datatable/ThSort.svelte";
    import RowCount from "$lib/components/datatable/RowCount.svelte";
    import Pagination from "$lib/components/datatable/Pagination.svelte";
    import { decks } from "$lib/state";
    import { createNewDeck } from "$lib/helpers";

    const handler = new DataHandler($decks, { rowsPerPage: 10 });
    const rows = handler.getRows();
</script>

<div class="flex-1 p-4 overflow-auto">
    <section>
        <h2 class="text-2xl mb-2">All Decks</h2>

        {#if $decks.length === 0}
            <p class="text-lg mb-2">
                No decks found. Create a new deck to get started!
            </p>
            <button
                class="btn variant-filled-success flex gap-2 items-center"
                on:click={createNewDeck}>
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
                        d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New Deck
            </button>
        {:else}
            <div class="table-container rounded-none space-y-4">
                <div class="flex justify-between">
                    <Search {handler} />
                </div>
                <table
                    class="table table-hover table-compact table-auto w-full">
                    <thead>
                        <tr>
                            <ThSort {handler} orderBy="title">Title</ThSort>
                            <ThSort {handler} orderBy="totalCards"
                                >Total Cards</ThSort>
                            <ThSort {handler} orderBy="lastStudied"
                                >Last Studied</ThSort>
                        </tr>
                    </thead>
                    <tbody>
                        {#each $rows as row}
                            <tr>
                                <td>{row.title}</td>
                                <td>{row.card_count}</td>
                                <td>
                                    {new Date(
                                        row.studied_at
                                    ).toLocaleDateString()}
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
                <div class="flex justify-between">
                    <RowCount {handler} />
                    <Pagination {handler} />
                </div>
            </div>
        {/if}
    </section>
</div>
