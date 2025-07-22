<script lang="ts">
  import { onMount } from 'svelte'
  import scrollama from 'scrollama'
  import ChikaPosts from './ChikaPosts.svelte'

  let currentStep = $state<number | null>(null)
  let selectedPeople = $state<string[]>([])
  let showOnlyTop10 = $state(true)
  let instance = $state<any>()

  const setupScrolly = () => {
    const scroller = scrollama()
    scroller
      .setup({
        step: 'section#posts-story [data-step]',
        offset: 0.7
      })
      .onStepEnter(({ element }) => {
        currentStep = Number(element.attributes.getNamedItem('data-step')?.value || currentStep)

        let resetForce = false
        if (currentStep === null) {
          return
        } else if (currentStep === 0) {
          selectedPeople = []
        } else if (currentStep === 1) {
          selectedPeople = ['Christopher Diwata']
        } else if (currentStep === 2) {
          selectedPeople = ['Maris Racal', 'Anthony Jennings']
          showOnlyTop10 = true
        } else if (currentStep === 3) {
          selectedPeople = []
          showOnlyTop10 = false
          resetForce = true
        }

        instance.drawSimulation({ resetForce })
      })
  }

  onMount(() => {
    setupScrolly()
  })
</script>

<section id="posts-story" class="flex w-full max-w-screen flex-col items-center">
  <div class="h-[40vh]"></div>

  <div data-step={0}></div>

  <ChikaPosts bind:selectedPeople bind:showOnlyTop10 bind:this={instance} />

  <div class="spacer"></div>

  <div class="story-step" data-step={1}>
    <p>
      The most upvoted post of all-time on the subreddit has people celebrating the recent brand
      deals and successes of <strong>Christopher Diwata</strong>, AKA “what hafen vella?,” “Taylor
      Laughter,” and many other names.
    </p>
  </div>

  <div class="spacer"></div>

  <div class="story-step" data-step={2}>
    <p>
      The <strong>Anthony & Maris</strong> issue last year also made huge waves—at the time it felt like
      everyone was glued to their screens waiting for the next update, spilling new info and tea over
      dinner catchups and Christmas parties. (Friends would also browse through polarizing comments on
      the posts and give their own takes.)
    </p>
  </div>

  <div class="spacer"></div>

  <div class="story-step" data-step={3}>
    <p>
      Is there more to ChikaPH than celebrities and politics? Does the sub tend to talk about
      certain people or topics over others?
    </p>
    <p>
      Looking into the <strong>top 10 posts per month</strong> gives us a much larger sample size to
      work with.
    </p>
  </div>

  <div class="spacer"></div>

  <div class="h-[2000px]"></div>
</section>

<style>
  .story-step {
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

  .spacer {
    height: 80vh;
  }
</style>
