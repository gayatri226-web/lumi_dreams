# Anew Moonbolt · Junior Sky-Car Engineer

Solo entry for **Baby's First Website** (haX.baby, 17–19 Oct 2026). Track 2: an original baby.

Anew is a baby Moonling who fell off the Moon, crash-landed in Cloudport, and now builds flying cars so the littlest creatures get to bed on time. *Small hands. Big launches.*

## Run it
No build step. Open `index.html`, or:
```
npx serve .
```

## Deploy
Vercel: import the repo, framework preset **Other**, no build command, output directory `.`
GitHub Pages: Settings → Pages → deploy from `main`, root.

## What's inside
| Brief requirement | Where |
|---|---|
| What they are | Hero + 5-point character sheet |
| What they do | Workshop: Puddle-Jumper game, Star-Charger, Comet Courier |
| Their story | Scroll-driven space story with click-to-launch rocket |
| Immersion | Eye tracking, Web Audio sounds + mute, space mode |
| Mobile | Responsive down to 360px |
| Easter egg | Honk the parked car 5 times |

Side quests: sparkle trail, click sounds + mute, hit counter, guestbook, chaos mode.

## Structure
```
index.html      markup + inline SVG art
css/style.css   all styles
js/main.js      all interactions
assets/         favicon and art
```

## Credits
Anew and friends are original characters drawn in SVG. Animation: GSAP 3.12.5 and the Web Animations API. Confetti: canvas-confetti 1.9.3. Font: Baloo 2 (Google Fonts). All sounds are synthesized with the Web Audio API.
