import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from "@remix-run/react";
import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { GoogleAnalytics } from "~/components/GoogleAnalytics";
import "./app.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous" as const,
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap",
  },
];

export const meta: MetaFunction = () => {
  return [
    { title: "Alberto Moreno — Senior Software Engineer" },
    {
      name: "description",
      content:
        "Senior Software Engineer with 13+ years of experience architecting scalable frontend ecosystems. Specialized in React, TypeScript, and high-performance web applications.",
    },
    { name: "theme-color", content: "#0a0a0a" },
    {
      property: "og:title",
      content: "Alberto Moreno — Senior Software Engineer",
    },
    {
      property: "og:description",
      content:
        "13+ years architecting scalable frontend ecosystems supporting millions of users.",
    },
    { property: "og:type", content: "website" },
  ];
};

export function loader({ context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env as Env;
  return json({ gaTrackingId: env.GA_MEASUREMENT_ID ?? "" });
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root");

  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <GoogleAnalytics gaTrackingId={data?.gaTrackingId} />
      </head>
      <body className="bg-bg text-text-primary antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
