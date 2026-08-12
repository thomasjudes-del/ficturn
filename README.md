# FICTURN

**Stories you enter.**

V0 experiment: read a short, authored story directly inside ChatGPT through an MCP App.

The first prototype is deliberately minimal:

- one short romance: **The Safehouse Rule**
- five linear fragments
- one **Continue** button
- no branching
- no login
- no database
- no generated prose

## Architecture

- TypeScript
- Cloudflare Worker
- stateless MCP endpoint at `/mcp`
- story content versioned in `src/story.ts`
- inline reader widget in `src/widget.ts`

## Deploy from a phone

Cloudflare Workers can import a GitHub repository directly.

1. Open the Cloudflare dashboard in your mobile browser.
2. Go to **Workers & Pages** → **Create application**.
3. Choose **Import a repository**.
4. Connect GitHub if needed and select `thomasjudes-del/ficturn`.
5. Keep the Worker name **ficturn** (it must match `wrangler.jsonc`).
6. Deploy. Cloudflare should use the default deploy command `npx wrangler deploy`.
7. Open the generated `workers.dev` URL. The root should say `FICTURN is live.`
8. The remote MCP URL is `https://<your-worker>.workers.dev/mcp`.

## Connect to ChatGPT

For a private development test, add the remote MCP URL as a custom/developer app in ChatGPT, then start a new chat and invoke FICTURN.

Suggested first prompts:

- `@FICTURN start the story`
- `Let me try the FICTURN romance prototype.`

Expected experience: ChatGPT renders the FICTURN reader inline with Part 1/5. Pressing **Continue** loads the next authored fragment inside the reader.

## Development

```bash
npm install
npm run typecheck
npm run dev
```

Deploy manually with:

```bash
npm run deploy
```
