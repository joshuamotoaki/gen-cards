<script lang="ts">
  import type { DataHandler } from "@vincjo/datatables";
  export let handler: DataHandler;
  let value: string;
</script>

<div
  class="input-group input-group-divider grid-cols-[auto_1fr] w-40 sm:w-64 lg:w-80
    focus:border-none hover:border-none border-none">
  <div class="input-group-shim">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="size-4">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  </div>
  <input
    class="input p-2 border-none outline-none bg-transparent focus:bg-transparent hover:bg-transparent"
    type="search"
    placeholder="Search..."
    bind:value
    on:input={() => handler.search(value)} />
</div>
