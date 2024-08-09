<script lang="ts">
  import Sidebar from "./Sidebar.svelte";
</script>

<div class="flex h-screen overflow-hidden">
  <Sidebar />
  <slot />
</div>
