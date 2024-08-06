<script>
    import { onMount, setContext } from "svelte";
    import "../app.postcss";
    import Database from "@tauri-apps/plugin-sql";
    import { currentTheme } from "$lib/config";
    import { browser } from "$app/environment";

    $: {
        if (browser) {
            document.body.setAttribute("data-theme", $currentTheme);
        }
    }

    onMount(async () => {
        const db = await Database.load("sqlite:sqlite-1.db");
        setContext("db", db);
    });
</script>

<slot />
