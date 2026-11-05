"use client";
import type { StepProps } from "@/lib/types";
import { Combo, Field, Input, Section, Select, opts } from "../ui";
import { Box, Sliders } from "../icons";
import { TR, TR_TO_KW } from "@/lib/api";
import { toNum } from "@/lib/check";
import { fmt } from "@/lib/dp";

export default function ProductStep({ d, up, errs, refs }: StepProps) {
  return (
    <div className="space-y-6">
      <Section title="Identification" text="How the product will be named in the report." icon={<Box />}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Type of product" id="type" error={errs.type} hint="Pick the type that most closely matches the product." className="sm:col-span-2">
            <Combo id="type" value={d.type} invalid={!!errs.type} placeholder="Search product types" options={opts(refs.productTypes)} onChange={(v) => up({ type: v })} />
          </Field>
          <Field label="Manufacturer" id="maker" error={errs.maker}>
            <Input id="maker" value={d.maker} invalid={!!errs.maker} maxLength={120} autoComplete="organization" placeholder="e.g. Acme Pumps Ltd" onChange={(e) => up({ maker: e.target.value })} />
          </Field>
          <Field label="Product name or model" id="name" error={errs.name}>
            <Input id="name" value={d.name} invalid={!!errs.name} maxLength={120} placeholder="e.g. HIU-1350" onChange={(e) => up({ name: e.target.value })} />
          </Field>
          <Field label="Contact email" id="email" optional error={errs.email} className="sm:col-span-2">
            <Input id="email" type="email" value={d.email} invalid={!!errs.email} autoComplete="email" placeholder="name@company.com" onChange={(e) => up({ email: e.target.value })} />
          </Field>
        </div>
      </Section>

      <Section title="Specification" text="Weight and service life drive most of the result." icon={<Sliders />}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Capacity or size" id="cap" error={errs.cap || errs.unit} hint={d.unit === TR ? (toNum(d.cap) ? `= ${fmt(Math.round(toNum(d.cap)! * TR_TO_KW * 100) / 100)} kW Cooling (1 TR = ${TR_TO_KW} kW). The report uses kW.` : `Enter tons of refrigeration. It is converted to kW automatically (1 TR = ${TR_TO_KW} kW).`) : "For heating or cooling equipment, say whether the capacity is for heating or cooling. Or choose TR Cooling to enter tons of refrigeration."} className="sm:col-span-2">
            <div className="grid grid-cols-[minmax(0,1fr)_150px] gap-2">
              <Input id="cap" inputMode="decimal" value={d.cap} invalid={!!errs.cap} placeholder="0" onChange={(e) => up({ cap: e.target.value })} />
              <Select value={d.unit} invalid={!!errs.unit} placeholder="Unit" aria-label="Unit" list={[...refs.units, TR]} onChange={(e) => up({ unit: e.target.value })} />
            </div>
          </Field>
          <Field label="Product weight" id="weight" error={errs.weight} hint="As on the manufacturer form. Material shares exclude the refrigerant charge.">
            <Input id="weight" inputMode="decimal" unit="kg" value={d.weight} invalid={!!errs.weight} placeholder="0" onChange={(e) => up({ weight: e.target.value })} />
          </Field>
          <Field label="Service life" id="life" error={errs.life} hint="Manufacturer recommendation or CIBSE Guide M.">
            <Input id="life" inputMode="numeric" unit="years" value={d.life} invalid={!!errs.life} placeholder="0" onChange={(e) => up({ life: e.target.value })} />
          </Field>
        </div>
      </Section>
    </div>
  );
}
