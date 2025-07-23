<script lang="ts">
  import { onMount } from 'svelte'
  import scrollama from 'scrollama'
  import ChikaPosts  from './ChikaPosts.svelte'
  import type { ColorMode } from './_types'

  let currentStep = $state<number | null>(null)
  let selectedPeople = $state<string[]>([])
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
        const dataResetForce = element.attributes.getNamedItem('data-reset-force')?.value
        const dataColorMode = element.attributes.getNamedItem('data-color-mode')?.value

        let resetForce = false
        if (currentStep === null) {
          return
        }

        if (currentStep >= 3) {
          // no turning back
          showOnlyTop10 = false
        }

        if (typeof dataPeople === 'string') {
          selectedPeople = dataPeople.split(', ').filter(Boolean)
        }

        if (typeof dataResetForce === 'string') {
          resetForce = dataResetForce === 'true'
        }

        if (typeof dataColorMode === 'string') {
          colorMode = dataColorMode as ColorMode
        }

        instance.drawSimulation({ resetForce })
      })
  }

  $inspect(selectedPeople)

  onMount(() => {
    setupScrolly()
  })
</script>

<section id="posts-story" class="flex w-full max-w-screen flex-col items-center">
  <div class="h-[40vh]"></div>

  <ChikaPosts bind:selectedPeople bind:showOnlyTop10 bind:colorMode bind:this={instance} />

  <div class='story-step storyblock with-spacer' data-selected-people=''>
    <p>
      Posts with more upvotes appear as larger and darker circles, while posts with fewer upvotes are smaller & lighter.
    </p>
  </div>

  <div class="story-step storyblock with-spacer" data-selected-people='Christopher Diwata'>
    <p>
      The most upvoted post of all-time on the subreddit has people celebrating the recent brand
      deals and successes of <strong>Christopher Diwata</strong>, AKA “what haffen vella?,” “Taylor
      Laughter,” and many other names.
    </p>
  </div>

  <div class="story-step storyblock with-spacer" data-selected-people='Maris Racal, Anthony Jennings'>
    <p>
      The <strong>Anthony & Maris</strong> issue last year also made huge waves—at the time it felt like
      everyone was glued to their screens waiting for the next update, spilling new info and tea over
      dinner catchups and Christmas parties. (Friends would also browse through polarizing comments on
      the posts and give their own takes.)
    </p>
  </div>

  <div class="story-step storyblock with-spacer" data-selected-people=''>
    <p>
      Is there more to ChikaPH than celebrities and politics? Does the sub tend to talk about
      certain people or topics over others?
    </p>
    <p>
      Looking into the <strong>top 10 posts per month</strong> gives us a much larger sample size to
      work with.
    </p>
  </div>

  <div class="story-step storyblock with-spacer" data-selected-people='Christopher Diwata, Maris Racal, Anthony Jennings'>
    <p>
      Who's talked about the most often?
    </p>
    <p>
      <strong>Christopher Diwata</strong> and <strong>Anthony & Maris</strong> are mentioned a fair bit in the hottest posts...
    </p>
  </div>

  <div class="story-step storyblock with-spacer" data-selected-people='Leni Robredo, Vico Sotto'>
    <p>
      Politicians like <strong>Leni Robredo</strong> and <strong>Vico Sotto</strong> also have their share of screen time.
    </p>
  </div>

  <div class="story-step storyblock with-spacer" data-selected-people='Kathryn Bernardo'>
    <p>
      <strong>Kathryn Bernardo</strong>, though she doesn't make top headlines, is the most mentioned and upvoted person in the sub's top 10 monthly posts.
    </p>
    <p>note: could make this a little quiz?</p>
  </div>

  <div class="story-step storyblock with-spacer" data-selected-people='' data-color-mode='ups'>
    <p>
      While ChikaPH is mainly a gossip subreddit, people don’t just respond strongly to shock and speculation. Let's look more into how people are reacting to posts...
    </p>
  </div>

  <div class="story-step storyblock with-spacer" data-selected-people='' data-color-mode='sentiment'>
    <p><strong class='text-green-500'>Green</strong> circles are posts with mostly <span class='text-green-500'>positive</span> reactions like excitement and support.</p> 
    <p><strong class='text-red-500'>Red</strong> circles are posts with mostly <span class='text-red-500'>negative</span> reactions like anger, sadness, and annoyance.</p> 
    <p><strong class='text-gray-800'>Gray</strong> circles are posts with <span class='text-gray-800'>mixed or ambiguous</span> reactions like feeling shocked or simply interested.</p> 
  </div>

  <div class="story-step storyblock with-spacer">
    <p>
      To my surprise, most of the top posts on this gossip subreddit have positive reactions in the comments sections and the posts themselves.
    </p>
  </div>

  <div class="story-step storyblock with-spacer">
    <p>
      TODO: handpick highlighted posts
    </p>
  </div>

  <div class="story-step storyblock with-spacer">
    <p>
      TODO: expose filter controls & let user play around
    </p>
  </div>

  <div class='with-spacer'></div>
</section>

<style>
  .storyblock {
    background-color: var(--color-gray-500);
    color: #f9fafb;
    padding: 12px 24px;
    border-radius: 12px;
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
