<script lang="ts">
  import Intro from './components/Intro.svelte'
  import ChikaPosts from './components/ChikaPosts.svelte'
  import Outro from './components/Outro.svelte'
  import { viewport } from '$lib/viewport'
</script>

{#if typeof window !== 'undefined'}
  <article id="redditchika_2025">
    <Intro/>
    <section class="w-full flex flex-col items-center"> 
      <div class='spacer' style:height={`${$viewport.height}px`}></div>
      <ChikaPosts />
      <div class='h-[2000px]'></div>
    </section>
    <Outro/>
  </article>
{/if}

<style>
  :global {
    article#redditchika_2025 {
      width: 100%;
      max-width: 640px;
      margin: 0 auto;

      .app-prose {
        margin: 0 auto;
        width: 100%;
        max-width: 640px;
        padding: 0 24px;

        p {
          margin: 12px 0;
          font-size: 16px;
          line-height: 28px;
          color: var(--color-gray-700);
        }
      }
    }
  }
</style>
