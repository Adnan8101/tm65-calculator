"use client";
import { useState } from "react";
import type { Draft, Level, Step } from "@/lib/types";
import { share, toNum } from "@/lib/check";
import { useDp } from "@/lib/dp";
import { TR, TR_TO_KW } from "@/lib/api";
import { Badge, Callout, Card } from "../ui";
import { Alert, Box, Check, Drop, Factory, Layers, Pencil } from "../icons";

function Block({ title, icon, issues, onEdit, children }: { title: string; icon: React.ReactNode; issues: number; onEdit: () => void; children: React.ReactNode }) {
  return (
    <Card className={issues ? "border-warn/40" : ""}>
      <header className="flex items-center gap-3 border-b border-line px-5 py-3.5 sm:px-6">
        <span className="text-muted">{icon}</span>
        <h3 className="flex-1 text-[15px] font-semibold text-ink">{title}</h3>
        {issues ? (
          <Badge tone="warn">
            <Alert className="h-3.5 w-3.5" /> {issues} to fix
          </Badge>
        ) : (
          <Badge tone="ok">
            <Check className="h-3.5 w-3.5" /> Complete
          </Badge>
        )}
        <button type="button" onClick={onEdit} className="-mr-2 flex items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] font-medium text-accent-text transition-colors hover:bg-accent-soft">
          <Pencil className="h-3.5 w-3.5" /> Edit
        </button>
      </header>
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </Card>
  );
}

function Facts({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map(([k, v]) => (
        <div key={k} className="min-w-0">
          <dt className="text-xs text-muted">{k}</dt>
          <dd className="mt-0.5 break-words text-sm text-ink">{v || <span className="text-muted">—</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function Review({ d, level, issues, onEdit }: { d: Draft; level: Level; issues: Record<Step, number>; onEdit: (s: Step) => void }) {
  const [all, setAll] = useState(false);
  const { f } = useDp();
  const pct = (s: string) => toNum(s) || 0;
  const mats = [...d.mats].sort((a, b) => pct(b.pct) - pct(a.pct));
  const top = Math.max(...mats.map((m) => pct(m.pct)), 1);
  const bad = Object.values(issues).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-5">
      {bad > 0 ? <Callout tone="warn" title="A few details are missing">Fix the sections marked below before calculating.</Callout> : <Callout tone="ok" title="Everything looks good">Your inputs are complete. Calculate the report when you&apos;re ready.</Callout>}

      <Block title="Product" icon={<Box />} issues={issues.product} onEdit={() => onEdit("product")}>
        <Facts
          rows={[
            ["Product", d.name],
            ["Manufacturer", d.maker],
            ["Type", d.type],
            ["Capacity", d.cap && (d.unit === TR && toNum(d.cap) ? `${f(String(Math.round(toNum(d.cap)! * TR_TO_KW * 100) / 100))} kW Cooling (${f(d.cap)} TR)` : `${f(d.cap)} ${d.unit}`)],
            ["Service life", d.life && `${d.life} years`],
            ["Weight", d.weight && `${f(d.weight)} kg`],
          ]}
        />
      </Block>

      <Block title="Materials" icon={<Layers />} issues={issues.materials} onEdit={() => onEdit("materials")}>
        <div className="flex items-baseline justify-between text-xs text-muted">
          <p>
            {mats.length} material{mats.length === 1 ? "" : "s"}
          </p>
          <p>
            Weight covered <span className="ml-1 font-mono text-sm font-medium tabular-nums text-ink">{f(share(d))}%</span>
          </p>
        </div>
        <ul className="mt-3 divide-y divide-line">
          {(all ? mats : mats.slice(0, 6)).map((m) => (
            <li key={m.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 py-2.5 sm:grid-cols-[minmax(0,1fr)_180px_72px]">
              <p className="truncate text-sm text-ink">{m.name}</p>
              <div className="col-span-2 row-start-2 h-1.5 rounded-full bg-sunken sm:col-span-1 sm:row-start-auto">
                <div className="grow h-1.5 rounded-full bg-accent" style={{ width: `${(pct(m.pct) / top) * 100}%` }} />
              </div>
              <p className="col-start-2 row-start-1 text-right font-mono text-sm tabular-nums text-ink sm:col-start-auto sm:row-start-auto">{f(m.pct)}%</p>
            </li>
          ))}
        </ul>
        {mats.length > 6 && (
          <button type="button" onClick={() => setAll(!all)} className="mt-2 text-[13px] font-medium text-accent-text hover:underline">
            {all ? "Show fewer" : `Show all ${mats.length}`}
          </button>
        )}
      </Block>

      <Block title="Refrigerant and repairs" icon={<Drop />} issues={issues.upkeep} onEdit={() => onEdit("upkeep")}>
        <Facts
          rows={[
            ["Refrigerant", d.hasRef ? d.ref : "None"],
            ["Charge", d.hasRef ? d.charge && `${f(d.charge)} kg` : "Not applicable"],
            ["Handling", d.hasRef ? d.leak : "Not applicable"],
          ]}
        />
        <div className="mt-5 border-t border-line pt-4">
          <p className="text-xs text-muted">Replaced parts</p>
          {d.reps.length ? (
            <ul className="mt-1.5 space-y-1">
              {d.reps.map((r) => (
                <li key={r.id} className="flex justify-between text-sm text-ink">
                  <span>{d.mats.find((m) => m.id === r.mat)?.name ?? "Removed material"}</span>
                  <span className="font-mono tabular-nums">{f(r.rate)}%</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-0.5 text-sm text-ink">None listed. TM65&apos;s default of 10% applies.</p>
          )}
        </div>
      </Block>

      {level === "mid" && (
        <Block title="Manufacturing" icon={<Factory />} issues={issues.factory} onEdit={() => onEdit("factory")}>
          <Facts
            rows={[
              ["Factory", d.city],
              ["Electricity", d.kwh && `${f(d.kwh, 0)} kWh/yr`],
              ["Grid region", d.region.replace(/^Electricity - /, "")],
              ["Other fuel", pct(d.fuelKwh) > 0 ? `${f(d.fuelKwh, 0)} kWh/yr, ${d.fuel}` : "None"],
              ["Factory output", d.totalT && `${f(d.totalT)} t/yr`],
              ["This product", d.prodT && `${f(d.prodT)} t/yr · ${d.units} unit${d.units === "1" ? "" : "s"}`],
            ]}
          />
        </Block>
      )}
    </div>
  );
}
