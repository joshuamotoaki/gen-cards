<script lang="ts">
    import { DataHandler } from "@vincjo/datatables";
    import { SAMPLE_DECKS } from "$lib/samples";
    import Search from "$lib/components/datatable/Search.svelte";
    import ThSort from "$lib/components/datatable/ThSort.svelte";
    import RowCount from "$lib/components/datatable/RowCount.svelte";
    import Pagination from "$lib/components/datatable/Pagination.svelte";

    const handler = new DataHandler(SAMPLE_DECKS, { rowsPerPage: 10 });
    const rows = handler.getRows();
</script>

<div class="flex-1 p-4 overflow-auto">
    <section>
        <h2 class="text-2xl font-semibold">All Decks</h2>

        <div class="table-container rounded-none space-y-4">
            <div class="flex justify-between">
                <Search {handler} />
            </div>
            <table class="table table-hover table-compact table-auto w-full">
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
                            <td>{row.totalCards}</td>
                            <td>
                                {new Date(row.lastStudied).toLocaleDateString()}
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
    </section>
</div>
