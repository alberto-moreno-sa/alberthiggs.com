import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { ContentfulClient } from "~/lib/contentful";

const ALLOWED_HOSTS = [
  "images.ctfassets.net",
  "downloads.ctfassets.net",
  "assets.ctfassets.net",
];

export const Route = createFileRoute("/resume")({
  server: {
    handlers: {
      GET: async () => {
        const client = new ContentfulClient(
          env.CONTENTFUL_SPACE_ID,
          env.CONTENTFUL_ACCESS_TOKEN,
        );

        const { personal } = await client.getAllData();

        if (!personal.resumeUrl) {
          return new Response("Resume not available", { status: 404 });
        }

        const parsed = new URL(personal.resumeUrl);
        if (
          parsed.protocol !== "https:" ||
          !ALLOWED_HOSTS.includes(parsed.hostname)
        ) {
          return new Response("Invalid resume URL", { status: 400 });
        }

        const response = await fetch(personal.resumeUrl, {
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          return new Response("Resume not available", { status: 502 });
        }

        return new Response(response.body, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition":
              'inline; filename="Alberto_Moreno-Resume.pdf"',
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
          },
        });
      },
    },
  },
});
