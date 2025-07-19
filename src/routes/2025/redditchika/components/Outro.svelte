<script>
  import { marked } from 'marked'
  import outroText from '../text/outro.md?raw'
</script>

<section id="outro" class="mb-20">
  <div class="app-prose">
    {@html marked(outroText)}
  </div>
  <div class='mt-20 text-center'>
    TODO footer / nav
  </div>
</section>

