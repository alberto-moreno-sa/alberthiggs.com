import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { ContentfulClient } from "~/lib/contentful";

export async function loader({ context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env as Env;
  const client = new ContentfulClient(
    env.CONTENTFUL_SPACE_ID,
    env.CONTENTFUL_ACCESS_TOKEN,
  );

  const personal = await client.getPersonal();

  if (!personal.resumeUrl) {
    throw new Response("Resume not available", { status: 404 });
  }

  const response = await fetch(personal.resumeUrl);

  if (!response.ok) {
    throw new Response("Resume not available", { status: 502 });
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="Alberto_Moreno-Resume.pdf"',
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
