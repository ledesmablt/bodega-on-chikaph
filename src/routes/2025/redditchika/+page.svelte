<script lang="ts">
  import Intro from './components/Intro.svelte'
  import ChikaPosts from './components/ChikaPosts.svelte'
  import Outro from './components/Outro.svelte'
</script>

{#if typeof window !== 'undefined'}
  <article id="redditchika_2025">
    <Intro/>
    <section class="w-full mt-100 flex flex-col items-center"> 
      <ChikaPosts />
      <div class='h-[2000px]'></div>
    </section>
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
        width: clamp(390px, 100%, 100%);
      }
    }
  }
</style>
