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

const VERSION = "0.1.2";
const LEGACY_WIDGET_URI = "ui://ficturn/reader.html";
const STORY_IDS = ["the-safehouse-rule", "room-713", "the-last-reply"] as const;
const storyIdSchema = z.enum(STORY_IDS);
const MAX_PART = Math.max(...stories.map((item) => item.fragments.length));

// FICTURN's current reader is fully self-contained: no remote scripts, images,
// frames, or direct network fetches from the iframe. Keep this CSP intentionally
// empty and expand it only if the UI later adds an external dependency.
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
        text: "FICTURN has displayed its library of short authored stories. Let the user choose inside the library rather than reproducing story prose in chat.",
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
      description: "Inline library and reader for short authored fiction.",
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
  const server = new McpServer({
    name: "FICTURN",
    version: VERSION,
  });

  server.registerTool(
    "browse_stories",
    {
      title: "Browse FICTURN stories",
      description:
        "Show the current FICTURN library of short, finished, human-authored stories with genre, mood, reading time and hook. Use when the user asks what FICTURN has, wants something to read, or wants to choose a story.",
      inputSchema: z.object({}),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
      _meta: appMeta(),
    },
    async () => catalogResult(),
  );

  server.registerTool(
    "start_story",
    {
      title: "Start a FICTURN story",
      description:
        "Start one finished, authored FICTURN story in the embedded reader. If no story is specified, open The Safehouse Rule for backward compatibility. Available stories include romance, uncanny horror and a near-future digital-twin thriller.",
      inputSchema: z.object({
        storyId: storyIdSchema
          .optional()
          .describe("Story to open: the-safehouse-rule, room-713, or the-last-reply."),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
      _meta: appMeta(),
    },
    async ({ storyId }) => storyResult(storyId ?? DEFAULT_STORY_ID, 1),
  );

  server.registerTool(
    "next_fragment",
    {
      title: "Continue a FICTURN story",
      description:
        "Return an exact authored fragment of a FICTURN story already open in the reader. Never invent, rewrite, summarise or skip story fragments.",
      inputSchema: z.object({
        storyId: storyIdSchema
          .optional()
          .describe("Story currently being read. Defaults to the-safehouse-rule for legacy clients."),
        part: z
          .number()
          .int()
          .min(2)
          .max(MAX_PART)
          .describe("Exact fragment number to display."),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
      _meta: appMeta(),
    },
    async ({ storyId, part }) => storyResult(storyId ?? DEFAULT_STORY_ID, part),
  );

  registerReaderResource(server, WIDGET_URI, "FICTURN reader v2");
  registerReaderResource(server, LEGACY_WIDGET_URI, "FICTURN reader legacy alias");

  return server;
}

const mcp = createMcpHandler(createServer);

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response(
        [
          "FICTURN is live.",
          "Stories you enter.",
          "",
          "MCP endpoint: /mcp",
          `${stories.length} authored stories available:`,
          ...stories.map((item) => `- ${item.title} · ${item.genre} · ${item.readingMinutes} min`),
        ].join("\n"),
        {
          headers: { "content-type": "text/plain; charset=utf-8" },
        },
      );
    }

    if (url.pathname === "/mcp") {
      return mcp.fetch(request);
    }

    return new Response("Not Found", { status: 404 });
  },
} satisfies ExportedHandler;
