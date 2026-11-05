"use client";
import { useState } from "react";
import type { Draft, Errs, Rep, StepProps } from "@/lib/types";
import { numErr } from "@/lib/check";
import { uid, upsert } from "@/lib/api";
import { useDp } from "@/lib/dp";
import { RefrigerantArt, RepairArt } from "../art2";
import { Callout, Choice, Combo, Err, Field, FormModal, Input, Item, Items, Section, Select, Toggle, opts } from "../ui";
import { Drop, Reset } from "../icons";

export default function UpkeepStep({ d, up, errs, refs }: StepProps) {
  const [edit, setEdit] = useState<Rep | null>(null);
  const [open, setOpen] = useState(false);
  const { f } = useDp();
  const show = (r: Rep | null) => (setEdit(r), setOpen(true));

  return (
    <div className="space-y-6">
      <Section
        title="Refrigerant"
        text="Only counted if the product contains refrigerant. Leakage during use (B1) and at end of life (C1) is then added to the result, without scale-up or buffer."
        icon={<Drop />}
        aside={<Toggle label="Does the product contain refrigerant?" value={d.hasRef ? "yes" : "no"} onChange={(v) => up(v === "yes" ? { hasRef: true } : { hasRef: false, ref: "", charge: "", leak: "" })} options={[["no", "None"], ["yes", "Yes"]]} />}
      >
        {d.hasRef ? (
          <div className="fade grid gap-5 sm:grid-cols-2">
            <Field label="Refrigerant" id="ref" error={errs.ref}>
              <Combo id="ref" value={d.ref} invalid={!!errs.ref} placeholder="Search refrigerants" options={opts(refs.refrigerants.slice(1))} onChange={(v) => up({ ref: v })} />
            </Field>
            <Field label="Refrigerant charge" id="charge" error={errs.charge}>
              <Input id="charge" inputMode="decimal" unit="kg" value={d.charge} invalid={!!errs.charge} placeholder="0" onChange={(e) => up({ charge: e.target.value })} />
            </Field>
            <Field label="How is the refrigerant handled?" id="leak" className="sm:col-span-2" error={errs.leak}>
              <Choice id="leak" value={d.leak} invalid={!!errs.leak} options={refs.leaks.slice(1).map((l) => ({ value: l, label: l }))} onChange={(v) => up({ leak: v })} />
            </Field>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <RefrigerantArt className="h-24 w-36 shrink-0" />
            <p className="text-sm text-ink-2">No refrigerant leakage will be included. Switch to <span className="font-medium text-ink">Yes</span> for heat pumps, chillers, VRF and similar equipment.</p>
          </div>
        )}
      </Section>

      <Section title="Parts replaced during service life" text="Materials typically replaced over the product's life (B3). Up to 5 parts." icon={<Reset />}>
        {!d.reps.length && <RepairArt className="mx-auto h-24 w-36" />}
        {!d.reps.length && <Callout>No parts listed, so TM65&apos;s default applies: 10% is added for repairs (10% of A1 in the basic method; 10% of A1–A4 and C2–C4 in mid-level). List the parts the manufacturer expects to replace to count them instead.</Callout>}
        <Err msg={errs.reps} />
        <Items add={d.reps.length >= 5 ? "Up to 5 parts" : d.mats.length ? "Add replaced part" : "Add materials first"} disabled={d.reps.length >= 5 || !d.mats.length} onAdd={() => show(null)}>
          {d.reps.map((r) => (
            <Item
              key={r.id}
              title={d.mats.find((m) => m.id === r.mat)?.name ?? "Removed material"}
              value={`${f(r.rate)}%`}
              error={errs[`rep.${r.id}`]}
              onEdit={() => show(r)}
              onDrop={() => up({ reps: d.reps.filter((x) => x.id !== r.id) })}
            />
          ))}
        </Items>
      </Section>

      <RepModal
        key={edit?.id ?? String(open)}
        open={open}
        rep={edit}
        d={d}
        onClose={() => setOpen(false)}
        onSave={(r) => {
          up({ reps: upsert(d.reps, r) });
          setOpen(false);
        }}
      />
    </div>
  );
}

function RepModal({ open, rep, d, onClose, onSave }: { open: boolean; rep: Rep | null; d: Draft; onClose: () => void; onSave: (r: Rep) => void }) {
  const [mat, setMat] = useState(rep?.mat ?? "");
  const [rate, setRate] = useState(rep?.rate ?? "");
  const [errs, setErrs] = useState<Errs>({});

  const submit = () => {
    const e: Errs = {};
    if (!d.mats.some((m) => m.id === mat)) e.mat = "Choose a material.";
    const r = numErr(rate, { label: "Replacement rate", gt: 0, max: 10000 });
    if (r) e.rate = r;
    setErrs(e);
    if (!Object.keys(e).length) onSave({ id: rep?.id ?? uid(), mat, rate: rate.trim() });
  };

  return (
    <FormModal open={open} onClose={onClose} title={rep ? "Edit replaced part" : "Add replaced part"} save={rep ? "Save changes" : "Add part"} onSave={submit}>
      <Field label="Material" id="rmat" error={errs.mat}>
        <Select id="rmat" value={mat} invalid={!!errs.mat} placeholder="Select from your materials" onChange={(e) => setMat(e.target.value)}>
          {d.mats.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Replacement rate" id="rate" error={errs.rate} hint="Share of that material replaced over the service life. If 10% of the steel is replaced 4 times, enter 40%. If all of it is replaced once, enter 100%.">
        <Input id="rate" inputMode="decimal" unit="%" value={rate} invalid={!!errs.rate} placeholder="0" onChange={(e) => setRate(e.target.value)} />
      </Field>
    </FormModal>
  );
}
