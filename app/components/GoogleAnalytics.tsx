import { useLocation } from "@remix-run/react";
import { useEffect } from "react";
import { trackPageView } from "~/lib/analytics";

/**
 * Injects the GA4 gtag.js script + sends page_view on every client-side
 * navigation. Renders nothing when no measurement ID is provided.
 */
// GA measurement IDs are always G-XXXXXXXXXX or UA-XXXXXXXX-X
const GA_ID_PATTERN = /^(G|UA)-[A-Z0-9-]+$/i;

export const GoogleAnalytics = ({ gaTrackingId }: { gaTrackingId?: string }) => {
  const location = useLocation();

  const safeId =
    gaTrackingId && GA_ID_PATTERN.test(gaTrackingId) ? gaTrackingId : null;

  useEffect(() => {
    if (safeId) {
      trackPageView(safeId, location.pathname + location.search);
    }
  }, [safeId, location]);

  if (!safeId) return null;

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${safeId}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(safeId)},{send_page_view:true});`,
        }}
      />
    </>
  );
};
