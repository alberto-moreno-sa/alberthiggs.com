import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server";
import { securityHeaders } from "~/lib/securityHeaders";

/**
 * Worker entry, replacing `@tanstack/react-start/server-entry`.
 *
 * Start's default entry is a thin wrapper around `createStartHandler`. This
 * adds one thing: it stamps the security headers onto the Response on its way
 * out, whatever produced it.
 *
 * Request middleware alone was not enough. `setResponseHeader` from middleware
 * reaches responses where a route component wins the match, but a 404 rendered
 * by `notFoundComponent` — or a 500 from `errorComponent` — came back with no
 * CSP, no HSTS and no X-Frame-Options at all. Verified with curl against the
 * deployed Worker, and again locally after moving the headers into middleware.
 * Post-processing here is the only seam every response passes through.
 *
 * Headers already set upstream win, so the nonce'd CSP that middleware wrote
 * for a real page render is preserved; the fallback below only fills in
 * responses that never got one.
 */
const handler = createStartHandler(defaultStreamHandler);

/**
 * A nonce for responses that never rendered a nonced script — error pages
 * served straight from the framework. It grants nothing, and is only here so
 * the directive stays well-formed.
 */
const inertCsp = () => securityHeaders(crypto.randomUUID());

export default {
  async fetch(...args: Parameters<typeof handler>) {
    const response = await handler(...args);

    // Static assets are served by Cloudflare before the Worker runs and carry
    // their own cache headers from public/_headers, so anything arriving here
    // is a Worker-generated response.
    const headers = new Headers(response.headers);
    for (const [name, value] of Object.entries(inertCsp())) {
      if (!headers.has(name)) headers.set(name, value);
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
