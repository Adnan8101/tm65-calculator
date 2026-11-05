"use client";

import type { Draft, Level } from "@/lib/types";
import { useDp } from "@/lib/dp";
import { Badge, Button, Card } from "../ui";
import Pie from "../pie";
import { Bolt, Drop, Factory, Layers, Left, PieIcon, Print, Recycle, Reset, Sheet, Trash, Truck, Wrench, Box } from "../icons";
import { AlertArt } from "../art";

type Slice = { label: string; value: number };
type MatRow = { name: string; share: number; embodied: number | null; distanceKm?: number | null };
type P = { open: boolean; res: any; err: string[]; d: Draft; level: Level; onBack: () => void; onNew: () => void; extra?: React.ReactNode };
type Seg = { name: string; codes: string; value: number; color: string; ink: string };

const basicNames: Record<string, [string, string]> = {
  "A1 Materials": ["A1", "Materials, with scale-up factor"],
  "A1 for Repair": ["B3", "Repairs (listed parts, or 10% of A1)"],
  "B1 + C1 Refrigerant": ["B1 C1", "Refrigerant leakage (only if the product has refrigerant)"],
};

const split = (label: string): [string, string] => basicNames[label] ?? [label.split(": ")[0], label.split(": ").slice(1).join(": ")];

// Validated categorical order (see globals.css --p1..--p4); yellow takes near-black text.
const slot = [
  ["var(--p1)", "#fff"],
  ["var(--p2)", "#fff"],
  ["var(--p3)", "#fff"],
  ["var(--p4)", "#0b0b0b"],
];

const phases = [
  ["Materials and manufacturing", "A1–A3"],
  ["Transport to site", "A4"],
  ["Refrigerant leakage in use and repairs", "B1, B3"],
  ["End of life", "C1–C4"],
];

const stageIcon: Record<string, typeof Layers> = { A1: Layers, A2: Truck, A3: Bolt, A4: Truck, B1: Drop, B3: Wrench, C1: Drop, C2: Truck, C3: Recycle, C4: Trash, "B1 C1": Drop };
const iconFor = (code: string) => stageIcon[code] ?? stageIcon[code.split(" ")[0]] ?? Layers;

const phaseOf = (code: string) => (code === "A4" ? 1 : code[0] === "A" ? 0 : code[0] === "B" ? 2 : 3);

export default function ReportView({ res, err, d, level, onBack, onNew, extra }: P) {
  const { f } = useDp();
  const p = (v: number) => `${f(v * 100, 1)}%`;
  const mid = level === "mid";
  const r = res?.[level];
  const c = res?.common;
  const ok = !err.length && !!r && !r.error && !!c;
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const toolbar = (
    <div className="no-print flex flex-wrap items-center justify-between gap-3">
      <Button kind="ghost" onClick={onBack} className="-ml-3">
        <Left /> Edit inputs
      </Button>
      {ok && (
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => window.print()}>
            <Print /> Save as PDF
          </Button>
        </div>
      )}
    </div>
  );

  if (!ok)
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
        {toolbar}
        <Card className="rise mt-8 p-8 text-center">
          <AlertArt className="mx-auto h-28 w-40" />
          <h1 className="mt-5 text-xl font-semibold tracking-tight text-ink">The report couldn&apos;t be calculated</h1>
          <ul className="mx-auto mt-4 max-w-md space-y-1.5 text-left text-sm text-ink-2">
            {(err.length ? err : [r?.message ?? "Unknown error."]).map((m: string) => (
              <li key={m} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-danger" />
                {m}
              </li>
            ))}
          </ul>
          <Button className="mt-7" onClick={onBack}>
            <Left /> Back to inputs
          </Button>
        </Card>
        {extra}
      </div>
    );

  const total: number = r.report.total;
  const rows = (r.chart as Slice[]).map((x, i) => {
    const [code, name] = split(x.label);
    return { code, name, value: x.value, seg: mid ? phaseOf(code) : i };
  });
  const segs: Seg[] = (mid ? phases.map(([name, codes]) => ({ name, codes })) : rows.map((x) => ({ name: x.name, codes: x.code }))).map((s, i) => ({
    ...s,
    value: rows.filter((x) => x.seg === i).reduce((a, x) => a + Math.max(x.value, 0), 0),
    color: slot[i][0],
    ink: slot[i][1],
  }));
  const lead = [...rows].sort((a, b) => b.value - a.value)[0];
  const mats = [...(r.materials as MatRow[])].sort((a, b) => (b.embodied ?? 0) - (a.embodied ?? 0));
  const matTop = Math.max(...mats.map((m) => m.embodied ?? 0), 1);
  const kind = mid ? "mid-level" : "basic";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12 print:max-w-none print:p-0">
      {toolbar}

      <article className="mt-6 space-y-6 text-sm print:mt-0 print:space-y-3 print:text-xs">
        <header className="rise">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">
              {mid ? <Factory className="h-3.5 w-3.5" /> : <Layers className="h-3.5 w-3.5" />} TM65 {kind}
            </Badge>
            <span className="text-[13px] text-muted">{date}</span>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl print:mt-1 print:text-2xl">{d.name}</h1>
          <p className="mt-2 text-[15px] text-ink-2 print:mt-0.5 print:text-xs">
            {d.maker} · {c.productType} · {c.capacity}
          </p>
        </header>

        <Card className="rise print-avoid overflow-hidden" >
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] print:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <div className="border-b border-line p-6 sm:p-8 lg:border-b-0 lg:border-r print:border-b-0 print:border-r print:p-4">
              <p className="text-[13px] font-medium text-ink-2">Total embodied carbon</p>
              <p className="mt-2 text-5xl font-semibold tracking-tight text-ink sm:text-6xl print:mt-1 print:text-4xl">{f(total, total >= 100 ? 0 : 2)}</p>
              <p className="mt-1 text-base text-muted">kgCO₂e</p>
              <p className="mt-6 max-w-sm leading-relaxed text-ink-2 print:mt-3">
                <span className="font-medium text-ink">{lead.name}</span> ({lead.code}) is the largest contributor, at {p(lead.value / total)} of the total.
              </p>
            </div>
            <dl className="grid grid-cols-2">
              {[
                ["In tonnes", `${f(total / 1000, 2)}`, "tCO₂e"],
                ["Per kg of product", f(total / c.productWeightKg, 2), "kgCO₂e/kg"],
                ["Per year of service", f(total / c.serviceLifeYears, 0), `kgCO₂e/yr · ${c.serviceLifeYears} yrs`],
                ["Product weight", f(c.productWeightKg, 0), `kg · ${p(c.materialShare)} covered`],
              ].map(([k, v, u], i) => (
                <div key={k} className={`min-w-0 p-4 sm:p-6 print:p-3 ${i % 2 ? "" : "border-r border-line"} ${i < 2 ? "border-b border-line" : ""}`}>
                  <dt className="text-xs text-muted">{k}</dt>
                  <dd className="mt-1.5 truncate text-xl font-semibold tracking-tight text-ink sm:text-2xl">{v}</dd>
                  <dd className="mt-0.5 text-xs text-muted">{u}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="border-t border-line bg-sunken/40 p-6 sm:px-8 print:p-4">
            <Segments segs={segs} total={total} />
          </div>
        </Card>

        <Card className="rise print-avoid p-4 sm:p-8 print:p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
              <PieIcon className="h-4 w-4 text-accent-text" /> Breakdown by life cycle stage
            </h2>
            <p className="text-xs text-muted">kgCO₂e · share of total</p>
          </div>
          <div className="mt-4 flex flex-col items-center gap-6 pb-8 sm:flex-row sm:gap-10 sm:pb-0 print:flex-row print:gap-6 print:pb-0">
            <Pie size={170} label="Share of total by life cycle stage" fmt={(v) => f(v, 0)} slices={rows.map((x) => ({ name: x.name, codes: x.code, value: x.value, color: segs[x.seg].color }))} />
            <ul className="w-full flex-1 space-y-1">
              {rows.map((x) => (
                <li key={x.code + x.name} className="grid grid-cols-[10px_56px_minmax(0,1fr)_auto_44px] items-center gap-x-2 rounded-lg px-1 py-2 sm:grid-cols-[12px_62px_minmax(0,1fr)_auto_52px] sm:gap-x-3 sm:px-2 transition-colors hover:bg-sunken/60">
                  <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: segs[x.seg].color }} />
                  <span className="flex w-fit items-center gap-1 rounded-md bg-sunken px-1.5 py-0.5 font-mono text-[11px] text-ink-2">
                    {(() => {
                      const I = iconFor(x.code);
                      return <I className="h-3 w-3" />;
                    })()}
                    {x.code}
                  </span>
                  <span className="truncate text-ink">{x.name}</span>
                  <span className="text-right font-mono tabular-nums text-ink">{f(x.value, 0)}</span>
                  <span className="text-right font-mono text-xs tabular-nums text-muted">{p(x.value / total)}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 text-xs text-muted">Values include the TM65 {mid ? "buffer factor" : "scale-up and buffer factors"}, except refrigerant leakage.</p>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2 print:grid-cols-2 print:gap-3">
          <Card className="rise print-avoid p-6 sm:p-8 print:p-4">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
              <Sheet className="h-4 w-4 text-accent-text" /> Calculation
            </h2>
            <table className="mt-4 w-full">
              <tbody>
                {mid ? (
                  <>
                    {r.report.lines.map((l: { code: string; label: string; value: number }) => (
                      <Row key={l.code} code={l.code} k={split(l.label)[1]} v={l.value} />
                    ))}
                    <Row k="Subtotal, excluding B1 and C1" v={r.report.totalNoBuffer} strong />
                    <Row k="Including buffer factor, excluding B1 and C1" v={r.report.totalWithBuffer} strong />
                  </>
                ) : (
                  <>
                    <Row code="A1" k="Material extraction" v={r.report.A1} />
                    <Row code="B3" k={r.repairsListed ? "Repairs, from the listed parts" : "Repairs, TM65 default (10% of A1)"} v={r.report.A1Replaced} />
                    <Row k="Including scale-up and buffer factors" v={r.report.totalExRefrigerant} strong />
                  </>
                )}
                <Row code="B1 C1" k={d.hasRef ? (mid ? "Add refrigerant leakage (B1 + C1)" : "Refrigerant leakage, in use and at end of life") : "Refrigerant leakage (none, product has no refrigerant)"} v={r.report.refrigerantLeakage} />
                <tr className="border-t-2 border-ink">
                  <td colSpan={2} className="pt-3 font-semibold text-ink">
                    Total, kgCO₂e
                  </td>
                  <td className="pt-3 text-right font-mono font-semibold tabular-nums text-ink">{f(total)}</td>
                </tr>
              </tbody>
            </table>
          </Card>

          <Card className="rise print-avoid p-6 sm:p-8 print:p-4">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
              <Box className="h-4 w-4 text-accent-text" /> Product
            </h2>
            <dl className="mt-4">
              <Item k="Manufacturer" v={d.maker} />
              <Item k="Type" v={c.productType} />
              <Item k="Capacity" v={c.capacity} />
              <Item k="Weight" v={`${f(c.productWeightKg)} kg`} />
              <Item k="Weight covered by materials" v={p(c.materialShare)} />
              <Item k="Service life" v={`${c.serviceLifeYears} years`} />
              <Item k="Refrigerant" v={d.hasRef ? `${c.refrigerant}, ${f(c.refrigerantChargeKg)} kg` : "None"} />
              {mid && <Item k="Factory" v={r.factory} />}
              {mid && <Item k="Factory energy per unit" v={`${f(r.energyPerUnit)} kWh`} />}
            </dl>
          </Card>
        </div>

        <Card className="rise print-avoid p-6 sm:p-8 print:p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
              <Layers className="h-4 w-4 text-accent-text" /> Materials
            </h2>
            <p className="text-xs text-muted">Sorted by embodied carbon</p>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] print:min-w-0">
              <thead className="border-b border-line text-left text-xs text-muted">
                <tr>
                  <th className="pb-2.5 font-normal">Material</th>
                  <th className="pb-2.5 text-right font-normal">Share of weight</th>
                  <th className="w-[28%] pb-2.5 pl-6 font-normal">A1, kgCO₂e</th>
                  <th className="pb-2.5 text-right font-normal" />
                  {mid && <th className="pb-2.5 text-right font-normal">To factory</th>}
                </tr>
              </thead>
              <tbody>
                {mats.map((m) => (
                  <tr key={m.name} className="border-b border-line last:border-0">
                    <td className="py-2.5 pr-4 text-ink">{m.name}</td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-ink-2">{p(m.share)}</td>
                    <td className="py-2.5 pl-6">
                      <div className="h-1.5 rounded-full bg-sunken">{(m.embodied ?? 0) > 0 && <div className="h-full rounded-full bg-accent" style={{ width: `max(3px, ${((m.embodied ?? 0) / matTop) * 100}%)` }} />}</div>
                    </td>
                    <td className="py-2.5 pl-3 text-right font-mono tabular-nums text-ink">{m.embodied === null ? "—" : f(m.embodied, 0)}</td>
                    {mid && <td className="py-2.5 pl-4 text-right font-mono tabular-nums text-ink-2">{m.distanceKm == null ? "—" : `${f(m.distanceKm, 0)} km`}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <p className="px-1 text-xs leading-relaxed text-muted">Calculated with the CIBSE TM65 {kind} method. A self-assessed, deliberately cautious estimate for use when no Environmental Product Declaration is available.</p>
        <p className="px-1 text-xs text-muted">
          Generated by <span className="font-medium text-ink-2">TM65 Calculator</span>, a product of <span className="font-medium text-ink-2">Blackcurrant Labs</span> · blackcurrantlabs.com
        </p>
      </article>

      <div className="no-print mt-10 flex flex-col items-center gap-3 border-t border-line pt-10 text-center">
        <p className="text-sm text-ink-2">Assessing another product?</p>
        <Button kind="secondary" onClick={onNew}>
          <Reset /> Start a new calculation
        </Button>
      </div>
      {extra}
    </div>
  );
}

function Segments({ segs, total }: { segs: Seg[]; total: number }) {
  const { f } = useDp();
  return (
    <div className="flex flex-col items-center gap-6 pb-8 sm:flex-row sm:gap-10 sm:pb-0 print:flex-row print:gap-6 print:pb-0">
      <Pie size={170} label="Share of total by life cycle phase" slices={segs} fmt={(v) => f(v, 0)} />
      <ul className="grid w-full flex-1 gap-2.5 text-[13px] text-ink-2">
        {segs.map((s) => (
          <li key={s.name} className={`flex items-center gap-3 ${s.value > 0 ? "" : "opacity-50"}`}>
            <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: s.color }} />
            <span className="min-w-0 flex-1">
              {s.name} <span className="font-mono text-xs text-muted">{s.codes}</span>
            </span>
            <span className="font-mono tabular-nums text-ink">{f(s.value, 0)}</span>
            <span className="w-14 text-right font-mono text-xs tabular-nums text-muted">{f((s.value / total) * 100, 1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Row({ k, v, code, strong }: { k: string; v: number; code?: string; strong?: boolean }) {
  const { f } = useDp();
  const tone = strong ? "font-medium text-ink" : "text-ink-2";
  return (
    <tr className={`border-b border-line ${strong ? "bg-sunken/50" : ""}`}>
      <td className="w-14 py-2 pl-1 font-mono text-[11px] text-muted">{code}</td>
      <td className={`py-2 pr-3 ${tone}`}>{k}</td>
      <td className={`py-2 pr-1 text-right font-mono tabular-nums ${tone}`}>{f(v)}</td>
    </tr>
  );
}

const Item = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between gap-6 border-b border-line py-2.5 last:border-0">
    <dt className="shrink-0 text-muted">{k}</dt>
    <dd className="text-right text-ink">{v}</dd>
  </div>
);
