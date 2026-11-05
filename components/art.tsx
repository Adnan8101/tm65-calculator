// Original flat-style illustrations (inline SVG, themed via CSS variables). No external assets.
type A = { className?: string };

export const Wrap = ({ className = "", label, children, w = 240, h = 180 }: A & { label?: string; children: React.ReactNode; w?: number; h?: number }) => (
  <svg viewBox={`0 0 ${w} ${h}`} className={className} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} fill="none">
    {children}
  </svg>
);

export const Cloud = ({ x, y, s = 1, c = "var(--line)" }: { x: number; y: number; s?: number; c?: string }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={c}>
    <circle cx="10" cy="14" r="9" />
    <circle cx="24" cy="9" r="11" />
    <circle cx="38" cy="14" r="8" />
    <rect x="3" y="14" width="42" height="9" rx="4.5" />
  </g>
);

export const Tree = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x="-2" y="-14" width="4" height="14" rx="1" fill="#7a5a3a" />
    <circle cx="0" cy="-24" r="11" fill="var(--p3)" />
    <circle cx="-7" cy="-17" r="7" fill="var(--p3)" opacity=".85" />
    <circle cx="7" cy="-17" r="7" fill="var(--accent)" opacity=".9" />
  </g>
);

/** Factory with smoking chimneys and trees: hero, mid-level. */
export function FactoryArt({ className }: A) {
  return (
    <Wrap className={className} label="Factory with chimneys and trees">
      <ellipse cx="120" cy="164" rx="108" ry="8" fill="var(--sunken)" />
      <Cloud x={34} y={22} s={0.9} />
      <Cloud x={150} y={12} s={0.7} />
      <g fill="var(--line-strong)" opacity=".7">
        <circle cx="86" cy="52" r="7" />
        <circle cx="94" cy="38" r="9" />
        <circle cx="130" cy="48" r="6" />
        <circle cx="136" cy="34" r="8" />
      </g>
      <rect x="78" y="62" width="16" height="60" rx="2" fill="var(--ink-2)" />
      <rect x="126" y="56" width="16" height="66" rx="2" fill="var(--ink-2)" />
      <rect x="78" y="62" width="16" height="7" fill="var(--p2)" />
      <rect x="126" y="56" width="16" height="7" fill="var(--p2)" />
      <path d="M40 160V104l32 -16v16l32 -16v16l32 -16v16l32 -16V160z" fill="var(--accent)" />
      <path d="M40 160V104l32 -16v16l32 -16v16l32 -16v16l32 -16V160z" fill="#fff" opacity=".08" />
      <g fill="var(--lime)">
        <rect x="52" y="120" width="18" height="12" rx="2" />
        <rect x="80" y="120" width="18" height="12" rx="2" />
        <rect x="108" y="120" width="18" height="12" rx="2" />
        <rect x="136" y="120" width="18" height="12" rx="2" />
      </g>
      <rect x="116" y="140" width="20" height="20" rx="2" fill="var(--surface)" />
      <Tree x={24} y={162} s={0.9} />
      <Tree x={210} y={162} />
      <Tree x={190} y={162} s={0.7} />
    </Wrap>
  );
}

/** Box and form: describe the product. */
export function BoxArt({ className }: A) {
  return (
    <Wrap className={className} label="Product box and form" w={200} h={140}>
      <ellipse cx="100" cy="126" rx="80" ry="7" fill="var(--sunken)" />
      <rect x="104" y="22" width="68" height="90" rx="8" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="2" />
      <rect x="126" y="16" width="24" height="12" rx="4" fill="var(--accent)" />
      <g stroke="var(--line-strong)" strokeWidth="3" strokeLinecap="round">
        <path d="M116 48h44M116 62h44M116 76h28" />
      </g>
      <path d="M116 94l6 6 12-12" stroke="var(--ok)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M26 56l36-16 36 16v42L62 114 26 98z" fill="var(--p1)" />
      <path d="M26 56l36 16 36-16" stroke="#fff" strokeOpacity=".5" strokeWidth="2" />
      <path d="M62 72v42" stroke="#fff" strokeOpacity=".5" strokeWidth="2" />
      <path d="M62 72l36-16v42L62 114z" fill="#000" opacity=".12" />
      <rect x="44" y="66" width="14" height="8" rx="2" fill="var(--lime)" transform="rotate(24 44 66)" />
    </Wrap>
  );
}

/** Stacked material layers with a magnifier. */
export function LayersArt({ className }: A) {
  return (
    <Wrap className={className} label="Stacked materials with a magnifying glass" w={200} h={140}>
      <ellipse cx="96" cy="126" rx="76" ry="7" fill="var(--sunken)" />
      <path d="M96 84l64 22-64 22-64-22z" fill="var(--p4)" />
      <path d="M96 62l64 22-64 22-64-22z" fill="var(--p3)" />
      <path d="M96 40l64 22-64 22-64-22z" fill="var(--p1)" />
      <path d="M32 62v8l64 22v-8z M160 62v8l-64 22v-8z" fill="#000" opacity=".12" />
      <path d="M32 84v8l64 22v-8z M160 84v8l-64 22v-8z" fill="#000" opacity=".12" />
      <circle cx="146" cy="40" r="20" fill="var(--surface)" fillOpacity=".7" stroke="var(--ink)" strokeWidth="5" />
      <path d="M160 55l22 22" stroke="var(--ink)" strokeWidth="8" strokeLinecap="round" />
      <path d="M137 36a10 10 0 0110-8" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
    </Wrap>
  );
}

/** Document with pie chart and check badge: get your report. */
export function ReportArt({ className }: A) {
  return (
    <Wrap className={className} label="Report document with a pie chart" w={200} h={140}>
      <ellipse cx="100" cy="126" rx="80" ry="7" fill="var(--sunken)" />
      <rect x="46" y="12" width="108" height="108" rx="10" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="2" />
      <path d="M100 64V36a28 28 0 0126.6 19.3z" fill="var(--p2)" />
      <path d="M100 64l26.6-8.7A28 28 0 0189 87.2z" fill="var(--p4)" />
      <path d="M100 64L89 87.2A28 28 0 11100 36z" fill="var(--p1)" />
      <g stroke="var(--line-strong)" strokeWidth="3" strokeLinecap="round">
        <path d="M62 102h30M62 112h20" />
      </g>
      <circle cx="146" cy="104" r="16" fill="var(--ok)" />
      <path d="M138 104l6 6 11-12" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </Wrap>
  );
}

/** Scale weighing a box with a leaf: basic level. */
export function BasicArt({ className }: A) {
  return (
    <Wrap className={className} label="Scales weighing a product" w={200} h={120}>
      <ellipse cx="100" cy="108" rx="76" ry="6" fill="var(--sunken)" />
      <rect x="94" y="30" width="12" height="70" rx="3" fill="var(--ink-2)" />
      <rect x="66" y="96" width="68" height="8" rx="4" fill="var(--ink-2)" />
      <path d="M40 40h120" stroke="var(--ink-2)" strokeWidth="5" strokeLinecap="round" />
      <path d="M44 40l-16 36h32zM156 40l-16 36h32z" stroke="var(--line-strong)" strokeWidth="2" />
      <path d="M24 76h40a20 10 0 01-40 0z" fill="var(--accent)" />
      <path d="M136 76h40a20 10 0 01-40 0z" fill="var(--accent)" />
      <rect x="34" y="58" width="20" height="18" rx="2" fill="var(--p1)" />
      <path d="M146 76c0-12 8-18 20-18 0 12-8 18-20 18z" fill="var(--p3)" />
      <circle cx="100" cy="24" r="8" fill="var(--lime)" stroke="var(--ink-2)" strokeWidth="3" />
    </Wrap>
  );
}

/** Factory, truck and pin: mid level. */
export function MidArt({ className }: A) {
  return (
    <Wrap className={className} label="Factory, delivery truck and location pin" w={200} h={120}>
      <ellipse cx="100" cy="108" rx="84" ry="6" fill="var(--sunken)" />
      <rect x="22" y="30" width="10" height="44" rx="2" fill="var(--ink-2)" />
      <path d="M12 100V62l24 -12v12l24 -12v12l24 -12V100z" fill="var(--accent)" />
      <g fill="var(--lime)">
        <rect x="22" y="72" width="12" height="9" rx="2" />
        <rect x="44" y="72" width="12" height="9" rx="2" />
        <rect x="66" y="72" width="12" height="9" rx="2" />
      </g>
      <path d="M96 100V78h30v-9h22l12 14v17z" fill="var(--p1)" />
      <path d="M130 73h14l8 10h-22z" fill="var(--surface)" opacity=".85" />
      <circle cx="112" cy="100" r="7" fill="var(--ink)" />
      <circle cx="112" cy="100" r="3" fill="var(--surface)" />
      <circle cx="152" cy="100" r="7" fill="var(--ink)" />
      <circle cx="152" cy="100" r="3" fill="var(--surface)" />
      <path d="M168 24a14 14 0 00-14 14c0 10 14 24 14 24s14 -14 14 -24a14 14 0 00-14-14z" fill="var(--p2)" />
      <circle cx="168" cy="38" r="5" fill="#fff" />
    </Wrap>
  );
}

/** Globe with a leaf: on dark call to action. */
export function GlobeArt({ className }: A) {
  return (
    <Wrap className={className} label="Globe with a leaf" w={160} h={160}>
      <circle cx="80" cy="84" r="52" fill="var(--p1)" />
      <path d="M52 62c10-14 28-14 34-4 4 8-6 12-4 20 2 10-14 12-18 24-4 10-16 0-16-14 0-10-6-14 4-26z" fill="var(--p3)" />
      <path d="M96 100c8-6 22-4 26 6 2 8-8 14-16 12-10-2-16-12-10-18z" fill="var(--p3)" />
      <ellipse cx="62" cy="62" rx="14" ry="8" fill="#fff" opacity=".18" transform="rotate(-30 62 62)" />
      <ellipse cx="80" cy="84" rx="68" ry="20" stroke="var(--lime)" strokeWidth="2" strokeDasharray="4 6" transform="rotate(-22 80 84)" />
      <path d="M118 30c0-14 10-22 26-22 0 14-10 22-26 22z" fill="var(--lime)" />
      <path d="M118 30c4-8 10-14 18-18" stroke="#10241a" strokeWidth="2" strokeLinecap="round" />
    </Wrap>
  );
}

/** Document with a warning: report couldn't be calculated. */
export function AlertArt({ className }: A) {
  return (
    <Wrap className={className} label="Document with a warning sign" w={160} h={120}>
      <ellipse cx="80" cy="108" rx="60" ry="6" fill="var(--sunken)" />
      <rect x="36" y="10" width="76" height="92" rx="8" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="2" />
      <g stroke="var(--line-strong)" strokeWidth="3" strokeLinecap="round">
        <path d="M48 28h40M48 40h30M48 52h36" />
      </g>
      <path d="M112 60l26 46H86z" fill="var(--warn-soft)" stroke="var(--p4)" strokeWidth="4" strokeLinejoin="round" transform="translate(-4 -6)" />
      <path d="M108 80v14M108 102v.1" stroke="var(--warn)" strokeWidth="5" strokeLinecap="round" />
    </Wrap>
  );
}
