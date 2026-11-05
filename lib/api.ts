import type { Draft, Level, Mat, Ref, Rep } from "./types";
import { toNum } from "./check";

export const TR = "TR Cooling";
export const TR_TO_KW = 3.517;
const KW_COOLING = "kW Cooling";

export const uid = () => Math.random().toString(36).slice(2, 10);

export const upsert = <T extends { id: string }>(list: T[], x: T) => (list.some((y) => y.id === x.id) ? list.map((y) => (y.id === x.id ? x : y)) : [...list, x]);

const text = ["type", "maker", "name", "email", "cap", "unit", "life", "weight", "ref", "charge", "leak", "city", "kwh", "region", "fuelKwh", "fuel", "totalT", "prodT"] as const;

export const blank = (): Draft => ({ ...(Object.fromEntries(text.map((k) => [k, ""])) as Record<(typeof text)[number], string>), mats: [], reps: [], hasRef: false, cityOk: false, units: "1" });

const num = (s: string) => {
  const n = toNum(s);
  return n === null || Number.isNaN(n) ? undefined : n;
};
const frac = (s: string) => (num(s) === undefined ? undefined : num(s)! / 100);
const isIce = (d: Draft, id: string) => Number(d.mats.find((m) => m.id === id)?.kind === "ice");

export function toInputs(d: Draft, ref: Ref, level: Level) {
  const materials: Record<string, unknown>[] = ref.slots.map((s) => ({ name: s.locked ? s.name : "Insert other material here" }));
  const free = ref.slots.filter((s) => !s.locked).map((s) => s.slot);
  const at = new Map<string, number>();
  for (const m of d.mats) {
    const slot = m.kind === "tm65" ? ref.slots.find((s) => s.locked && s.name === m.name)?.slot : free.shift();
    if (slot === undefined) continue;
    at.set(m.id, slot);
    materials[slot] = { name: m.name, percent: frac(m.pct), recycledPercent: frac(m.rec), originLat: m.lat ?? undefined, originLng: m.lng ?? undefined };
  }
  const reps = level === "basic" ? [...d.reps].sort((a, b) => isIce(d, b.mat) - isIce(d, a.mat)) : d.reps;
  const base = {
    productType: d.type,
    manufacturer: d.maker.trim(),
    productName: d.name.trim(),
    contactEmail: d.email.trim(),
    capacityValue: d.unit === TR && num(d.cap) != null ? Math.round(num(d.cap)! * TR_TO_KW * 100) / 100 : num(d.cap),
    capacityUnit: d.unit === TR ? KW_COOLING : d.unit,
    serviceLifeYears: num(d.life),
    productWeightKg: num(d.weight),
    materials,
    refrigerantType: d.hasRef ? d.ref : ref.refrigerants[0],
    refrigerantChargeKg: d.hasRef ? num(d.charge) : 0,
    leakageScenario: d.hasRef ? d.leak : ref.leaks[0],
    replacements: reps.map((r) => ({ componentSlot: at.get(r.mat), rate: frac(r.rate) })),
  };
  if (level === "basic") return base;
  return {
    ...base,
    factoryCity: d.city,
    electricityKwh: num(d.kwh),
    electricityRegion: d.region,
    gasKwh: num(d.fuelKwh) ?? 0,
    gasFuelType: d.fuel || undefined,
    totalTonnage: num(d.totalT),
    productTonnage: num(d.prodT),
    numProducts: num(d.units) ?? 1,
  };
}

const str = (v: unknown) => (v == null ? "" : String(v));
const pc = (v: unknown) => (v == null || v === "" ? "" : String(Number((Number(v) * 100).toPrecision(15))));

const sampleKeys: [keyof Draft, string][] = [
  ["type", "productType"],
  ["maker", "manufacturer"],
  ["name", "productName"],
  ["email", "contactEmail"],
  ["cap", "capacityValue"],
  ["unit", "capacityUnit"],
  ["life", "serviceLifeYears"],
  ["weight", "productWeightKg"],
  ["city", "factoryCity"],
  ["kwh", "electricityKwh"],
  ["region", "electricityRegion"],
  ["fuelKwh", "gasKwh"],
  ["fuel", "gasFuelType"],
  ["totalT", "totalTonnage"],
  ["prodT", "productTonnage"],
  ["units", "numProducts"],
];

export function fromSample(x: any, ref: Ref): Draft {
  const bySlot = new Map<number, string>();
  const mats: Mat[] = (x.materials || []).flatMap((m: any, i: number) => {
    if (!(Number(m?.percent) > 0)) return [];
    const s = ref.slots[i];
    const id = uid();
    bySlot.set(i, id);
    return [{ id, kind: s?.locked ? "tm65" : "ice", name: s?.locked ? s.name : str(m.name), pct: pc(m.percent), rec: pc(m.recycledPercent), origin: "", lat: m.originLat ?? null, lng: m.originLng ?? null }];
  });
  const d: Draft = { ...blank(), ...Object.fromEntries(sampleKeys.map(([k, s]) => [k, str(x[s])])), mats, cityOk: !!x.factoryCity };
  if (x.refrigerantType && x.refrigerantType !== ref.refrigerants[0]) Object.assign(d, { hasRef: true, ref: str(x.refrigerantType), charge: str(x.refrigerantChargeKg), leak: str(x.leakageScenario) });
  const reps: Rep[] = (x.replacements || []).flatMap((r: any) => {
    const mat = bySlot.get(Number(r?.componentSlot));
    return mat && Number(r?.rate) > 0 ? [{ id: uid(), mat, rate: pc(r.rate) }] : [];
  });
  return { ...d, reps, units: d.units || "1" };
}
