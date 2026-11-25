# TeddyPups U.A.E.

Next.js 15 (App Router) + React 19 + TypeScript storefront for TeddyPups U.A.E., featuring a scroll-choreographed SVG mascot engine, 64-photo family memory wall, filterable catalog across 42 puppy profiles, and an accessible letter enquiry form.

## Architecture

- **Framework**: Next.js 15.5 (`App Router`, static pre-rendering across `54` routes including `42` `/puppies/[slug]` pages, `/robots.txt`, and `/sitemap.xml`).
- **Fonts**: Variable Google Fonts via `next/font/google` — `Fraunces` (`SOFT`, `WONK`, `opsz`), `Shantell_Sans` (`BNCE`, `INFM`), and `Figtree`.
- **Styling**: Pre-compiled Tailwind v4 design system in `src/app/globals.css`.
- **Motion Engine**:
  - `src/components/PupActor.tsx` + `pup-behaviors.ts`: Unified `motion/react` frame-loop mascot controller with cached layout metrics, paw-print stamping, cursor gaze, click tricks, and mobile lane mode.
  - `src/components/pup-journey.ts` + `pup-trajectory.ts`: Bezier S-curve transitions, smooth soft bounds, desktop scene-top hold caps, hop-out/hop-in arcs, and rest-snap settling.
  - `src/components/pup-kinematics.ts` + `pup-tricks.ts` + `pup-svg-paths.tsx`: 12 poses, 11 tricks, SSR pose transforms for zero-flash rendering.
  - `src/components/ScrollEffects.tsx`: Desktop fine-pointer Lenis smooth scroll synchronized on `frame.read`.
- **Forms**: `src/components/LetterForm.tsx` + `letter-envelope.tsx` with accessible validation, honeypot field, and envelope animation.
- **Production Hardening (`next.config.ts`)**:
  - AVIF & WebP responsive image optimization (`images.formats`).
  - HTTP security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) and `immutable` 1-year caching on `/media/*`, `/brand/*`, and `/cursor/*`.

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

## Verification Suite (`tools/`)

- `python tools/pw-audit.py` — Full-page 1440px Playwright screenshot + Pixelmatch + DOM geometry/font/header/basket parity audit across all 8 routes.
- `python tools/pw-e2e-mobile.py` — 390x844 mobile viewport parity + interactive E2E regression checks (filters, tabs, lightbox, FAQ search, form validation).
- `python tools/motion-trajectory-eval.py` — 31-step scroll trajectory coordinate diff against live production (`d=(0,0)`) + non-home `PupBuddy` pose checks.
- `node tools/runtime-interactive-audit.mjs` — Runtime MP4 playback (`7/7` HTTP 200), console error, and mascot stop verification.
