<script>
  import { marked } from 'marked'
  import introText from '../text/intro.md?raw'
</script>

<div id="title" class="mt-10 mb-4 text-center font-serif">
  <h1 class="m-auto mb-4 text-3xl font-bold">ano chika?!</h1>
  <div class='italic font-light'>
    <p>a glimpse into the Filipino pop culture psyche through r/ChikaPH</p>
    <p>by Benj Ledesma</p>
  </div>
</div>

<section id="intro" class="app-prose">
  <div class="callout my-8 rounded border border-gray-300 p-4">
    <div>
      <span class="text-xl"> chi·ka </span>
    </div>
    <div class="text-gray-500">gossip; rumors; chit-chat.</div>
  </div>
  {@html marked(introText)}
</section>
