import { mdsvex } from 'mdsvex'
import adapter from '@sveltejs/adapter-cloudflare-workers'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [vitePreprocess(), mdsvex({ extensions: ['.svx', '.md'] })],
  kit: {
    adapter: adapter(),
    paths: {
      base: '/2025/redditchika'
    }
  },
  extensions: ['.svelte', '.svx', '.md']
}

export default config
