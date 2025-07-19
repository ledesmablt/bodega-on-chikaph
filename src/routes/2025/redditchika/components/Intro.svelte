<script>
  import { marked } from 'marked'
  import introText from '../text/intro.md?raw'
</script>

<section id="intro" class="prose">
  <div id="title" class="mt-10">
    <h1 class="m-auto text-center">ano chika?!</h1>
  </div>

  <div class="callout p-4 rounded border border-gray-300">
    <div>
      <span class='text-xl'>
        chi·ka
      </span>
    </div>
    <div class='text-gray-500'>
      gossip; rumors; chit-chat.
    </div>
  </div>
  {@html marked(introText)}
</section>
