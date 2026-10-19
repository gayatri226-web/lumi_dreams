# Lumi Moonbolt · Junior Space-Car Engineer

A baby Moonling who fell off the Moon, crash-landed in a cloud city called Cloudport, and now builds flying sky-cars, and is teaching them to fly all the way back to the Moon.

**Live site:** _add your Vercel link here_

## The story (5 chapters, one per page)

| Chapter | Page | What happens |
|---|---|---|
| 0 | Preloader | Turn the key: Lumi flies in in her sky-car and says hi out loud (voice + typewriter), then crawls you into the site. |
| 1 · Meet Lumi | `/` | Hero with Lumi, Cloudport map, her passport (character sheet + stamps), a **3D Lumi you can spin** and **chat with**, and the crew. |
| 2 · Where I come from | `/origin` | A scroll-driven **3D film**: the Moon sneezes, a crumb of moonlight falls 384,400 km to a real Earth, lands in Cloudport's scrapyard as baby Lumi, who builds her first sky-car piece by piece. Ends on her full profile card. |
| 3 · What I build | `/garage` | Three playable sky-car machines and her engineer growth chart. |
| 4 · My big mission | `/journey` | Scroll to fly the **Moonbolt-1** sky-car from Cloudport, past Mars, Jupiter and Saturn, and land it on the Moon (realistic NASA planet maps, speed streaks, live distance and speed). |
| 5 · What's next | `/dreams` | Dream orbits to catch, and a live **wish guestbook** (Express + MongoDB). |

Every page ends with a "next chapter" card, so the site reads like a picture book.

## Judge's 2-minute path

1. Press **Start the engine**, listen to Lumi say hi, press **Launch**.
2. Home: drag the **3D Lumi**, type "my name is …" in the chat, then reload: she remembers you.
3. **Origin**: scroll slowly through the whole film.
4. **Journey**: scroll from liftoff to the Moon landing (confetti + passport stamp).
5. **Dreams**: post a wish, then refresh: it is saved on the server.
6. Easter eggs: honk the parked car on Home, play ★1 ★1 ★5 ★5 ★6 ★6 ★5 on the footer star piano, tuck Lumi in, chaos mode.

Sound is always one click (or the **M** key) away, with a volume slider next to the speaker button.

## Built with

- **MERN:** MongoDB (optional) + Express API, React 18 + Vite, React Router.
- **Motion:** GSAP + ScrollTrigger, Framer Motion, Lenis smooth scrolling.
- **3D:** Three.js (cel-shaded Lumi and sky-car, realistic Earth/Moon shaders, 3D nursery background).
- **Sound:** every effect and the lullaby are synthesized live with the Web Audio API; Lumi's voice uses the Web Speech API (prefers a real child voice when the device has one).
- Planet maps: public-domain NASA imagery (via the three.js and threex.planets example sets).

## Run it locally

```bash
npm install          # root tools
npm run install:all  # client + server
npm run dev          # API on :5000, site on http://localhost:5173
```

No database needed: without `MONGODB_URI` the API keeps wishes in memory.

## Deploy

- **Server (Render):** root directory `server`, build `npm install`, start `npm start`. Env: `CLIENT_ORIGIN` = your site URL, optional `MONGODB_URI`.
- **Site (Vercel):** root directory `client`, framework Vite. Env: `VITE_API_URL` = your Render URL.

If the API is asleep or unreachable, the guestbook and visitor counter fall back to the visitor's browser, so the site never breaks.

## API

| Method | Path | What it does |
|---|---|---|
| GET | `/api/health` | `{ ok, db }` |
| GET | `/api/wishes?limit=30` | Latest guestbook wishes |
| POST | `/api/wishes` | `{ name ≤24, wish ≤120 }`, 5 per minute per IP |
| GET | `/api/visits` | Current visit count |
| POST | `/api/visits` | Count a visit (once per browser session) |
