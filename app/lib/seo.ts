const SITE_URL = "https://alberthiggs.com";

export const siteConfig = {
  url: SITE_URL,
  title: "Alberto Moreno — Senior Software Engineer",
  description:
    "Senior Software Engineer with 13+ years of experience architecting scalable frontend ecosystems. Specialized in React, TypeScript, and high-performance web applications.",
  shortDescription:
    "13+ years architecting scalable frontend ecosystems supporting millions of users.",
  ogImage: `${SITE_URL}/og-image.jpg`,
  themeColor: "#0a0a0a",
};

export const rootLinks = [
  // The Hero <h1> renders in JetBrains Mono and is the likely LCP element.
  // Without this, the font is only discovered once app.css is parsed.
  {
    rel: "preload",
    href: "/fonts/jetbrains-mono-latin.woff2",
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous" as const,
  },
  { rel: "icon", href: "/favicon.ico", sizes: "any" },
  {
    rel: "icon",
    href: "/favicon-32x32.png",
    type: "image/png",
    sizes: "32x32",
  },
  {
    rel: "icon",
    href: "/favicon-16x16.png",
    type: "image/png",
    sizes: "16x16",
  },
  { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
  { rel: "manifest", href: "/site.webmanifest" },
];

export const rootMeta = [
  { title: siteConfig.title },
  { name: "description", content: siteConfig.description },
  { name: "theme-color", content: siteConfig.themeColor },
  { property: "og:title", content: siteConfig.title },
  { property: "og:description", content: siteConfig.shortDescription },
  { property: "og:type", content: "website" },
  { property: "og:url", content: siteConfig.url },
  { property: "og:image", content: siteConfig.ogImage },
  { property: "og:image:type", content: "image/jpeg" },
  { property: "og:image:width", content: "1200" },
  { property: "og:image:height", content: "630" },
];
