import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server";
import { securityHeaders } from "~/lib/securityHeaders";

/**
 * Worker entry, replacing `@tanstack/react-start/server-entry`.
 *
 * Start's default entry is a thin wrapper around `createStartHandler`. This one
 * owns two things the framework leaves to the app:
 *
 * 1. Security headers on *every* response. Setting them from the root loader,
 *    or even from request middleware, missed the 404 and 500 paths — Start
 *    builds those Responses outside the route that ran the loader. Verified
 *    with curl against the deployed Worker: 0 of 6 headers on a 404.
 *
 * 2. Edge-caching the rendered HTML. Cloudflare does not cache text/html at the
 *    zone level by default, so `s-maxage` on the document was doing nothing and
 *    every visit paid a full SSR pass plus a Contentful round trip. Doing it
 *    here rather than with a dashboard Cache Rule keeps the TTL in one place,
 *    in version control, next to the header that declares it.
 */
const handler = createStartHandler(defaultStreamHandler);

/** Matches the document's `s-maxage` in securityHeaders.ts. */
const HTML_TTL_SECONDS = 3600;

/**
 * Give every response its own nonce, even one replayed from cache.
 *
 * This is what makes caching the HTML safe. A cached document carries the nonce
 * from whichever request rendered it; serving that to everyone for an hour
 * would turn a per-request secret into a shared one. HTMLRewriter streams over
 * the body and rewrites every `nonce` attribute to the value this request will
 * advertise in its own CSP header, so the two always agree and no two visitors
 * share a nonce.
 */
const withNonce = (response: Response, nonce: string): Response =>
  new HTMLRewriter()
    .on("[nonce]", {
      element(element) {
        element.setAttribute("nonce", nonce);
      },
    })
    .transform(response);

/**
 * Cloudflare's shared edge cache — the same one the CDN uses, and the one the
 * dashboard's "Purge Everything" clears, which is what you want after editing
 * the CMS. A namespaced `caches.open(name)` would type cleanly but sits outside
 * that purge.
 *
 * The cast is needed because tsconfig includes the DOM lib, whose CacheStorage
 * has no `default`; the Workers runtime type does, but DOM's declaration wins.
 */
const edgeCache = (caches as unknown as { default: Cache }).default;

const isCacheableDocument = (request: Request, response: Response): boolean =>
  request.method === "GET" &&
  response.status === 200 &&
  (response.headers.get("Content-Type") ?? "").includes("text/html");

export default {
  async fetch(
    request: Request,
    env: unknown,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const nonce = crypto.randomUUID();

    // The nonce is rewritten on the way out, so the cached copy is
    // nonce-agnostic. The build id is in the key so a deploy invalidates
    // everything it rendered — without it, shipping a fix left the previous
    // HTML being served for the rest of its hour.
    const keyUrl = new URL(request.url);
    keyUrl.searchParams.set("__b", __BUILD_ID__);
    const cacheKey = new Request(keyUrl.toString(), { method: "GET" });
    const cached =
      request.method === "GET" ? await edgeCache.match(cacheKey) : undefined;

    const response =
      cached ??
      (await (
        handler as (
          r: Request,
          e: unknown,
          c: ExecutionContext,
        ) => Promise<Response>
      )(request, env, ctx));

    const headers = new Headers(response.headers);
    for (const [name, value] of Object.entries(securityHeaders(nonce))) {
      headers.set(name, value);
    }
    headers.set("X-Cache", cached ? "HIT" : "MISS");

    const out = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });

    if (!cached && isCacheableDocument(request, out)) {
      // Store a copy with only the TTL the edge cache reads. Security headers
      // are re-applied above on every serve, so they are deliberately not
      // baked into the cached entry.
      const toStore = out.clone();
      const storeHeaders = new Headers(toStore.headers);
      storeHeaders.set("Cache-Control", `public, max-age=${HTML_TTL_SECONDS}`);
      ctx.waitUntil(
        edgeCache.put(
          cacheKey,
          new Response(toStore.body, {
            status: toStore.status,
            headers: storeHeaders,
          }),
        ),
      );
    }

    return isCacheableDocument(request, out) ? withNonce(out, nonce) : out;
  },
};
