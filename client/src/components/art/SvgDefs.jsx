// Shared SVG art, defined once and reused with <use href="#baby" /> and <use href="#sky-car" />.
// Anew's full body sits in a 200 x 240 box; the sky-car in 420 x 240.
const INK = '#4A2C3A';

export function BabyParts() {
  return (
    <>
      <ellipse cx="78" cy="224" rx="20" ry="12" fill="#FF8FB8" stroke={INK} strokeWidth="5" />
      <ellipse cx="122" cy="224" rx="20" ry="12" fill="#FF8FB8" stroke={INK} strokeWidth="5" />
      <ellipse cx="74" cy="228" rx="9" ry="4" fill="#FFEAF2" />
      <ellipse cx="126" cy="228" rx="9" ry="4" fill="#FFEAF2" />
      <path d="M58 150 C 48 198 66 222 100 222 C 134 222 152 198 142 150 C 130 134 70 134 58 150 Z" fill="#FF8FB8" stroke={INK} strokeWidth="5" />
      <path d="M78 146 Q100 166 122 146" fill="#FFEAF2" stroke={INK} strokeWidth="4" />
      <path d="M100 172 l5 10 11 2 -8 8 2 11 -10 -5 -10 5 2 -11 -8 -8 11 -2z" fill="#FFE38A" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <ellipse cx="50" cy="178" rx="13" ry="21" transform="rotate(22 50 178)" fill="#FF8FB8" stroke={INK} strokeWidth="5" />
      <circle cx="44" cy="196" r="10" fill="#FFF6E8" stroke={INK} strokeWidth="4" />
    </>
  );
}

export function BabyHead() {
  return (
    <>
      <circle cx="100" cy="92" r="64" fill="#FFF6E8" stroke={INK} strokeWidth="6" />
      <path d="M92 32 q6 -14 18 -6 q-8 2 -6 10" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
    </>
  );
}

export function Antenna({ starProps = {} }) {
  return (
    <>
      <path d="M112 34 C 116 22 120 14 128 8" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M128 -4 l4 8 9 1 -7 6 2 9 -8 -4 -8 4 2 -9 -7 -6 9 -1z" fill="#FFE38A" stroke={INK} strokeWidth="3" strokeLinejoin="round" {...starProps} />
    </>
  );
}

export function Goggles() {
  return (
    <>
      <path d="M40 62 L160 62" stroke="#C93D78" strokeWidth="6" />
      <circle cx="80" cy="62" r="15" fill="#CFE6FF" fillOpacity=".9" stroke="#C93D78" strokeWidth="5" />
      <circle cx="120" cy="62" r="15" fill="#CFE6FF" fillOpacity=".9" stroke="#C93D78" strokeWidth="5" />
    </>
  );
}

export function Cheeks() {
  return (
    <>
      <ellipse cx="58" cy="118" rx="12" ry="7" fill="#FF8FB8" opacity=".7" />
      <ellipse cx="142" cy="118" rx="12" ry="7" fill="#FF8FB8" opacity=".7" />
      <path d="M90 120 q5 7 10 0 q5 7 10 0" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
    </>
  );
}

export function WaveArm({ x = 160, y = 150 }) {
  return (
    <>
      <ellipse cx={x} cy={y} rx="13" ry="21" transform={`rotate(-40 ${x} ${y})`} fill="#FF8FB8" stroke={INK} strokeWidth="5" />
      <circle cx={x + 12} cy={y - 18} r="11" fill="#FFF6E8" stroke={INK} strokeWidth="4" />
    </>
  );
}

export default function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <g id="baby">
          <BabyParts />
          <ellipse cx="150" cy="178" rx="13" ry="21" transform="rotate(-22 150 178)" fill="#FF8FB8" stroke={INK} strokeWidth="5" />
          <circle cx="156" cy="196" r="10" fill="#FFF6E8" stroke={INK} strokeWidth="4" />
          <Antenna />
          <BabyHead />
          <Goggles />
          <ellipse cx="78" cy="100" rx="11" ry="13" fill={INK} />
          <ellipse cx="122" cy="100" rx="11" ry="13" fill={INK} />
          <circle cx="82" cy="95" r="4.5" fill="#fff" />
          <circle cx="75" cy="105" r="2" fill="#fff" />
          <circle cx="126" cy="95" r="4.5" fill="#fff" />
          <circle cx="119" cy="105" r="2" fill="#fff" />
          <Cheeks />
        </g>
        <g id="sky-car">
          <path d="M40 150 C 20 150 0 160 6 172 C 12 182 30 178 40 172 Z" fill="#FFE38A" />
          <path d="M40 160 C 28 160 18 166 22 172 C 26 176 34 174 40 170 Z" fill="#FF7A59" />
          <path d="M60 120 L30 92 L74 108 Z" fill="#FFB3CF" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          <path d="M42 130 C 42 104 76 96 120 96 L300 96 C 350 96 386 116 392 146 C 396 170 380 192 350 196 L80 196 C 56 196 42 176 42 158 Z" fill="#FF8FB8" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          <path d="M70 150 L360 150" stroke="#FFEAF2" strokeWidth="6" strokeLinecap="round" />
          <circle cx="372" cy="138" r="10" fill="#FFE38A" stroke={INK} strokeWidth="4" />
          <ellipse cx="120" cy="210" rx="36" ry="12" fill="#C8F0DE" stroke={INK} strokeWidth="5" />
          <ellipse cx="300" cy="210" rx="36" ry="12" fill="#C8F0DE" stroke={INK} strokeWidth="5" />
        </g>
      </defs>
    </svg>
  );
}
