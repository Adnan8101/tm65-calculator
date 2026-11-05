"use client";
import type { StepProps } from "@/lib/types";
import { toNum } from "@/lib/check";
import { useDp } from "@/lib/dp";
import { CitySearch, Combo, Field, Input, Section, Select, opts } from "../ui";
import { Factory, Pin, Sparkle } from "../icons";

export default function FactoryStep({ d, up, errs, refs }: StepProps) {
  const { f } = useDp();
  const [total, prod, w] = [toNum(d.totalT), toNum(d.prodT), toNum(d.weight)];
  const ratio = total! > 0 && prod! > 0 && prod! <= total! ? (prod! / total!) * 100 : null;
  const num = (k: "kwh" | "fuelKwh" | "totalT" | "prodT" | "units", unit?: string) => (
    <Input id={k} inputMode={k === "units" ? "numeric" : "decimal"} unit={unit} value={d[k]} invalid={!!errs[k]} placeholder="0" onChange={(e) => up({ [k]: e.target.value })} />
  );

  return (
    <div className="space-y-6">
      <Section title="Final assembly" text="Where the product is finally assembled. Shown in the report, and used to measure how far each material travels to the factory." icon={<Pin />}>
        <Field label="Factory location" id="city" error={errs.city} hint={d.cityOk ? undefined : "Start typing and pick the nearest city from the list."}>
          <CitySearch id="city" value={d.city} invalid={!!errs.city} onPick={(c, text) => up({ city: c ? c.label : text, cityOk: !!c })} />
        </Field>
      </Section>

      <Section title="Annual factory energy" text="Total energy the factory uses in a year. It's shared across products by output tonnage." icon={<Sparkle />}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Electricity" id="kwh" error={errs.kwh}>
            {num("kwh", "kWh/yr")}
          </Field>
          <Field label="Grid region" id="region" error={errs.region} hint="Sets the grid carbon factor and the TM65 distance to site (A4).">
            <Select id="region" value={d.region} invalid={!!errs.region} placeholder="Select region" list={refs.regions} show={(r) => r.replace(/^Electricity - /, "")} onChange={(e) => up({ region: e.target.value })} />
          </Field>
          <Field label="Gas or other fuel" id="fuelKwh" optional error={errs.fuelKwh}>
            {num("fuelKwh", "kWh/yr")}
          </Field>
          <Field label="Fuel type" id="fuel" optional={!(toNum(d.fuelKwh)! > 0)} error={errs.fuel}>
            <Combo id="fuel" value={d.fuel} invalid={!!errs.fuel} placeholder="Search fuels" options={opts(refs.fuels)} onChange={(v) => up({ fuel: v })} />
          </Field>
        </div>
      </Section>

      <Section
        title="Factory output"
        text="Used to assign a fair share of the factory's energy to this product."
        icon={<Factory />}
        aside={
          ratio !== null && (
            <div className="fade hidden text-right sm:block">
              <p className="text-lg font-semibold tracking-tight text-ink">{f(ratio, ratio < 1 ? 3 : 1)}%</p>
              <p className="text-[11px] text-muted">of factory output</p>
            </div>
          )
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Total output, all products" id="totalT" error={errs.totalT}>
            {num("totalT", "t/yr")}
          </Field>
          <Field
            label="Output of this product"
            id="prodT"
            error={errs.prodT}
            hint={
              w! > 0 && !d.prodT ? (
                <button type="button" className="font-medium text-accent-text underline-offset-2 hover:underline" onClick={() => up({ prodT: String(w! / 1000) })}>
                  Use one unit ({f(w! / 1000, 3)} t)
                </button>
              ) : (
                ratio !== null && <span className="sm:hidden">{f(ratio)}% of factory output</span>
              )
            }
          >
            {num("prodT", "t/yr")}
          </Field>
          <Field label="Number of products" id="units" error={errs.units} hint="Units this output represents.">
            {num("units")}
          </Field>
        </div>
      </Section>
    </div>
  );
}
