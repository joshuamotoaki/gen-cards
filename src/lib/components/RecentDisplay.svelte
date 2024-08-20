<script lang="ts">
  import { gotoDeck, type DeckInfo } from "$lib/utils/deck";

  export let props: DeckInfo;
  export let variant: string = "variant-glass-surface";

  // "today", "yesterday", up to "7" days ago, and then the date
  let lastStudied = props.studied_at ? new Date(props.studied_at) : null;
  let today = new Date();
  let yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let lastStudiedString = lastStudied
    ? lastStudied.toDateString()
    : "Never studied";

  if (lastStudied) {
    if (lastStudied.toDateString() === today.toDateString()) {
      lastStudiedString = "Today";
    } else if (lastStudied.toDateString() === yesterday.toDateString()) {
      lastStudiedString = "Yesterday";
    } else {
      let diff = Math.floor(
        (today.getTime() - lastStudied.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diff <= 10) {
        lastStudiedString = `${diff} days ago`;
      }
    }
  }
</script>

<button
  class="block card card-hover overflow-clip {variant}"
  on:click={async () => await gotoDeck(props, "/")}>
  <section class="p-4 text-left">
    <h2 class="text-xl font-semibold">
      {props.title ? props.title : "(no title)"}
    </h2>
    <p class="mt-1 text-sm font-normal">
      {props.description}
    </p>
  </section>
  <footer class="card-footer flex justify-between items-center font-normal">
    <span class="text-sm">
      {props.card_count} card{props.card_count === 1 ? "" : "s"}
    </span>
    <span class="text-sm">
      Last studied: {lastStudiedString}
    </span>
  </footer>
</button>
