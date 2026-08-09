import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  // Minted here, not in a loader: the router needs it at construction time to
  // stamp Start's inline hydration script, and the root loader needs the same
  // value for the Content-Security-Policy header. Anything later and the
  // markup and the header would disagree.
  const nonce = crypto.randomUUID();

  return createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    ssr: { nonce },
    context: { nonce },
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
