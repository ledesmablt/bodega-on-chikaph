<script lang="ts">
  import Intro from './components/Intro.svelte'
  import PostStory from './components/PostStory.svelte'
  import Outro from './components/Outro.svelte'
  import Methodology from './components/Methodology.svelte'
  import Logo from '$lib/assets/Logo.svelte'

  const ogDescription = "A glimpse into the Filipino pop culture psyche through one of the most popular internet communities."
</script>

<svelte:head>
  <title>
    on r/ChikaPH: a glimpse into the Filipino pop culture psyche through
    one of the most popular internet communities
  </title>
  <meta property="og:url" content="https://bodega.zip/2025/redditchika"  />
  <meta property="og:image" content="/2025/redditchika/assets/thumb.png" />
  <meta property="og:site_name" content="Bodega"  />
  <meta property="title" content="on r/ChikaPH"  />
  <meta property="og:title" content="on r/ChikaPH"  />
  <meta property="description" content={ogDescription} />
  <meta property="og:description" content={ogDescription} />
</svelte:head>

{#if typeof window !== 'undefined'}
  <nav class="flex flex-col items-center w-full mt-6 mb-8">
    <a href="/">
      <Logo id="bodega-nav-logo" height="24" />
    </a>
  </nav>

  <article id="redditchika_2025">
    <Intro />
    <PostStory />
    <Outro />
    <div class="text-center my-20">~~~</div>
    <Methodology/>
  </article>

  <footer class="bg-black py-4">
    <a href="/" class="flex justify-center">
      <Logo id="bodega-nav-logo" height="24" fill="white" class="pl-2" />
    </a>
  </footer>
{/if}

<style>
  :global {
    nav #bodega-nav-logo {
      fill: #111827;

      &:hover {
        fill: var(--color-theme-dark-orange);
        transition: 0.6s ease;
      }
    }

    article#redditchika_2025 {
      width: 100%;
      max-width: 640px;
      margin: 0 auto;
      margin-bottom: 64px;
      font-family: Reddit Sans;
      color: var(--color-text-body);

      ::selection {
        background: #fcdacc;
      }

      a {
        text-decoration: underline;
        text-decoration-thickness: 2px;
        text-underline-offset: 4px;
        text-decoration-color: var(--color-theme-mid-orange);
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
