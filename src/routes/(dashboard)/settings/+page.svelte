<script>
  import { currentTheme } from "$lib/utils/config";
  import { LightSwitch } from "@skeletonlabs/skeleton";
</script>

<div class="p-4 flex-1 overflow-y-auto">
  <section>
    <h2>General</h2>
    <p>Coming soon.</p>
  </section>
  <section>
    <h2>Style</h2>
    <div class="flex gap-4 mb-2">
      <label for="light-switch">Dark Mode</label>
      <LightSwitch />
    </div>
    <div class="mb-2">
      <span>
        Theme (current: {$currentTheme
          .split("-")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")})
      </span>
    </div>
    <div class="grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
      <button
        class="card card-hover
                    {$currentTheme === 'gengoko'
          ? 'from-[#DA2602] to-[#ed9121] text-white'
          : 'from-red-200 to-orange-200 text-black'}
                    "
        on:click={() => currentTheme.set("gengoko")}>
        ⭐ Gengoko
      </button>
      <button
        class="card card-hover
                        {$currentTheme === 'skeleton'
          ? 'from-gray-600 to-blue-600 text-white'
          : 'from-gray-200 to-blue-200 text-black'}
                        "
        on:click={() => currentTheme.set("skeleton")}>
        💀 Skeleton
      </button>
      <button
        class="card card-hover
                        {$currentTheme === 'wintry'
          ? 'from-blue-600 to-blue-400 text-white'
          : 'from-blue-200 to-white text-black'}
                        "
        on:click={() => currentTheme.set("wintry")}>
        🌨️ Wintry
      </button>
      <button
        class="card card-hover
                        {$currentTheme === 'modern'
          ? 'from-pink-600 to-indigo-600 text-white'
          : 'from-pink-200 to-indigo-200 text-black'}
                        "
        on:click={() => currentTheme.set("modern")}>
        🤖 Modern
      </button>
      <button
        class="card card-hover
                        {$currentTheme === 'rocket'
          ? 'from-red-600 to-blue-600 text-white'
          : 'from-red-200 to-blue-200 text-black'}
                        "
        on:click={() => currentTheme.set("rocket")}>
        🚀 Rocket
      </button>
      <button
        class="card card-hover
                        {$currentTheme === 'seafoam'
          ? 'from-cyan-600 to-blue-600 text-white'
          : 'from-cyan-200 to-blue-200 text-black'}
                        "
        on:click={() => currentTheme.set("seafoam")}>
        🧜‍♀️ Seafoam
      </button>
      <button
        class="card card-hover
                        {$currentTheme === 'vintage'
          ? 'from-amber-600 to-orange-600 text-white'
          : 'from-amber-200 to-orange-200 text-black'}
                        "
        on:click={() => currentTheme.set("vintage")}>
        📺 Vintage
      </button>
      <button
        class="card card-hover
                        {$currentTheme === 'hamlindigo'
          ? 'from-indigo-600 to-purple-600 text-white'
          : 'from-indigo-200 to-purple-200 text-black'}
                        "
        on:click={() => currentTheme.set("hamlindigo")}>
        👔 Hamlindigo
      </button>
      <button
        class="card card-hover
                        {$currentTheme === 'gold-nouveau'
          ? 'from-yellow-600 to-red-600 text-white'
          : 'from-yellow-200 to-red-200 text-black'}
                        "
        on:click={() => currentTheme.set("gold-nouveau")}>
        💫 Gold Nouveau
      </button>
      <button
        class="card card-hover
                        {$currentTheme === 'crimson'
          ? 'from-red-600 to-pink-600 text-white'
          : 'from-red-200 to-pink-200 text-black'}
                        "
        on:click={() => currentTheme.set("crimson")}>
        ⭕ Crimson
      </button>
    </div>
  </section>
  <section>
    <h2>Configuration</h2>
    <p>Coming soon.</p>
  </section>
</div>

<style lang="postcss">
  section {
    @apply mb-4;
  }

  h2 {
    @apply text-2xl font-semibold mb-2;
  }

  .card {
    @apply p-2 bg-gradient-to-br overflow-hidden;
  }
</style>
