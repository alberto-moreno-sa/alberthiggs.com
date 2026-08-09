import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { ContentfulClient, type SiteData } from "~/lib/contentful";
import { slugify } from "~/lib/slugify";

const ALLOWED_HOSTS = [
  "images.ctfassets.net",
  "downloads.ctfassets.net",
  "assets.ctfassets.net",
];

const VALID_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  "image/avif",
];

const IMAGE_DEFAULTS: Record<string, { w: number; q: number }> = {
  experience: { w: 600, q: 80 },
  project: { w: 760, q: 80 },
  testimonial: { w: 80, q: 80 },
};

/**
 * Returns a 400 Response when the URL is not one we are willing to fetch.
 *
 * Under Remix this threw a Response, which the framework caught. A Start server
 * handler returns its Response instead, so the caller forwards this one.
 */
const validateAssetUrl = (url: string): Response | undefined => {
  const parsed = new URL(url);
  if (
    parsed.protocol !== "https:" ||
    !ALLOWED_HOSTS.includes(parsed.hostname)
  ) {
    return new Response("Invalid asset URL", { status: 400 });
  }
  return undefined;
};

/** Append Contentful Images API params for resize + WebP conversion */
const optimizeImageUrl = (url: string, type: string): string => {
  const defaults = IMAGE_DEFAULTS[type];
  if (!defaults) return url;

  const optimized = new URL(url);
  optimized.searchParams.set("fm", "webp");
  optimized.searchParams.set("w", String(defaults.w));
  optimized.searchParams.set("q", String(defaults.q));
  return optimized.toString();
};

const resolveImageUrl = (
  data: SiteData,
  type: string,
  slug: string,
): string | undefined => {
  switch (type) {
    case "experience": {
      const match = data.experience.find((e) => slugify(e.company) === slug);
      return match?.imageUrl;
    }
    case "project": {
      const match = data.projects.find((p) => p.slug === slug);
      return match?.imageUrl;
    }
    case "testimonial": {
      const match = data.testimonials.find((t) => slugify(t.name) === slug);
      return match?.avatarUrl;
    }
    default:
      return undefined;
  }
};

export const Route = createFileRoute("/asset/$type/$slug")({
  server: {
    handlers: {
      GET: async ({ params }: { params: { type: string; slug: string } }) => {
        const { type, slug } = params;
        const client = new ContentfulClient(
          env.CONTENTFUL_SPACE_ID,
          env.CONTENTFUL_ACCESS_TOKEN,
        );

        const data = await client.getAllData();
        const imageUrl = resolveImageUrl(data, type, slug);
        if (!imageUrl) {
          return new Response("Asset not found", { status: 404 });
        }

        const invalid = validateAssetUrl(imageUrl);
        if (invalid) return invalid;

        const optimizedUrl = optimizeImageUrl(imageUrl, type);
        const response = await fetch(optimizedUrl, {
          signal: AbortSignal.timeout(5000),
        });
        if (!response.ok) {
          return new Response("Asset not available", { status: 502 });
        }

        const contentType = response.headers.get("Content-Type") || "";
        if (!VALID_CONTENT_TYPES.some((t) => contentType.includes(t))) {
          return new Response("Invalid content type", { status: 400 });
        }

        return new Response(response.body, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400, s-maxage=604800",
          },
        });
      },
    },
  },
});
