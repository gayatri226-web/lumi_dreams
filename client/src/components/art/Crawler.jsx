// Anew crawling, side view. Limbs swing via the .cr-a / .cr-b keyframes in global.css.
const INK = '#4A2C3A';
const STAR = 'l4 8 9 1 -7 6 2 9 -8 -4 -8 4 2 -9 -7 -6 9 -1z';

export default function Crawler(props) {
  return (
    <svg viewBox="0 0 260 190" aria-hidden="true" {...props}>
      <g className="cr-body">
        <ellipse className="cr-b" cx="70" cy="150" rx="15" ry="26" fill="#FF8FB8" stroke={INK} strokeWidth="5" />
        <ellipse className="cr-b" cx="160" cy="150" rx="13" ry="25" fill="#FF8FB8" stroke={INK} strokeWidth="5" />
        <ellipse cx="102" cy="118" rx="64" ry="40" fill="#FF8FB8" stroke={INK} strokeWidth="5" />
        <circle cx="44" cy="110" r="24" fill="#FFEAF2" stroke={INK} strokeWidth="5" />
        <path d={`M100 100 ${STAR}`} fill="#FFE38A" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <ellipse className="cr-a" cx="92" cy="152" rx="15" ry="26" fill="#FF8FB8" stroke={INK} strokeWidth="5" />
        <ellipse className="cr-a" cx="180" cy="152" rx="13" ry="25" fill="#FF8FB8" stroke={INK} strokeWidth="5" />
        <circle cx="182" cy="176" r="9" fill="#FFF6E8" stroke={INK} strokeWidth="4" />
        <path d="M180 40 C 176 26 170 18 162 12" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d={`M160 0 ${STAR}`} fill="#FFE38A" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <circle cx="190" cy="88" r="50" fill="#FFF6E8" stroke={INK} strokeWidth="5" />
        <path d="M144 62 L236 62" stroke="#C93D78" strokeWidth="5" />
        <circle cx="180" cy="62" r="12" fill="#CFE6FF" stroke="#C93D78" strokeWidth="4" />
        <circle cx="210" cy="62" r="12" fill="#CFE6FF" stroke="#C93D78" strokeWidth="4" />
        <ellipse cx="182" cy="92" rx="8" ry="10" fill={INK} />
        <ellipse cx="212" cy="92" rx="8" ry="10" fill={INK} />
        <circle cx="185" cy="88" r="3.5" fill="#fff" />
        <circle cx="215" cy="88" r="3.5" fill="#fff" />
        <ellipse cx="168" cy="108" rx="9" ry="5" fill="#FF8FB8" />
        <ellipse cx="226" cy="106" rx="9" ry="5" fill="#FF8FB8" />
        <path d="M192 110 q4 6 8 0 q4 6 8 0" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
}
