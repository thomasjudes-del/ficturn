import { McpServer, createMcpHandler } from "@modelcontextprotocol/server";
import { z } from "zod";
import { getFragment, story } from "./story";
import { WIDGET_HTML, WIDGET_MIME, WIDGET_URI } from "./widget";

const VERSION = "0.0.2";
const LEGACY_WIDGET_URI = "ui://ficturn/reader.html";

function appMeta() {
  return {
    ui: {
      resourceUri: WIDGET_URI,
      visibility: ["app", "model"],
    },
    // ChatGPT compatibility metadata for the V0 reader.
    "openai/outputTemplate": WIDGET_URI,
    "openai/widgetAccessible": true,
    "openai/toolInvocation/invoking": "Opening FICTURN…",
    "openai/toolInvocation/invoked": "FICTURN ready",
  } as Record<string, unknown>;
}

function fragmentPayload(part: number) {
  return {
    storyId: story.id,
    title: story.title,
    subtitle: story.subtitle,
    hook: story.hook,
    tags: story.tags,
    readingMinutes: story.readingMinutes,
    part,
    total: story.fragments.length,
    text: getFragment(part),
    isEnd: part === story.fragments.length,
  };
}

function toolResult(part: number) {
  const payload = fragmentPayload(part);
  return {
    content: [
      {
        type: "text" as const,
        text: payload.isEnd
          ? `FICTURN has displayed the final part of ${story.title} in the reader. Do not reproduce or continue the story outside the reader.`
          : `FICTURN has displayed part ${part} of ${story.fragments.length} of ${story.title} in the reader. Do not reproduce the prose outside the reader. The user can press Continue or ask to continue.`,
      },
    ],
    structuredContent: payload,
  };
}

function registerReaderResource(server: McpServer, uri: string, label: string) {
  server.registerResource(
    label,
    uri,
    {
      title: "FICTURN Reader",
      description: "Minimal inline reader for short authored fiction.",
      mimeType: WIDGET_MIME,
      _meta: {
        ui: { prefersBorder: true },
        "openai/widgetPrefersBorder": true,
      },
    },
    async (resourceUri) => ({
      contents: [
        {
          uri: resourceUri.href,
          mimeType: WIDGET_MIME,
          text: WIDGET_HTML,
          _meta: {
            ui: { prefersBorder: true },
            "openai/widgetPrefersBorder": true,
          },
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
    "start_story",
    {
      title: "Start a FICTURN story",
      description:
        "Start the current short, authored FICTURN romance in an embedded reader. Use when the user asks to try FICTURN, read the FICTURN prototype, start the story, or experience a short romance in ChatGPT.",
      inputSchema: z.object({}),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
      _meta: appMeta(),
    },
    async () => toolResult(1),
  );

  server.registerTool(
    "next_fragment",
    {
      title: "Continue a FICTURN story",
      description:
        "Return the next authored fragment of the current FICTURN story. Use only to continue an already-started FICTURN reading experience. Never invent, rewrite, summarise, or skip story fragments.",
      inputSchema: z.object({
        part: z
          .number()
          .int()
          .min(2)
          .max(story.fragments.length)
          .describe("The exact next fragment number to display."),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: false,
      },
      _meta: appMeta(),
    },
    async ({ part }) => toolResult(part),
  );

  // Current template URI for new scans plus the original URI so an already
  // configured ChatGPT draft can still fetch the reader without being recreated.
  registerReaderResource(server, WIDGET_URI, "FICTURN reader v2");
  if (WIDGET_URI !== LEGACY_WIDGET_URI) {
    registerReaderResource(server, LEGACY_WIDGET_URI, "FICTURN reader legacy alias");
  }

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
          `Prototype: ${story.title} (${story.readingMinutes} min)`,
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
