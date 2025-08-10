<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { marked } from 'marked'
  import * as d3 from 'd3'
  import _ from 'lodash'
  import type { ColorMode, ChikaPost, SimulationNode, Sentiment } from './_types'
  import { fade, fly } from 'svelte/transition'
  import { cubicOut } from 'svelte/easing'
  import { COLORS, REACTIONS, TAGS } from './utils'
  import { base as BASE_PATH } from '$app/paths'

  // NOTE: next time, just use a shared state instead of whatever this grew into.
  let {
    selectedPeople = $bindable<string[]>([]),
    showTopRank = $bindable(1),
    colorMode = $bindable<ColorMode>('ups'),
    selectedSentiments = $bindable<Sentiment[]>([]),
    selectedTags = $bindable<string[]>([]),
    hoveredPostId = $bindable<string | null>(null),
    selectedPostId = $bindable<string | null>(),
    showFilters = $bindable(false)
  } = $props()

  const MIN_WIDTH = 390
  const MAX_WIDTH = 1200
  const MAX_HEIGHT = 680
  let mouse = $state([0, 0])
  let containerWidth = $state(MIN_WIDTH)
  let containerHeight = $derived(Math.min(containerWidth + 80, MAX_HEIGHT))
  const widthDomain = $derived([MIN_WIDTH, MAX_WIDTH])
  const minCircleScale = $derived(d3.scaleLinear(widthDomain, [3, 8]).clamp(true))
  const maxCircleScale = $derived(d3.scaleLinear(widthDomain, [22, 40]).clamp(true))
  const minCircleR = $derived(minCircleScale(containerWidth))
  const maxCircleR = $derived(maxCircleScale(containerWidth))
  const orangeGradient = d3.interpolateRgb(COLORS.lightOrange, COLORS.darkOrange)

  let chikaPosts = $state<ChikaPost[]>([])
  const getPeopleOptions = (): { subject: string; count: number }[] => {
    const people = chikaPosts.flatMap((post) => (post.people as string[]) ?? [])
    const asKeys = _.countBy(people)
    return Object.entries(asKeys)
      .map(([key, value]) => ({
        subject: key,
        count: value
      }))
      .filter((obj) => !!obj.subject)
      .sort((a, b) => {
        const countDiff = b.count - a.count
        if (countDiff !== 0) {
          return countDiff
        }
        return a.subject.localeCompare(b.subject)
      })
  }
  const peopleOptions = $derived(getPeopleOptions())
  const maxUps = 11507

  const RANK_THRESHOLD = 30
  const showOnlyTop = $derived(showTopRank <= RANK_THRESHOLD)
  const minUps = $derived(showOnlyTop ? 5000 : 1579)
  const radiusScale = $derived(d3.scaleLinear([minUps, maxUps], [minCircleR, maxCircleR]))

  // NOTE: these non-reactive variables, especially those used by the d3 visualization here,
  // don't have to be declared as $state variables. d3 does its own DOM manipulation outside of
  // svelte's component rendering lifecycle.
  // instead of trying to reassign the `chikaPosts` and `nodes` variables, it might have been a
  // better idea to just load all posts (but mark some as "hidden" where appropriate), and when
  // there are changes in the filters or selected posts just call `drawContainer`. this shouldn't
  // make svelte "tick" but will cause d3 to update the DOM.
  // *CONCLUSION*: moving forward, prefer plain `let var = value` declarations if user interactions
  // affect DOM nodes rendered d3 and not in the svelte template.
  let simulation: d3.Simulation<any, any> | null = $state(null)

  const getFill = (d: ChikaPost): string => {
    const defaultColor = COLORS.black
    const ratio = (d.ups - minUps) / (maxUps - minUps)

    const hasPeopleOverlap = _.intersection(d.people, selectedPeople).length > 0
    if (selectedPeople.length > 0 && !hasPeopleOverlap) {
      // color only selected people, otherwise gray the rest out
      return COLORS.lightGray
    }

    const sentiment = REACTIONS[d.reaction ?? '']
    const matchesReaction = selectedSentiments.includes(d.reaction)
    const matchesSentiment = selectedSentiments.includes(sentiment)
    if (selectedSentiments.length && !(matchesReaction || matchesSentiment)) {
      return COLORS.lightGray
    }

    // this one behaves a bit differently - we want to check that the post
    // has ALL the selected tags.
    const hasTagOverlap = _.intersection(d.tags, selectedTags).length == selectedTags.length
    if (selectedTags.length && !hasTagOverlap) {
      return COLORS.lightGray
    }

    // actually render the selected colors
    if (colorMode === 'ups') {
      return orangeGradient(ratio)
    } else if (colorMode === 'sentiment') {
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
    if (simNodes?.length !== showTopRank) {
      return chikaPosts
        .filter((node) => node.overall_rank <= showTopRank)
        .map((node) => ({
          ...node,
          radius: radiusScale(node.ups)
        }))
        .sort((b, a) => b.overall_rank - a.overall_rank) as SimulationNode[]
    }

    // default to using the simulation nodes, which already have position & vector
    return simNodes
  }

  let nodes = $derived(getNodes())
  let nodesById = $derived(_.keyBy(nodes, (d) => d.id as string))
  let selectedPost = $derived(nodesById[selectedPostId ?? ''])
  let openedPostId: string | null = $state(null)
  let openedPost = $derived(nodesById[openedPostId ?? ''])

  $inspect(selectedPost)

  export const drawContainer = ({ width }: { width?: number } = {}) => {
    if (!width) {
      width = containerWidth
    }
    const container = d3.select('#top-10').attr('width', width).attr('height', containerHeight)
    return container
      .append('g')
      .attr('width', width)
      .attr('height', containerHeight)
      .attr('id', 'top-10-group')
  }

  const positionPostPreview = () => {
    if (!selectedPostId) {
      return
    }

    const node = d3.select(`circle.top-10-item[data-post-id="${selectedPostId}"]`)
    if (!node) {
      return
    }
    const radius = Number(node.attr('r'))
    const x = Number(node.attr('cx'))
    const y = Number(node.attr('cy'))

    const boxWidth = 320
    const boxHeight = 132
    const post = d3.select('#post-preview')
    post.style('width', `${boxWidth}px`)
    post.style('height', `${boxHeight}px`)
    post.style('padding', '16px 24px')

    // if small screen, just center it
    if (containerWidth <= 640) {
      post.style('top', `${containerHeight - 20}px`)
      post.style('left', `${containerWidth / 2 - boxWidth / 2}px`)
      return
    }

    post.style('top', `${y + radius + 12}px`)
    const beforeCenter = x <= containerWidth / 2
    if (beforeCenter) {
      post.style('left', `${x - 5}px`)
    } else {
      post.style('right', `${containerWidth - x - 5}px`)
    }
  }

  interface DrawSimulationOptions {
    resetForce?: boolean
  }
  export const drawSimulation = (opts: DrawSimulationOptions = {}) => {
    const g = d3.select('g#top-10-group')

    // draw the circles
    const circles = g
      .selectChildren('circle')
      .data(nodes, (d) => (d as ChikaPost).id)
      .join(
        (enter) => {
          const circle = enter
            .append('circle')
            .attr('r', 0)
            .attr('fill', (d) => getFill(d))

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
            .attr('fill', (d) => getFill(d))
            .transition()
            .duration(120)
            .ease(d3.easeCubic)

          update
            .attr('r', (d) => d.radius)
            .transition()
            .duration(100)
          return update
        },
        (exit) => exit
      )
      .classed('top-10-item', true)
      .attr('data-post-id', (d) => d.id)

    const onSimulationTick = () => {
      circles
        .classed('with-stroke', (d) => selectedPostId === d.id)
        // force simulation sets these values
        .attr('cx', (d) => d.x ?? 0)
        .attr('cy', (d) => d.y ?? 0)
        .on('click', (_event, d) => {
          const alreadySelected = selectedPostId === d.id
          if (alreadySelected) {
            onOpenDialog(d)
          } else {
            selectedPostId = d.id
            positionPostPreview()
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
      positionPostPreview()
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
        positionPostPreview()
      })

    simulation.force('followMouse', (alpha) => {
      const hoveredNode = nodesById[hoveredPostId]
      if (!hoveredNode) {
        return
      }

      if (!hoveredNode.vx) {
        hoveredNode.vx = 0
      }
      if (!hoveredNode.vy) {
        hoveredNode.vy = 0
      }

      hoveredNode.vx += (mouse[0] - (hoveredNode.x ?? 0)) * 0.15 * alpha
      hoveredNode.vy += (mouse[1] - (hoveredNode.y ?? 0)) * 0.15 * alpha
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

  const onChangeSelectedTags = (value: string) => {
    if (value) {
      selectedTags = [value]
    } else {
      selectedTags = []
    }
    drawSimulation()
  }

  // NOTE: resizing mumbo jumbo that chatgpt gave me.
  // next time, use runed? https://runed.dev/docs
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
    // part of the resizing mumbo jumbo - i think there
    observer = new ResizeObserver(handleResize)
    if (el) observer.observe(el)

    d3.csv<any>(`${BASE_PATH}/data/chika_10.csv`, d3.autoType)
      .then((data) => {
        chikaPosts = data.map((record) => {
          return {
            ...record,
            people: (record.people ?? '').split(','),
            tags: (record.tags ?? '').split(', ')
          } as ChikaPost
        })
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
  id="top-10-wrapper"
  class="sticky w-full transform-[translateY(-40%)] sm:transform-[translateY(-50%)] lg:min-w-[1024px]"
  bind:this={el}
  onclick={(e) => {
    const target = e.target as SVGElement | HTMLElement
    const className = target.getAttribute('class') ?? ''
    if (!className.includes('top-10-item')) {
      selectedPostId = null
    }
  }}
>
  <svg id="top-10" class="z-1"> </svg>

  <div class="mt-2 flex h-[152px] flex-col items-center">
    {#if showFilters}
      <div
        id="active-filters"
        class="mt-2 flex w-fit items-start justify-center gap-2 rounded border bg-white p-4"
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
              <option value="sentiment">color by reaction</option>
            </select>
          </div>
          <div id="select-person-wrapper">
            <select
              name="select-person"
              class={{
                rounded: true,
                'w-full': true,
                'px-1': true,
                'text-gray-500': !selectedPeople.length
              }}
              value={selectedPeople[0] ?? ''}
              onchange={(e) => {
                onChangeSelectedPeople(e.currentTarget.value)
              }}
            >
              <option value="">(filter by subject)</option>
              {#each peopleOptions as option}
                <option value={option.subject}>{option.subject}</option>
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
              <option value="">(filter by reaction)</option>
              {#each Object.entries(REACTIONS) as [key]}
                <option value={key}>{key}</option>
              {/each}
            </select>
          </div>
          <div id="select-tag-wrapper">
            <select
              name="select-tag"
              value={selectedTags[0] ?? ''}
              class={{
                'w-full': true,
                rounded: true,
                'px-1': true,
                'text-gray-500': !selectedTags.length
              }}
              onchange={(e) => {
                onChangeSelectedTags(e.currentTarget.value)
              }}
            >
              <option value="">(filter by other tags)</option>
              {#each TAGS as tag}
                <option value={tag}>{tag}</option>
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
      <p class="line-clamp-1">Subject: {(selectedPost.people ?? []).join(', ') || 'none'}</p>
      <p>Response: {selectedPost.reaction}</p>
      <p class="mt-2"><i>(click for more details)</i></p>
    </button>
  {/if}

  <dialog id="post-dialog" closedby="any">
    {#if openedPost}
      <div class="flex w-full">
        <button class="ml-auto cursor-pointer" onclick={onCloseDialog}>x</button>
      </div>
      <h3 class="text-2xl font-semibold">{openedPost.title}</h3>
      <div id="post-details" class="font-mono text-sm">
        <p>
          {openedPost.ups.toLocaleString()} upvotes • {openedPost.num_comments.toLocaleString()} comments
        </p>
        <p>
          Posted on {new Date(openedPost.date).toLocaleDateString()}
        </p>
        <p>
          <a
            href={openedPost.permalink}
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm hover:underline"
          >
            View on Reddit
          </a>
        </p>
      </div>

      <div id="post-selftext" class="flex flex-col gap-2 py-4 text-sm">
        {#if openedPost.selftext}
          {@html marked(openedPost.selftext)}
        {:else}
          <p class="mt-2 text-center text-gray-500"><i>(this post has no description)</i></p>
        {/if}
      </div>
      <div class="mb-4 flex justify-center"></div>
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

    div#post-details {
      margin-top: 12px;
      p {
        margin-bottom: 2px;
      }
    }

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
    z-index: 10;
  }

  #active-filters select {
    min-width: 320px;
    -webkit-appearance: 'menulist';
    -moz-appearance: 'menulist';
    appearance: 'menulist';
  }

  :global {
    svg#top-10 {
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
