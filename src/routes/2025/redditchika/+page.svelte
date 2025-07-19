<script lang="ts">
  import Intro from './components/Intro.svelte'
  import ChikaPosts from './components/ChikaPosts.svelte'
  import Outro from './components/Outro.svelte'
</script>

{#if typeof window !== 'undefined'}
  <article id="redditchika_2025">
    <Intro/>
    <ChikaPosts />
    <Outro/>
  </article>
{/if}

<style>
  :global {
    article#redditchika_2025 {
      max-width: 640px;
      margin: 0 auto;

      .prose {
        margin: 0 auto;
        width: clamp(400px, 80%, 100%);
      }
    }
  }
</style>
