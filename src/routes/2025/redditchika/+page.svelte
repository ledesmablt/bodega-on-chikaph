<script lang="ts">
  import TopTenChart from './components/TopTenChart.svelte'
</script>

{#if typeof window !== 'undefined'}
  <article id="2025-redditchika">
    <TopTenChart />
  </article>
{/if}
