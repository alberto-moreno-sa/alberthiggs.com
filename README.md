# alberthiggs.com

Personal portfolio site, built with [Remix](https://remix.run/) and [Tailwind CSS](https://tailwindcss.com/), rendered on [Cloudflare Pages](https://pages.cloudflare.com/) and driven by content from [Contentful](https://www.contentful.com/). Alongside the usual portfolio sections it hosts a WebGL flyover of Paseo de la Reforma built from public LiDAR data.

## Tech Stack

| Category  | Technology                                                          |
| --------- | ------------------------------------------------------------------- |
| Framework | [Remix](https://remix.run/) v2 + [Vite](https://vite.dev/) v6       |
| Language  | [TypeScript](https://www.typescriptlang.org/) 5                     |
| Styling   | [Tailwind CSS](https://tailwindcss.com/) v4 (CSS-first `@theme`)    |
| 3D        | [three.js](https://threejs.org/) + @react-three/fiber, drei         |
| CMS       | [Contentful](https://www.contentful.com/) (GraphQL Content API)     |
| Hosting   | [Cloudflare Pages](https://pages.cloudflare.com/) (Workers runtime) |
| Analytics | Google Analytics 4                                                  |
| Runtime   | Node.js >= 20                                                       |

## Features

- **Headless CMS** — bio, experience, projects, skills and testimonials live in Contentful, fetched in a single GraphQL query and validated at the boundary, so a malformed section degrades on its own instead of taking down the page
- **Reforma in 3D** — 12,414 buildings extruded to heights measured from INEGI LiDAR, streamed as ~50 KB tiles through a memory-bounded LRU cache; loaded lazily behind a click so it costs nothing for visitors who scroll past
- **Edge-cached SSR** — the rendered document is served from Cloudflare's edge with `stale-while-revalidate`, so repeat visits do not re-invoke the Worker
- **Image proxy** — Contentful assets are served same-origin through `/asset/*`, resized and converted to WebP, which keeps the CMS domain out of the CSP entirely
- **Scroll-driven animations** — IntersectionObserver reveals with staggered delays
- **Taco Builder** — scroll-progress section that assembles a taco layer by layer
- **Expandable cards** — experience and project cards expand with ResizeObserver-based height transitions
- **Animated counters** — hero stats count up with ease-out cubic easing
- **Security headers** — CSP, HSTS, X-Frame-Options and Permissions-Policy set in the server entry
- **Accessibility** — skip link, keyboard-operable disclosures, AA contrast, and `prefers-reduced-motion` honoured in CSS, JS and the WebGL viewer; enforced by `eslint-plugin-jsx-a11y`

## Project Structure

```
app/
├── components/
│   ├── ui/                  # Shared primitives — SectionHeader, Card, Pill, icons
│   ├── city/                # The Reforma 3D viewer (self-contained)
│   │   ├── CityViewer.tsx   # Scene, camera, hover picking, playback
│   │   ├── TileCache.ts     # Memory-bounded LRU over streamed tiles
│   │   ├── tileLoader.ts    # Binary tile fetch + decode
│   │   ├── geometry.ts      # Terrain and building geometry
│   │   ├── cityStore.ts     # useSyncExternalStore viewer state
│   │   ├── Timeline.tsx     # Station scrubber
│   │   ├── BuildingTooltip.tsx
│   │   ├── CacheStatus.tsx
│   │   ├── useFlightControls.ts
│   │   └── palette.ts
│   ├── About.tsx            # Bio, highlights, education
│   ├── Contact.tsx          # Email, phone and social links
│   ├── Experience.tsx       # Work timeline with expandable cards
│   ├── Footer.tsx
│   ├── GoogleAnalytics.tsx  # GA4 script injection
│   ├── Hero.tsx             # Hero section with animated stats
│   ├── Navbar.tsx           # Sticky nav with scroll tracking
│   ├── Projects.tsx         # Featured & filtered project sliders
│   ├── Skills.tsx           # Skill categories grid
│   ├── Survey.tsx           # Reforma section — gates the 3D viewer
│   ├── TacoBuilder.tsx      # Scroll-driven taco assembly
│   └── Testimonials.tsx
├── hooks/
│   ├── useCountUp.ts             # Animated number counter
│   ├── useExpandable.ts          # Expand/collapse with ResizeObserver
│   ├── useScrollAnimation.ts     # Scroll-triggered visibility
│   ├── useScrollProgress.ts      # Scroll progress (0–1)
│   └── usePrefersReducedMotion.ts
├── lib/
│   ├── analytics.ts         # GA4 event helpers
│   ├── contentful.ts        # GraphQL client, types and boundary validation
│   ├── seo.ts               # Site metadata, meta tags and links
│   └── slugify.ts
├── routes/
│   ├── _index.tsx           # Home — loader, cache headers, section layout
│   ├── $.tsx                # 404
│   ├── asset.$type.$slug.ts # Same-origin proxy for Contentful images
│   ├── resume.ts            # Same-origin proxy for the résumé PDF
│   ├── sitemap[.]xml.ts
│   └── lab.survey.tsx       # Full-screen 3D viewer
├── app.css                  # @theme tokens, base styles, keyframes
├── entry.client.tsx         # Client hydration
├── entry.server.tsx         # Streaming SSR + security headers
└── root.tsx                 # Root layout, skip link, error boundary
functions/
└── [[path]].ts              # Cloudflare Pages function handler
public/
└── data/city/               # Pre-built city tiles and index
```

## Getting Started

### Prerequisites

- Node.js **>= 20**
- A [Contentful](https://www.contentful.com/) space with the matching content model
- (Optional) A Google Analytics 4 property

### Environment Variables

Create a `.dev.vars` file in the project root:

```
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_access_token
GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

`CONTENTFUL_ACCESS_TOKEN` is a **Content Delivery** token — read-only. A Content Management token is not needed to run the site and should not be kept here.

### Installation

```bash
git clone https://github.com/alberthiggs/alberthiggs.com.git
cd alberthiggs.com
npm install
npm run dev
```

The site will be available at `http://localhost:5173`.

### Available Scripts

| Command                | Description                                   |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Start Remix + Vite dev server                 |
| `npm run build`        | Production build                              |
| `npm run preview`      | Preview production build locally via Wrangler |
| `npm run deploy`       | Deploy to Cloudflare Pages                    |
| `npm run typecheck`    | Run TypeScript type checking                  |
| `npm run lint`         | ESLint, including jsx-a11y rules              |
| `npm run format`       | Format with Prettier                          |
| `npm run format:check` | Verify formatting without writing             |

## Content Model

All content lives in a single Contentful content type, `siteSection`, with two fields: `sectionId` (short text) and `content` (JSON object). One entry per section, using these ids:

| `sectionId`    | Shape                                                                               |
| -------------- | ----------------------------------------------------------------------------------- |
| `personal`     | Object — name, title, email, heroTagline, heroStats[], bio[], highlights[]          |
| `experience`   | Array of roles — company, role, period, description, achievements[], technologies[] |
| `projects`     | Array — name, slug, descriptions, technologies[], highlights[], featured            |
| `skills`       | Array — title, iconId, skills[]                                                     |
| `testimonials` | Array — name, role, company, quote                                                  |

Because the content is hand-authored JSON, `app/lib/contentful.ts` shape-checks each section at the boundary. A malformed entry is dropped and logged with its section id; a malformed `personal` is fatal, since the page means nothing without it.

## Deployment

Pushing to `main` runs `.github/workflows/release.yml`, which:

1. **verify** — typecheck, lint, format check and build. Everything downstream depends on this, so a red check never reaches production.
2. **release** — cuts the next patch tag and creates a GitHub release with generated notes.
3. **deploy** — builds and deploys to Cloudflare Pages.

### Required secrets

Set these in the repo under **Settings → Secrets and variables → Actions**:

| Secret                  | Description                          |
| ----------------------- | ------------------------------------ |
| `CLOUDFLARE_API_TOKEN`  | Cloudflare API token with Pages edit |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID                |

Set these in the **Cloudflare Pages** project environment variables:

| Variable                  | Description               |
| ------------------------- | ------------------------- |
| `CONTENTFUL_SPACE_ID`     | Contentful space ID       |
| `CONTENTFUL_ACCESS_TOKEN` | Contentful delivery token |
| `GA_MEASUREMENT_ID`       | Google Analytics 4 ID     |

## Data Credits

Elevation data — Fuente: INEGI, Modelos Digitales de Elevación de alta resolución LiDAR 1.5 m, sheets E14A39 B1–B4, 2020 edition. Building footprints © Overture Maps Foundation / © OpenStreetMap contributors (ODbL).
