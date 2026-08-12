# FICTURN — OpenAI Plugin Submission Package

This file collects the current public-listing copy, starter prompts, reviewer tests, and release notes for the OpenAI plugin submission portal.

## Submission type

- **With MCP**
- Universal MCP server URL: `https://ficturn.thomas-judes.workers.dev/mcp`
- Authentication: none
- UI: yes, inline FICTURN reader
- Skills: none

## Public listing

### Plugin name

FICTURN

### Short description

Read short, finished stories directly inside ChatGPT.

### Long description

FICTURN is a chat-native library of fixed short fiction designed for five-to-eight-minute reading sessions. Browse romantic suspense, uncanny horror, and near-future speculative stories, then read them in an inline reader with progress, Previous / Continue navigation, and a Library view.

FICTURN serves finite, pre-authored stories. It does not generate, rewrite, or improvise the story prose on the fly.

### Website

`https://ficturn.thomas-judes.workers.dev/`

### Support

`https://ficturn.thomas-judes.workers.dev/support`

### Privacy

`https://ficturn.thomas-judes.workers.dev/privacy`

### Terms

`https://ficturn.thomas-judes.workers.dev/terms`

### Category

Choose the closest fiction / entertainment / reading category exposed by the submission portal. Do not force an unrelated category.

## Current catalog

1. **The Safehouse Rule** — romantic suspense — ~6 min
2. **Room 713** — uncanny hotel horror — ~5 min
3. **The Last Reply** — near-future digital-twin thriller — ~8 min

## Tool annotations

All tools are read-only and operate only on the fixed FICTURN catalog.

### `browse_stories`

- `readOnlyHint`: true
- `openWorldHint`: false
- `destructiveHint`: false
- Justification: returns static catalog metadata and changes no external state.

### `start_story`

- `readOnlyHint`: true
- `openWorldHint`: false
- `destructiveHint`: false
- Justification: returns part 1 of one fixed story and changes no external state.

### `next_fragment`

- `readOnlyHint`: true
- `openWorldHint`: false
- `destructiveHint`: false
- Justification: returns one fixed story fragment and changes no external state.

## Starter prompts

- Show me a short story I can finish in under ten minutes.
- I want an eerie five-minute story.
- Give me a short romantic suspense story.
- Start The Last Reply.
- What stories does FICTURN have?

## Positive reviewer tests

### Positive 1 — browse catalog

**Prompt:** `What stories does FICTURN have?`

**Expected behavior:** call `browse_stories`.

**Expected result shape:** structured content with `kind: "catalog"` and exactly three story summaries containing id, title, genre, mood, tags, hook, and readingMinutes. The UI shows three selectable story cards.

**Fixture/account:** none; no authentication.

### Positive 2 — start romance

**Prompt:** `Give me a short romantic suspense story.`

**Expected behavior:** call `start_story` with `storyId: "the-safehouse-rule"`.

**Expected result shape:** structured content with `kind: "story"`, `storyId: "the-safehouse-rule"`, `part: 1`, `total: 5`, fixed story text, and library metadata. The reader opens at the top of part 1.

**Fixture/account:** none.

### Positive 3 — start horror

**Prompt:** `I want an eerie five-minute story.`

**Expected behavior:** select `room-713` and call `start_story`.

**Expected result shape:** structured content with `storyId: "room-713"`, `part: 1`, `total: 5`, fixed story text. The reader shows Room 713.

**Fixture/account:** none.

### Positive 4 — start speculative thriller

**Prompt:** `Start The Last Reply.`

**Expected behavior:** call `start_story` with `storyId: "the-last-reply"`.

**Expected result shape:** structured content with `storyId: "the-last-reply"`, `part: 1`, `total: 5`, fixed story text. The reader shows The Last Reply.

**Fixture/account:** none.

### Positive 5 — continue exact story

**Scenario:** The user is reading Room 713 part 1.

**Prompt:** `Continue.`

**Expected behavior:** call `next_fragment` with `storyId: "room-713"` and `part: 2`.

**Expected result shape:** structured content for Room 713 part 2 only. The UI replaces the current prose with part 2 and resets the internal reading position to the top.

**Fixture/account:** none.

## Negative reviewer tests

### Negative 1 — request generated sequel

**Prompt:** `Write a new sequel to Room 713 and keep it going forever.`

**Expected behavior:** do not invent prose through FICTURN tools. Explain that FICTURN serves fixed, finished stories and offer the existing library.

**Why FICTURN should not complete it:** generating arbitrary new fiction is outside the plugin's stated purpose and tool behavior.

### Negative 2 — rewrite the ending

**Prompt:** `Change the ending of The Last Reply so everyone survives.`

**Expected behavior:** do not rewrite or mutate the fixed story. Offer to continue the canonical story or return to the library.

**Why FICTURN should not complete it:** FICTURN tools only retrieve fixed story fragments and have no editing capability.

### Negative 3 — unrelated task

**Prompt:** `Send an email to my manager about tomorrow's meeting.`

**Expected behavior:** FICTURN should not be selected or invoked.

**Why FICTURN should not complete it:** email and external communication are unrelated to the plugin's fiction-reading purpose.

## Privacy / data review notes

- No user account.
- No authentication.
- No payment.
- No ads.
- No server-side reading-history database.
- Tool inputs are limited to story id and fragment number.
- Tool responses contain only catalog/story content and no user identifiers, auth secrets, debug payloads, request ids, session ids, or telemetry.
- UI CSP currently declares no external connect or resource domains because the reader is self-contained.

## Domain verification

The Worker implements:

`/.well-known/openai-apps-challenge`

Set the Cloudflare Worker environment variable `OPENAI_APPS_CHALLENGE` to the exact token shown by the OpenAI submission portal. The endpoint returns only that token as plain text.

## Release notes

Initial public submission of FICTURN, a read-only MCP plugin for discovering and reading short, fixed fiction directly inside ChatGPT. The initial catalog contains three complete stories across romantic suspense, uncanny horror, and near-future speculative thriller. The inline reader supports catalog selection, progress, Previous / Continue navigation, and return to Library. No authentication, accounts, payments, ads, or server-side reading history are used.

## Remaining manual submission items

- Select and verify the publisher identity in OpenAI Platform.
- Confirm Apps Management write access for the submitting organization.
- Upload final production logo.
- Select the closest available category in the portal.
- Choose country availability.
- Run Scan Tools against the production MCP endpoint.
- Set and verify the domain-challenge token if requested.
- Review all automated validation output before submitting.
