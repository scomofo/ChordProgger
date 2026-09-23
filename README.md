# Cadence

**Play the changes.** Cadence is a chord-progression player and songwriting
practice app: pick a key and mode, build a progression from scale degrees
(or start from a preset), and hear it played back through a Web Audio
engine with piano, plucked-string, and pad voices.

This repo is an export of a Grok App Builder project.

## Stack

- **TanStack Start** (React 19, file-based routes) + **Vite 8**
- **Tailwind CSS 4**, Radix UI primitives, zustand
- **better-auth** for sign-in (optional — disabled by default, see below)
- **PGlite + Kysely** for Postgres-compatible persistence (local PGlite
  fallback; set `DATABASE_URL` for a real Postgres)
- **Web Audio** lookahead-scheduler playback engine (no audio assets)

## Quick start

Requires **Node 22**.

```sh
npm ci
npm run dev      # serve on http://0.0.0.0:8080
```

## Scripts

| Command              | What it does                                              |
| -------------------- | --------------------------------------------------------- |
| `npm run dev`        | Start the dev server (`0.0.0.0:8080`)                     |
| `npm run build`      | Production build, then `db:migrate`                       |
| `npm run db:migrate` | Run SQL migrations (`migrations/`); skips cleanly when `DATABASE_URL` is unset (PGlite migrates itself) |
| `npm test`           | Script unit tests (`node --test`) + TS suites             |
| `npm run lint`       | ESLint (must stay at 0 errors, 0 warnings)                |
| `npm run typecheck`  | `tsc --noEmit`                                            |
| `npm run format`     | Prettier                                                  |
| `npm run check:auth` | Verify the auth on/off invariant                          |

## Auth

Auth is **off** by default (`VITE_AUTH_ENABLED=false`); the app runs with a
local dev user and per-browser state. Turn it on via the platform env to
get real better-auth sign-in. `npm run check:auth` guards the invariant.

## Project structure

```
src/
  routes/            # TanStack Start file routes (__root, index)
  router.tsx         # router setup
  components/
    cadence/         # app UI (studio sidebar, chord grid, transport…)
    ui/              # shared Radix/shadcn-style primitives
  lib/
    music/           # the theory + playback core
      theory.ts      # keys, modes, qualities, intervals, voicings
      progressions.ts# preset progressions (recipes + mode metadata)
      patterns.ts    # strum/fingerpicking patterns
      engine.ts      # Web Audio lookahead scheduler (piano/pluck/pad)
      store.ts       # zustand store (key, mode, slots, saved charts)
    app-data/        # viewer connector data (gated)
    auth/            # better-auth client, gates, hooks
    db.ts            # Kysely + PGlite/Postgres
    og/              # share-card metadata (src/lib/og/site.json)
server/              # Nitro middleware (PWA head injection, platform chrome)
scripts/             # build/test/dev tooling (incl. grok-pwa platform scripts)
migrations/          # SQL migrations
public/              # static assets (og.jpg share card, icons)
```

### Music core

- `theory.ts` — source of truth for keys, the five modes
  (major / minor / dorian / mixolydian / harmonic-minor), per-degree
  chord qualities, and voicings.
- `progressions.ts` — preset recipes as scale-degree steps. Presets whose
  hints assume a mode (e.g. Lament's `i–VII–VI–V`) declare `mode: "minor"`;
  `loadPreset` in `store.ts` switches to it.
- `engine.ts` — lookahead scheduler driving three synthesized voices;
  lazy-inits `AudioContext` on first play, never at import time.

## Tests

- `scripts/**/*.test.mjs` — platform/tooling unit tests (`node --test`).
- `src/**/*.test.ts` — app unit tests via
  `node --experimental-strip-types --test` (testable modules use explicit
  `.ts` import extensions so node can resolve them).
- `npm test` runs both; the script suite runs first via `&&`.

## Deploy

Deployed to Vercel. `npm run build` emits `.vercel/output` (git-ignored;
regenerated on every build). Only `VITE_`-prefixed env vars reach the
browser; never commit a `.env` file.
