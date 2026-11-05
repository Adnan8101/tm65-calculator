// More original flat-style illustrations (inline SVG, themed via CSS variables).
import { Cloud, Tree, Wrap } from "./art";

type A = { className?: string };

/** Cylinder and AC unit: refrigerant. */
export function RefrigerantArt({ className }: A) {
  return (
    <Wrap className={className} label="Refrigerant cylinder and air conditioning unit" w={200} h={140}>
      <ellipse cx="100" cy="126" rx="84" ry="7" fill="var(--sunken)" />
      <rect x="18" y="30" width="96" height="40" rx="8" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="2" />
      <g stroke="var(--line-strong)" strokeWidth="3" strokeLinecap="round">
        <path d="M30 46h50M30 56h36" />
      </g>
      <circle cx="96" cy="50" r="8" fill="var(--p1)" />
      <path d="M96 44v12M90 50h12M92 46l8 8M100 46l-8 8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      <g fill="var(--p1)" opacity=".6">
        <path d="M34 82c0 6-5 9-5 13a5 5 0 0010 0c0-4-5-7-5-13z" />
        <path d="M62 84c0 6-5 9-5 13a5 5 0 0010 0c0-4-5-7-5-13z" />
        <path d="M90 82c0 6-5 9-5 13a5 5 0 0010 0c0-4-5-7-5-13z" />
      </g>
      <rect x="140" y="38" width="36" height="76" rx="14" fill="var(--accent)" />
      <rect x="150" y="26" width="16" height="16" rx="3" fill="var(--ink-2)" />
      <rect x="146" y="20" width="24" height="8" rx="3" fill="var(--ink)" />
      <rect x="140" y="64" width="36" height="22" fill="var(--lime)" />
      <path d="M150 75h16" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
      <path d="M176 28h10a8 8 0 018 8v6" stroke="var(--ink-2)" strokeWidth="4" strokeLinecap="round" />
    </Wrap>
  );
}

/** Wrench and gear: repairs. */
export function RepairArt({ className }: A) {
  return (
    <Wrap className={className} label="Wrench and gear" w={200} h={130}>
      <ellipse cx="100" cy="118" rx="80" ry="6" fill="var(--sunken)" />
      <g transform="translate(70 60)">
        <circle r="34" fill="var(--p4)" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <rect key={a} x="-7" y="-44" width="14" height="14" rx="3" fill="var(--p4)" transform={`rotate(${a})`} />
        ))}
        <circle r="14" fill="var(--surface)" />
        <circle r="5" fill="var(--p4)" opacity=".5" />
      </g>
      <g transform="rotate(40 140 70)">
        <rect x="132" y="30" width="16" height="84" rx="8" fill="var(--ink-2)" />
        <path d="M126 24a16 16 0 0132 0v16a8 8 0 01-8 0v-10h-16v10a8 8 0 01-8 0z" fill="var(--ink-2)" />
      </g>
      <path d="M170 24l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="var(--lime)" />
    </Wrap>
  );
}

/** Clipboard with checklist: review step. */
export function ChecklistArt({ className }: A) {
  return (
    <Wrap className={className} label="Clipboard with a checklist" w={200} h={140}>
      <ellipse cx="100" cy="128" rx="76" ry="6" fill="var(--sunken)" />
      <rect x="56" y="14" width="88" height="108" rx="10" fill="var(--accent)" />
      <rect x="64" y="26" width="72" height="88" rx="6" fill="var(--surface)" />
      <rect x="80" y="8" width="40" height="16" rx="6" fill="var(--ink-2)" />
      <circle cx="100" cy="14" r="3" fill="var(--lime)" />
      {[44, 66, 88].map((y, i) => (
        <g key={y}>
          <rect x="72" y={y - 8} width="16" height="16" rx="4" fill={i < 2 ? "var(--ok)" : "var(--line)"} />
          {i < 2 && <path d={`M75 ${y}l4 4 7-8`} stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
          <path d={`M96 ${y}h32`} stroke="var(--line-strong)" strokeWidth="4" strokeLinecap="round" />
        </g>
      ))}
      <path d="M162 40l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="var(--lime)" />
      <path d="M32 84l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="var(--p2)" />
    </Wrap>
  );
}

/** Open empty box: nothing added yet. */
export function EmptyArt({ className }: A) {
  return (
    <Wrap className={className} label="Empty box" w={160} h={110}>
      <ellipse cx="80" cy="98" rx="56" ry="6" fill="var(--sunken)" />
      <path d="M30 50l50-18 50 18v38l-50 14-50-14z" fill="var(--p4)" opacity=".85" />
      <path d="M30 50l50 18 50-18" stroke="#fff" strokeOpacity=".6" strokeWidth="2" />
      <path d="M80 68v34" stroke="#fff" strokeOpacity=".6" strokeWidth="2" />
      <path d="M30 50L12 36l46-14 22 10zM130 50l18-14-46-14-22 10z" fill="var(--p4)" />
      <path d="M80 22v-8M62 26l-5-6M98 26l5-6" stroke="var(--line-strong)" strokeWidth="3" strokeLinecap="round" />
    </Wrap>
  );
}

/** Server that is offline: service unavailable. */
export function OfflineArt({ className }: A) {
  return (
    <Wrap className={className} label="Server that is offline" w={180} h={130}>
      <ellipse cx="90" cy="118" rx="64" ry="6" fill="var(--sunken)" />
      {[18, 48, 78].map((y, i) => (
        <g key={y}>
          <rect x="40" y={y} width="100" height="24" rx="6" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="2" />
          <circle cx="56" cy={y + 12} r="4" fill={i === 1 ? "var(--danger)" : "var(--ok)"} />
          <path d={`M72 ${y + 12}h40`} stroke="var(--line-strong)" strokeWidth="3" strokeLinecap="round" />
        </g>
      ))}
      <circle cx="140" cy="30" r="14" fill="var(--danger-soft)" stroke="var(--danger)" strokeWidth="3" />
      <path d="M134 24l12 12M146 24l-12 12" stroke="var(--danger)" strokeWidth="3" strokeLinecap="round" />
    </Wrap>
  );
}

/** Building with rooftop plant: building services. */
export function BuildingArt({ className }: A) {
  return (
    <Wrap className={className} label="Building with rooftop plant and pipework" w={240} h={170}>
      <ellipse cx="120" cy="158" rx="104" ry="7" fill="var(--sunken)" />
      <Cloud x={176} y={14} s={0.8} />
      <rect x="64" y="46" width="112" height="112" rx="4" fill="var(--p1)" />
      <rect x="64" y="46" width="112" height="10" fill="#000" opacity=".15" />
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <rect key={`${r}${c}`} x={76 + c * 24} y={66 + r * 20} width="14" height="12" rx="2" fill={(r + c) % 3 === 0 ? "var(--lime)" : "#fff"} opacity={(r + c) % 3 === 0 ? 1 : 0.55} />
        )),
      )}
      <rect x="108" y="132" width="24" height="26" rx="2" fill="var(--surface)" />
      <rect x="76" y="30" width="34" height="16" rx="3" fill="var(--ink-2)" />
      <circle cx="93" cy="30" r="9" fill="var(--surface)" stroke="var(--ink-2)" strokeWidth="3" />
      <path d="M93 22v16M85 30h16" stroke="var(--ink-2)" strokeWidth="2" />
      <rect x="124" y="34" width="30" height="12" rx="3" fill="var(--ink-2)" />
      <path d="M176 120h22v-50M198 70h8" stroke="var(--p2)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <Tree x={34} y={158} s={1.1} />
      <Tree x={214} y={158} s={0.8} />
    </Wrap>
  );
}

/** Calculator with a leaf and sparkles: welcome. */
export function WelcomeArt({ className }: A) {
  return (
    <Wrap className={className} label="Calculator with a leaf" w={200} h={130}>
      <ellipse cx="100" cy="118" rx="70" ry="6" fill="var(--sunken)" />
      <rect x="64" y="18" width="72" height="96" rx="12" fill="var(--accent)" />
      <rect x="74" y="28" width="52" height="24" rx="5" fill="var(--lime)" />
      <path d="M82 40h22" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={76 + c * 18} y={60 + r * 17} width="13" height="12" rx="3" fill={r === 2 && c === 2 ? "var(--p2)" : "#fff"} opacity={r === 2 && c === 2 ? 1 : 0.85} />),
      )}
      <path d="M150 34c0-14 10-22 26-22 0 14-10 22-26 22z" fill="var(--p3)" />
      <path d="M150 34c4-8 10-14 18-18" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
      <path d="M38 40l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="var(--p4)" />
      <path d="M164 84l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="var(--lime)" />
    </Wrap>
  );
}

/** Compass with a question mark: page not found. */
export function LostArt({ className }: A) {
  return (
    <Wrap className={className} label="Compass pointing nowhere" w={200} h={140}>
      <ellipse cx="100" cy="128" rx="70" ry="6" fill="var(--sunken)" />
      <circle cx="100" cy="68" r="52" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="4" />
      <circle cx="100" cy="68" r="42" fill="var(--sunken)" />
      <g stroke="var(--line-strong)" strokeWidth="3" strokeLinecap="round">
        <path d="M100 30v8M100 98v8M62 68h8M130 68h8" />
      </g>
      <path d="M100 68l-12-26 24 22z" fill="var(--p2)" />
      <path d="M100 68l12 26-24-22z" fill="var(--ink-2)" />
      <circle cx="100" cy="68" r="5" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
      <path d="M156 24a12 12 0 1118 8c-4 3-6 4-6 10M168 52v.1" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" />
    </Wrap>
  );
}
