// Lumi crawling, side view, for the pink page transition.
// Limbs swing via the .cr-a / .cr-b keyframes in global.css.
const INK = '#4A2C3A';
const PINK = '#FF8FB8';

export default function Crawler(props) {
  return (
    <svg viewBox="0 0 270 200" aria-hidden="true" {...props}>
      <g className="cr-body">
        <ellipse className="cr-b" cx="70" cy="158" rx="15" ry="26" fill={PINK} stroke={INK} strokeWidth="5" />
        <ellipse className="cr-b" cx="158" cy="158" rx="13" ry="25" fill={PINK} stroke={INK} strokeWidth="5" />
        <ellipse cx="102" cy="126" rx="64" ry="40" fill={PINK} stroke={INK} strokeWidth="5" />
        <circle cx="44" cy="118" r="24" fill="#FFEAF2" stroke={INK} strokeWidth="5" />
        <path d="M100 108 l4 8 9 1 -7 6 2 9 -8 -4 -8 4 2 -9 -7 -6 9 -1z" fill="#FFE38A" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <ellipse className="cr-a" cx="92" cy="160" rx="15" ry="26" fill={PINK} stroke={INK} strokeWidth="5" />
        <ellipse className="cr-a" cx="180" cy="162" rx="13" ry="25" fill={PINK} stroke={INK} strokeWidth="5" />
        <circle cx="184" cy="186" r="9" fill="#FFF6E8" stroke={INK} strokeWidth="4" />
        <circle cx="162" cy="40" r="15" fill={PINK} stroke={INK} strokeWidth="5" />
        <circle cx="228" cy="34" r="15" fill={PINK} stroke={INK} strokeWidth="5" />
        <circle cx="196" cy="90" r="58" fill={PINK} stroke={INK} strokeWidth="5" />
        <ellipse cx="204" cy="98" rx="46" ry="43" fill="#FFF6E8" stroke={INK} strokeWidth="4" />
        <ellipse cx="190" cy="96" rx="9" ry="11" fill={INK} />
        <ellipse cx="222" cy="96" rx="9" ry="11" fill={INK} />
        <circle cx="194" cy="91" r="4" fill="#fff" />
        <circle cx="226" cy="91" r="4" fill="#fff" />
        <ellipse cx="176" cy="114" rx="9" ry="5" fill={PINK} />
        <ellipse cx="238" cy="112" rx="8" ry="5" fill={PINK} />
        <path d="M200 116 Q206 126 212 116 Q206 119 200 116 Z" fill="#C93D78" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
