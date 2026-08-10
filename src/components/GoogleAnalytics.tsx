import { useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { trackPageView } from "~/lib/analytics";

const GA_ID_PATTERN = /^(G|UA)-[A-Z0-9-]+$/i;

/**
 * Deferred GA4 loader — injects gtag.js only after the page is idle,
 * avoiding render-blocking and improving Lighthouse performance scores.
 */
export const GoogleAnalytics = ({
  gaTrackingId,
}: {
  gaTrackingId?: string;
}) => {
  const location = useLocation();
  const [loaded, setLoaded] = useState(false);

  const safeId =
    gaTrackingId && GA_ID_PATTERN.test(gaTrackingId) ? gaTrackingId : null;

  // Load GA script after the page is idle
  useEffect(() => {
    if (!safeId || loaded) return;

    const load = () => {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer.push(arguments);
      };
      window.gtag("js", new Date());
      window.gtag("config", safeId, { send_page_view: true });

      const script = document.createElement("script");
      script.src = `https://www.googletagmanager.com/gtag/js?id=${safeId}`;
      script.async = true;
      document.head.appendChild(script);

      setLoaded(true);
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(load);
    } else {
      setTimeout(load, 2000);
    }
  }, [safeId, loaded]);

  // Track page views on navigation.
  //
  // `location.href` — not `pathname + search`. Under Remix, `search` was the
  // raw query string; TanStack Router parses it into an object, so
  // concatenating threw "Cannot convert object to primitive value" at render.
  // TypeScript allows `string + object`, so only the browser caught it.
  // `href` is documented as pathname + search + hash, which is what GA wants.
  useEffect(() => {
    if (safeId && loaded) {
      trackPageView(safeId, location.href);
    }
  }, [safeId, loaded, location]);

  return null;
};
