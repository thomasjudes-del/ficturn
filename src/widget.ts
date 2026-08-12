export const WIDGET_URI = "ui://ficturn/reader.html";
export const WIDGET_MIME = "text/html;profile=mcp-app";

export const WIDGET_HTML = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: ui-serif, Georgia, Cambria, "Times New Roman", serif;
    background: transparent;
    color: inherit;
  }
  .reader {
    max-width: 720px;
    margin: 0 auto;
    padding: 18px 18px 14px;
    border: 1px solid color-mix(in srgb, currentColor 15%, transparent);
    border-radius: 18px;
    background: color-mix(in srgb, Canvas 96%, transparent);
  }
  .brand {
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 11px;
    letter-spacing: .16em;
    text-transform: uppercase;
    opacity: .58;
    margin-bottom: 14px;
  }
  h1 {
    font-size: 25px;
    line-height: 1.08;
    margin: 0 0 5px;
    font-weight: 650;
  }
  .meta {
    font-family: ui-sans-serif, system-ui, sans-serif;
    font-size: 12px;
    opacity: .62;
    margin-bottom: 18px;
  }
  .progress {
    height: 2px;
    background: color-mix(in srgb, currentColor 12%, transparent);
    margin: 0 0 20px;
    overflow: hidden;
  }
  .progress > div {
    height: 100%;
    width: 20%;
    background: currentColor;
    transition: width .25s ease;
  }
  .text {
    font-size: 17px;
    line-height: 1.58;
    white-space: pre-wrap;
    letter-spacing: .002em;
  }
  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 22px;
    padding-top: 14px;
    border-top: 1px solid color-mix(in srgb, currentColor 12%, transparent);
    font-family: ui-sans-serif, system-ui, sans-serif;
  }
  .part { font-size: 12px; opacity: .55; }
  button {
    appearance: none;
    border: 1px solid currentColor;
    border-radius: 999px;
    padding: 10px 16px;
    font: 600 14px/1 ui-sans-serif, system-ui, sans-serif;
    color: inherit;
    background: transparent;
    cursor: pointer;
  }
  button:disabled { opacity: .4; cursor: default; }
  .end {
    font-family: ui-sans-serif, system-ui, sans-serif;
    font-size: 13px;
    font-weight: 650;
    letter-spacing: .06em;
    text-transform: uppercase;
  }
  .status {
    font-family: ui-sans-serif, system-ui, sans-serif;
    font-size: 12px;
    opacity: .6;
    margin-top: 10px;
    min-height: 16px;
  }
</style>
</head>
<body>
  <main class="reader">
    <div class="brand">FICTURN · Stories you enter.</div>
    <h1 id="title">FICTURN</h1>
    <div class="meta" id="meta">Loading story…</div>
    <div class="progress"><div id="bar"></div></div>
    <article class="text" id="text">Open this story inside ChatGPT to begin.</article>
    <div class="footer">
      <div class="part" id="part"></div>
      <button id="next" type="button">Continue →</button>
      <div class="end" id="end" hidden>End</div>
    </div>
    <div class="status" id="status"></div>
  </main>
<script>
(() => {
  const titleEl = document.getElementById('title');
  const metaEl = document.getElementById('meta');
  const textEl = document.getElementById('text');
  const partEl = document.getElementById('part');
  const barEl = document.getElementById('bar');
  const nextEl = document.getElementById('next');
  const endEl = document.getElementById('end');
  const statusEl = document.getElementById('status');
  let current = null;

  function resize() {
    requestAnimationFrame(() => {
      try { window.openai?.notifyIntrinsicHeight?.(document.documentElement.scrollHeight); } catch (_) {}
    });
  }

  function render(data) {
    if (!data || typeof data !== 'object' || !data.text) return false;
    current = data;
    titleEl.textContent = data.title || 'FICTURN';
    const tags = Array.isArray(data.tags) ? data.tags.join(' · ') : '';
    metaEl.textContent = [tags, data.readingMinutes ? data.readingMinutes + ' min' : ''].filter(Boolean).join(' · ');
    textEl.textContent = data.text;
    partEl.textContent = 'Part ' + data.part + ' / ' + data.total;
    barEl.style.width = Math.round((data.part / data.total) * 100) + '%';
    const ended = Boolean(data.isEnd);
    nextEl.hidden = ended;
    endEl.hidden = !ended;
    statusEl.textContent = ended ? 'You have finished this FICTURN.' : '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    resize();
    return true;
  }

  function extract(response) {
    return response?.structuredContent
      || response?.structured_content
      || response?.result?.structuredContent
      || response?.result?.structured_content
      || null;
  }

  async function continueStory() {
    if (!current || current.isEnd) return;
    const nextPart = current.part + 1;
    nextEl.disabled = true;
    nextEl.textContent = 'Opening…';
    statusEl.textContent = '';

    try {
      if (window.openai?.callTool) {
        const response = await window.openai.callTool('next_fragment', { part: nextPart });
        const data = extract(response);
        if (!render(data)) throw new Error('No story fragment returned');
      } else if (window.openai?.sendFollowUpMessage) {
        await window.openai.sendFollowUpMessage({ prompt: 'Continue FICTURN with part ' + nextPart + '.' });
        statusEl.textContent = 'The next part will appear in the chat.';
      } else {
        statusEl.textContent = 'Type “continue” in the chat to keep reading.';
      }
    } catch (error) {
      statusEl.textContent = 'Could not open the next part. Type “continue” in the chat.';
    } finally {
      nextEl.disabled = false;
      nextEl.textContent = 'Continue →';
      resize();
    }
  }

  nextEl.addEventListener('click', continueStory);

  if (window.openai?.toolOutput) render(window.openai.toolOutput);

  window.addEventListener('openai:set_globals', (event) => {
    const globals = event?.detail?.globals || event?.detail || {};
    if (globals.toolOutput) render(globals.toolOutput);
  });

  resize();
})();
</script>
</body>
</html>`;
