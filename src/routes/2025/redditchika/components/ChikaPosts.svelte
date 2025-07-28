<script lang="ts">
  import { onMount } from 'svelte'
  import { marked } from 'marked'
  import * as d3 from 'd3'
  import _ from 'lodash'
  import type { ColorMode, ChikaPost, SimulationNode, Sentiment } from './_types'

  let {
    selectedPeople = $bindable<string[]>([]),
    showOnlyTop10 = $bindable(true),
    colorMode = $bindable<ColorMode>('ups'),
    selectedSentiments = $bindable<Sentiment[]>([]),
    hoveredPostId = $bindable<string | null>(null),
    selectedPostId = $bindable<string | null>(),
  } = $props()

  const COLORS = {
    black: 'black',
    lightGrey: '#e5e7eb',
    lightOrange: '#fcdacc',
    darkOrange: '#ff4500',
    green: '#22c55e',
    red: '#f87171',
    grey: '#6b7280',
  } as const

  // TODO: plug this into the tailwind theme
  const MIN_VW = 390
  const MAX_VW = 640
  const vwDomain = [MIN_VW, MAX_VW]
  let mouse = $state([0,0])
  let containerWidth = $state(MAX_VW)
  let containerHeight = $derived(containerWidth)
  const minCircleScale = d3.scaleLinear(vwDomain, [5, 8]).clamp(true)
  const maxCircleScale = d3.scaleLinear(vwDomain, [20, 40]).clamp(true)
  const minCircleR = $derived(minCircleScale(containerWidth))
  const maxCircleR = $derived(maxCircleScale(containerWidth))
  const orangeGradient = d3.interpolateRgb(COLORS.lightOrange, COLORS.darkOrange)

  const REACTIONS: Record<string, string> = {
    respect: 'positive',
    happy: 'positive',
    funny: 'positive',
    supportive: 'positive',
    dasurb: 'neutral',
    shocking: 'neutral',
    interesting: 'neutral',
    neutral: 'neutral',
    mixed: 'neutral',
    sad: 'negative',
    annoying: 'negative',
    angry: 'negative'
  }

  let chikaPosts = $state<ChikaPost[]>([])
  const maxUps = 11507
  const minUps = $derived(showOnlyTop10 ? 5000 : 1579)
  const radiusScale = $derived(d3.scaleLinear([minUps, maxUps], [minCircleR, maxCircleR]))

  let simulation: d3.Simulation<any, any> | null = $state(null)

  const getFill = (d: ChikaPost): string => {
    const defaultColor = COLORS.black
    const ratio = (d.ups - minUps) / (maxUps - minUps)

    const hasPeopleOverlap = _.intersection(d.people, selectedPeople).length == 0
    if (selectedPeople.length > 0 && hasPeopleOverlap) {
      // color only selected people, otherwise grey the rest out
      return COLORS.lightGrey
    }

    if (colorMode === 'ups') {
      return orangeGradient(ratio)
    } else if (colorMode === 'sentiment') {
      const sentiment = REACTIONS[d.reaction ?? '']
      if (selectedSentiments.length && !selectedSentiments.includes(sentiment)) {
        return COLORS.lightGrey
      }
      switch (sentiment) {
        case 'positive':
          return COLORS.green
        case 'neutral':
          return COLORS.grey
        case 'negative':
          return COLORS.red
        default:
          return defaultColor
      }
    }

    return defaultColor
  }

  const getNodes = (): SimulationNode[] => {
    const simNodes = simulation?.nodes()
    const stillTop10 = simNodes?.length === 10
    if (!showOnlyTop10 && stillTop10) {
      return chikaPosts.map((node) => ({
        ...node,
        radius: radiusScale(node.ups)
      }))
    }

    if (!simNodes) {
      // article starts with showOnlyTop10
      return chikaPosts
        .filter((node) => node.overall_rank <= 10)
        .map((node) => ({
          ...node,
          radius: radiusScale(node.ups)
        }))
    }

    // default to using the simulation nodes, which already have position & vector
    return simNodes
  }

  let nodes = $derived(getNodes())
  let nodesById = $derived(_.keyBy(nodes, (d) => d.id as string))
  let selectedPost = $derived(nodesById[selectedPostId ?? ''])
  let openedPostId: string | null = $state(null)
  let openedPost = $derived(nodesById[openedPostId ?? ''])

  export const drawContainer = () => {
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

  const drawPostPreview = () => {
    const post = d3.select('#post-preview')
    if (!selectedPostId) {
      return
    }

    // TODO: on desktop, preview on hovered post instead of selected
    const node = nodesById[selectedPostId]
    if (!node) {
      return
    }

    // TODO: improve positioning
    // TODO: is there a way to do this with `.data` & `.join` so we get a smooth `node.radius` transition
    // TODO: hovering over the preview box itself "resizes" the circle, which is pretty annoying...
    const boxWidth = 320
    const boxHeight = 132
    // TODO: make this smaller on mobile
    post.style('width', `${boxWidth}px`)
    post.style('height', `${boxHeight}px`)
    post.style('padding', '16px 24px')

    const padding = 12
    post.style('top', `${node.y + node.radius + padding}px`)

    // default left aligned
    const withinRightBound = node.x + boxWidth <= containerWidth
    if (withinRightBound) {
      post.style('left', `${node.x}px`)
    } else {
      // right align
      const withinLeftBound = node.x >= boxWidth
      if (withinLeftBound) {
        post.style('left', `${node.x - boxWidth}px`)
      } else {
        post.style('left', '0px')
      }
    }
  }

  interface DrawSimulationOptions {
    resetForce?: boolean
  }
  export const drawSimulation = (opts: DrawSimulationOptions = {}) => {
    console.info('drawSimulation', opts)
    const g = d3.select('g#top-10-group')

    // draw the circles
    const circles = g
      .selectChildren('circle')
      .data(nodes, (d) => (d as ChikaPost).id)
      .join('circle')
      .classed('top-10-item', true)
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => getFill(d))

    const onSimulationTick = () => {
      circles
        .classed('with-stroke', (d) => selectedPostId === d.id)
        // force simulation sets these values
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y)
        .on('click', (_event, d) => {
          const alreadySelected = selectedPostId === d.id
          if (alreadySelected) {
            onOpenDialog(d)
          } else {
            selectedPostId = d.id
            drawPostPreview()
          }
        })
        .on('mouseenter', function (_event, d) {
          hoveredPostId = d.id
          if (d.upsized) {
            return
          }
          d.upsized = true
          // double the radius (or at least make it big enough)
          d.radius = Math.max(d.radius * 2, maxCircleR)
          d3.select(this).transition().duration(200).attr('r', d.radius)
          onReheatSimulation({ resetForce: true })
        })
        .on('mouseleave', function (_event, d) {
          hoveredPostId = null
          if (!d.upsized) {
            return
          }
          d.upsized = false
          d.radius = d.radius / 2
          d3.select(this).transition().duration(200).attr('r', d.radius)
          onReheatSimulation({ resetForce: true })
        })
        .on('mousemove', (e) => {
            mouse = d3.pointer(e)
        })

      // draw this on every tick so that the preview shifts with the node's position
      drawPostPreview()
    }

    const onReheatSimulation = (opts: DrawSimulationOptions) => {
      if (!simulation) {
        return
      }

      simulation
        // shoot for the center of the box
        .force('center', d3.forceCenter(containerWidth / 2, containerHeight / 2))
        // make sure circles don't bump into each other, and give the upsized ones a bit more space
        .force(
          'collision',
          d3.forceCollide((d) => (d.upsized ? d.radius + 4 : d.radius + 2))
        )

      if (opts.resetForce) {
        simulation
          // draw the top 10 circles together faster.
          // calling #force again will "reset" the "charge", causing the
          // circles to move towards the center.
          .force('charge', d3.forceManyBody().strength(nodes.length === 10 ? 50 : 1))
      }

      // actually restart the simulation
      simulation.alpha(1).restart()
    }

    const getAlpha = () => {
      if (!simulation) {
        return 1
      }
      if (opts.resetForce) {
        return 1
      } else {
        // we want to use the ongoing simulation's alpha when appropriate so we don't
        // "reheat" the simulation over and over.
        return simulation.alpha()
      }
    }

    simulation = d3
      .forceSimulation(nodes)
      .alpha(getAlpha())
      .on('tick', onSimulationTick)
      .on('end', () => {
        drawPostPreview()
      })

    simulation.force('followMouse', (alpha) => {
      const hoveredNode = nodesById[hoveredPostId]
      if (!hoveredNode) {
        return
      }

      hoveredNode.vx += (mouse[0] - hoveredNode.x) * 0.15 * alpha
      hoveredNode.vy += (mouse[1] - hoveredNode.y) * 0.15 * alpha
    })

    if (opts.resetForce) {
      onReheatSimulation(opts)
    }
  }

  const getModal = () => {
    return document.getElementById('post-dialog') as HTMLDialogElement
  }

  const onOpenDialog = (post: ChikaPost) => {
    openedPostId = post.id
    const dialog = getModal()
    dialog.showModal()
  }
  const onCloseDialog = () => {
    openedPostId = null
    const dialog = getModal()
    dialog.close()
  }

  const toggleColorMode = () => {
    if (colorMode === 'ups') {
      colorMode = 'sentiment'
    } else {
      colorMode = 'ups'
    }
    drawSimulation()
  }

  const toggleShowAllPosts = () => {
    showOnlyTop10 = !showOnlyTop10
    drawSimulation({ resetForce: true })
  }

  onMount(() => {
    d3.json('/data/2025/redditchika/chika_10.json')
      .then((data) => {
        chikaPosts = data as ChikaPost[]
        drawContainer()
        drawSimulation({ resetForce: true })
      })
      .catch(console.error)
  })
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
  class="sticky top-1/2 w-full transform-[translateY(-50%)]"
  bind:clientWidth={containerWidth}
  onclick={(e) => {
    const target = e.target as SVGElement | HTMLElement
    const className = target.getAttribute('class') ?? ''
    if (!className.includes('top-10-item')) {
      selectedPostId = null
    }
  }}
>
  <div id="controls" class="hidden">
    <button
      id="toggle-top10"
      class="border-gray cursor-pointer rounded border p-2"
      onclick={toggleShowAllPosts}
    >
      {#if showOnlyTop10}
        show all posts
      {:else}
        show top 10 posts
      {/if}
    </button>
    <button class="border-gray cursor-pointer rounded border p-2" onclick={toggleColorMode}>
      color by {colorMode === 'ups' ? 'ups' : 'sentiment'}
    </button>
  </div>
  <svg id="top-10-wrapper" class="z-1 mt-2 border border-gray-500"> </svg>
  <div id="active-filters" class="mt-2">
    <p>TODO: expose filters here?</p>
  </div>

  {#if selectedPost}
    <button id="post-preview" onclick={() => onOpenDialog(selectedPost)}>
      <p class="line-clamp-1">{selectedPost.title}</p>
      {#if selectedPost.people.length > 0}
        <p class="line-clamp-1">Subject: {selectedPost.people.join(', ')}</p>
      {/if}
      <p>Vibe: {selectedPost.reaction}</p>
      <p><i>(click for more details)</i></p>
    </button>
  {/if}

  <dialog id="post-dialog" closedby="any">
    {#if openedPost}
      <div class="flex w-full">
        <button class="ml-auto cursor-pointer" onclick={onCloseDialog}>x</button>
      </div>
      <h3 class="text-2xl font-semibold">{openedPost.title}</h3>
      <div class="font-mono">
        <p class="text-sm text-gray-600">
          Posted on: {new Date(openedPost.date).toLocaleDateString()}
        </p>
        <p class="text-sm">{openedPost.ups.toLocaleString()} upvotes</p>
      </div>

      {#if openedPost.selftext}
        <div id="post-selftext" class="flex flex-col gap-2 py-4 text-sm">
          {@html marked(openedPost.selftext)}
        </div>
      {/if}
      <div class="mb-4 flex justify-center">
        <a
          href={openedPost.permalink}
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
  dialog#post-dialog {
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

  dialog#post-dialog::backdrop {
    background-color: rgba(0, 0, 0, 0.5);
  }

  #post-preview {
    background-color: black;
    color: white;
    position: fixed;
    text-align: left;
    cursor: pointer;
  }

  :global {
    svg#top-10-wrapper {
      .top-10-item {
        transition: fill 0.2s ease;
        cursor: pointer;
        &:hover {
          stroke: black;
          stroke-width: 2px;
        }
      }

      .with-stroke {
        stroke: #000;
        stroke-width: 2px;
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
