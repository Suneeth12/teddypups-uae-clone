# TeddyPups U.A.E. — Website Clone

A 1:1 frontend, typography, layout, and motion engineering clone of the real **[TeddyPups U.A.E. website](https://puppy.instabizweb.com/)**, rebuilt from the ground up with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Motion**, and **Lenis**.

> **Original Website & Attribution**
>
> - **Original Live Website:** [https://puppy.instabizweb.com/](https://puppy.instabizweb.com/)
> - **Purpose:** This project is an independent frontend and interactive motion engineering clone created to replicate and study the design, responsive layout, variable typography, and scroll-choreographed SVG animations of [puppy.instabizweb.com](https://puppy.instabizweb.com/).
> - **Rights:** All original brand identity, copy, photography, and video assets belong to their respective owners at TeddyPups U.A.E. (`https://puppy.instabizweb.com/`).

## Live Deployments

- **Vercel Production (Primary — Full AVIF/WebP + Security Headers):** [https://teddypups-uae-clone-seven.vercel.app/](https://teddypups-uae-clone-seven.vercel.app/)
- **GitHub Pages (Static Mirror):** [https://suneeth12.github.io/teddypups-uae-clone/](https://suneeth12.github.io/teddypups-uae-clone/)
- **Original Live Reference:** [https://puppy.instabizweb.com/](https://puppy.instabizweb.com/)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSuneeth12%2Fteddypups-uae-clone)

## Architecture

- **Framework**: Next.js 15.5 (`App Router`, static pre-rendering across `54` routes including `42` `/puppies/[slug]` pages, `/robots.txt`, and `/sitemap.xml`).
- **Fonts**: Variable Google Fonts via `next/font/google` — `Fraunces` (`SOFT`, `WONK`, `opsz`), `Shantell_Sans` (`BNCE`, `INFM`), and `Figtree`.
- **Styling**: Tailwind v4 design system in `src/app/globals.css`.
- **Motion Engine**:
  - `src/components/PupActor.tsx` + `pup-behaviors.ts`: Unified `motion/react` frame-loop mascot controller with cached layout metrics, paw-print stamping, cursor gaze, click tricks, and mobile lane mode.
  - `src/components/pup-journey.ts` + `pup-trajectory.ts`: Bezier S-curve transitions, smooth soft bounds, desktop scene-top hold caps, hop-out/hop-in arcs, and rest-snap settling.
  - `src/components/pup-kinematics.ts` + `pup-tricks.ts` + `pup-svg-paths.tsx`: 12 poses, 11 tricks, SSR pose transforms for zero-flash rendering.
  - `src/components/ScrollEffects.tsx`: Desktop fine-pointer Lenis smooth scroll synchronized on `frame.read`.
- **Forms**: `src/components/LetterForm.tsx` + `letter-envelope.tsx` with accessible validation, honeypot field, and envelope animation.
- **Production Hardening (`next.config.ts`)**:
  - Dual-target build: full AVIF/WebP image optimization + HTTP security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, immutable asset caching) on Vercel/Node, plus automatic static export (`GITHUB_PAGES=true`) for GitHub Pages.

## Routes

| Route | Purpose |
|---|---|
| `/` | Home story with hero lineup, pinned hallway door gallery, showroom/import split, WhatsApp simulator, trust cards, and dusk polaroid wall |
| `/puppies` | Filterable catalog (breed, origin, gender) with hand-drawn wobble sketch cards + gone-home strip |
| `/puppies/[slug]` | 42 statically generated puppy detail pages (15 available + 27 gone-home) with photo/video gallery |
| `/how-it-works` | Interactive Dubai vs. Imported journey tabs, promise steps, delivery guide |
| `/happy-families` | 64-photo natural-aspect masonry memory wall with accessible lightbox (`PhotoViewer`) |
| `/faq` | Live keyword search with `<mark>` highlighting and pinned noticeboard accordions |
| `/contact` | Envelope-sealing `LetterForm` with client validation, honeypot, and WhatsApp CTA |
| `/gone-home` | Archive of rehomed puppies |

## Quick Start

```powershell
npm install
npm run dev
```

Production build & run:

```powershell
npm run lint
npx tsc --noEmit
npm run build
npm run start
```

Deploy via Vercel CLI:

```powershell
npm install -g vercel
vercel login
vercel --prod
```

## Verification Suite (`tools/`)

- `python tools/pw-audit.py` — Full-page 1440px Playwright screenshot + Pixelmatch + DOM geometry/font/header/basket parity audit against `https://puppy.instabizweb.com/` across all 8 routes.
- `python tools/pw-e2e-mobile.py` — 390x844 mobile viewport parity + interactive E2E regression checks (filters, tabs, lightbox, FAQ search, form validation).
- `python tools/motion-trajectory-eval.py` — 31-step scroll trajectory coordinate diff against the original site (`d=(0,0)`) + non-home `PupBuddy` pose checks.
- `node tools/runtime-interactive-audit.mjs` — Runtime MP4 playback (`7/7` HTTP 200), console error, and mascot stop verification.
