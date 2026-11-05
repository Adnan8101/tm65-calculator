"use client";
import { useState } from "react";
import type { Draft, Errs, Level, Mat, Ref, StepProps } from "@/lib/types";
import { ICE_SLOTS, numErr, share, toNum } from "@/lib/check";
import { uid, upsert } from "@/lib/api";
import { useDp } from "@/lib/dp";
import { EmptyArt } from "../art2";
import { Badge, Card, CitySearch, Combo, Err, Field, FormModal, Input, Item, Items, type Opt } from "../ui";
import { Alert, Check, Pin } from "../icons";

function Coverage({ total }: { total: number }) {
  const { f } = useDp();
  const good = total >= 95 && total <= 100.0001;
  const over = total > 100.0001;
  const fill = good ? "bg-accent" : over ? "bg-danger" : "bg-warn";
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-ink-2">Product weight covered</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight text-ink">
            {f(total, 1)}
            <span className="ml-0.5 text-xl font-normal text-muted">%</span>
          </p>
        </div>
        {good ? (
          <Badge tone="ok">
            <Check className="h-3.5 w-3.5" /> Ready{total < 99.9999 && " · rest counted as steel"}
          </Badge>
        ) : over ? (
          <Badge tone="danger">
            <Alert className="h-3.5 w-3.5" /> {f(total - 100, 1)}% over
          </Badge>
        ) : (
          <Badge tone="warn">{f(95 - total, 1)}% more needed</Badge>
        )}
      </div>
      <div className="relative mt-5" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(total * 10) / 10} aria-label="Product weight covered">
        <div className="h-2.5 overflow-hidden rounded-full bg-sunken">
          <div className={`h-full rounded-full transition-all duration-500 ${fill}`} style={{ width: `${Math.min(total, 100)}%` }} />
        </div>
        <span className="absolute -top-1 left-[95%] h-[18px] w-0.5 -translate-x-1/2 rounded-full bg-ink/40" />
      </div>
      <div className="relative mt-2 h-4 font-mono text-[11px] text-muted">
        <span className="absolute left-0">0</span>
        <span className="absolute left-[95%] -translate-x-full pr-1">95</span>
        <span className="absolute right-0">100</span>
      </div>
    </Card>
  );
}

export default function MaterialsStep({ d, up, errs, refs, level }: StepProps & { level: Level }) {
  const [edit, setEdit] = useState<Mat | null>(null);
  const [open, setOpen] = useState(false);
  const { f } = useDp();
  const show = (m: Mat | null) => (setEdit(m), setOpen(true));
  const sorted = [...d.mats].sort((a, b) => (toNum(b.pct) || 0) - (toNum(a.pct) || 0));

  return (
    <div className="space-y-6">
      <Coverage total={share(d)} />

      <Card className="p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-[15px] font-semibold text-ink">Materials</h3>
          <p className="text-xs text-muted">Share of weight, excluding refrigerant</p>
        </div>
        <Err msg={errs.mats} />
        <Items
          add="Add material"
          onAdd={() => show(null)}
          empty={
            <>
              <EmptyArt className="mx-auto h-24 w-36" />
              <p className="mt-2 text-sm font-medium text-ink">No materials yet</p>
              <p className="mx-auto mt-1 max-w-xs text-[13px] text-muted">Add each material from the manufacturer&apos;s breakdown, starting with the heaviest.</p>
            </>
          }
        >
          {sorted.map((m) => (
            <Item
              key={m.id}
              title={m.name}
              value={`${f(m.pct)}%`}
              bar={toNum(m.pct) || 0}
              error={errs[`mat.${m.id}`]}
              onEdit={() => show(m)}
              onDrop={() => up({ mats: d.mats.filter((x) => x.id !== m.id), reps: d.reps.filter((r) => r.mat !== m.id) })}
              meta={
                (m.rec || m.origin) && (
                  <>
                    {m.rec && <span>{f(m.rec)}% recycled</span>}
                    {m.origin && (
                      <span className="inline-flex items-center gap-1">
                        <Pin className="h-3 w-3" />
                        {m.origin}
                      </span>
                    )}
                  </>
                )
              }
            />
          ))}
        </Items>
      </Card>

      <MatModal
        key={edit?.id ?? String(open)}
        open={open}
        mat={edit}
        d={d}
        refs={refs}
        level={level}
        onClose={() => setOpen(false)}
        onSave={(m) => {
          up({ mats: upsert(d.mats, m) });
          setOpen(false);
        }}
      />
    </div>
  );
}

function MatModal({ open, mat, d, refs, level, onClose, onSave }: { open: boolean; mat: Mat | null; d: Draft; refs: Ref; level: Level; onClose: () => void; onSave: (m: Mat) => void }) {
  const [pick, setPick] = useState(mat ? (mat.kind === "tm65" ? `t:${mat.name}` : `i:${refs.extra.indexOf(mat.name)}`) : "");
  const [pct, setPct] = useState(mat?.pct ?? "");
  const [rec, setRec] = useState(mat?.rec ?? "");
  const [city, setCity] = useState({ label: mat?.origin ?? "", lat: mat?.lat ?? null, lng: mat?.lng ?? null });
  const [errs, setErrs] = useState<Errs>({});
  const { f } = useDp();
  const others = d.mats.filter((m) => m.id !== mat?.id);
  const used = new Set(others.filter((m) => m.kind === "tm65").map((m) => m.name));
  const usedIce = new Set(others.filter((m) => m.kind === "ice").map((m) => m.name));
  const full = others.filter((m) => m.kind === "ice").length >= ICE_SLOTS(refs);
  const rest = 100 - others.reduce((s, m) => s + (toNum(m.pct) || 0), 0);
  const options: Opt[] = [
    ...refs.slots.filter((s) => s.locked).map((s) => ({ value: `t:${s.name}`, label: s.name, group: "Common materials", disabled: used.has(s.name), note: used.has(s.name) ? "Added" : undefined })),
    ...refs.extra.map((x, i) => ({ value: `i:${i}`, label: x, group: "More materials", disabled: usedIce.has(x) || (full && pick !== `i:${i}`), note: usedIce.has(x) ? "Added" : undefined })),
  ];

  const submit = () => {
    const has = city.label.trim() !== "";
    const e: Errs = {};
    if (!pick) e.pick = "Choose a material.";
    const p = numErr(pct, { label: "Share", gt: 0, max: 100 });
    const r = numErr(rec, { label: "Recycled content", min: 0, max: 100, req: false });
    if (p) e.pct = p;
    if (r) e.rec = r;
    if (has && city.lat === null) e.city = "Choose a city from the list, or clear the field.";
    setErrs(e);
    if (Object.keys(e).length) return;
    const tm = pick.startsWith("t:");
    onSave({
      id: mat?.id ?? uid(),
      kind: tm ? "tm65" : "ice",
      name: tm ? pick.slice(2) : refs.extra[Number(pick.slice(2))],
      pct: pct.trim(),
      rec: rec.trim(),
      origin: has ? city.label : "",
      lat: has ? city.lat : null,
      lng: has ? city.lng : null,
    });
  };

  const left = rest > 0 && rest < 100 && !pct;
  return (
    <FormModal open={open} onClose={onClose} title={mat ? "Edit material" : "Add material"} sub={rest > 0 && rest < 100 ? `${f(rest, 2)}% of the weight is not yet allocated.` : undefined} save={mat ? "Save changes" : "Add material"} onSave={submit}>
      <Field label="Material" id="mat" error={errs.pick} hint={full ? `The limit of ${ICE_SLOTS(refs)} materials from "More materials" has been reached.` : "Type to search, e.g. “copper” or “steel”."}>
        <Combo id="mat" value={pick} invalid={!!errs.pick} placeholder="Search materials" options={options} onChange={setPick} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Share of product weight"
          id="pct"
          error={errs.pct}
          hint={
            left && (
              <button type="button" className="font-medium text-accent-text underline-offset-2 hover:underline" onClick={() => setPct(String(Number(rest.toFixed(4))))}>
                Use remaining {f(rest, 2)}%
              </button>
            )
          }
        >
          <Input id="pct" inputMode="decimal" unit="%" value={pct} invalid={!!errs.pct} placeholder="0" onChange={(e) => setPct(e.target.value)} />
        </Field>
        <Field label="Recycled content" id="rec" optional error={errs.rec}>
          <Input id="rec" inputMode="decimal" unit="%" value={rec} invalid={!!errs.rec} placeholder="0" onChange={(e) => setRec(e.target.value)} />
        </Field>
      </div>
      {level === "mid" && (
        <Field label="Where is it sourced from?" id="origin" optional error={errs.city} hint="Used to show the straight-line distance to the factory in the report.">
          <CitySearch id="origin" value={city.label} invalid={!!errs.city} onPick={(c, text) => setCity(c ? { label: c.label, lat: c.lat, lng: c.lng } : { label: text, lat: null, lng: null })} />
        </Field>
      )}
    </FormModal>
  );
}
