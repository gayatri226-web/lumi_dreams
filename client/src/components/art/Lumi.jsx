// Lumi, drawn in SVG. A big round face inside a pink hood with two cloud ears,
// a crescent-moon badge, sparkly eyes, rosy cheeks and a star on the onesie.
// crop: 'full' (standing) or 'bust' (head and shoulders, for the car and the cradle).
// mood: 'happy' | 'sleep'. helmet: shows a glass space helmet (space mode).
const INK = '#4A2C3A';
const PINK = '#FF8FB8';
const PALE = '#FFEAF2';
const FACE = '#FFF6E8';
const STAR = 'l5 10 11 2 -8 8 2 11 -10 -5 -10 5 2 -11 -8 -8 11 -2z';

export const LUMI_EYES = [{ cx: 76, cy: 104 }, { cx: 124, cy: 104 }];

function Eye({ cx, cy, mood, setRef }) {
  if (mood === 'sleep') {
    return <path d={`M${cx - 12} ${cy + 2} q12 9 24 0`} fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />;
  }
  return (
    <g>
      <g ref={setRef}>
        <ellipse cx={cx} cy={cy} rx="12.5" ry="14.5" fill={INK} />
        <circle cx={cx + 5} cy={cy - 6} r="5.2" fill="#fff" />
        <circle cx={cx - 4} cy={cy + 6} r="2.4" fill="#fff" />
      </g>
      <rect className="lid" x={cx - 15} y={cy - 17} width="30" height="34" rx="13" fill={FACE} />
    </g>
  );
}

function Head({ mood, pupilRefs }) {
  const set = (i) => (el) => { if (pupilRefs) pupilRefs.current[i] = el; };
  return (
    <g>
      <circle cx="44" cy="42" r="20" fill={PINK} stroke={INK} strokeWidth="5" />
      <circle cx="44" cy="42" r="9" fill="#FFD3E4" />
      <circle cx="156" cy="42" r="20" fill={PINK} stroke={INK} strokeWidth="5" />
      <circle cx="156" cy="42" r="9" fill="#FFD3E4" />
      <circle cx="100" cy="96" r="78" fill={PINK} stroke={INK} strokeWidth="5" />
      <path className="lumi-moon" d="M108 13 a14 14 0 1 0 0 27 a11 11 0 1 1 0 -27 z" fill="#FFE38A" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <ellipse cx="100" cy="106" rx="62" ry="57" fill={FACE} stroke={INK} strokeWidth="4" />
      <path d="M95 52 q4 -15 17 -9 q-10 1 -7 11" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <Eye {...LUMI_EYES[0]} mood={mood} setRef={set(0)} />
      <Eye {...LUMI_EYES[1]} mood={mood} setRef={set(1)} />
      <ellipse cx="54" cy="126" rx="12" ry="7.5" fill={PINK} opacity=".75" />
      <ellipse cx="146" cy="126" rx="12" ry="7.5" fill={PINK} opacity=".75" />
      <circle cx="50" cy="123" r="1.8" fill="#fff" />
      <circle cx="142" cy="123" r="1.8" fill="#fff" />
      <ellipse cx="100" cy="119" rx="3.4" ry="2.4" fill="#E7A0B5" />
      {mood === 'sleep' ? (
        <path d="M95 132 q5 5 10 0" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      ) : (
        <>
          <path d="M88 128 Q100 144 112 128 Q100 134 88 128 Z" fill="#C93D78" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M95 135 Q100 140 105 135 Q100 132 95 135 Z" fill={PINK} />
        </>
      )}
    </g>
  );
}

function WaveArm({ armRef }) {
  return (
    <g ref={armRef} className="lumi-arm">
      <ellipse cx="160" cy="156" rx="13" ry="21" transform="rotate(-40 160 156)" fill={PINK} stroke={INK} strokeWidth="5" />
      <circle cx="173" cy="138" r="11" fill={FACE} stroke={INK} strokeWidth="4" />
    </g>
  );
}

export default function Lumi({ crop = 'full', mood = 'happy', helmet = false, pupilRefs, armRef, title, className, style, onClick, svgRef }) {
  const viewBox = crop === 'bust' ? '0 -6 200 196' : '0 -6 200 248';
  return (
    <svg ref={svgRef} viewBox={viewBox} className={className} style={style} onClick={onClick}
      role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      {crop === 'full' ? (
        <g>
          <ellipse cx="78" cy="226" rx="20" ry="12" fill={PINK} stroke={INK} strokeWidth="5" />
          <ellipse cx="122" cy="226" rx="20" ry="12" fill={PINK} stroke={INK} strokeWidth="5" />
          <ellipse cx="74" cy="230" rx="9" ry="4" fill={PALE} />
          <ellipse cx="126" cy="230" rx="9" ry="4" fill={PALE} />
          <path d="M56 160 C 46 206 64 230 100 230 C 136 230 154 206 144 160 C 132 146 68 146 56 160 Z" fill={PINK} stroke={INK} strokeWidth="5" />
          <path d={`M100 176 ${STAR}`} fill="#FFE38A" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <ellipse cx="50" cy="184" rx="13" ry="21" transform="rotate(22 50 184)" fill={PINK} stroke={INK} strokeWidth="5" />
          <circle cx="44" cy="202" r="10" fill={FACE} stroke={INK} strokeWidth="4" />
        </g>
      ) : (
        <path d="M44 196 C 46 166 66 154 100 154 C 134 154 154 166 156 196 Z" fill={PINK} stroke={INK} strokeWidth="5" />
      )}
      <Head mood={mood} pupilRefs={pupilRefs} />
      <path d="M80 160 Q100 172 120 160" fill="none" stroke={PALE} strokeWidth="5" strokeLinecap="round" />
      {mood !== 'sleep' && <WaveArm armRef={armRef} />}
      {helmet && (
        <g className="lumi-helmet">
          <circle cx="100" cy="98" r="97" fill="#CFE6FF" fillOpacity=".22" stroke={INK} strokeWidth="4" />
          <path d="M34 78 q12 -44 56 -58" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" opacity=".75" />
        </g>
      )}
    </svg>
  );
}
