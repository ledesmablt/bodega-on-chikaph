<script lang="ts">
  import { onMount } from 'svelte'
  import scrollama from 'scrollama'
  import ChikaPosts from './ChikaPosts.svelte'

  let currentStep = $state(0)

  const setupScrolly = () => {
    const scroller = scrollama()
    scroller
      .setup({
        step: 'section#posts-story .story-step'
      })
      .onStepEnter(({ element }) => {
        currentStep = Number(element.attributes.getNamedItem('data-step')?.value || currentStep)
      })
  }

  $effect(() => {
    if (currentStep === 1) {
      const elem: HTMLButtonElement | null = document.querySelector('#controls #toggle-top10')
      elem?.click()
    }
  })

  $inspect(currentStep)

  onMount(() => {
    setupScrolly()
  })
</script>

<section id="posts-story" class="flex w-full max-w-screen flex-col items-center">
  <div class="h-[40vh]"></div>

  <ChikaPosts />

  <div class="spacer"></div>

  <div class="story-step">
    <p>
      The most upvoted post of all-time on the subreddit has people celebrating the recent brand
      deals and successes of <strong>Christopher Diwata</strong>, AKA “what hafen vella?,” “Taylor
      Laughter,” and many other names.
    </p>
  </div>

  <div class="spacer"></div>

  <div class="story-step">
    <p>
      The <strong>Anthony & Maris</strong> issue last year also made huge waves—at the time it felt like
      everyone was glued to their screens waiting for the next update, spilling new info and tea over
      dinner catchups and Christmas parties. (Friends would also browse through polarizing comments on
      the posts and give their own takes.)
    </p>
  </div>

  <div class="spacer"></div>

  <div class="story-step" data-step={1}>
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
