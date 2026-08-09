import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { takeNonce } from "./start";

export function getRouter() {
  // Minted by the request middleware (src/start.ts) so the value stamped on
  // the inline hydration script is the same one already in the CSP header.
  const nonce = takeNonce();

  return createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    // Not 0: with intent-preloading, a zero stale time means the preload
    // fetched on hover is already stale by the time the click lands, so the
    // loader runs twice. Content only changes when the CMS is edited.
    defaultPreloadStaleTime: 30_000,
    ssr: { nonce },
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
