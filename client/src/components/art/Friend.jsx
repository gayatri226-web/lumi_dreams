// Anew's Cloudport friends. Same rounded body, a different topper each.
const INK = '#4A2C3A';

const TOPPERS = {
  puff: <path d="M20 40 C 10 20 30 10 40 26 C 50 6 70 6 80 26 C 90 10 110 20 100 40 Z" fill="#CFE6FF" stroke={INK} strokeWidth="5" strokeLinejoin="round" />,
  bolt: <path d="M60 24 L60 6 M50 6 L70 6" stroke={INK} strokeWidth="5" strokeLinecap="round" />,
  comet: <path d="M24 40 L30 10 L48 28 Z M96 40 L90 10 L72 28 Z" fill="#FFB3A0" stroke={INK} strokeWidth="5" strokeLinejoin="round" />,
  nib: <path d="M44 24 C 34 4 20 6 22 18 M76 24 C 86 4 100 6 98 18" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />,
  pebble: null,
  fizz: (
    <>
      <path d="M60 22 L60 4" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <circle cx="60" cy="6" r="5" fill="#C93D78" />
    </>
  ),
};

export const FRIENDS = [
  { id: 'puff', name: 'Puff, a cloud pup', color: '#CFE6FF' },
  { id: 'bolt', name: 'Bolt, a tiny wrench bot', color: '#FFE38A' },
  { id: 'comet', name: 'Comet, a sleepy fox', color: '#FFB3A0', sleepy: true },
  { id: 'nib', name: 'Nib, a moon moth', color: '#E3D6FF' },
  { id: 'pebble', name: 'Pebble, a mint turtle', color: '#C8F0DE', shell: true },
  { id: 'fizz', name: 'Fizz, a soda sprite', color: '#FFD3E4' },
];

export default function Friend({ id, name, color, sleepy, shell }) {
  return (
    <svg viewBox="0 0 120 120" role="img" aria-label={name}>
      {id === 'comet' && TOPPERS.comet}
      <path d="M14 120 C 14 50 30 22 60 22 C 90 22 106 50 106 120 Z" fill={color} stroke={INK} strokeWidth="5" />
      {id !== 'comet' && TOPPERS[id]}
      {shell && <path d="M30 46 Q60 30 90 46" stroke={INK} strokeWidth="4" fill="none" />}
      {sleepy ? (
        <path d="M40 70 q6 5 12 0 M68 70 q6 5 12 0" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
      ) : (
        <>
          <ellipse cx="46" cy="70" rx="6" ry="8" fill={INK} />
          <ellipse cx="74" cy="70" rx="6" ry="8" fill={INK} />
          <circle cx="48" cy="67" r="2" fill="#fff" />
          <circle cx="76" cy="67" r="2" fill="#fff" />
        </>
      )}
      <ellipse cx="34" cy="84" rx="8" ry="5" fill="#FF8FB8" />
      <ellipse cx="86" cy="84" rx="8" ry="5" fill="#FF8FB8" />
      <path d="M54 84 Q60 90 66 84" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}
