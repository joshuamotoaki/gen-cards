<script lang="ts">
  import { page } from "$app/stores";
  import BackIcon from "$lib/components/icons/BackIcon.svelte";
  import { currentRoute } from "$lib/utils/config";
</script>

<svelte:head>
  <title>TigerJunction | Oh Noes!</title>
  <meta property="og:title" content="TigerJunction | Oh Noes!" />
</svelte:head>

<div class="h-[80vh] flex justify-center items-center">
  <div class="text-center">
    <h1 class="text-9xl mb-2 font-bold">
      <span>Oh</span>
      <span>noes!</span>
    </h1>
    <h2 class="text-5xl mb-8 font-light">
      {$page.status}
      {$page.error?.message}
    </h2>
    <a
      on:click={() => currentRoute.set("/")}
      class="btn btn-lg variant-filled-warning"
      href="/">
      <BackIcon />
      <span> Go to Dashboard </span>
    </a>
  </div>
</div>
