"use client";
import { useState } from "react";

export type PieSlice = { name: string; codes?: string; value: number; color: string };

const R = 80;
const polar = (a: number, r = R) => [100 + r * Math.sin(a), 100 - r * Math.cos(a)];

function path(a0: number, a1: number) {
  if (a1 - a0 >= Math.PI * 2 - 1e-6) return `M100 ${100 - R} A${R} ${R} 0 1 1 99.99 ${100 - R} Z`;
  const [x0, y0] = polar(a0);
  const [x1, y1] = polar(a1);
  return `M100 100 L${x0} ${y0} A${R} ${R} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1} ${y1} Z`;
}

/** Pie chart with hover/focus highlight. `unit` and `fmt` format the tooltip text. */
export default function Pie({ slices, size = 200, label, fmt = (v: number) => v.toLocaleString("en-GB", { maximumFractionDigits: 0 }), unit = "kgCO₂e", className = "" }: { slices: PieSlice[]; size?: number; label: string; fmt?: (v: number) => string; unit?: string; className?: string }) {
  const [hov, setHov] = useState<number | null>(null);
  const live = slices.map((s, i) => ({ ...s, i })).filter((s) => s.value > 0);
  const total = live.reduce((a, s) => a + s.value, 0) || 1;
  let acc = 0;
  const arcs = live.map((s) => {
    const a0 = (acc / total) * Math.PI * 2;
    acc += s.value;
    return { ...s, a0, a1: (acc / total) * Math.PI * 2, sh: s.value / total };
  });
  const h = arcs.find((s) => s.i === hov);
  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label={label} className="overflow-visible">
        {arcs.map((s) => {
          const mid = (s.a0 + s.a1) / 2;
          const [lx, ly] = polar(mid, R * 0.64);
          return (
            <g key={s.name} tabIndex={0} onMouseEnter={() => setHov(s.i)} onMouseLeave={() => setHov(null)} onFocus={() => setHov(s.i)} onBlur={() => setHov(null)} className="outline-none" aria-label={`${s.name}: ${fmt(s.value)} ${unit}, ${(s.sh * 100).toFixed(1)}%`} style={{ opacity: hov === null || hov === s.i ? 1 : 0.55, transition: "opacity .15s" }}>
              <path d={path(s.a0, s.a1)} fill={s.color} stroke="var(--surface, #fff)" strokeWidth={arcs.length > 1 ? 2 : 0} strokeLinejoin="round" />
              {s.sh >= 0.07 && (
                <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="600" fill="#fff" className="pointer-events-none" style={s.color.includes("p4") ? { fill: "#0b0b0b" } : undefined}>
                  {Math.round(s.sh * 100)}%
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {h && (
        <span className="fade pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-lift">
          <span className="block font-semibold text-ink">
            {h.name} {h.codes && <span className="font-mono font-normal text-muted">{h.codes}</span>}
          </span>
          <span className="mt-0.5 block text-ink-2">
            {fmt(h.value)} {unit} · {(h.sh * 100).toFixed(1)}%
          </span>
        </span>
      )}
    </div>
  );
}
