<script lang="ts">
  import ChikaPosts from './components/ChikaPosts.svelte'
</script>

{#if typeof window !== 'undefined'}
  <article id="2025-redditchika">
    <ChikaPosts />
  </article>
{/if}
