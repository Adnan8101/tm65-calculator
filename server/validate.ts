import { getRef, findCity } from './db';
import { key } from './excel';

const blank = (v: any) => v === undefined || v === null || v === '';
const isNum = (v: any) => typeof v === 'number' && Number.isFinite(v);

export type Problem = { field: string; message: string };

export function validate(inp: any, mode = 'both'): Problem[] {
  const ref = getRef();
  const out: Problem[] = [];
  const bad = (field: string, message: string) => out.push({ field, message });
  const obj = (v: any) => v !== null && typeof v === 'object' && !Array.isArray(v);

  // Server actions are public endpoints: reject malformed shapes before reading fields.
  if (!obj(inp)) return [{ field: 'inputs', message: 'inputs required' }];
  if (inp.materials != null && (!Array.isArray(inp.materials) || !inp.materials.every((m: any) => m == null || obj(m)))) return [{ field: 'materials', message: 'Enter the material breakdown.' }];
  if (inp.replacements != null && (!Array.isArray(inp.replacements) || !inp.replacements.every((r: any) => r == null || obj(r)))) return [{ field: 'replacements', message: 'Replaced parts are not valid.' }];
  inp = { ...inp, materials: (inp.materials || []).map((m: any) => m || {}), replacements: (inp.replacements || []).map((r: any) => r || {}) };

  // Upper limits mirror the client checks (lib/check.ts) and keep results finite.
  if (!ref.byType.has(key(inp.productType))) bad('productType', 'Select a type of product.');
  if (!isNum(inp.capacityValue) || inp.capacityValue < 0 || inp.capacityValue > 1e8) bad('capacityValue', 'Capacity must be a number of 0 or more.');
  if (blank(inp.capacityUnit)) bad('capacityUnit', 'Select the capacity unit.');
  if (!Number.isInteger(inp.serviceLifeYears) || inp.serviceLifeYears < 0 || inp.serviceLifeYears > 100) bad('serviceLifeYears', 'Service life must be a whole number of years, up to 100.');
  if (!isNum(inp.productWeightKg) || inp.productWeightKg <= 0 || inp.productWeightKg > 1e6) bad('productWeightKg', 'Product weight must be greater than 0 kg and at most 1,000,000 kg.');

  (inp.materials || []).forEach((m: any, i: number) => {
    const slot = ref.slots[i];
    if (!slot) return bad(`materials[${i}]`, 'Too many material rows.');
    const f = (n: string) => `materials[${i}].${n}`;
    if (!blank(m.percent) && (!isNum(m.percent) || m.percent < 0 || m.percent > 1)) bad(f('percent'), 'Share must be between 0% and 100%.');
    if (!blank(m.originLat) && (!isNum(m.originLat) || Math.abs(m.originLat) > 90)) bad(f('originLat'), 'Latitude must be between -90 and 90.');
    if (!blank(m.originLng) && (!isNum(m.originLng) || Math.abs(m.originLng) > 180)) bad(f('originLng'), 'Longitude must be between -180 and 180.');
    if (!blank(m.recycledPercent) && (!isNum(m.recycledPercent) || m.recycledPercent < 0 || m.recycledPercent > 1)) bad(f('recycledPercent'), 'Recycled content must be between 0% and 100%.');
    if (!slot.locked) {
      const empty = blank(m.name) || key(m.name) === 'insert other material here';
      if (!empty && !ref.byIce.has(key(m.name))) bad(f('name'), 'Choose a material from the ICE list.');
      if (empty && m.percent > 0) bad(f('name'), 'Select the material for this row.');
    }
  });
  const total = (inp.materials || []).reduce((s: number, m: any) => s + (isNum(m.percent) ? m.percent : 0), 0);
  if (total <= 0) bad('materials', 'Enter the material breakdown.');

  if (blank(inp.refrigerantType) || !ref.byRef.has(key(inp.refrigerantType))) bad('refrigerantType', 'Select a refrigerant, or "No refrigerant".');
  if (!blank(inp.refrigerantChargeKg) && (!isNum(inp.refrigerantChargeKg) || inp.refrigerantChargeKg < 0 || inp.refrigerantChargeKg > 1e5)) bad('refrigerantChargeKg', 'Refrigerant charge must be between 0 and 100,000 kg.');
  if (blank(inp.leakageScenario) || !ref.byLeak.has(key(inp.leakageScenario))) bad('leakageScenario', 'Select a leakage scenario.');

  (inp.replacements || []).forEach((r: any, i: number) => {
    if (blank(r.component) && blank(r.componentSlot)) return;
    if (!blank(r.rate) && (!isNum(r.rate) || r.rate < 0 || r.rate > 100)) bad(`replacements[${i}].rate`, 'Rate must be between 0% and 10,000%.');
  });

  if (mode !== 'basic') {
    if (!findCity(inp.factoryCity)) bad('factoryCity', 'Pick the factory city from the list.');
    if (!isNum(inp.electricityKwh) || inp.electricityKwh < 0 || inp.electricityKwh > 1e12) bad('electricityKwh', 'Enter annual electricity use in kWh.');
    const el = ref.byGrid.get(key(inp.electricityRegion));
    if (!el || el.kind !== 'electricity') bad('electricityRegion', 'Select the electricity region.');
    if (!blank(inp.gasKwh) && (!isNum(inp.gasKwh) || inp.gasKwh < 0 || inp.gasKwh > 1e12)) bad('gasKwh', 'Gas or fuel energy must be 0 or more.');
    if (!blank(inp.gasFuelType) && ref.byGrid.get(key(inp.gasFuelType))?.kind !== 'fuel') bad('gasFuelType', 'Select a valid fuel type.');
    if (inp.gasKwh > 0 && blank(inp.gasFuelType)) bad('gasFuelType', 'Select the fuel type.');
    if (!isNum(inp.totalTonnage) || inp.totalTonnage <= 0 || inp.totalTonnage > 1e9) bad('totalTonnage', 'Total tonnage must be greater than 0.');
    if (!isNum(inp.productTonnage) || inp.productTonnage <= 0 || inp.productTonnage > 1e9) bad('productTonnage', 'Product tonnage must be greater than 0.');
    if (!blank(inp.numProducts) && (!Number.isInteger(inp.numProducts) || inp.numProducts < 1)) bad('numProducts', 'Number of products must be a whole number of 1 or more.');
  }
  return out;
}
