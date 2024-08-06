<script>
    import { onMount, setContext } from "svelte";
    import "../app.postcss";
    import Database from "@tauri-apps/plugin-sql";

    onMount(async () => {
        const db = await Database.load("sqlite:sqlite-1.db");
        setContext("db", db);
    });
</script>

<slot />
