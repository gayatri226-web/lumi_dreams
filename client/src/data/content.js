// All of Lumi's words live here so the copy is easy to edit in one place.

export const NAME = 'Lumi';

export const PAGES = [
  { path: '/', label: 'Home', title: "Lumi's sky" },
  { path: '/origin', label: 'Origin', title: 'Where I come from' },
  { path: '/garage', label: 'Garage', title: 'The Sky-Car Garage' },
  { path: '/journey', label: 'Journey', title: 'My space journey' },
  { path: '/dreams', label: 'Dreams', title: 'The Dream Observatory' },
];

// The 5-point character sheet (Track 2 requirement).
export const SHEET = [
  ['Name', 'Lumi Moonbolt'],
  ['What I am', 'A baby Moonling: a crumb of moonlight in a pink cloud-ear hood, with very big eyes and very small hands.'],
  ['What I do', 'Junior Space-Car Engineer at Cloudport Space Garage. I build sky-cars, and now I teach them to fly to space.'],
  ['My story', 'The Moon sneezed, I fell off, bounced into a Cloudport scrapyard, and built my first car out of a teacup.'],
  ['Tagline', '“Small hands. Big launches.”'],
];

// Lumi's full profile, shown at the end of the Origin story.
export const PROFILE = [
  ['Species', 'Moonling (a crumb of moonlight)'],
  ['Born', 'The night the Moon sneezed'],
  ['Age', '212 days · 1 moon-year'],
  ['Height', '76 cm and growing'],
  ['Works at', 'Cloudport Space Garage, Bay 3'],
  ['Superpower', 'Fixes anything with a spoon'],
  ['Scared of', 'The vacuum cleaner'],
  ['Mission', 'Fly every sleepy creature to the Moon and back'],
];

// The storyline: every page is a chapter of Lumi's story.
export const STORY = [
  { path: '/', n: 1, title: 'Meet Lumi', teaser: 'Say hi, spin me around and get your passport.' },
  { path: '/origin', n: 2, title: 'Where I come from', teaser: 'The night the Moon sneezed, and how a crumb became an engineer.' },
  { path: '/garage', n: 3, title: 'What I build', teaser: 'Test-drive my sky-cars and watch me grow as an engineer.' },
  { path: '/journey', n: 4, title: 'My big mission', teaser: 'Fly the Moonbolt-1, my first space-car, all the way to the Moon.' },
  { path: '/dreams', n: 5, title: "What's next", teaser: 'Catch my dreams and send me a wish for the next mission.' },
];

// Passport stamps: each one is earned by doing something on the site.
export const STAMPS = [
  { id: 'garage', label: 'Sky-Car Garage', task: 'Visit my garage', color: '#FF8FB8', icon: 'wrench' },
  { id: 'journey', label: 'Moon Landing', task: 'Fly my sky-car to the Moon', color: '#9DB8FF', icon: 'rocket' },
  { id: 'dreams', label: 'Dream Observatory', task: 'Catch a dream', color: '#FFC24D', icon: 'star' },
  { id: 'post', label: 'Wish Post Office', task: 'Send me a wish', color: '#7BD3A8', icon: 'heart' },
  { id: 'secret', label: '???', task: 'Find a secret', color: '#C9A8FF', icon: 'moon' },
];

// Engineer level-up path, drawn as a nursery growth chart.
export const LEVELS = [
  { n: 1, cm: 52, title: 'Spoon Tinkerer', copy: 'Took apart my first rattle to see where the jingle lives.', tool: "A spoon (it's a screwdriver)", color: '#C8F0DE' },
  { n: 2, cm: 64, title: 'Crib Mechanic', copy: 'Gave my crib wheels. Then a motor. Then a seatbelt, just in case.', tool: 'Rubber-band engine', color: '#CFE6FF' },
  { n: 3, cm: 76, title: 'Junior Space-Car Engineer', copy: 'I build sky-cars at Cloudport Space Garage, and my Moonbolt-1 can reach the Moon. Bay 3 is mine!', tool: 'Starlight fuel', color: '#FF8FB8', here: true },
  { n: 4, cm: 92, title: 'Orbit Architect', copy: 'Next dream: a sky-car that can loop all the way around the Moon.', tool: 'Gravity wrench', future: true },
  { n: 5, cm: 110, title: 'Galaxy Bridge Builder', copy: 'Big dream: a bridge between stars so nobody has to fly home alone.', tool: '??? (still inventing it)', future: true },
];

// Mission log entries shown during the Journey flight.
export const SCENES = [
  { km: '350,000 km', title: 'Leaving Cloudport', copy: 'Seatbelt on, snacks packed, Bunny the co-pilot strapped in. The Moonbolt-1 has never been this high.' },
  { km: '260,000 km', title: 'Past the satellites', copy: 'Waved at a weather satellite. It did not wave back. Engines purring like a sleepy cat.' },
  { km: '150,000 km', title: 'Hello, Mars!', copy: 'A little red planet off the left wing. Note to self: build a Mars car next.' },
  { km: '40,000 km', title: 'Starlight check', copy: 'Tank at 40%. Moon gravity is pulling us in. Every sleepy creature could make this trip one day.' },
];

export const DREAMS = [
  { r: 80, speed: 1.6, color: '#FF8FB8', title: 'A car that folds into a pillow', text: "Fly to Grandma's, land, fold it up, take a nap on it. Perfect.", pct: 60 },
  { r: 122, speed: 1.1, color: '#FFE38A', title: 'Loop-the-Moon license', text: 'Pass my flying test so I can loop around the Moon without asking.', pct: 35 },
  { r: 162, speed: 0.8, color: '#CFE6FF', title: 'Seatbelts for ghosts', text: "Ghosts keep floating out of their seats. I'm designing very gentle straps.", pct: 20 },
  { r: 194, speed: 0.55, color: '#C8F0DE', title: 'A bridge between two stars', text: 'My biggest dream: a sparkly bridge so nobody ever flies home alone.', pct: 5 },
];

// What Lumi says the first time you arrive on each page.
export const ARRIVALS = {
  '/origin': 'Want to know where I come from? Scroll slowly!',
  '/garage': 'Welcome to my garage! Mind the oil puddles.',
  '/journey': 'Mission time! Scroll to fly my sky-car to the Moon.',
  '/dreams': 'Shh. This is where I keep my dreams.',
};
