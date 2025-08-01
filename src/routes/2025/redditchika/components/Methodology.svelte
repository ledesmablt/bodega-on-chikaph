<script>
  import MethodologyText from './_methodology.md'
</script>

<section id="methodology">
  <div id="methodology-inner">
    <MethodologyText/>
  </div>
</section>

<style>
  section#methodology {
    font-family: var(--font-serif);
    font-size: 14px;
    line-height: 1.75;
    margin: 0 40px;
    padding: 12px 24px;
    border: 1px solid black;
    border-radius: 8px;
    background-color: white;

    :global {
      h1 {
        font-size: 16px;
        font-weight: bold;
      }

      h2 {
        margin-bottom: 2px;
        font-weight: bold;
        margin-top: 18px;
      }

      h2:first-of-type {
        margin-top: 8px;
      }

      p {
        margin-bottom: 8px;
      }

      ul {
        margin: 12px 0;
        list-style-type: disc;
        list-style-position: inside;
      }
    }

  }
</style>
