<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { marked } from 'marked'
  import * as d3 from 'd3'
  import _ from 'lodash'
  import type { ColorMode, ChikaPost, SimulationNode, Sentiment } from './_types'
  import { fade, fly } from 'svelte/transition'
  import { cubicOut } from 'svelte/easing'

  let {
    selectedPeople = $bindable<string[]>([]),
    showTopRank = $bindable(1),
    colorMode = $bindable<ColorMode>('ups'),
    selectedSentiments = $bindable<Sentiment[]>([]),
    hoveredPostId = $bindable<string | null>(null),
    selectedPostId = $bindable<string | null>(),
    showFilters = $bindable(false)
  } = $props()

  const COLORS = {
    black: 'black',
    lightGray: '#e5e7eb',
    lightOrange: '#fcdacc',
    darkOrange: '#ff4500',
    green: '#22c55e',
    red: '#f87171',
    gray: '#6b7280'
  } as const

  // TODO: plug this into the tailwind theme
  const MIN_WIDTH = 390
  const MAX_WIDTH = 1200
  const MAX_HEIGHT = 680
  let mouse = $state([0, 0])
  let containerWidth = $state(390)
  let containerHeight = $derived(Math.min(containerWidth + 80, MAX_HEIGHT))
  const widthDomain = $derived([MIN_WIDTH, MAX_WIDTH])
  const minCircleScale = $derived(d3.scaleLinear(widthDomain, [3, 8]).clamp(true))
  const maxCircleScale = $derived(d3.scaleLinear(widthDomain, [22, 40]).clamp(true))
  const minCircleR = $derived(minCircleScale(containerWidth))
  const maxCircleR = $derived(maxCircleScale(containerWidth))
  const orangeGradient = d3.interpolateRgb(COLORS.lightOrange, COLORS.darkOrange)

  const REACTIONS: Record<string, string> = {
    respect: 'positive',
    happy: 'positive',
    funny: 'positive',
    supportive: 'positive',
    shocking: 'neutral',
    interesting: 'neutral',
    neutral: 'neutral',
    mixed: 'neutral',
    sad: 'negative',
    annoying: 'negative',
    angry: 'negative'
  }

  let chikaPosts = $state<ChikaPost[]>([])
  // TODO: limit this to top
  const peopleOptions = $derived(new Set(chikaPosts.flatMap((post) => post.people ?? [])))
  const maxUps = 11507

  const RANK_THRESHOLD = 30
  const showOnlyTop = $derived(showTopRank <= RANK_THRESHOLD)
  const minUps = $derived(showOnlyTop ? 5000 : 1579)
  const radiusScale = $derived(d3.scaleLinear([minUps, maxUps], [minCircleR, maxCircleR]))

  let simulation: d3.Simulation<any, any> | null = $state(null)

  const getFill = (d: ChikaPost): string => {
    const defaultColor = COLORS.black
    const ratio = (d.ups - minUps) / (maxUps - minUps)

    const hasPeopleOverlap = _.intersection(d.people, selectedPeople).length == 0
    if (selectedPeople.length > 0 && hasPeopleOverlap) {
      // color only selected people, otherwise gray the rest out
      return COLORS.lightGray
    }

    if (colorMode === 'ups') {
      return orangeGradient(ratio)
    } else if (colorMode === 'sentiment') {
      const sentiment = REACTIONS[d.reaction ?? '']
      const matchesReaction = selectedSentiments.includes(d.reaction)
      const matchesSentiment = selectedSentiments.includes(sentiment)
      if (selectedSentiments.length && !(matchesReaction || matchesSentiment)) {
        return COLORS.lightGray
      }
      switch (sentiment) {
        case 'positive':
          return COLORS.green
        case 'neutral':
          return COLORS.gray
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
    console.log(simNodes?.length, showTopRank)
    if (simNodes?.length !== showTopRank) {
      return chikaPosts
        .filter((node) => node.overall_rank <= showTopRank)
        .map((node) => ({
          ...node,
          radius: radiusScale(node.ups)
        }))
        .sort((b, a) => b.overall_rank - a.overall_rank)
    }

    // default to using the simulation nodes, which already have position & vector
    return simNodes
  }

  let nodes = $derived(getNodes())
  let nodesById = $derived(_.keyBy(nodes, (d) => d.id as string))
  let selectedPost = $derived(nodesById[selectedPostId ?? ''])
  let openedPostId: string | null = $state(null)
  let openedPost = $derived(nodesById[openedPostId ?? ''])

  export const drawContainer = ({ width }: { width?: number } = {}) => {
    if (!width) {
      width = containerWidth
    }
    console.log('drawContainer', width)
    const container = d3
      .select('#top-10-wrapper')
      .attr('width', width)
      .attr('height', containerHeight)
    return container
      .append('g')
      .attr('width', width)
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

    // if small screen, just center it
    if (containerWidth <= 800) {
      post.style('top', `${containerHeight - 20}px`)
      post.style('left', `${containerWidth / 2 - boxWidth / 2}px`)
      return
    }

    // default left aligned
    const padding = 12
    post.style('top', `${node.y + node.radius + padding}px`)
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
      .join(
        (enter) => {
          const circle = enter.append('circle').attr('r', 0)

          const getDuration = (d: SimulationNode) => {
            if (d.overall_rank === 1) {
              return 500
            }
            if (d.overall_rank <= RANK_THRESHOLD) {
              return 200
            }
            return 150
          }

          const getDelay = (d: SimulationNode) => {
            if (d.overall_rank === 1) {
              return 0
            }
            if (d.overall_rank <= RANK_THRESHOLD) {
              return d.overall_rank * 20 + 1000
            }
            return d.overall_rank * 5
          }

          circle
            .transition()
            .duration((d) => getDuration(d))
            .delay((d) => getDelay(d))
            .attr('r', (d) => d.radius)

          return circle
        },
        (update) => {
          update
            .attr('r', (d) => d.radius)
            .transition()
            .duration(100)
          return update
        },
        (exit) => exit
      )
      .classed('top-10-item', true)
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
          // draw the top circles together faster.
          // calling #force again will "reset" the "charge", causing the
          // circles to move towards the center.
          .force('charge', d3.forceManyBody().strength(nodes.length <= RANK_THRESHOLD ? 10 : 1))
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
      }
      const currentAlpha = simulation.alpha()
      if (currentAlpha <= simulation.alphaMin()) {
        // "reheat" the simulation when it stops so that drifters find their place
        return 0.2
      }

      // we want to use the ongoing simulation's alpha when appropriate so we don't
      // "reheat" the simulation too early.
      return currentAlpha
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

  const onChangeSelectedPeople = (value: string) => {
    if (value) {
      selectedPeople = [value]
    } else {
      selectedPeople = []
    }
    drawSimulation()
  }

  const onChangeSelectedSentiments = (value: string) => {
    if (value) {
      selectedSentiments = [value]
    } else {
      selectedSentiments = []
    }
    drawSimulation()
  }

  // resizing mumbo jumbo that chatgpt gave me
  let el: any // reference to the element
  let width = 0
  let observer: any

  function handleResize(entries: any[]) {
    for (const entry of entries) {
      const newWidth = entry.contentRect.width
      if (newWidth !== width) {
        width = newWidth
        onWidthChange(width)
      }
    }
  }

  function onWidthChange(newWidth: number) {
    containerWidth = Math.min(newWidth, MAX_WIDTH)
    drawContainer({ width: newWidth })
    drawSimulation({ resetForce: true })
  }

  onMount(() => {
    // part of the resizing mumbo jumbo
    observer = new ResizeObserver(handleResize)
    if (el) observer.observe(el)

    d3.json('/data/2025/redditchika/chika_10.json')
      .then((data) => {
        chikaPosts = data as ChikaPost[]
        drawContainer()
        drawSimulation({ resetForce: true })
      })
      .catch(console.error)
  })

  onDestroy(() => {
    if (observer) observer.disconnect()
  })
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
  class="sticky top-1/2 w-full transform-[translateY(-50%)] lg:min-w-[1024px]"
  bind:this={el}
  onclick={(e) => {
    const target = e.target as SVGElement | HTMLElement
    const className = target.getAttribute('class') ?? ''
    if (!className.includes('top-10-item')) {
      selectedPostId = null
    }
  }}
>
  <svg id="top-10-wrapper" class="z-1"> </svg>

  <div class="mt-2 h-[96px]">
    {#if showFilters}
      <div
        id="active-filters"
        class="mt-2 flex items-start justify-center gap-2"
        transition:fade={{ duration: 200 }}
      >
        <div class="flex flex-col gap-2">
          <div id="select-colormode-wrapper">
            <select
              name="select-colormode"
              value={colorMode}
              onchange={(e) => {
                colorMode = e.currentTarget.value
                drawSimulation()
              }}
              class="w-full rounded px-1"
            >
              <option value="ups">color by upvotes</option>
              <option value="sentiment">color by sentiment</option>
            </select>
          </div>
          <div id="select-person-wrapper">
            <select
              name="select-person"
              class={{
                rounded: true,
                'w-full': true,
                'px-1': true,
                'text-gray-500': !selectedPeople.length,
                [`bg-[#ff4500]`]: !!selectedPeople.length
              }}
              value={selectedPeople[0] ?? ''}
              onchange={(e) => {
                onChangeSelectedPeople(e.currentTarget.value)
              }}
            >
              <option value="">(filter by subject)</option>
              <!-- TODO: limit to top 20, show # of ups  -->
              {#each peopleOptions as option}
                <option value={option}>{option}</option>
              {/each}
            </select>
          </div>
          <div id="select-sentiment-wrapper">
            <select
              name="select-sentiment"
              value={selectedSentiments[0] ?? ''}
              class={{
                'w-full': true,
                rounded: true,
                'px-1': true,
                'bg-green-500': REACTIONS[selectedSentiments[0]] === 'positive',
                'bg-gray-400': REACTIONS[selectedSentiments[0]] === 'neutral',
                'bg-red-500': REACTIONS[selectedSentiments[0]] === 'negative',
                'text-gray-500': !selectedSentiments.length
              }}
              onchange={(e) => {
                onChangeSelectedSentiments(e.currentTarget.value)
              }}
            >
              <option value="">(filter by sentiment)</option>
              {#each Object.entries(REACTIONS) as [key]}
                <option value={key}>{key}</option>
              {/each}
            </select>
          </div>
        </div>
      </div>
    {/if}
  </div>

  {#if selectedPost}
    <button
      id="post-preview"
      onclick={() => onOpenDialog(selectedPost)}
      in:fly={{ duration: 200, easing: cubicOut, y: 50 }}
      out:fade={{ duration: 150 }}
    >
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
