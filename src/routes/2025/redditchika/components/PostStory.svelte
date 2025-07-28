<script lang="ts">
  import { onMount } from 'svelte'
  import scrollama from 'scrollama'
  import ChikaPosts from './ChikaPosts.svelte'
  import type { ColorMode, Sentiment } from './_types'

  let currentStep = $state<number | null>(null)
  let selectedPeople = $state<string[]>([])
  let selectedSentiments = $state<Sentiment[]>([])
  let selectedPostId = $state<string | null>(null)
  let showOnlyTop10 = $state(true)
  let colorMode = $state<ColorMode>('ups')
  let instance = $state<any>()

  const setupScrolly = () => {
    const scroller = scrollama()
    scroller
      .setup({
        step: 'section#posts-story .story-step',
        offset: 0.7,
      })
      .onStepEnter(({ element, index }) => {
        currentStep = index
        const dataPeople = element.attributes.getNamedItem('data-selected-people')?.value
        const dataColorMode = element.attributes.getNamedItem('data-color-mode')?.value
        const dataSelectedPostId = element.attributes.getNamedItem('data-selected-post-id')?.value
        const dataSelectedSentiment = element.attributes.getNamedItem('data-selected-sentiments')?.value

        if (currentStep === null) {
          return
        }

        let resetForce = false
        let shouldRedraw = false

        if (currentStep >= 3) {
          // no turning back
          if (showOnlyTop10) {
            resetForce = true
          }
          showOnlyTop10 = false
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

        if (typeof dataSelectedSentiment === 'string') {
          selectedSentiments = dataSelectedSentiment.split(', ').filter(Boolean)
          shouldRedraw = true
        }

        if (shouldRedraw) {
          instance.drawSimulation({ resetForce })
        }
      })
  }

  onMount(() => {
    setupScrolly()
  })
</script>

<section id="posts-story" class="flex w-full max-w-screen flex-col items-center">
  <div class="h-[40vh]"></div>

  <ChikaPosts
    bind:selectedPeople
    bind:showOnlyTop10
    bind:colorMode
    bind:selectedPostId
    bind:selectedSentiments
    bind:this={instance}
  />

  <div class="story-step storyblock with-spacer" data-selected-people="">
    <p>
      Posts with more upvotes appear as larger and darker circles, while posts with fewer upvotes
      are smaller & lighter.
    </p>
  </div>

  <div
    class="story-step storyblock with-spacer"
    data-selected-people="Christopher Diwata"
    data-selected-post-id="1l26i30"
  >
    <p>
      The most upvoted post of all-time on the subreddit has people celebrating the recent brand
      deals and successes of <strong>Christopher Diwata</strong>, AKA “what haffen vella?” and
      “Taylor Laughter.”
    </p>
  </div>

  <div
    class="story-step storyblock with-spacer"
    data-selected-people="Maris Racal, Anthony Jennings"
    data-selected-post-id="1h5ofsd"
  >
    <p>
      The <strong>Anthony & Maris</strong> issue last year also made huge waves—at the time it felt like
      everyone was glued to their screens waiting for the next update, spilling new info and tea over
      dinner catchups and Christmas parties. (Friends would also browse through polarizing comments on
      the posts and give their own takes.)
    </p>
  </div>

  <div class="story-step storyblock with-spacer" data-selected-people="" data-selected-post-id="">
    <p>
      Is there more to ChikaPH than celebrities and politics? Does the sub tend to talk about
      certain people or topics over others?
    </p>
    <p>
      Looking into the <strong>top 10 posts per month</strong> gives us a much larger sample size to
      work with.
    </p>
  </div>

  <div
    class="story-step storyblock with-spacer"
    data-selected-people="Christopher Diwata, Maris Racal, Anthony Jennings"
    data-selected-post-id=""
  >
    <p>Who's talked about the most often?</p>
    <p>
      <strong>Christopher Diwata</strong> and <strong>Anthony & Maris</strong> are mentioned a fair bit
      in the hottest posts...
    </p>
  </div>

  <div
    class="story-step storyblock with-spacer"
    data-selected-people="Leni Robredo, Vico Sotto"
    data-selected-post-id="1f7hnov"
  >
    <p>
      Politicians like <strong>Leni Robredo</strong> and <strong>Vico Sotto</strong> also have their
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
      mentioned and upvoted person in the sub's top 10 monthly posts.
    </p>
    <p>note: could make this a little quiz?</p>
  </div>

  <div
    class="story-step storyblock with-spacer"
    data-selected-people=""
    data-color-mode="ups"
    data-selected-post-id=""
  >
    <p>
      While ChikaPH is mainly a gossip subreddit, people don’t just respond strongly to shock and
      speculation. Let's look more into how people are reacting to posts...
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
      simply interested.
    </p>
  </div>

  <div class="story-step storyblock with-spacer" data-color-mode="sentiment" data-selected-sentiments="positive">
    <p>
      To my surprise, most of the top posts on this gossip subreddit have positive reactions in the
      comments sections and the posts themselves.
    </p>
  </div>

  <div class="story-step storyblock with-spacer" data-color-mode="sentiment" data-selected-sentiments="positive" data-selected-post-id="1jrc5ft">
    <p>Of course, and everyone loves a good glow-up...</p>
    <p>TODO: filter for glowup related posts?</p>
  </div>

  <div class="story-step storyblock with-spacer" data-color-mode="sentiment" data-selected-sentiments="positive" data-selected-post-id="1l7vcq3">
    <p>... and reddit is all ears for courtroom drama.</p>
  </div>

  <div class="story-step storyblock with-spacer" data-color-mode="sentiment" data-selected-sentiments="positive" data-selected-post-id="1k6pq5g">
    <p>To my surprise, not all headlines in ChikaPH are about celebrities politics - even Pope Francis made headlines around the time of his passing.</p>
  </div>

  <div class="story-step storyblock with-spacer" data-color-mode="sentiment" data-selected-sentiments="positive" data-selected-post-id="1jwtvqy">
    <p>Most heartwarming of all, it's nice to see the community expressing respect and support for people powering through difficult circumstances.</p>
  </div>

  <div class="story-step storyblock with-spacer" data-color-mode="sentiment" data-selected-sentiments="negative" data-selected-post-id="1big0i4">
    <p>There are moments when the community rallies together and cries for justice...</p>
  </div>

  <div class="story-step storyblock with-spacer" data-color-mode="sentiment" data-selected-sentiments="negative" data-selected-post-id="1f9t7u0">
    <p>... expresses disapproval and annoyance...</p>
  </div>

  <div class="story-step storyblock with-spacer" data-color-mode="sentiment" data-selected-sentiments="negative" data-selected-post-id="1igf9m1">
    <p>... grieves together...</p>
  </div>

  <div class="story-step storyblock with-spacer" data-color-mode="sentiment" data-selected-sentiments="negative" data-selected-post-id="1dbkego">
    <p>... or even just hates on the same influencers.</p>
  </div>

  <div class="story-step storyblock with-spacer" data-color-mode="sentiment" data-selected-sentiments="neutral" data-selected-post-id="1kxo4dd">
    <p>Of course, <i>chika</i> means gossip, and the Filipino internet loves its scandals.</p>
    <p>TODO: footnote on why "shocking" is tagged as neutral</p>
    <p>TODO: filter for scandals</p>
  </div>

  <div class="story-step storyblock with-spacer" data-color-mode="sentiment" data-selected-sentiments="neutral" data-selected-post-id="194h84i">
    <p>We also love speculating on if a breakup is about to happen...</p>
  </div>

  <div class="story-step storyblock with-spacer" data-color-mode="sentiment" data-selected-sentiments="neutral" data-selected-post-id="194tkza">
    <p>... why it might happen...</p>
  </div>

  <div class="story-step storyblock with-spacer" data-color-mode="sentiment" data-selected-sentiments="neutral" data-selected-post-id="1clbysh">
    <p>... or even if a new loveteam might be coming around.</p>
  </div>

  <div class="story-step storyblock with-spacer" data-color-mode="sentiment" data-selected-sentiments="neutral" data-selected-post-id="1l4yu8s">
    <p>It was also amusing to see posts with more complex discussions - a [insert word count] word essay on BINI (and my <a rel="noreferrer" target="_blank" href="https://www.reddit.com/r/ChikaPH/comments/1l4yu8s/comment/mwdcaxh/">favorite comment</a> from this research)...</p>
  </div>

  <div class="story-step storyblock with-spacer" data-color-mode="sentiment" data-selected-sentiments="neutral" data-selected-post-id="1hzx3ml">
    <p>... and people criticizing corporations' acts of generosity actually being "marketing tactics".</p>
  </div>

  <div class="story-step storyblock with-spacer" data-color-mode="ups" data-selected-sentiments="" data-selected-post-id="">
    <p>TODO: expose filter controls & let user play around</p>
  </div>

  <div class="story-step storyblock with-spacer">
    <p>The breadth of topics in the ChikaPH subreddit extends beyond just gossip or celebrity news -- there's a lot going on, and it's </p>
    <p>TODO: put this in conclusion?</p>
  </div>

  <div class="with-spacer"></div>
</section>

<style>
  .storyblock {
    background-color: var(--color-gray-600);
    color: #f9fafb;
    padding: 12px 24px;
    width: 360px;
    z-index: 100;
    display: flex;
    flex-direction: column;
    gap: 8px;
    line-height: 24px;
  }

  .with-spacer {
    margin-bottom: 80vh;
  }
</style>
