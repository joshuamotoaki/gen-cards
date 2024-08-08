<script lang="ts">
    import { page } from "$app/stores";
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
        <a class="btn btn-lg variant-filled-warning" href="/">
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
                    d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
            <span> Go to Dashboard </span>
        </a>
    </div>
</div>
