<script lang="ts">
  import Intro from './components/Intro.svx'
  import PostStory from './components/PostStory.svelte'
  import Outro from './components/Outro.svx'
</script>

{#if typeof window !== 'undefined'}
  <article id="redditchika_2025">
    <Intro />
    <PostStory />
    <Outro />
  </article>
{/if}

<style>
  :global {
    article#redditchika_2025 {
      --font-serif: IBM Plex Serif;
      --font-sans: IBM Plex Sans;
      --font-mono: IBM Plex Mono;

      width: 100%;
      max-width: 640px;
      margin: 0 auto;

      ::selection {
        background: #fcdacc;
      }

      .app-prose {
        margin: 0 auto;
        width: 100%;
        max-width: 640px;
        padding: 0 24px;
        font-family: var(--font-serif);

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
