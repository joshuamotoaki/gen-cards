<script lang="ts">
  import type { DataHandler } from "@vincjo/datatables";
  import SearchIcon from "../icons/SearchIcon.svelte";
  export let handler: DataHandler;
  let value: string;
</script>

<div
  class="input-group input-group-divider grid-cols-[auto_1fr] w-40 sm:w-64 lg:w-80
    focus:border-none hover:border-none border-none">
  <div class="input-group-shim">
    <SearchIcon />
  </div>
  <input
    class="input p-2 border-none outline-none bg-transparent focus:bg-transparent hover:bg-transparent"
    type="search"
    placeholder="Search..."
    bind:value
    on:input={() => handler.search(value)} />
</div>
