<script lang="ts">
    import "../../app.postcss";
    import Sidebar from "./Sidebar.svelte";
</script>

<div class="flex h-screen overflow-hidden">
    <Sidebar />
    <slot />
</div>
