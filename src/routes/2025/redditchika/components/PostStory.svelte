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
        step: 'section#posts-story .story-step',
        offset: 0.7,
      })
      .onStepEnter(({ element, index }) => {
        currentStep = index
        const dataPeople = element.attributes.getNamedItem('data-selected-people')?.value
        const dataResetForce = element.attributes.getNamedItem('data-reset-force')?.value

        let resetForce = false
        if (currentStep === null) {
          return
        }

        if (currentStep >= 3) {
          showOnlyTop10 = false
        } else {
          showOnlyTop10 = true
        }

        if (typeof dataPeople === 'string') {
          selectedPeople = dataPeople.split(', ').filter(Boolean)
        }

        if (typeof dataResetForce === 'string') {
          resetForce = dataResetForce === 'true'
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

  <div class='story-step'></div>

  <ChikaPosts bind:selectedPeople bind:showOnlyTop10 bind:this={instance} />

  <div class="story-step storyblock with-spacer" data-selected-people='Christopher Diwata'>
    <p>
      The most upvoted post of all-time on the subreddit has people celebrating the recent brand
      deals and successes of <strong>Christopher Diwata</strong>, AKA “what hafen vella?,” “Taylor
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
      <strong>Kathryn Bernardo</strong> is the most mentioned and upvoted person in r/ChikaPH.
    </p>
    <p>note: could make this a little quiz?</p>
  </div>

  <div class="story-step storyblock with-spacer" data-selected-people=''>
    <p>
      While ChikaPH is mainly a gossip subreddit, people don’t just respond strongly to shock and speculation.
    </p>
  </div>

  <div class="h-[2000px]"></div>
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
