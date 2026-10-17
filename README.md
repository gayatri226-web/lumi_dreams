# Anew Moonbolt · Junior Sky-Car Engineer

Solo entry for **Baby's First Website** (haX.baby, 17–19 Oct 2026), Track 2: an original baby.

Anew is a baby Moonling who fell off the Moon, crash-landed in Cloudport, and now builds flying cars so the littlest creatures get to bed on time. *Small hands. Big launches.*

Built with the **MERN** stack: MongoDB, Express, React, Node. Animation is **GSAP** (with ScrollTrigger) and **Framer Motion**.

## The flow

1. **Preloader.** A real starry sky. Anew's name pops in, the pink sky-car flies in and waves, and the starlight tank fills. Then you hit Launch.
2. **Pink crawl transition.** Every page jump goes through a pink polka-dot screen while Anew crawls across, leaving hearts.
3. **Hello.** Anew's eyes follow your cursor, dream planets orbit around the baby, and space mode drops the goggles.
4. **Workshop.** Three playable projects: a cloud-dodging game, a constellation charger, and a lullaby route that draws itself as you scroll.
5. **Level-up path.** How Anew grows as an engineer, from Spoon Tinkerer to Galaxy Bridge Builder.
6. **Space story.** Scroll to fall from the Moon to Cloudport, then launch the rocket back home.
7. **Dream orbits, live guestbook and hit counter.**

**Easter egg:** honk the parked car 5 times.

## Brief checklist

| Requirement | Where |
|---|---|
| What they are | Hero + 5-point character sheet |
| What they do | Workshop: Puddle-Jumper, Star-Charger, Comet Courier |
| Their story | Scroll-driven space story (GSAP ScrollTrigger) + click-to-launch rocket |
| Immersion | Eye tracking, Web Audio sounds with mute, space mode |
| Mobile | Responsive down to 360px |
| Easter egg | Parked car horn × 5 → Rainbow Rocket |
| Tier 2 | Constellation toy, scroll-synced SVG route, mini-game |
| Tier 3 | Live guestbook (MongoDB), visitor memory ("welcome back") |
| Side quests | Live guestbook, sparkle trail, hit counter, click sounds + mute, chaos mode |

## Run it locally

```bash
npm install          # root tools
npm run install:all  # client + server
npm run dev          # API on :5000, site on http://localhost:5173
```

No database needed to try it: without `MONGODB_URI` the API uses an in-memory store. To use MongoDB, copy `server/.env.example` to `server/.env` and paste your Atlas connection string.

## Deploy

**Option A: one service on Render (simplest).** Push to GitHub, then on Render choose New → Blueprint and select this repo (it reads `render.yaml`). Set `MONGODB_URI` to your Atlas string. Render builds the React app and Express serves both the site and the API.

**Option B: Vercel + Render.** Deploy `server/` on Render (build `npm install`, start `npm start`), then deploy `client/` on Vercel (framework Vite) with `VITE_API_URL` set to the Render URL, and set the server's `CLIENT_ORIGIN` to the Vercel URL.

If the API is ever unreachable, the guestbook and counter fall back to the visitor's browser and say so, so the site never breaks.

## API

| Method | Path | What it does |
|---|---|---|
| GET | `/api/health` | `{ ok, db }` |
| GET | `/api/wishes?limit=30` | Latest guestbook wishes |
| POST | `/api/wishes` | `{ name ≤24, wish ≤120 }`, 5 per minute per IP |
| GET | `/api/visits` | Current hit count |
| POST | `/api/visits` | Count a visit (once per browser session) |

## Structure

```
client/                 React + Vite
  src/App.jsx           page flow
  src/context/          app state: sound, space mode, chaos, transitions, toasts
  src/components/       one file per section, art/ for SVG characters, workshop/ for the toys
  src/lib/              Web Audio synth, API client, helpers
  src/styles/global.css all styles (design tokens at the top)
server/                 Express + Mongoose
  src/index.js          app, security, static hosting in production
  src/store.js          MongoDB or in-memory data access
  src/models/           Wish, Counter
  src/routes/           wishes, visits
```

## Credits

Anew and friends are original characters drawn in SVG. Animation: GSAP 3 + ScrollTrigger and Framer Motion. Confetti: canvas-confetti. Font: Baloo 2 (Google Fonts). Every sound is synthesized live with the Web Audio API. AI coding help: Claude.
