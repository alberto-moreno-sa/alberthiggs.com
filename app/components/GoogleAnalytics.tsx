import { useLocation } from "@remix-run/react";
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

  // Track page views on navigation
  useEffect(() => {
    if (safeId && loaded) {
      trackPageView(safeId, location.pathname + location.search);
    }
  }, [safeId, loaded, location]);

  return null;
};
