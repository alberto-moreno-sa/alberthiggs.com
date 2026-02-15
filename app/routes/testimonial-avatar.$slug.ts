import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { ContentfulClient } from "~/lib/contentful";

export async function loader({ params, context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env as Env;
  const client = new ContentfulClient(
    env.CONTENTFUL_SPACE_ID,
    env.CONTENTFUL_ACCESS_TOKEN,
  );

  const testimonials = await client.getTestimonials();
  const testimonial = testimonials.find(
    (t) => slugify(t.name) === params.slug,
  );

  if (!testimonial?.avatarUrl) {
    throw new Response("Avatar not found", { status: 404 });
  }

  const response = await fetch(testimonial.avatarUrl);
  if (!response.ok) {
    throw new Response("Avatar not available", { status: 502 });
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
    },
  });
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}
