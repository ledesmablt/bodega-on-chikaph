<script lang="ts">
  import Intro from './components/Intro.svelte'
  import PostStory from './components/PostStory.svelte'
  import Outro from './components/Outro.svelte'
  import Methodology from './components/Methodology.svelte'
</script>

{#if typeof window !== 'undefined'}
  <article id="redditchika_2025">
    <Intro />
    <PostStory />
    <Outro />
    <div class="text-center my-20">~~~</div>
    <Methodology/>
  </article>
{/if}

<style>
  /* import Reddit Sans */
  @import url('https://fonts.googleapis.com/css2?family=Reddit+Sans:ital,wght@0,200..900;1,200..900&display=swap');

  :global {
    article#redditchika_2025 {
      --font-serif: IBM Plex Serif;
      /* --font-sans: IBM Plex Sans; */
      --font-sans: Reddit Sans;
      --font-mono: IBM Plex Mono;
      --color-theme-dark-orange: #ff4500;
      --color-theme-light-orange: #fcdacc;

      width: 100%;
      max-width: 640px;
      margin: 0 auto;
      margin-bottom: 64px;
      font-family: Reddit Sans;
      color: var(--color-gray-700);

      ::selection {
        background: #fcdacc;
      }

      a {
        text-decoration: underline;
        text-decoration-color: var(--color-theme-dark-orange);
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
          line-height: 1.75;
        }
      }
    }
  }
</style>
