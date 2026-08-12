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
  .shell {
    max-width: 720px;
    margin: 0 auto;
    padding: 18px;
    border: 1px solid color-mix(in srgb, currentColor 15%, transparent);
    border-radius: 18px;
    background: color-mix(in srgb, Canvas 96%, transparent);
  }
  .ui, .brand, .meta, .part, .status, button, .card-meta, .card-tags {
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 22px;
    margin-bottom: 12px;
  }
  .brand {
    font-size: 11px;
    letter-spacing: .16em;
    text-transform: uppercase;
    opacity: .58;
  }
  .library-link {
    border: 0;
    padding: 4px 0;
    background: transparent;
    font-size: 12px;
    opacity: .66;
  }
  h1, h2, .card-title {
    font-family: ui-serif, Georgia, Cambria, "Times New Roman", serif;
  }
  h1 {
    font-size: 25px;
    line-height: 1.08;
    margin: 0 0 5px;
    font-weight: 650;
  }
  h2 {
    font-size: 23px;
    line-height: 1.12;
    margin: 0 0 6px;
    font-weight: 650;
  }
  .catalog-sub {
    margin: 0 0 16px;
    font: 13px/1.45 ui-sans-serif, system-ui, sans-serif;
    opacity: .66;
  }
  .catalog-window {
    max-height: 62dvh;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    padding-right: 2px;
  }
  .catalog-list { display: grid; gap: 10px; }
  .story-card {
    padding: 14px;
    border: 1px solid color-mix(in srgb, currentColor 13%, transparent);
    border-radius: 14px;
  }
  .card-meta {
    font-size: 11px;
    letter-spacing: .05em;
    text-transform: uppercase;
    opacity: .56;
    margin-bottom: 5px;
  }
  .card-title {
    font-size: 20px;
    line-height: 1.12;
    font-weight: 650;
    margin-bottom: 7px;
  }
  .card-hook {
    font: 14px/1.48 ui-serif, Georgia, Cambria, "Times New Roman", serif;
    margin-bottom: 10px;
  }
  .card-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .card-tags {
    min-width: 0;
    font-size: 11px;
    opacity: .52;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
  #next, #more { grid-column: 3; justify-self: end; }
  .status { min-height: 14px; margin-top: 8px; font-size: 11px; opacity: .58; }
  [hidden] { display: none !important; }
</style>
</head>
<body>
<main class="shell">
  <div class="topbar">
    <div class="brand">FICTURN · Stories you enter.</div>
    <button class="library-link" id="library" type="button" hidden>Library</button>
  </div>

  <section id="catalogView" hidden>
    <h2>Choose a story</h2>
    <p class="catalog-sub">Finished, authored fiction made to be read inside the conversation.</p>
    <div class="catalog-window"><div class="catalog-list" id="catalog"></div></div>
  </section>

  <section id="storyView" hidden>
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
      <button id="more" type="button" hidden>More stories</button>
    </div>
  </section>

  <div class="status" id="status"></div>
</main>
<script>
(() => {
  const catalogView = document.getElementById('catalogView');
  const storyView = document.getElementById('storyView');
  const catalogEl = document.getElementById('catalog');
  const libraryEl = document.getElementById('library');
  const titleEl = document.getElementById('title');
  const metaEl = document.getElementById('meta');
  const textEl = document.getElementById('text');
  const partEl = document.getElementById('part');
  const barEl = document.getElementById('bar');
  const readingWindow = document.getElementById('readingWindow');
  const prevEl = document.getElementById('prev');
  const nextEl = document.getElementById('next');
  const moreEl = document.getElementById('more');
  const statusEl = document.getElementById('status');

  const visited = new Map();
  let current = null;
  let catalogData = null;

  function resize() {
    requestAnimationFrame(() => {
      try { window.openai?.notifyIntrinsicHeight?.(document.documentElement.scrollHeight); } catch (_) {}
    });
  }

  function resetReadingPosition() {
    readingWindow.scrollTop = 0;
    requestAnimationFrame(() => { readingWindow.scrollTop = 0; });
  }

  function extract(response) {
    return response?.structuredContent
      || response?.structured_content
      || response?.result?.structuredContent
      || response?.result?.structured_content
      || null;
  }

  function cacheKey(storyId, part) {
    return String(storyId) + ':' + String(part);
  }

  function renderCatalog(data) {
    const stories = Array.isArray(data?.stories) ? data.stories : Array.isArray(data) ? data : null;
    if (!stories) return false;
    catalogData = { kind: 'catalog', stories };
    current = null;
    catalogEl.textContent = '';

    stories.forEach((story) => {
      const card = document.createElement('article');
      card.className = 'story-card';

      const cardMeta = document.createElement('div');
      cardMeta.className = 'card-meta';
      cardMeta.textContent = [story.genre, story.readingMinutes ? story.readingMinutes + ' min' : ''].filter(Boolean).join(' · ');

      const cardTitle = document.createElement('div');
      cardTitle.className = 'card-title';
      cardTitle.textContent = story.title || 'Untitled';

      const hook = document.createElement('div');
      hook.className = 'card-hook';
      hook.textContent = story.hook || '';

      const bottom = document.createElement('div');
      bottom.className = 'card-bottom';

      const tags = document.createElement('div');
      tags.className = 'card-tags';
      tags.textContent = Array.isArray(story.tags) ? story.tags.join(' · ') : '';

      const read = document.createElement('button');
      read.type = 'button';
      read.textContent = 'Read →';
      read.dataset.storyId = story.id;

      bottom.appendChild(tags);
      bottom.appendChild(read);
      card.appendChild(cardMeta);
      card.appendChild(cardTitle);
      card.appendChild(hook);
      card.appendChild(bottom);
      catalogEl.appendChild(card);
    });

    storyView.hidden = true;
    catalogView.hidden = false;
    libraryEl.hidden = true;
    statusEl.textContent = '';
    resize();
    return true;
  }

  function renderStory(data) {
    if (!data || typeof data !== 'object' || !data.text) return false;
    current = data;
    visited.set(cacheKey(data.storyId, data.part), data);

    // New server responses carry the compact library directly. This makes the
    // Library button work even when ChatGPT has not refreshed its MCP tool snapshot.
    if (Array.isArray(data.library)) {
      catalogData = { kind: 'catalog', stories: data.library };
    }

    titleEl.textContent = data.title || 'FICTURN';
    const tags = Array.isArray(data.tags) ? data.tags.join(' · ') : '';
    metaEl.textContent = [data.genre, tags, data.readingMinutes ? data.readingMinutes + ' min' : ''].filter(Boolean).join(' · ');
    textEl.textContent = data.text;
    partEl.textContent = 'Part ' + data.part + ' / ' + data.total;
    barEl.style.width = Math.round((data.part / data.total) * 100) + '%';

    const ended = Boolean(data.isEnd);
    prevEl.hidden = data.part <= 1;
    nextEl.hidden = ended;
    moreEl.hidden = !ended;

    catalogView.hidden = true;
    storyView.hidden = false;
    libraryEl.hidden = false;
    statusEl.textContent = ended ? 'End.' : '';

    resetReadingPosition();
    resize();
    return true;
  }

  function render(data) {
    if (!data || typeof data !== 'object') return false;
    if (data.kind === 'catalog' || Array.isArray(data.stories)) return renderCatalog(data);
    return renderStory(data);
  }

  async function openCatalog() {
    statusEl.textContent = '';
    if (catalogData) {
      renderCatalog(catalogData);
      return;
    }

    statusEl.textContent = 'Opening library…';
    try {
      if (!window.openai?.callTool) throw new Error('Tools unavailable');
      const response = await window.openai.callTool('browse_stories', {});
      const data = extract(response);
      if (!renderCatalog(data)) throw new Error('No catalog returned');
    } catch (_) {
      statusEl.textContent = 'Could not open the library yet. Refresh the FICTURN app tools once.';
    }
  }

  async function startStory(storyId) {
    statusEl.textContent = 'Opening story…';
    try {
      if (!window.openai?.callTool) throw new Error('Tools unavailable');
      const response = await window.openai.callTool('start_story', { storyId });
      const data = extract(response);
      if (!renderStory(data)) throw new Error('No story returned');
    } catch (_) {
      statusEl.textContent = 'Could not open that story. Refresh the FICTURN app tools once.';
    }
  }

  async function fetchPart(storyId, part) {
    const key = cacheKey(storyId, part);
    if (visited.has(key)) return visited.get(key);
    if (!window.openai?.callTool) return null;
    const response = part === 1
      ? await window.openai.callTool('start_story', { storyId })
      : await window.openai.callTool('next_fragment', { storyId, part });
    return extract(response);
  }

  async function goTo(part) {
    if (!current || part < 1 || part > current.total) return;
    const storyId = current.storyId;
    prevEl.disabled = true;
    nextEl.disabled = true;
    moreEl.disabled = true;
    statusEl.textContent = '';
    try {
      const data = await fetchPart(storyId, part);
      if (!renderStory(data)) throw new Error('No fragment returned');
    } catch (_) {
      statusEl.textContent = 'Could not open that part. Try again.';
    } finally {
      prevEl.disabled = false;
      nextEl.disabled = false;
      moreEl.disabled = false;
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

  catalogEl.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest('button[data-story-id]');
    if (!button) return;
    const storyId = button.dataset.storyId;
    if (storyId) startStory(storyId);
  });

  libraryEl.addEventListener('click', openCatalog);
  moreEl.addEventListener('click', openCatalog);
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
