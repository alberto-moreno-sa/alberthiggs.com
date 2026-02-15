import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { ContentfulClient } from "~/lib/contentful";
import { slugify } from "~/lib/slugify";

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

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Response("Asset not available", { status: 502 });
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
    },
  });
};
