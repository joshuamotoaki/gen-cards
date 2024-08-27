<script lang="ts">
  import Sidebar from "$lib/components/Sidebar.svelte";

  // Routes
  import Dashboard from "$lib/pages/Dashboard.svelte";
  import Library from "$lib/pages/Library.svelte";
  import Settings from "$lib/pages/Settings.svelte";
  import DeckView from "$lib/pages/DeckView.svelte";
  import DeckEdit from "$lib/pages/DeckEdit.svelte";
  import Study from "$lib/pages/Study.svelte";
  import { currentRoute, type Route } from "$lib/utils/config";
  import Error from "./+error.svelte";

  const router: Record<Route, any> = {
    "/": Dashboard,
    "/library": Library,
    "/settings": Settings,
    "/deck": DeckView,
    "/deck/edit": DeckEdit,
    "/deck/study": Study
  };
</script>

<div class="flex h-screen overflow-hidden">
  <Sidebar />

  {#if $currentRoute in router}
    <svelte:component this={router[$currentRoute]} />
  {:else}
    <Error />
  {/if}
</div>
