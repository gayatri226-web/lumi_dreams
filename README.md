# Lumi · Junior Sky-Car Engineer

Solo entry for **Baby's First Website** (haX.baby, 17–19 Oct 2026), Track 2: an original baby.

Lumi is a baby Moonling in a pink cloud-ear hood who fell off the Moon, crash-landed in Cloudport, and now builds flying cars so the littlest creatures get to bed on time. *Small hands. Big launches.*

Built with the **MERN** stack (MongoDB, Express, React, Node), animated with **GSAP + ScrollTrigger** and **Framer Motion**. Lumi talks out loud with the Web Speech API, and every sound is synthesized with the Web Audio API.

## The flow

1. **Arrival.** A real starry sky and Lumi's name. Turn the key ("Start the engine"), which also unlocks sound. The pink sky-car flies in, Lumi waves and *says hi out loud* while the starlight tank fills, then Launch.
2. **Pink crawl transition.** Every page change goes through a pink polka-dot screen while Lumi crawls across, leaving hearts.
3. **Home: Lumi's sky.** Lumi's eyes follow your cursor, dream planets orbit, and clicking makes Lumi talk. Below that:
   - Cloudport, a floating island map where every building is a door to a page
   - Lumi's **cosmic passport** (the character sheet), with 5 stamps to earn
   - the crew
4. **Garage.** A striped garage door rolls up as you scroll to reveal three playable machines. Then the growth chart, where Lumi grows taller next to a nursery measuring tape as you scroll through the engineer levels.
5. **Journey.** Scroll to fall from the Moon to Cloudport, then launch the rocket back home with a spoken countdown.
6. **Dreams.** Catch dreams orbiting sleeping Lumi, then post a wish at the Wish Post Office (the live guestbook).
7. **Bedtime footer on every page.** Lumi sleeps in a rocking moon cradle. Play the star piano, tuck Lumi in to start the music box, check the visitor odometer, or follow the webring.

**Easter eggs:** honk the parked car 5 times; play Twinkle Twinkle (★1 ★1 ★5 ★5 ★6 ★6 ★5) on the star piano.

## Brief checklist

| Requirement | Where |
|---|---|
| What they are | Home: cosmic passport (5-point character sheet) |
| What they do | Garage: Puddle-Jumper game, Star-Charger, Comet Courier + growth-chart level-up path |
| Their story | Journey: scroll-driven fall from the Moon + click-to-launch rocket |
| Immersion | Eye tracking, spoken voice, Web Audio sounds, music box, space mode, mute |
| Mobile | Responsive down to 360px, cloud menu on phones |
| Easter egg | Car horn × 5 → Rainbow Rocket; Twinkle on the star piano |
| Tier 2 | Constellation toy, garage door + growth chart ScrollTrigger scenes, mini-game |
| Tier 3 | Live guestbook (MongoDB), visitor memory, character that talks back |
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

## Structure (client)

```
src/pages/          Home, Garage, Journey, Dreams, NotFound
src/components/
  art/              Lumi, crawler, sky-car, crew, cloud (all SVG)
  layout/           Header (cloud nav), Preloader, CrawlTransition, Footer (bedtime), ScrollCar, Effects
  fx/               StarSky canvas, SplitTitle, ParallaxClouds, PageHero
  home/ garage/ journey/ dreams/   page sections
src/data/content.js all of Lumi's words in one place
src/lib/            sound (Web Audio), voice (Web Speech), api, helpers
```

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

Lumi and friends are original characters drawn in SVG. Animation: GSAP 3 + ScrollTrigger and Framer Motion. Confetti: canvas-confetti. Voice: Web Speech API. Font: Baloo 2 (Google Fonts). Every sound is synthesized live with the Web Audio API. AI coding help: Claude.
