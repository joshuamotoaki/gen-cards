<script lang="ts">
  import { getModalStore } from "@skeletonlabs/skeleton";

  const modalStore = getModalStore();

  const onFormSubmit = async () => {
    modalStore.close();
  };
</script>

{#if $modalStore[0]}
  <div class="card p-4 w-modal shadow-xl">
    <header class="text-2xl font-semibold mb-1">Cards to Add</header>
    <article class="mb-4">Confirm adding these cards to the deck?</article>
    <form on:submit|preventDefault={onFormSubmit}>
      <div>Hello, World!</div>

      <footer class="flex justify-end gap-2">
        <button
          type="button"
          class="btn variant-filled-surface"
          on:click={modalStore.close}>Cancel</button>
        <button type="submit" class="btn variant-filled-success"
          >Confirm</button>
      </footer>
    </form>
  </div>
{/if}
