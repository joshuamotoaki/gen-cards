<script lang="ts">
  import { page } from "$app/stores";
  import { createNewDeck, refreshDecks } from "$lib/utils/deck";
  import { PlusIcon } from "$lib/components/icons/icons";
  import { db } from "$lib/utils/db";
  import { goto } from "$app/navigation";
</script>

<aside
  class="h-full p-4 flex justify-between
    flex-col w-1/5 min-w-48 bg-surface-50-900-token border-r border-surface-500/30">
  <div class="space-y-4">
    <a href="/" class="flex items-center gap-2 w-12">
      <img src="/logo.webp" class="h-8 w-8" alt="GenCards Logo" />
      <h1 class="text-2xl font-light">GenCards</h1>
    </a>

    <nav class="space-y-1">
      <a
        href="/"
        class="btn link-button
                    {$page.url.pathname === '/'
          ? 'bg-primary-500/60'
          : 'hover:bg-primary-500/10'}
                ">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="icon">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
        Dashboard
      </a>
      <a
        href="/library"
        class="btn link-button
                {$page.url.pathname.startsWith('/library') ||
        $page.url.pathname.startsWith('/deck')
          ? 'bg-primary-500/60'
          : 'hover:bg-primary-500/10'}
            ">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="icon">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
        </svg>

        Library
      </a>
      <a
        href="/settings"
        class="btn link-button
            {$page.url.pathname.startsWith('/settings')
          ? 'bg-primary-500/60'
          : 'hover:bg-primary-500/10'}
        ">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="icon">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
        Settings
      </a>
    </nav>
  </div>

  <div class="space-y-4">
    <!-- TODO: Remove in production-->
    <button
      class="btn w-full variant-filled-error"
      on:click={async () => {
        await db.deleteEverything();
        await refreshDecks();
        goto("/");
      }}>
      Clear Data
    </button>
    <button
      class="btn w-full gap-2 items-center variant-soft-secondary"
      on:click={createNewDeck}>
      <PlusIcon />
      New Deck
    </button>
  </div>
</aside>

<style lang="postcss">
  .icon {
    @apply w-6 h-6 flex-shrink-0;
  }

  .link-button {
    @apply w-full justify-start gap-2;
  }

  .btn {
    @apply overflow-hidden;
  }
</style>
