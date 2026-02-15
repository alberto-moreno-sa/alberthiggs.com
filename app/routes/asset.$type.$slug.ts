import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { ContentfulClient } from "~/lib/contentful";
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
];

const validateAssetUrl = (url: string) => {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || !ALLOWED_HOSTS.includes(parsed.hostname)) {
    throw new Response("Invalid asset URL", { status: 400 });
  }
};

const resolveImageUrl = async (
  client: ContentfulClient,
  type: string,
  slug: string,
): Promise<string | undefined> => {
  switch (type) {
    case "experience": {
      const experiences = await client.getExperience();
      const match = experiences.find((e) => slugify(e.company) === slug);
      return match?.imageUrl;
    }
    case "project": {
      const projects = await client.getProjects();
      const match = projects.find((p) => p.slug === slug);
      return match?.imageUrl;
    }
    case "testimonial": {
      const testimonials = await client.getTestimonials();
      const match = testimonials.find((t) => slugify(t.name) === slug);
      return match?.avatarUrl;
    }
    default:
      return undefined;
  }
};

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  const { type, slug } = params;
  const env = context.cloudflare.env as Env;
  const client = new ContentfulClient(
    env.CONTENTFUL_SPACE_ID,
    env.CONTENTFUL_ACCESS_TOKEN,
  );

  const imageUrl = await resolveImageUrl(client, type!, slug!);
  if (!imageUrl) {
    throw new Response("Asset not found", { status: 404 });
  }

  validateAssetUrl(imageUrl);

  const response = await fetch(imageUrl, {
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) {
    throw new Response("Asset not available", { status: 502 });
  }

  const contentType = response.headers.get("Content-Type") || "";
  if (!VALID_CONTENT_TYPES.some((t) => contentType.includes(t))) {
    throw new Response("Invalid content type", { status: 400 });
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
    },
  });
};
