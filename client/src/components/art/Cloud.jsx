// A puffy cloud outline, stretched to fit whatever box it sits in.
export const CLOUD_PATH = 'M28 58 C10 58 3 41 16 33 C12 18 30 9 43 17 C49 3 73 1 81 13 C91 3 113 7 115 23 C131 23 139 46 123 56 C121 57 119 58 116 58 Z';

export default function Cloud({ className, style, fill = 'var(--cloud)', stroke = 'var(--ink)', strokeWidth = 3 }) {
  return (
    <svg viewBox="0 0 140 62" preserveAspectRatio="none" className={className} style={style} aria-hidden="true" focusable="false">
      <path d={CLOUD_PATH} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
