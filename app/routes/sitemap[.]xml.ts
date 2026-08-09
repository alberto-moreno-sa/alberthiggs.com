import { siteConfig } from "~/lib/seo";

/**
 * Indexable routes.
 *
 * Deliberately hand-listed: the site is one page plus the lab, and every entry
 * here is static. Add new public routes as they appear — /lab/survey was live
 * for a while before it made it into this file.
 */
const ROUTES = [
  { path: "/", changefreq: "monthly", priority: "1.0" },
  { path: "/lab/survey", changefreq: "monthly", priority: "0.7" },
];

export const loader = () => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map(
  ({ path, changefreq, priority }) => `  <url>
    <loc>${siteConfig.url}${path === "/" ? "" : path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
).join("\n")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
    },
  });
};
