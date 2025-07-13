<script lang="ts">
  import { onMount } from 'svelte'
  import { marked } from 'marked'
  import * as d3 from 'd3'

  // TODO: load this async
  import rawData from '../data/chika_10.json'

  const cellSize = 24
  const padding = 2
  const cols = 10
  const rows = 18
  const labelWidth = 80
  const labelPadding = 12

  const chikaPosts = rawData.filter(
    (d) => new Date(d.date).getFullYear() >= 2024 && new Date(d.date) < new Date('2025-07-01')
  )
  const maxUps = d3.max(chikaPosts, (d) => d.ups) ?? 10000
  const minUps = d3.min(chikaPosts, (d) => d.ups) ?? 0

  type ChikaPost = (typeof chikaPosts)[0]
  let selectedPost: ChikaPost | null = $state(null)

  const drawContainer = () => {
    const containerWidth = cellSize * cols + labelWidth + labelPadding
    const container = d3
      .select('#top-10-wrapper')
      .attr('width', containerWidth)
      .attr('height', cellSize * rows)
    return container
      .append('g')
      .attr('width', containerWidth)
      .attr('height', cellSize * rows)
      .attr('id', 'top-10-group')
  }

  const drawLabels = () => {
    const g = d3.select('g#top-10-group')
    const labelData = Array.from({ length: rows }, (_, i) => {
      const date = new Date(2024, i, 1) // +1 to align with your current row logic
      let label = date.toLocaleString('default', { month: 'short' })
      if (label === 'Jan') {
        label = `${date.getFullYear()} ${label}`
      }

      return {
        label,
        y: i * cellSize + cellSize / 2
      }
    })

    g.selectAll('text.date-label')
      .data(labelData)
      .join('text')
      .classed('date-label', true)
      .attr('x', labelWidth - labelPadding)
      .attr('y', (d) => d.y)
      .attr('dy', '0.35em')
      .text((d) => d.label)
  }

  const drawGridItems = () => {
    const g = d3.select('g#top-10-group')
    const orangeGradient = d3.interpolateRgb('#fcdacc', '#ff4500')

    g.selectAll('rect.top-10-item')
      .data(chikaPosts, (d) => (d as { id: string }).id)
      .join('rect')
      .classed('top-10-item', true)
      .on('click', (_event, d) => {
        onOpenDialog(d)
      })
      .attr('rx', 4)
      .attr('width', cellSize - padding * 2)
      .attr('height', cellSize - padding * 2)
      .attr('fill', (d) => {
        const ratio = (d.ups - minUps) / (maxUps - minUps)
        return orangeGradient(ratio)
      })
      .attr('x', (_d, i) => (i % cols) * cellSize + labelWidth)
      .attr('y', (_d, i) => Math.floor(i / cols) * cellSize)
      .attr('opacity', 1)
  }

  const getModal = () => {
    return document.getElementById('post-dialog') as HTMLDialogElement
  }

  const onOpenDialog = (post: ChikaPost) => {
    selectedPost = post
    const dialog = getModal()
    dialog.showModal()

  }
  const onCloseDialog = () => {
    selectedPost = null
    const dialog = getModal()
    dialog.close()

  }

  onMount(() => {
    drawContainer()
    drawLabels()
    drawGridItems()
  })
</script>

<div class="flex min-h-200 w-full flex-col items-center justify-center">
  <h2 class="mb-4 text-2xl font-bold">Top 10 Chika Posts per month</h2>
  <svg id="top-10-wrapper"> </svg>

  <dialog id='post-dialog' closedby='any'>
    {#if selectedPost}
      <div class='w-full flex'>
        <button class='cursor-pointer ml-auto' onclick={onCloseDialog}>x</button>
      </div>
      <h3 class="text-2xl font-semibold">{selectedPost.title}</h3>
      <div class='font-mono'>
        <p class="text-sm text-gray-600">
          Posted on: {new Date(selectedPost.date).toLocaleDateString()}
        </p>
        <p class="text-sm">{selectedPost.ups.toLocaleString()} upvotes</p>
      </div>

      {#if selectedPost.selftext}
        <div id='post-selftext' class='flex flex-col gap-2 py-4 text-sm'>
          {@html marked(selectedPost.selftext)}
        </div>
      {/if}
      <div class='flex justify-center mb-4'>
        <a
          href={selectedPost.permalink}
          target="_blank"
          rel="noopener noreferrer"
          class="text-blue-500 hover:underline"
        >
          View post on Reddit
        </a>
      </div>
    {/if}
  </dialog>
</div>

<style>
  dialog {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 480px;
    padding: 16px 24px;
    border-radius: 6px;

    :global {
      div#post-selftext {
        a {
          text-decoration: underline;
        }
      }
    }
  }

  dialog::backdrop {
    background-color: rgba(0, 0, 0, 0.5);
  }

  :global {
    svg#top-10-wrapper {
      .top-10-item {
        transition: fill 0.2s ease;
        cursor: pointer;
        &:hover {
          fill: #ff4500;
        }
      }

      .date-label {
        font-family: monospace;
        font-size: 12px;
        text-anchor: end;
        fill: #333;
      }
    }
  }
</style>
