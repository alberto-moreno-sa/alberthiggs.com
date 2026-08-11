# alberthiggs.com

Personal portfolio site, built with [TanStack Start](https://tanstack.com/start) and [Tailwind CSS](https://tailwindcss.com/), rendered on [Cloudflare Workers](https://workers.cloudflare.com/) and driven by content from [Contentful](https://www.contentful.com/). Alongside the usual portfolio sections it hosts a WebGL flyover of Paseo de la Reforma built from public LiDAR data.

## Tech Stack

| Category  | Technology                                                                  |
| --------- | --------------------------------------------------------------------------- |
| Framework | [TanStack Start](https://tanstack.com/start) + [Vite](https://vite.dev/) v8 |
| Language  | [TypeScript](https://www.typescriptlang.org/) 5                             |
| Styling   | [Tailwind CSS](https://tailwindcss.com/) v4 (CSS-first `@theme`)            |
| 3D        | [three.js](https://threejs.org/) + @react-three/fiber, drei                 |
| CMS       | [Contentful](https://www.contentful.com/) (GraphQL Content API)             |
| Hosting   | [Cloudflare Workers](https://workers.cloudflare.com/) (static assets + SSR) |
| Analytics | Google Analytics 4                                                          |
| Runtime   | Node.js >= 22 (wrangler 4 requires it)                                      |

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
src/
├── routes/                  # File-based routing (TanStack Router)
│   ├── __root.tsx           # Document shell, head, skip link, error pages
│   ├── index.tsx            # Home — loader + section layout
│   ├── lab/survey.tsx       # Full-screen 3D viewer
│   ├── asset.$type.$slug.ts # Server route: same-origin Contentful image proxy
│   ├── resume.ts            # Server route: same-origin résumé proxy
│   └── sitemap[.]xml.ts     # Server route
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
│   ├── cn.ts                # clsx + tailwind-merge
│   ├── contentful.ts        # GraphQL client, types and boundary validation
│   ├── safeUrl.ts           # Scheme validation for CMS-provided URLs
│   ├── securityHeaders.ts   # CSP, HSTS and cache headers
│   ├── seo.ts               # Site metadata, meta tags and links
│   └── slugify.ts
├── router.tsx               # Router construction, per-request CSP nonce
├── server.ts                # Worker entry — stamps security headers on every response
├── start.ts                 # Request middleware
└── styles.css               # @theme tokens, base styles, keyframes
public/
├── _headers                 # Cache-Control for static assets and city tiles
└── data/city/               # Pre-built city tiles and index
```

## Getting Started

### Prerequisites

- Node.js **>= 22** — wrangler 4 refuses to run on older versions (`.nvmrc` pins it)
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

### Running in Docker

Optional, and mostly worth it to avoid needing the right Node on your PATH —
wrangler 4 refuses to start on Node 20, which is easy to trip over when nvm has
not been sourced in the current shell.

```bash
docker compose up dev       # Vite dev server with HMR — http://localhost:3000
docker compose up preview   # production build on the Workers runtime — http://localhost:4173
```

Both read secrets from `.dev.vars`, which stays on the host and is never copied
into the image.

Use `dev` while writing components. Use `preview` for anything that only exists
in the Worker — the CSP nonce, the security headers, the HTML edge cache, and
the `/asset`, `/resume` and sitemap server routes. `dev` does not run
`src/server.ts` at all, so none of that is exercised there.

### Available Scripts

| Command                | Description                                   |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Start the Vite dev server                     |
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

Because the content is hand-authored JSON, `src/lib/contentful.ts` shape-checks each section at the boundary. A malformed entry is dropped and logged with its section id; a malformed `personal` is fatal, since the page means nothing without it.

## Deployment

Pushing to `main` runs `.github/workflows/release.yml`, which:

1. **verify** — typecheck, lint, format check and build. Everything downstream depends on this, so a red check never reaches production.
2. **release** — cuts the next patch tag and creates a GitHub release with generated notes.
3. **deploy** — builds and runs `wrangler deploy` (Workers, not Pages).

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
