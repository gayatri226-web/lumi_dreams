// Lumi's pink sky-car, drawn in a 420 x 240 box. Rendered as a <g> so it can sit inside other SVGs.
const INK = '#4A2C3A';

export function SkyCarBody() {
  return (
    <g>
      <path className="car-flame" d="M40 150 C 20 150 0 160 6 172 C 12 182 30 178 40 172 Z" fill="#FFE38A" />
      <path d="M40 160 C 28 160 18 166 22 172 C 26 176 34 174 40 170 Z" fill="#FF7A59" />
      <path d="M60 120 L30 92 L74 108 Z" fill="#FFB3CF" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      <path d="M42 130 C 42 104 76 96 120 96 L300 96 C 350 96 386 116 392 146 C 396 170 380 192 350 196 L80 196 C 56 196 42 176 42 158 Z" fill="#FF8FB8" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      <path d="M70 150 L360 150" stroke="#FFEAF2" strokeWidth="6" strokeLinecap="round" />
      <circle cx="372" cy="138" r="10" fill="#FFE38A" stroke={INK} strokeWidth="4" />
      <ellipse cx="120" cy="210" rx="36" ry="12" fill="#C8F0DE" stroke={INK} strokeWidth="5" />
      <ellipse cx="300" cy="210" rx="36" ry="12" fill="#C8F0DE" stroke={INK} strokeWidth="5" />
    </g>
  );
}

export default function SkyCar({ className, title, style }) {
  return (
    <svg viewBox="0 80 420 150" className={className} style={style} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <SkyCarBody />
    </svg>
  );
}
