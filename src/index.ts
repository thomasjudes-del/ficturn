import { McpServer, createMcpHandler } from "@modelcontextprotocol/server";
import { z } from "zod";
import {
  DEFAULT_STORY_ID,
  getFragment,
  getStory,
  getStorySummaries,
  stories,
} from "./story";
import { WIDGET_HTML, WIDGET_MIME, WIDGET_URI } from "./widget";

const VERSION = "0.2.0";
const LEGACY_WIDGET_URI = "ui://ficturn/reader.html";
const STORY_IDS = ["the-safehouse-rule", "room-713", "the-last-reply"] as const;
const storyIdSchema = z.enum(STORY_IDS);
const MAX_PART = Math.max(...stories.map((item) => item.fragments.length));
const GITHUB_REPO = "https://github.com/thomasjudes-del/ficturn";
const SUPPORT_URL = `${GITHUB_REPO}/issues`;
const OPENAI_APPS_CHALLENGE = "CCWEhlF94vOBRRKTlcMx4LurZua0NZsDkMHaS-r7tyg";

const UI_CSP = {
  connectDomains: [] as string[],
  resourceDomains: [] as string[],
};

const LEGACY_UI_CSP = {
  connect_domains: [] as string[],
  resource_domains: [] as string[],
};

function appMeta() {
  return {
    ui: {
      resourceUri: WIDGET_URI,
      visibility: ["app", "model"],
    },
    "openai/outputTemplate": WIDGET_URI,
    "openai/widgetAccessible": true,
    "openai/toolInvocation/invoking": "Opening FICTURN…",
    "openai/toolInvocation/invoked": "FICTURN ready",
  } as Record<string, unknown>;
}

function fragmentPayload(storyId: string, part: number) {
  const story = getStory(storyId);
  return {
    kind: "story",
    storyId: story.id,
    title: story.title,
    subtitle: story.subtitle,
    hook: story.hook,
    genre: story.genre,
    mood: story.mood,
    tags: story.tags,
    readingMinutes: story.readingMinutes,
    part,
    total: story.fragments.length,
    text: getFragment(story.id, part),
    isEnd: part === story.fragments.length,
    library: getStorySummaries(),
  };
}

function storyResult(storyId: string, part: number) {
  const story = getStory(storyId);
  const payload = fragmentPayload(story.id, part);
  return {
    content: [
      {
        type: "text" as const,
        text: payload.isEnd
          ? `FICTURN has displayed the final part of ${story.title} in the reader. Do not reproduce or continue the story outside the reader.`
          : `FICTURN has displayed part ${part} of ${story.fragments.length} of ${story.title} in the reader. Do not reproduce the prose outside the reader. The user can navigate inside the reader.`,
      },
    ],
    structuredContent: payload,
  };
}

function catalogResult() {
  return {
    content: [
      {
        type: "text" as const,
        text: "FICTURN has displayed its library of short, fixed stories. Let the user choose inside the library rather than reproducing story prose in chat.",
      },
    ],
    structuredContent: {
      kind: "catalog",
      title: "FICTURN",
      subtitle: "Stories you enter.",
      stories: getStorySummaries(),
    },
  };
}

function registerReaderResource(server: McpServer, uri: string, label: string) {
  const resourceMeta = {
    ui: {
      prefersBorder: true,
      csp: UI_CSP,
    },
    "openai/widgetPrefersBorder": true,
    "openai/widgetCSP": LEGACY_UI_CSP,
  } as Record<string, unknown>;

  server.registerResource(
    label,
    uri,
    {
      title: "FICTURN Reader",
      description: "Inline library and reader for short, fixed fiction.",
      mimeType: WIDGET_MIME,
      _meta: resourceMeta,
    },
    async (resourceUri) => ({
      contents: [
        {
          uri: resourceUri.href,
          mimeType: WIDGET_MIME,
          text: WIDGET_HTML,
          _meta: resourceMeta,
        },
      ],
    }),
  );
}

function createServer() {
  const server = new McpServer({ name: "FICTURN", version: VERSION });

  server.registerTool(
    "browse_stories",
    {
      title: "Browse FICTURN stories",
      description:
        "Show the FICTURN library of short, finished, pre-authored stories with genre, mood, reading time and hook. Use when the user asks what FICTURN has, wants a short story to read, or wants to choose among the available stories.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      _meta: appMeta(),
    },
    async () => catalogResult(),
  );

  server.registerTool(
    "start_story",
    {
      title: "Start a FICTURN story",
      description:
        "Start one finished, pre-authored FICTURN story in the embedded reader. If no story is specified, open The Safehouse Rule. Available stories include romantic suspense, uncanny horror, and a near-future digital-twin thriller.",
      inputSchema: z.object({
        storyId: storyIdSchema.optional().describe("Story to open: the-safehouse-rule, room-713, or the-last-reply."),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      _meta: appMeta(),
    },
    async ({ storyId }) => storyResult(storyId ?? DEFAULT_STORY_ID, 1),
  );

  server.registerTool(
    "next_fragment",
    {
      title: "Continue a FICTURN story",
      description:
        "Return the requested next fragment of the fixed FICTURN story already open in the reader. Never invent, rewrite, summarise, or skip story fragments.",
      inputSchema: z.object({
        storyId: storyIdSchema.optional().describe("Story currently being read. Defaults to the-safehouse-rule for legacy clients."),
        part: z.number().int().min(2).max(MAX_PART).describe("Exact fragment number to display."),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      _meta: appMeta(),
    },
    async ({ storyId, part }) => storyResult(storyId ?? DEFAULT_STORY_ID, part),
  );

  registerReaderResource(server, WIDGET_URI, "FICTURN reader v2");
  registerReaderResource(server, LEGACY_WIDGET_URI, "FICTURN reader legacy alias");
  return server;
}

const mcp = createMcpHandler(createServer);

function htmlPage(title: string, body: string) {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · FICTURN</title><style>body{max-width:720px;margin:0 auto;padding:40px 22px 72px;font:16px/1.65 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#171717;background:#fff}h1{font:700 38px/1.05 Georgia,serif;margin:0 0 8px}h2{margin-top:32px;font-size:19px}.brand{letter-spacing:.15em;text-transform:uppercase;font-size:12px;color:#666;margin-bottom:22px}a{color:inherit}nav{display:flex;gap:16px;flex-wrap:wrap;margin:30px 0 0;padding-top:20px;border-top:1px solid #ddd}.muted{color:#666}</style></head><body><div class="brand">FICTURN · Stories you enter.</div>${body}<nav><a href="/">Home</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/support">Support</a></nav></body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

function homePage() {
  const cards = stories.map((story) => `<li><strong>${story.title}</strong> — ${story.genre}, about ${story.readingMinutes} min.<br><span class="muted">${story.hook}</span></li>`).join("");
  return htmlPage("Home", `<h1>Short fiction, inside the conversation.</h1><p>FICTURN is a small library of finished, fixed stories designed to be read directly inside ChatGPT through an inline reader. The story prose is not generated on the fly.</p><h2>Current library</h2><ul>${cards}</ul><p><strong>MCP endpoint:</strong> <code>/mcp</code></p>`);
}

function privacyPage() {
  return htmlPage("Privacy Policy", `<h1>Privacy Policy</h1><p class="muted">Effective August 13, 2026.</p><p>FICTURN is designed to work without user accounts, advertising, payments, or a server-side reading-history database.</p><h2>Data FICTURN processes</h2><p>The MCP tools receive only the narrow parameters needed to serve the experience, such as the selected story identifier and fragment number. FICTURN does not ask for names, email addresses, passwords, payment information, precise location, or full conversation history.</p><p>As with ordinary internet services, technical request data such as IP address, device or browser information, and request metadata may be processed by the platform and hosting infrastructure used to deliver FICTURN.</p><h2>Purposes</h2><p>Data is used only to deliver the requested story or catalog, operate the service, and maintain security and reliability.</p><h2>Recipients</h2><p>Requests are delivered through OpenAI/ChatGPT and hosted on Cloudflare infrastructure. FICTURN does not sell personal data and does not use it for advertising.</p><h2>Retention</h2><p>FICTURN currently maintains no application database, user profile, or server-side reading history. Any transient technical data processed or retained by OpenAI or Cloudflare is subject to those providers' own policies and retention practices.</p><h2>Your controls</h2><p>You can stop using or disconnect FICTURN at any time. Because FICTURN currently stores no application-level user profile or reading history, there is normally no FICTURN account data to delete. For privacy or support questions, use the public support channel linked below.</p><h2>Age</h2><p>FICTURN is not directed to children under 13.</p>`);
}

function termsPage() {
  return htmlPage("Terms of Use", `<h1>Terms of Use</h1><p class="muted">Effective August 13, 2026.</p><p>FICTURN provides short fictional works for personal reading inside supported conversational interfaces.</p><h2>Fictional content</h2><p>The stories are works of fiction. Names, characters, events, organizations, and situations are fictional or used fictitiously unless explicitly stated otherwise.</p><h2>Permitted use</h2><p>You may use FICTURN for personal, non-commercial reading. Do not use the service to infringe intellectual-property rights, interfere with the service, or attempt unauthorized access to its infrastructure.</p><h2>Availability</h2><p>FICTURN is provided on an as-available basis. Features, catalog titles, and supported interfaces may change. No guarantee is made that the service will be uninterrupted or error-free.</p><h2>No professional advice</h2><p>FICTURN is an entertainment product. Its fictional content is not medical, legal, financial, safety, or other professional advice.</p><h2>Changes</h2><p>These terms may be updated as the product evolves. The effective date above identifies the current version.</p><h2>Questions</h2><p>For support or questions about these terms, use the public support channel linked below.</p>`);
}

function supportPage() {
  return htmlPage("Support", `<h1>Support</h1><p>For bugs, reader problems, accessibility issues, privacy questions, or other support requests, open an issue in the public FICTURN repository.</p><p><a href="${SUPPORT_URL}">Open FICTURN support on GitHub</a></p><p class="muted">Please do not post passwords, private conversation content, or other sensitive personal information in a public issue.</p>`);
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/") return homePage();
    if (url.pathname === "/privacy") return privacyPage();
    if (url.pathname === "/terms") return termsPage();
    if (url.pathname === "/support") return supportPage();

    if (url.pathname === "/.well-known/openai-apps-challenge") {
      return new Response(OPENAI_APPS_CHALLENGE, {
        status: 200,
        headers: { "content-type": "text/plain", "cache-control": "no-store" },
      });
    }

    if (url.pathname === "/mcp" || url.pathname === "/mcp-test") {
      return mcp.fetch(request);
    }

    return new Response("Not Found", { status: 404 });
  },
} satisfies ExportedHandler;
