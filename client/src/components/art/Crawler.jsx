// Lumi crawling, side view, for the pink page transition. Each limb is its own group with a real
// shoulder or hip pivot, and they move in a diagonal gait like a real baby (near arm with far
// leg, far arm with near leg) while the body bobs and the head nods. Keyframes live in global.css.
const INK = '#4A2C3A';
const PINK = '#FF8FB8';
const FAR = '#F07AA8';
const FACE = '#FFF6E8';

export default function Crawler(props) {
  return (
    <svg viewBox="0 0 300 215" aria-hidden="true" {...props}>
      <ellipse className="cr-shadow" cx="150" cy="206" rx="100" ry="7" fill={INK} opacity=".18" />
      <g className="cr-all">
        <g className="cr-farleg">
          <ellipse cx="92" cy="166" rx="16" ry="34" transform="rotate(14 92 166)" fill={FAR} stroke={INK} strokeWidth="5" />
          <ellipse cx="78" cy="194" rx="21" ry="10" fill={FAR} stroke={INK} strokeWidth="5" />
        </g>
        <g className="cr-fararm">
          <ellipse cx="206" cy="160" rx="13" ry="33" fill={FAR} stroke={INK} strokeWidth="5" />
          <circle cx="207" cy="192" r="11" fill="#F6E4D6" stroke={INK} strokeWidth="4" />
        </g>
        <ellipse cx="146" cy="124" rx="72" ry="42" fill={PINK} stroke={INK} strokeWidth="5" />
        <circle cx="80" cy="116" r="26" fill="#FFEAF2" stroke={INK} strokeWidth="5" />
        <path d="M140 104 l5 10 11 2 -8 8 2 11 -10 -5 -10 5 2 -11 -8 -8 11 -2z" fill="#FFE38A" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <g className="cr-nearleg">
          <ellipse cx="110" cy="168" rx="17" ry="34" transform="rotate(10 110 168)" fill={PINK} stroke={INK} strokeWidth="5" />
          <ellipse cx="96" cy="198" rx="22" ry="11" fill={PINK} stroke={INK} strokeWidth="5" />
          <ellipse cx="90" cy="200" rx="9" ry="4" fill="#FFEAF2" />
        </g>
        <g className="cr-neararm">
          <ellipse cx="192" cy="160" rx="14" ry="34" fill={PINK} stroke={INK} strokeWidth="5" />
          <circle cx="193" cy="194" r="12" fill={FACE} stroke={INK} strokeWidth="4" />
        </g>
        <g className="cr-head">
          <circle cx="198" cy="34" r="16" fill={PINK} stroke={INK} strokeWidth="5" />
          <circle cx="262" cy="30" r="16" fill={PINK} stroke={INK} strokeWidth="5" />
          <circle cx="228" cy="82" r="58" fill={PINK} stroke={INK} strokeWidth="5" />
          <path d="M232 20 a11 11 0 1 0 0 21 a8.5 8.5 0 1 1 0 -21 z" fill="#FFE38A" stroke={INK} strokeWidth="3" />
          <ellipse cx="236" cy="90" rx="46" ry="43" fill={FACE} stroke={INK} strokeWidth="4" />
          <g className="cr-eyes">
            <ellipse cx="222" cy="88" rx="9.5" ry="11.5" fill={INK} />
            <ellipse cx="254" cy="88" rx="9.5" ry="11.5" fill={INK} />
            <circle cx="226" cy="83" r="4" fill="#fff" />
            <circle cx="258" cy="83" r="4" fill="#fff" />
          </g>
          <ellipse cx="208" cy="106" rx="9" ry="5" fill={PINK} />
          <ellipse cx="270" cy="104" rx="8" ry="5" fill={PINK} />
          <path d="M231 108 Q238 119 245 108 Q238 111 231 108 Z" fill="#C93D78" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        </g>
      </g>
    </svg>
  );
}
