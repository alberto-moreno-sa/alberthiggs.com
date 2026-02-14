# alberthiggs.com

Personal portfolio website for Albert Higgs, built with [Remix](https://remix.run/) and [Tailwind CSS](https://tailwindcss.com/). The site showcases a hero section, about me, work experience, projects, skills, testimonials, and a contact form. Content is managed through [Contentful](https://www.contentful.com/) and the app is deployed on [Cloudflare Pages](https://pages.cloudflare.com/).

## Tech Stack

| Category  | Technology                                                       |
| --------- | ---------------------------------------------------------------- |
| Framework | [Remix](https://remix.run/) v2 + [Vite](https://vite.dev/) v6    |
| Language  | [TypeScript](https://www.typescriptlang.org/) 5                  |
| Styling   | [Tailwind CSS](https://tailwindcss.com/) v4                      |
| CMS       | [Contentful](https://www.contentful.com/) (Content Delivery API) |
| Hosting   | [Cloudflare Pages](https://pages.cloudflare.com/)                |
| Analytics | Google Analytics 4                                               |
| Runtime   | Node.js >= 20                                                    |

## Features

- **Streaming SSR** — Remix `defer` + React `Suspense` for fast initial loads with progressive data hydration
- **Headless CMS** — All content (bio, experience, projects, skills, testimonials) managed in Contentful
- **Custom cursor** — Interactive cursor with hover expansion; respects `prefers-reduced-motion` and touch devices
- **Preloader animation** — Concentric rotating circles with smooth fade-out
- **Scroll-driven animations** — Intersection Observer fade-in/slide-up with staggered delays
- **Taco Builder** — Fun scroll-progress section that assembles a taco layer by layer
- **Expandable cards** — Experience and project cards expand/collapse with ResizeObserver-based height transitions
- **Animated counters** — Hero stats count up with ease-out cubic easing
- **Security headers** — CSP, HSTS, X-Frame-Options, Permissions-Policy set in the server entry
- **Responsive design** — Mobile-first layout with desktop navigation and glass morphism effects
- **Accessibility** — Keyboard navigation, ARIA attributes, reduced-motion support

## Project Structure

```
app/
├── components/
│   ├── About.tsx            # Bio, highlights, education
│   ├── Contact.tsx          # Email and social links
│   ├── CustomCursor.tsx     # Interactive custom cursor
│   ├── Experience.tsx       # Work timeline with expandable cards
│   ├── Footer.tsx           # Site footer
│   ├── GoogleAnalytics.tsx  # GA4 script injection
│   ├── Hero.tsx             # Hero section with animated stats
│   ├── Navbar.tsx           # Sticky nav with scroll tracking
│   ├── Preloader.tsx        # Loading animation
│   ├── Projects.tsx         # Featured & filtered project grid
│   ├── Skills.tsx           # Skill categories grid
│   ├── TacoBuilder.tsx      # Scroll-driven taco assembly
│   └── Testimonials.tsx     # Testimonial cards
├── hooks/
│   ├── useCountUp.ts        # Animated number counter
│   ├── useExpandable.ts     # Expand/collapse with ResizeObserver
│   ├── useScrollAnimation.ts # Scroll-triggered visibility
│   └── useScrollProgress.ts  # Scroll progress (0–1)
├── lib/
│   ├── analytics.ts         # GA4 event helpers
│   └── contentful.ts        # Contentful client & types
├── routes/
│   └── _index.tsx           # Main page loader & layout
├── app.css                  # Global styles & custom animations
├── entry.client.tsx         # Client hydration
├── entry.server.tsx         # SSR + security headers
└── root.tsx                 # Root layout & metadata
functions/
└── [[path]].ts              # Cloudflare Pages function handler
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

### Installation

```bash
# Clone the repository
git clone https://github.com/alberthiggs/alberthiggs.com.git
cd alberthiggs.com

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The site will be available at `http://localhost:5173`.

### Available Scripts

| Command             | Description                                   |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Start Remix + Vite dev server                 |
| `npm run build`     | Production build                              |
| `npm run preview`   | Preview production build locally via Wrangler |
| `npm run deploy`    | Deploy to Cloudflare Pages                    |
| `npm run typecheck` | Run TypeScript type checking                  |

## Deployment

Production deploys are triggered automatically when a **GitHub Release** is published. The workflow (`.github/workflows/deploy.yml`) builds the app and deploys to Cloudflare Pages.

### How to deploy

```bash
# Create a tag and push it
git tag v1.0.0
git push origin v1.0.0
```

Then go to **GitHub → Releases → Draft a new release**, select the tag, and click **Publish release**. The deploy workflow will run automatically.

You can also create the release directly from the CLI:

```bash
gh release create v1.0.0 --generate-notes
```

### Required secrets

Set these in your repo under **Settings → Secrets and variables → Actions**:

| Secret                   | Description                          |
| ------------------------ | ------------------------------------ |
| `CLOUDFLARE_API_TOKEN`   | Cloudflare API token with Pages edit |
| `CLOUDFLARE_ACCOUNT_ID`  | Your Cloudflare account ID           |

Set these in your **Cloudflare Pages** project environment variables:

| Variable                   | Description                |
| -------------------------- | -------------------------- |
| `CONTENTFUL_SPACE_ID`      | Contentful space ID        |
| `CONTENTFUL_ACCESS_TOKEN`  | Contentful delivery token  |
| `GA_MEASUREMENT_ID`        | Google Analytics 4 ID      |
