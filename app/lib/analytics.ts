/**
 * Centralized analytics module.
 * All GA4 event calls go through here so tracking logic
 * stays in one place and components remain presentation-only.
 */

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

function isAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.gtag === "function";
}

// ── Page views ──────────────────────────────────────────────

export function trackPageView(trackingId: string, path: string) {
  if (!isAvailable()) return;
  window.gtag("config", trackingId, { page_path: path });
}

// ── Generic event ───────────────────────────────────────────

interface EventParams {
  category: string;
  label?: string;
  value?: number;
  [key: string]: unknown;
}

export function trackEvent(action: string, params: EventParams) {
  if (!isAvailable()) return;
  window.gtag("event", action, {
    event_category: params.category,
    event_label: params.label,
    value: params.value,
  });
}

// ── Predefined events ───────────────────────────────────────

export function trackNavClick(section: string) {
  trackEvent("nav_click", {
    category: "navigation",
    label: section,
  });
}

export function trackCtaClick(cta: string) {
  trackEvent("cta_click", {
    category: "engagement",
    label: cta,
  });
}

export function trackSocialClick(platform: string) {
  trackEvent("social_click", {
    category: "outbound",
    label: platform,
  });
}

export function trackResumeDownload() {
  trackEvent("resume_download", {
    category: "engagement",
    label: "resume_pdf",
  });
}
