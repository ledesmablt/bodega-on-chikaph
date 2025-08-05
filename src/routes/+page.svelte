 <script>
  import Logo from '$lib/assets/Logo.svelte'
  import { onMount } from 'svelte'

  const ogDescription = "Interactive data stories for the internet."

  onMount(() => {
    document.body.style.backgroundColor = 'white'
  })
 </script>

<svelte:head>
  <title>
    Bodega
  </title>
  <meta property="og:url" content="https://bodega.zip/"  />
  <meta property="site_name" content="Bodega"  />
  <meta property="title" content="Bodega"  />
  <meta property="og:title" content="Bodega"  />
  <meta property="description" content={ogDescription} />
  <meta property="og:description" content={ogDescription} />
  <meta property="og:image" content="/assets/thumb.png" />
</svelte:head>

 <div class="flex flex-col items-center justify-center min-h-screen text-gray-900">
   <section id="hello" class="max-w-md px-8">
     <Logo width="120" class="mb-4"/>
     <p>Interactive data stories for the internet.</p>
     <ol class="list-decimal list-inside">
       <li>
         <a class="font-bold" href="/2025/redditchika">on r/ChikaPH</a> — a glimpse into the Filipino pop culture psyche through one of the most popular internet communities.
       </li>
       <li>
         that's it! still cooking up a few more things 🍚🥘🍗
         but in the meantime, you <a href="https://pudding.cool/" target="blank" rel="noreferrer">might</a>
         <a href="https://kontinentalist.com/" target="blank" rel="noreferrer">enjoy</a>
         <a href="https://www.reddit.com/r/dataisbeautiful/" target="blank" rel="noreferrer">these</a> too.
       </li>
     </ol>
     <p class="mt-6 text-sm">📍 PH</p>
   </section>
 </div> 

 <style>
    :root {
      --font-serif: IBM Plex Serif;
      --font-sans: Reddit Sans;
      --font-mono: IBM Plex Mono;
      --color-text-body: #282828; /* gray-700 */ /* alternative: #282828; */
    }

    :global {
      body {
        background-color: white;
      }
    }

    section#hello {
      font-family: IBM Plex Sans;

      p {
        line-height: 1.5;
        margin-bottom: 16px;
      }

      a {
        text-decoration: underline;
      }
    }
 </style>
