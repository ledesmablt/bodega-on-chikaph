<script lang="ts">
  import { onMount } from 'svelte'
  import { marked } from 'marked'
  import * as d3 from 'd3'

  // TODO: load this async
  import rawData from '../data/chika_10.json'

  const containerWidth = 600
  const containerHeight = 600

  const chikaPosts = rawData.filter(
    (d) => new Date(d.date).getFullYear() >= 2024 && new Date(d.date) < new Date('2025-07-01')
  )
  const maxUps = d3.max(chikaPosts, (d) => d.ups) ?? 10000
  const minUps = d3.min(chikaPosts, (d) => d.ups) ?? 0

  type ChikaPost = (typeof chikaPosts)[0]
  type SimulationNode = ChikaPost & d3.SimulationNodeDatum
  let selectedPost: ChikaPost | null = $state(null)
  let simulation: d3.Simulation<any, any> | null = $state(null)

  const drawContainer = () => {
    const container = d3
      .select('#top-10-wrapper')
      .attr('width', containerWidth)
      .attr('height', containerHeight)
    return container
      .append('g')
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .attr('id', 'top-10-group')
  }

  const drawSimulation = () => {
    const nodes = chikaPosts as SimulationNode[]
    const g = d3.select('g#top-10-group')
    const orangeGradient = d3.interpolateRgb('#fcdacc', '#ff4500')
    const upsScale = d3.scaleLinear([minUps, maxUps], [4, 40])

    const ticked = () => {
      g.selectAll('circle.top-10-item')
        .data(nodes, (d) => (d as ChikaPost).id)
        .join('circle')
        .classed('top-10-item', true)
        .on('click', (_event, d) => {
          onOpenDialog(d)
        })
        .attr('fill', (d) => {
          const ratio = (d.ups - minUps) / (maxUps - minUps)
          return orangeGradient(ratio)
        })
        .attr('r', (d) => upsScale(d.ups))
        .attr('cx', (d) => d.x ?? 0)
        .attr('cy', (d) => d.y ?? 0)
        .attr('opacity', 1)
    }

    simulation = d3
      .forceSimulation(nodes)
      .force('center', d3.forceCenter(containerWidth / 2, containerHeight / 2))
      .force('charge', d3.forceManyBody().strength(1))
      .force(
        'collision',
        d3.forceCollide().radius((d) => upsScale((d as SimulationNode).ups) + 1)
      )
      .on('tick', ticked)
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
    drawSimulation()
  })
</script>

<div class="flex min-h-200 w-full flex-col items-center justify-center">
  <h2 class="mb-4 text-2xl font-bold">Top 10 Chika Posts per month</h2>
  <svg id="top-10-wrapper"> </svg>

  <dialog id="post-dialog" closedby="any">
    {#if selectedPost}
      <div class="flex w-full">
        <button class="ml-auto cursor-pointer" onclick={onCloseDialog}>x</button>
      </div>
      <h3 class="text-2xl font-semibold">{selectedPost.title}</h3>
      <div class="font-mono">
        <p class="text-sm text-gray-600">
          Posted on: {new Date(selectedPost.date).toLocaleDateString()}
        </p>
        <p class="text-sm">{selectedPost.ups.toLocaleString()} upvotes</p>
      </div>

      {#if selectedPost.selftext}
        <div id="post-selftext" class="flex flex-col gap-2 py-4 text-sm">
          {@html marked(selectedPost.selftext)}
        </div>
      {/if}
      <div class="mb-4 flex justify-center">
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
