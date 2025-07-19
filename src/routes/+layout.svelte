<script lang="ts">
  import '../app.css'
  import { viewport } from '$lib/viewport'
  import { onMount } from 'svelte'

  let { children } = $props()

  const onresize = () => {
    if (typeof window === 'undefined') {
      return
    }

    $viewport = {
      width: window.outerWidth,
      height: window.outerHeight,
    }
    console.debug('resize', $viewport)
  }

  onMount(() => {
    console.debug('init', $viewport)
    $viewport = {
      width: window.outerWidth,
      height: window.outerHeight,
    }
    console.debug('init', $viewport)
  })
</script>

<main class="w-full">
  {@render children()}
</main>
<svelte:window {onresize} />
