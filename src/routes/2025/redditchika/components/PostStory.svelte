<script lang="ts">
  import { onMount } from 'svelte'
  import * as d3 from 'd3'
  import scrollama from 'scrollama'
  import ChikaPosts from './ChikaPosts.svelte'
  import type { ColorMode, Sentiment } from './_types'

  let currentStep = $state<number | null>(null)
  let selectedPeople = $state<string[]>([])
  let selectedSentiments = $state<Sentiment[]>([])
  let selectedTags = $state<string[]>([])
  let selectedPostId = $state<string | null>(null)
  let showTopRank = $state(0)
  let colorMode = $state<ColorMode>('ups')
  let showFilters = $state(false)
  let instance = $state<any>()

  const setupScrolly = () => {
    const scroller = scrollama()
    scroller
      .setup({
        step: 'section#posts-story .story-step',
        offset: 0.7
      })
      .onStepEnter(({ element, index }) => {
        currentStep = index
        const dataShowTop = Number(element.attributes.getNamedItem('data-show-top')?.value)
        const dataPeople = element.attributes.getNamedItem('data-selected-people')?.value
        const dataColorMode = element.attributes.getNamedItem('data-color-mode')?.value
        const dataSelectedPostId = element.attributes.getNamedItem('data-selected-post-id')?.value
        const dataSelectedSentiment = element.attributes.getNamedItem(
          'data-selected-sentiments'
        )?.value
        const dataSelectedTags = element.attributes.getNamedItem('data-selected-tags')?.value
        const dataShowFilters = element.attributes.getNamedItem('data-show-filters')?.value

        if (currentStep === null) {
          return
        }

        let resetForce = false
        let shouldRedraw = false

        if (!isNaN(dataShowTop)) {
          if (showTopRank !== dataShowTop) {
            resetForce = true
          }
          showTopRank = Math.max(dataShowTop, showTopRank)
          shouldRedraw = true
        }

        if (typeof dataPeople === 'string') {
          selectedPeople = dataPeople.split(', ').filter(Boolean)
          shouldRedraw = true
        }

        if (typeof dataColorMode === 'string') {
          colorMode = dataColorMode as ColorMode
          shouldRedraw = true
        }

        if (typeof dataSelectedPostId === 'string') {
          selectedPostId = dataSelectedPostId
          shouldRedraw = true
        }

        if (typeof dataSelectedTags === 'string') {
          selectedTags = dataSelectedTags.split(',').filter(Boolean)
          shouldRedraw = true
        }

        if (typeof dataSelectedSentiment === 'string') {
          selectedSentiments = dataSelectedSentiment.split(', ').filter(Boolean) as Sentiment[]
          shouldRedraw = true
        }

        if (dataShowFilters === 'true') {
          showFilters = true
        } else if (dataShowFilters === 'false') {
          showFilters = false
        }

        if (shouldRedraw) {
          instance.drawSimulation({ resetForce })
        }
      })
  }

  const setHeight = (newHeight: number) => {
    const spacing = Math.round(newHeight * 0.8)
    d3.selectAll('#posts-story div.with-spacer').style('margin-bottom', `${spacing}px`)

    // set the sticky element's `top` here because doing something like `top: 50%`
    // causes wonky repositioning on mobile
    d3.select('#posts-story #top-10-wrapper').style('top', `${Math.round(newHeight / 2)}px`)
  }

  onMount(() => {
    setupScrolly()
    // use this instead of vh because vh is wonky and causes responsiveness issues
    // on mobile. yes, this means resizing vertically won't be as nice, but what are
    // the odds.
    setHeight(window.innerHeight)

    // const onResizeWindow = () => {
    //   onResizeHeight(window.innerHeight)
    // }
    // window.addEventListener('resize', onResizeWindow)
    // return () => {
    //   window.removeEventListener('resize', onResizeWindow)
    // }
  })
</script>

<section id="posts-story" class="flex w-full max-w-screen flex-col items-center">
  <p id="scroll-to-continue" class="mt-12 min-h-8 text-center font-mono text-sm text-gray-500">
    {#if currentStep === null}
      ↓ scroll to keep reading
    {:else}
      {''}
    {/if}
  </p>

  <div class="h-120"></div>

  <ChikaPosts
    bind:selectedPeople
    bind:showTopRank
    bind:colorMode
    bind:selectedPostId
    bind:selectedSentiments
    bind:showFilters
    bind:selectedTags
    bind:this={instance}
  />

  <div class="story-step storyblock with-spacer" data-selected-people="" data-show-top="30">
    <p>
      <i>
        Posts with more upvotes appear as larger and darker circles, while posts with fewer upvotes
        are smaller & lighter.
      </i>
    </p>
  </div>

  <div
    class="story-step storyblock with-spacer"
    data-selected-people="Christopher Diwata"
    data-selected-post-id="1l26i30"
  >
    <p>
      The most upvoted post of all-time on the subreddit has people celebrating the recent brand
      deals and successes of <strong>Christopher Diwata</strong>, made popular by the meme “what
      haffen vella?”.
    </p>
  </div>

  <div
    class="story-step storyblock with-spacer"
    data-selected-people="Maris Racal, Anthony Jennings"
    data-selected-post-id="1h5ofsd"
    data-show-top="30"
  >
    <p>
      The <strong>Anthony & Maris</strong> issue also made waves — at the time it felt like everyone
      was glued to their screens waiting for the next update, spilling breaking news over parties and
      dinner catchups.
    </p>
  </div>

  <div
    class="story-step storyblock with-spacer"
    data-selected-people=""
    data-selected-post-id=""
    data-show-top="180"
  >
    <p>
      Is there more to r/ChikaPH than celebrities and politics? Does the sub lean towards certain
      people or topics?
    </p>
    <p>
      Looking into the <strong>top 10 posts per month</strong>, for a total of 180 posts, might give
      us a better idea.
    </p>
  </div>

  <div
    class="story-step storyblock with-spacer"
    data-selected-people="Christopher Diwata, Maris Racal, Anthony Jennings"
    data-selected-post-id=""
  >
    <p>How often are topics brought up?</p>
    <p>
      <strong>Christopher Diwata</strong> and <strong>Anthony & Maris</strong> appear in more posts beyond
      the top 30.
    </p>
  </div>

  <div
    class="story-step storyblock with-spacer"
    data-selected-people="Leni Robredo, Vico Sotto"
    data-selected-post-id="1f7hnov"
  >
    <p>
      Politicians like <strong>Vico Sotto</strong> and <strong>Leni Robredo</strong> also have their
      share of screen time.
    </p>
  </div>

  <div
    class="story-step storyblock with-spacer"
    data-selected-people="Kathryn Bernardo"
    data-selected-post-id="1g719o8"
  >
    <p>
      <strong>Kathryn Bernardo</strong>, though she doesn't make top headlines, is the most
      mentioned person in the dataset.
    </p>
  </div>

  <div
    class="story-step storyblock with-spacer"
    data-selected-people=""
    data-color-mode="ups"
    data-selected-post-id=""
  >
    <p>
      While r/ChikaPH is mainly a gossip subreddit, people don’t only talk about shock and
      speculation. Let's look more into what else users are saying...
    </p>
  </div>

  <div
    class="story-step storyblock with-spacer"
    data-selected-people=""
    data-color-mode="sentiment"
    data-selected-sentiments=""
  >
    <p>
      <strong class="bg-green-500 px-1">Green</strong> circles are posts with mostly
      <strong class="bg-green-500 px-1">positive</strong> reactions like excitement and support.
    </p>
    <p>
      <strong class="bg-red-500 px-1">Red</strong> circles are posts with mostly
      <strong class="bg-red-500 px-1">negative</strong> reactions like anger, sadness, and annoyance.
    </p>
    <p>
      <strong class="bg-gray-700 px-1">Gray</strong> circles are posts with
      <strong class="bg-gray-700 px-1">mixed or ambiguous</strong> reactions like feeling shocked or
      simply expressing interest.
    </p>
  </div>

  <div
    class="story-step storyblock with-spacer"
    data-color-mode="sentiment"
    data-selected-sentiments="positive"
    data-selected-post-id=""
  >
    <p>
      To my surprise, most of the top posts on this gossip subreddit have positive responses in the
      comments and the posts themselves.
    </p>
  </div>

  <div
    class="story-step storyblock with-spacer"
    data-color-mode="sentiment"
    data-selected-sentiments="positive"
    data-selected-post-id="1jrc5ft"
  >
    <p>The community loves a celebrity fashion photoshoot...</p>
  </div>

  <div
    class="story-step storyblock with-spacer"
    data-color-mode="sentiment"
    data-selected-sentiments="positive"
    data-selected-post-id="1l7vcq3"
  >
    <p>... and loves chiming in to courtroom drama.</p>
  </div>

  <div
    class="story-step storyblock with-spacer"
    data-color-mode="sentiment"
    data-selected-sentiments="positive"
    data-selected-post-id="1k6pq5g"
  >
    <p>To my surprise, not all headlines in r/ChikaPH are about celebrities and politics.</p>
  </div>

  <div
    class="story-step storyblock with-spacer"
    data-color-mode="sentiment"
    data-selected-sentiments="positive"
    data-selected-post-id="1jwtvqy"
  >
    <p>
      And it's nice to see the community expressing respect and support for people going through
      difficult circumstances.
    </p>
  </div>

  <div
    class="story-step storyblock with-spacer"
    data-color-mode="sentiment"
    data-selected-sentiments="negative"
    data-selected-post-id="1big0i4"
  >
    <p>
      On the other hand, there are moments when the community rallies together and cries for
      justice...
    </p>
  </div>

  <div
    class="story-step storyblock with-spacer"
    data-color-mode="sentiment"
    data-selected-sentiments="negative"
    data-selected-post-id="1f9t7u0"
  >
    <p>... expresses disapproval and annoyance...</p>
  </div>

  <div
    class="story-step storyblock with-spacer"
    data-color-mode="sentiment"
    data-selected-sentiments="negative"
    data-selected-post-id="1igf9m1"
  >
    <p>... grieves together...</p>
  </div>

  <div
    class="story-step storyblock with-spacer"
    data-color-mode="sentiment"
    data-selected-sentiments="negative"
    data-selected-post-id="1dbkego"
    data-selected-tags=""
  >
    <p>... or even just hates on the same influencers.</p>
  </div>

  <div
    class="story-step storyblock with-spacer"
    data-color-mode="sentiment"
    data-selected-sentiments="neutral"
    data-selected-post-id="1h8g952"
    data-selected-tags="cheating"
  >
    <p>
      Of course, r/ChikaPH wouldn't be complete without the <i>chika</i> — especially around scandals.
    </p>
  </div>

  <div
    class="story-step storyblock with-spacer"
    data-color-mode="sentiment"
    data-selected-sentiments="neutral"
    data-selected-post-id="193a39s"
    data-selected-tags="cheating"
  >
    <p>Many enjoy speculating about an impending breakup...</p>
  </div>

  <div
    class="story-step storyblock with-spacer"
    data-color-mode="sentiment"
    data-selected-sentiments="positive"
    data-selected-post-id="1bu2vby"
    data-selected-tags="speculation,lovelife"
  >
    <p>... while some might believe that love is in the air.</p>
  </div>

  <div
    class="story-step storyblock with-spacer"
    data-color-mode="sentiment"
    data-selected-people=""
    data-selected-sentiments="neutral"
    data-selected-post-id="1l4yu8s"
    data-show-filters="false"
    data-selected-tags=""
  >
    <p>
      Drama aside, it's also amusing to see posts with more nuanced discussions, like this 4000-word
      essay on BINI (which also has my <a
        rel="noreferrer"
        target="_blank"
        class="underline"
        href="https://www.reddit.com/r/ChikaPH/comments/1l4yu8s/comment/mwdcaxh/"
        >favorite comment</a
      > from the sub).
    </p>
  </div>

  <div
    class="story-step storyblock with-spacer"
    data-color-mode="ups"
    data-selected-people=""
    data-selected-sentiments=""
    data-selected-post-id=""
    data-selected-tags=""
    data-show-filters="true"
  >
    <p>
      <i>Use the filters below to interact with the dataset.</i>
    </p>
  </div>

  <div class="with-spacer"></div>
</section>

<style>
  .storyblock {
    background-color: #475569; /* slate-600 */
    color: #f9fafb;
    padding: 12px 24px;
    width: 360px;
    z-index: 100;
    display: flex;
    flex-direction: column;
    gap: 8px;
    line-height: 1.5;
  }
</style>
