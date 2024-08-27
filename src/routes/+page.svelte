<script lang="ts">
  import Sidebar from "$lib/components/Sidebar.svelte";
  import { currentRoute, type Route } from "$lib/utils/config";

  // Routes
  import DashboardPage from "$lib/pages/DashboardPage.svelte";
  import LibraryPage from "$lib/pages/LibraryPage.svelte";
  import SettingsPage from "$lib/pages/SettingsPage.svelte";
  import DeckViewPage from "$lib/pages/DeckViewPage.svelte";
  import DeckEditPage from "$lib/pages/DeckEditPage.svelte";
  import StudyPage from "$lib/pages/StudyPage.svelte";
  import ErrorPage from "./+error.svelte";

  const router: Record<Route, any> = {
    "/": DashboardPage,
    "/library": LibraryPage,
    "/settings": SettingsPage,
    "/deck": DeckViewPage,
    "/deck/edit": DeckEditPage,
    "/deck/study": StudyPage
  };

  const hideSidebar = ["/deck/study"];
</script>

<div class="flex h-screen overflow-hidden">
  {#if !hideSidebar.includes($currentRoute)}
    <Sidebar />
  {/if}

  {#if $currentRoute in router}
    <svelte:component this={router[$currentRoute]} />
  {:else}
    <ErrorPage />
  {/if}
</div>
