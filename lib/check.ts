import type { Draft, Errs, Level, Ref, Step } from "./types";

export const toNum = (s: string): number | null => {
  const t = String(s ?? "").replace(/[\s,]/g, "");
  if (t === "") return null;
  return /^-?(\d+\.?\d*|\.\d+)$/.test(t) ? Number(t) : NaN;
};

const mail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Rule = { label: string; req?: boolean; int?: boolean; gt?: number; min?: number; max?: number };

export function numErr(v: string, r: Rule): string | undefined {
  const n = toNum(v);
  if (n === null) return r.req === false ? undefined : `${r.label} is required.`;
  if (Number.isNaN(n)) return `${r.label} must be a number.`;
  if (r.int && !Number.isInteger(n)) return `${r.label} must be a whole number.`;
  if (r.gt !== undefined && n <= r.gt) return `${r.label} must be greater than ${r.gt}.`;
  if (r.min !== undefined && n < r.min) return `${r.label} must be at least ${r.min}.`;
  if (r.max !== undefined && n > r.max) return `${r.label} must be ${r.max.toLocaleString("en-GB")} or less.`;
  return undefined;
}

function textErr(v: string, label: string, max: number): string | undefined {
  const t = v.trim();
  if (!t) return `${label} is required.`;
  if (t.length > max) return `${label} must be ${max} characters or fewer.`;
  return undefined;
}

export const share = (d: Draft) => d.mats.reduce((s, m) => s + (toNum(m.pct) || 0), 0);

export const ICE_SLOTS = (ref: Ref) => ref.slots.filter((s) => !s.locked).length;

export function checkStep(step: Step, d: Draft, ref: Ref, level: Level = "mid"): Errs {
  const e: Errs = {};
  const put = (k: string, m?: string) => {
    if (m) e[k] = m;
  };

  if (step === "product") {
    if (!ref.productTypes.includes(d.type)) e.type = "Choose the type of product.";
    put("maker", textErr(d.maker, "Manufacturer", 120));
    put("name", textErr(d.name, "Product name", 120));
    if (d.email.trim() && !mail.test(d.email.trim())) e.email = "Enter a valid email address.";
    put("cap", numErr(d.cap, { label: "Capacity", gt: 0, max: 1e7 }));
    if (!d.unit) e.unit = "Choose a unit.";
    put("life", numErr(d.life, { label: "Service life", int: true, min: 1, max: 100 }));
    put("weight", numErr(d.weight, { label: "Product weight", gt: 0, max: 1e6 }));
  }

  if (step === "materials") {
    if (!d.mats.length) e.mats = "Add at least one material.";
    for (const m of d.mats) {
      const p = toNum(m.pct);
      if (p === 0) e[`mat.${m.id}`] = "Share is 0%. Enter a share above 0, or remove this material.";
      else put(`mat.${m.id}`, numErr(m.pct, { label: "Share", gt: 0, max: 100 }) || numErr(m.rec, { label: "Recycled content", min: 0, max: 100, req: false }));
    }
    const tm = d.mats.filter((m) => m.kind === "tm65").map((m) => m.name);
    if (new Set(tm).size !== tm.length) e.mats = "Each TM65 material can only be listed once.";
    if (d.mats.filter((m) => m.kind === "ice").length > ICE_SLOTS(ref)) e.mats = `You can add up to ${ICE_SLOTS(ref)} materials from the "More materials" list.`;
    if (d.mats.length && !e.mats) {
      const t = share(d);
      if (t < 95) e.mats = `Shares add up to ${t.toFixed(2)}%. TM65 needs materials covering at least 95% of the product weight.`;
      else if (t > 100.0001) e.mats = `Shares add up to ${t.toFixed(2)}%, which is more than 100%.`;
    }
  }

  if (step === "upkeep") {
    if (d.hasRef) {
      if (!ref.refrigerants.slice(1).includes(d.ref)) e.ref = "Choose the refrigerant.";
      put("charge", numErr(d.charge, { label: "Refrigerant charge", gt: 0, max: 1e5 }));
      if (!ref.leaks.slice(1).includes(d.leak)) e.leak = "Choose a leakage scenario.";
    }
    if (d.reps.length > 5) e.reps = "You can list up to 5 replaced components.";
    const ice = d.reps.filter((r) => d.mats.find((m) => m.id === r.mat)?.kind === "ice");
    if (level === "basic" && ice.length > 1) e.reps = "The basic method can only include one material from the \"More materials\" list as a replaced part. Keep one, or switch to a mid-level report.";
    for (const r of d.reps) {
      if (!d.mats.some((m) => m.id === r.mat)) e[`rep.${r.id}`] = "This material is no longer in your material list.";
      else put(`rep.${r.id}`, numErr(r.rate, { label: "Replacement rate", gt: 0, max: 10000 }));
    }
  }

  if (step === "factory") {
    if (!d.cityOk) e.city = "Pick the final assembly city from the list.";
    put("kwh", numErr(d.kwh, { label: "Electricity use", min: 0, max: 1e12 }));
    if (!ref.regions.includes(d.region)) e.region = "Choose the electricity grid region.";
    put("fuelKwh", numErr(d.fuelKwh, { label: "Fuel use", min: 0, max: 1e12, req: false }));
    if ((toNum(d.fuelKwh) || 0) > 0 && !ref.fuels.includes(d.fuel)) e.fuel = "Choose the fuel type.";
    put("totalT", numErr(d.totalT, { label: "Total factory output", gt: 0, max: 1e9 }));
    put("prodT", numErr(d.prodT, { label: "Output of this product", gt: 0, max: 1e9 }));
    if (!e.totalT && !e.prodT && (toNum(d.prodT) as number) > (toNum(d.totalT) as number)) e.prodT = "Can't be more than the total factory output.";
    put("units", numErr(d.units, { label: "Number of products", int: true, min: 1, max: 1e9 }));
  }

  return e;
}
