// Lumi's chat brain: a small rule-based dialogue engine that answers in character.
// Each intent is a pattern plus a few replies; {name} is filled with the visitor's name if known.
import { store } from './util.js';

export const getName = () => store.get('lumi-name', '');
const setName = (n) => store.set('lumi-name', n);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const fill = (s, name) => s.replace(/\{name\}/g, name || 'friend');

const INTENTS = [
  { re: /\b(my name is|i am|i'm|call me)\s+([a-z][a-z' -]{0,20})/i, run: (m) => {
    const n = m[2].trim().split(' ')[0];
    const name = n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
    setName(name);
    return { text: `${name}! What a lovely name. I'll remember it, even after my nap.`, action: 'happy' };
  } },
  { re: /\b(hi|hello|hey|hiya|namaste|yo)\b/i, replies: ["Hi hi, {name}! Want to hear about my sky-cars?", 'Hello, {name}! You found my little garage in the sky.', 'Hey {name}! Boop. That was a hello boop.'] },
  { re: /\bwho are you|what are you|your name\b/i, replies: ["I'm Lumi! A baby Moonling. I fell off the Moon and now I build flying cars in Cloudport."] },
  { re: /\b(how old|age|born)\b/i, replies: ["I'm two hundred and twelve days old. That's practically an engineer in moon years."] },
  { re: /\b(what do you do|job|work|engineer|build)\b/i, replies: ['I build and fix sky-cars so sleepy creatures get home by bedtime. My favorite tool is a spoon.', 'Junior Sky-Car Engineer, reporting for duty! Bay 3 is mine.'] },
  { re: /\b(car|sky-?car|vroom|drive|fly)\b/i, replies: ['My sky-cars run on starlight! Try the Star-Charger in my garage.', 'Vroom vroom! My first car was a teacup. It flew sideways.'] },
  { re: /\b(moon|space|rocket|star)\b/i, replies: ['The Moon is my home! I visit by rocket. Fly my journey page to come along.', 'Stars are just the Moon\'s nightlights. I count them before bed.'] },
  { re: /\b(dream|wish|future)\b/i, replies: ['My biggest dream is a bridge between two stars, so nobody flies home alone.', 'I keep my dreams in orbit around my head. Catch one on my dreams page!'] },
  { re: /\b(color|colour)\b/i, replies: ['Pink! Obviously. Look at my hood.'] },
  { re: /\b(food|eat|hungry|snack|milk)\b/i, replies: ['Moon cheese and warm milk. Not together. Okay, sometimes together.'] },
  { re: /\b(joke|funny|laugh)\b/i, replies: ['Why did the sky-car go to school? To get a little brighter! Hehe.', 'What do you call a sleepy rocket? A nap-stronaut!', 'Knock knock. Who is there? Moon. Moon who? Moon-ny hugs for you!'] },
  { re: /\b(sing|song|lullaby|music)\b/i, replies: ["Here's my music box lullaby! Shhh..."], action: 'sing' },
  { re: /\b(sleep|tired|nap|bed|goodnight|good night)\b/i, replies: ['Yawn... every page ends at bedtime. Scroll down and tuck me in!'] },
  { re: /\b(love|cute|adorable|like you)\b/i, replies: ['Aww! My cheeks just went extra pink.', 'I like you too, {name}! You can borrow my spoon.'], action: 'happy' },
  { re: /\b(scared|sad|lonely|bad day)\b/i, replies: ["Oh no. Here, a nightlight for you. You're never alone in Cloudport, {name}."] },
  { re: /\b(help|what can you|can you)\b/i, replies: ['You can ask me about my cars, the Moon, my dreams, or ask for a joke or a song. Or tell me your name!'] },
  { re: /\b(thank|thanks|ty)\b/i, replies: ["You're welcome, {name}! High five. Gentle one, my hands are small."] },
  { re: /\b(bye|see you|later|goodbye)\b/i, replies: ['Bye bye, {name}! Fly safe!'] },
  { re: /\b(hackathon|judge|haX|hax)\b/i, replies: ['I was built in 48 hours for Baby\'s First Website! Please be gentle with my score.'] },
];

const FALLBACK = [
  "Hmm, I'm only two hundred and twelve days old, I don't know that one yet. Ask me about the Moon?",
  'Ooh, big words! Can you ask me about my sky-cars instead?',
  'I tilted my head at that one. Try asking for a joke!',
];

export function reply(input) {
  const text = String(input || '').trim();
  const name = getName();
  if (!text) return { text: 'Say something! I promise I listen better than a teacup.' };
  for (const it of INTENTS) {
    const m = text.match(it.re);
    if (!m) continue;
    if (it.run) return it.run(m);
    return { text: fill(pick(it.replies), name), action: it.action };
  }
  return { text: fill(pick(FALLBACK), name) };
}

export const SUGGESTIONS = ['Hi Lumi!', 'Tell me a joke', 'What do you do?', 'Sing a song', 'My name is…'];
