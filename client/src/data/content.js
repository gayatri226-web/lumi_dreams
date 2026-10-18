// All of Lumi's words live here so the copy is easy to edit in one place.

export const NAME = 'Lumi';

export const PAGES = [
  { path: '/', label: 'Home', title: "Lumi's sky" },
  { path: '/garage', label: 'Garage', title: 'The Sky-Car Garage' },
  { path: '/journey', label: 'Journey', title: 'My space journey' },
  { path: '/dreams', label: 'Dreams', title: 'The Dream Observatory' },
];

// The 5-point character sheet (Track 2 requirement).
export const SHEET = [
  ['Name', 'Lumi Moonbolt'],
  ['What I am', 'A baby Moonling: a crumb of moonlight in a pink cloud-ear hood, with very big eyes and very small hands.'],
  ['What I do', 'Junior Sky-Car Engineer. I build and fix flying cars so sleepy creatures get home by bedtime.'],
  ['My story', 'I fell off the Moon, bounced into a Cloudport scrapyard, and built my first car out of a teacup.'],
  ['Tagline', '“Small hands. Big launches.”'],
];

// Passport stamps: each one is earned by doing something on the site.
export const STAMPS = [
  { id: 'garage', label: 'Sky-Car Garage', task: 'Visit my garage', color: '#FF8FB8', icon: 'wrench' },
  { id: 'journey', label: 'Launchpad', task: 'Launch my rocket', color: '#9DB8FF', icon: 'rocket' },
  { id: 'dreams', label: 'Dream Observatory', task: 'Catch a dream', color: '#FFC24D', icon: 'star' },
  { id: 'post', label: 'Wish Post Office', task: 'Send me a wish', color: '#7BD3A8', icon: 'heart' },
  { id: 'secret', label: '???', task: 'Find a secret', color: '#C9A8FF', icon: 'moon' },
];

// Engineer level-up path, drawn as a nursery growth chart.
export const LEVELS = [
  { n: 1, cm: 52, title: 'Spoon Tinkerer', copy: 'Took apart my first rattle to see where the jingle lives.', tool: "A spoon (it's a screwdriver)", color: '#C8F0DE' },
  { n: 2, cm: 64, title: 'Crib Mechanic', copy: 'Gave my crib wheels. Then a motor. Then a seatbelt, just in case.', tool: 'Rubber-band engine', color: '#CFE6FF' },
  { n: 3, cm: 76, title: 'Junior Sky-Car Engineer', copy: 'Now I build and fix flying cars at Cloudport Garage. Bay 3 is mine!', tool: 'Starlight fuel', color: '#FF8FB8', here: true },
  { n: 4, cm: 92, title: 'Orbit Architect', copy: 'Next dream: a sky-car that can loop all the way around the Moon.', tool: 'Gravity wrench', future: true },
  { n: 5, cm: 110, title: 'Galaxy Bridge Builder', copy: 'Big dream: a bridge between stars so nobody has to fly home alone.', tool: '??? (still inventing it)', future: true },
];

export const SCENES = [
  { km: '384,400 km', title: 'A crumb falls off the Moon', copy: 'One sleepy night the Moon sneezed. A tiny crumb tumbled off, and that crumb was me.' },
  { km: '300,000 km', title: 'Crash-landing in Cloudport', copy: 'I bounced into a scrapyard full of broken sky-cars. Nobody was fixing them, so I picked up a spoon.' },
  { km: '120,000 km', title: 'The teacup car', copy: 'A teacup, two springs and one very helpful firefly. It flew! Sort of. Mostly sideways.' },
  { km: '2 km', title: 'Cloudport hires a baby', copy: 'Now I fix cars for sleepy ghosts, foxes and turtles who need a ride home before bedtime.' },
];

export const DREAMS = [
  { r: 80, speed: 1.6, color: '#FF8FB8', title: 'A car that folds into a pillow', text: "Fly to Grandma's, land, fold it up, take a nap on it. Perfect.", pct: 60 },
  { r: 122, speed: 1.1, color: '#FFE38A', title: 'Loop-the-Moon license', text: 'Pass my flying test so I can loop around the Moon without asking.', pct: 35 },
  { r: 162, speed: 0.8, color: '#CFE6FF', title: 'Seatbelts for ghosts', text: "Ghosts keep floating out of their seats. I'm designing very gentle straps.", pct: 20 },
  { r: 194, speed: 0.55, color: '#C8F0DE', title: 'A bridge between two stars', text: 'My biggest dream: a sparkly bridge so nobody ever flies home alone.', pct: 5 },
];

// What Lumi says the first time you arrive on each page.
export const ARRIVALS = {
  '/garage': 'Welcome to my garage! Mind the oil puddles.',
  '/journey': 'Want to hear how I got here? Scroll down!',
  '/dreams': 'Shh. This is where I keep my dreams.',
};
