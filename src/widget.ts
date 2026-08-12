export const WIDGET_URI = "ui://ficturn/reader-v2.html";
export const WIDGET_MIME = "text/html+skybridge";

export const WIDGET_HTML = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: transparent; color: inherit; }
  .reader {
    max-width: 720px;
    margin: 0 auto;
    padding: 18px;
    border: 1px solid color-mix(in srgb, currentColor 15%, transparent);
    border-radius: 18px;
    background: color-mix(in srgb, Canvas 96%, transparent);
  }
  .brand, .meta, .part, .status, button {
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .brand {
    font-size: 11px;
    letter-spacing: .16em;
    text-transform: uppercase;
    opacity: .58;
    margin-bottom: 14px;
  }
  h1 {
    font-family: ui-serif, Georgia, Cambria, "Times New Roman", serif;
    font-size: 25px;
    line-height: 1.08;
    margin: 0 0 5px;
    font-weight: 650;
  }
  .meta { font-size: 12px; opacity: .62; margin-bottom: 16px; }
  .progress { height: 2px; background: color-mix(in srgb, currentColor 12%, transparent); margin-bottom: 14px; overflow: hidden; }
  .progress > div { height: 100%; width: 20%; background: currentColor; transition: width .2s ease; }
  .reading-window {
    max-height: 56dvh;
    min-height: 260px;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    padding: 4px 4px 8px 0;
    scroll-behavior: auto;
  }
  .text {
    font-family: ui-serif, Georgia, Cambria, "Times New Roman", serif;
    font-size: 17px;
    line-height: 1.58;
    white-space: pre-wrap;
    letter-spacing: .002em;
  }
  .footer {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 8px;
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid color-mix(in srgb, currentColor 12%, transparent);
  }
  .part { grid-column: 2; font-size: 12px; opacity: .55; white-space: nowrap; }
  button {
    appearance: none;
    border: 1px solid currentColor;
    border-radius: 999px;
    padding: 10px 13px;
    font-size: 13px;
    font-weight: 650;
    line-height: 1;
    color: inherit;
    background: transparent;
    cursor: pointer;
    white-space: nowrap;
  }
  button:disabled { opacity: .4; }
  #prev { grid-column: 1; justify-self: start; }
  #next { grid-column: 3; justify-self: end; }
  .end { grid-column: 3; justify-self: end; font: 650 12px/1 ui-sans-serif, system-ui, sans-serif; letter-spacing: .08em; text-transform: uppercase; }
  .status { min-height: 14px; margin-top: 8px; font-size: 11px; opacity: .58; }
  [hidden] { display: none !important; }
</style>
</head>
<body>
<main class="reader">
  <div class="brand">FICTURN · Stories you enter.</div>
  <h1 id="title">FICTURN</h1>
  <div class="meta" id="meta">Loading story…</div>
  <div class="progress"><div id="bar"></div></div>
  <div class="reading-window" id="readingWindow">
    <article class="text" id="text">Open this story inside ChatGPT to begin.</article>
  </div>
  <div class="footer">
    <button id="prev" type="button" hidden>← Previous</button>
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
  const readingWindow = document.getElementById('readingWindow');
  const prevEl = document.getElementById('prev');
  const nextEl = document.getElementById('next');
  const endEl = document.getElementById('end');
  const statusEl = document.getElementById('status');
  const visited = new Map();
  let current = null;

  function resize() {
    requestAnimationFrame(() => {
      try { window.openai?.notifyIntrinsicHeight?.(document.documentElement.scrollHeight); } catch (_) {}
    });
  }

  function resetReadingPosition() {
    readingWindow.scrollTop = 0;
    requestAnimationFrame(() => { readingWindow.scrollTop = 0; });
  }

  function render(data) {
    if (!data || typeof data !== 'object' || !data.text) return false;
    current = data;
    visited.set(data.part, data);
    titleEl.textContent = data.title || 'FICTURN';
    const tags = Array.isArray(data.tags) ? data.tags.join(' · ') : '';
    metaEl.textContent = [tags, data.readingMinutes ? data.readingMinutes + ' min' : ''].filter(Boolean).join(' · ');
    textEl.textContent = data.text;
    partEl.textContent = 'Part ' + data.part + ' / ' + data.total;
    barEl.style.width = Math.round((data.part / data.total) * 100) + '%';
    const ended = Boolean(data.isEnd);
    prevEl.hidden = data.part <= 1;
    nextEl.hidden = ended;
    endEl.hidden = !ended;
    statusEl.textContent = ended ? 'You have finished this FICTURN.' : '';
    resetReadingPosition();
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

  async function fetchPart(part) {
    if (visited.has(part)) return visited.get(part);
    if (!window.openai?.callTool) return null;
    const response = part === 1
      ? await window.openai.callTool('start_story', {})
      : await window.openai.callTool('next_fragment', { part });
    return extract(response);
  }

  async function goTo(part) {
    if (!current || part < 1 || part > current.total) return;
    prevEl.disabled = true;
    nextEl.disabled = true;
    statusEl.textContent = '';
    try {
      const data = await fetchPart(part);
      if (!render(data)) throw new Error('No fragment returned');
    } catch (_) {
      statusEl.textContent = 'Could not open that part. Try again.';
    } finally {
      prevEl.disabled = false;
      nextEl.disabled = false;
      nextEl.textContent = 'Continue →';
      resize();
    }
  }

  async function continueStory() {
    if (!current || current.isEnd) return;
    nextEl.textContent = 'Opening…';
    await goTo(current.part + 1);
  }

  async function previousStory() {
    if (!current || current.part <= 1) return;
    await goTo(current.part - 1);
  }

  prevEl.addEventListener('click', previousStory);
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
