import { XlErr, na, canon, key, approx, hav, sum } from './excel';
import { getRef, findCity } from './db';

const BLANKNAME = 'insert other material here';
const STEEL = 'steel (general or galvanised)';

const blank = (v: any) => v === undefined || v === null || v === '';
const num = (v: any): number | null => (blank(v) ? null : Number(v));

type G = { value: any; error?: string; message?: string };

function guard(fn: () => any): G {
  try {
    return { value: fn() };
  } catch (e) {
    if (e instanceof XlErr) return { value: null, error: e.code, message: e.message };
    throw e;
  }
}

function safe(fn: () => any): any {
  try {
    return fn();
  } catch (e) {
    if (e instanceof XlErr) return { error: e.code, message: e.message };
    throw e;
  }
}

export function calculate(inp: any, opts: { mode?: string } = {}): any {
  const ref = getRef();
  const k = ref.k;
  const ntm = ref.slots.filter((s) => s.locked).length;
  const w = Number(inp.productWeightKg);

  const type = ref.byType.get(key(inp.productType));
  if (!type) throw na(`Unknown product type "${inp.productType}"`);
  const rounds = type.rounds_of_manufacture;
  const scale = rounds === 1 ? k.scale_up_rounds_1 : rounds === 2 ? k.scale_up_rounds_2 : k.scale_up_rounds_other;
  const road = ref.mode('Road').kgco2e_per_tonne_km;
  const sea = ref.mode('Sea').kgco2e_per_tonne_km;

  const mats: any[] = Array.from({ length: 34 }, (_, i) => inp.materials?.[i] || {});
  const total = mats.reduce((s, m) => s + (num(m.percent) ?? 0), 0);
  const short = total < k.material_threshold_min;

  const tmByRaw = new Map<string, any>(ref.tm65.map((r) => [String(r.source_name).toLowerCase(), r]));

  const rows = mats.map((m, i) => {
    const name = i < ntm ? ref.slots[i].name : key(m.name) === BLANKNAME ? '' : canon(m.name);
    let share = num(m.percent);
    if (key(name) === STEEL) {
      const own = share ?? 0;
      share = total > 1 || total < 0.95 ? own : 1 - total + own;
    }
    const raw = i < ntm ? tmRaw(name) : name === '' ? '' : ref.byIce.get(key(name))?.source_name ?? name;
    const row: any = { slot: i, name, raw, share, recycled: num(m.recycledPercent), lat: num(m.originLat), lng: num(m.originLng) };
    if (i < ntm) {
      row.source = 'TM65 Table 2.1';
      row.embodied = share == null ? null : share * w * tmCoef(raw);
    } else {
      row.source = 'ICE database';
      const g = guard(() => (share == null ? null : share * w * iceCoef(name)));
      row.embodied = g.error ? null : g.value;
    }
    return row;
  });

  function tmRaw(name: string): string {
    const hit = ref.tm65.find((r) => key(r.name) === key(name));
    return hit ? hit.source_name : name;
  }

  function iceCoef(name: string): number {
    if (name === '') throw na('blank material');
    const hit = ref.byIce.get(key(name));
    if (k.ice_lookup_mode_excel_approx) {
      const i = approx(ref.iceKeys, hit ? hit.source_name : name);
      return ref.ice[i].ec_per_kg;
    }
    if (!hit) throw na(`ICE material "${name}" not found`);
    return hit.ec_per_kg;
  }

  function tmCoef(raw: string): number {
    const hit = tmByRaw.get(String(raw).toLowerCase());
    if (!hit) throw na(`${raw} not in TM65 table`);
    return hit.coefficient_kgco2e_per_kg;
  }

  function shareOf(raw: string): number {
    const hit = rows.find((x) => x.raw.toLowerCase() === String(raw).toLowerCase());
    if (!hit) throw na(`${raw} not in material list`);
    return hit.share ?? 0;
  }

  const a1 = sum(rows.map((r) => r.embodied));

  const reps = Array.from({ length: 5 }, (_, i) => {
    const r = inp.replacements?.[i] || {};
    let raw = '';
    if (!blank(r.componentSlot) && rows[r.componentSlot]) raw = rows[r.componentSlot].raw || 'Insert other material here';
    else if (!blank(r.component)) {
      const lc = String(r.component).toLowerCase();
      const hit = rows.find((x) => x.raw.toLowerCase() === lc) || rows.find((x) => key(x.name) === key(r.component));
      raw = hit ? hit.raw : String(r.component);
    }
    const name = raw === '' ? '' : canon(raw);
    return { name, raw, rate: name === '' ? null : num(r.rate) ?? 0 } as any;
  });
  const anyRep = reps.some((r) => r.name !== '');

  const life = Number(inp.serviceLifeYears);
  const charge = num(inp.refrigerantChargeKg) ?? 0;
  const refName = canon(inp.refrigerantType);
  const fridge = guard(() => {
    if (refName === '') return { b1: 0, c1: 0, gwp: null, total: 0 };
    const gr = ref.byRef.get(key(refName));
    const lk = ref.byLeak.get(key(inp.leakageScenario));
    if (!gr || !lk) throw na('refrigerant or leakage scenario not found');
    const b1 = charge * lk.annual_leak_rate * gr.gwp100 * life;
    const c1 = charge * (1 - lk.eol_recovery_rate) * gr.gwp100;
    return { b1, c1, gwp: gr.gwp100, total: c1 + b1 };
  });
  const lk = ref.byLeak.get(key(inp.leakageScenario));

  const common = {
    productType: type.name,
    capacity: `${inp.capacityValue ?? ''} ${inp.capacityUnit ?? ''}`,
    productWeightKg: w,
    materialSharePct: total,
    serviceLifeYears: life,
    refrigerant: { name: refName },
    refrigerantChargeKg: charge,
  };

  const out: any = { common };
  const mode = opts.mode;
  if (mode !== 'mid') out.basic = safe(basic);
  if (mode !== 'basic') out.mid = safe(mid);
  return out;

  function basic() {
    const rr = reps.map((r, i) =>
      guard(() => {
        if (r.name === '') return null;
        const viaTm = () => r.rate * w * tmCoef(r.raw) * shareOf(r.raw);
        if (i > 0) return viaTm();
        try {
          return viaTm();
        } catch (e) {
          if (!(e instanceof XlErr)) throw e;
          return r.rate * w * iceCoef(r.raw) * shareOf(r.raw);
        }
      }),
    );
    const cells = rr.map((g) => (g.error ? new XlErr(g.error, g.message) : g.value));
    const sg = guard(() => sum(cells));
    if (sg.error && !short) throw new XlErr(sg.error, sg.message);
    const sr = sg.error ? 0 : sg.value;
    const a1r = anyRep && sr !== 0 ? sr : a1 * k.default_replacement_fraction;
    const scaled = (a1 + a1r) * (scale * k.buffer_factor);
    if (fridge.error) throw new XlErr(fridge.error, fridge.message);
    const f = fridge.value;
    const tot = scaled + f.total;
    const gate = (v: number) => (short ? null : v);
    const f2 = scale * k.buffer_factor;
    return {
      materials: rows.map((r) => ({ name: r.name, share: r.share, embodied: r.embodied })),
      replacements: reps.map((r) => ({ name: r.name })),
      report: {
        A1: gate(a1),
        A1Replaced: gate(a1r),
        totalExRefrigerant: gate(scaled),
        refrigerantLeakage: f.total,
        total: gate(tot),
      },
      chart: short
        ? null
        : [
            { label: 'A1 Materials', value: a1 * f2 },
            { label: 'A1 for Repair', value: a1r * f2 },
            { label: 'B1 + C1 Refrigerant', value: f.total },
          ],
    };
  }

  function mid() {
    const city = findCity(inp.factoryCity);
    if (!city) throw na(`Factory location "${inp.factoryCity}" not found`);
    const el = ref.byGrid.get(key(inp.electricityRegion));
    if (!el || el.kind !== 'electricity') throw na('Electricity region required');
    const kwe = num(inp.electricityKwh) ?? 0;
    const kwg = num(inp.gasKwh) ?? 0;
    let gf = 0;
    if (!blank(inp.gasFuelType)) {
      const g = ref.byGrid.get(key(inp.gasFuelType));
      if (!g || g.kind !== 'fuel') throw na('Fuel type not found');
      gf = g.kgco2e_per_kwh;
    } else if (kwg > 0) throw na('Fuel type required when gas/fuel energy is entered');
    const tt = num(inp.totalTonnage);
    const pt = num(inp.productTonnage);
    const np = num(inp.numProducts) ?? 1;
    if (!(pt! > 0) || !(tt! > 0)) throw new XlErr('#DIV/0!', 'Tonnage inputs must be > 0');
    const ratio = pt! / tt!;
    const t = w / 1000;
    const energy = (((kwe * el.kgco2e_per_kwh + kwg * gf) * rounds) / (pt! / t)) * ratio;
    const toSite = t * (el.distance_to_site_road_km * road + el.distance_to_site_sea_km * sea);

    const mrows = rows.map((r) => ({
      name: r.name,
      share: r.share,
      embodied: r.embodied,
      linearDistanceKm: r.share == null ? null : hav(city.lat, city.lng, r.lat ?? 0, r.lng ?? 0, k.earth_radius_km),
    }));

    const a2 = t * type.travel_distance_factory_km * road;
    const a3 = energy;
    const a4 = toSite;
    const c2 = t * k.waste_transport_km * road;
    const c3 = a3 / rounds;
    const c4 = w * type.landfill_fraction * k.landfill_ef_kgco2e_per_kg;
    const c24 = c2 + c3 + c4;
    if (fridge.error) throw new XlErr(fridge.error, fridge.message);
    const f = fridge.value;

    const rr = reps.map((r, i) =>
      guard(() => {
        if (r.name === '') return null;
        const p = shareOf(r.raw);
        let e: number;
        try {
          e = r.rate * w * tmCoef(r.raw) * p;
        } catch (x) {
          if (!(x instanceof XlErr)) throw x;
          e = r.rate * w * iceCoef(r.raw) * p;
        }
        const ra = r.rate;
        const x2 = t * p * ra * (i === 0 ? type.travel_distance_factory_km : 1) * road;
        const x3 = (((kwe * el.kgco2e_per_kwh + kwg * gf) * rounds) / (pt! / t)) * ratio * p * ra;
        const x4 = toSite * p * ra;
        const y2 = t * 100 * road * p * ra;
        const y3 = (a3 / rounds) * p * ra;
        const y4 = w * type.landfill_fraction * k.landfill_ef_kgco2e_per_kg * p * ra;
        return { E: e, A2: x2, A3: x3, A4: x4, C2: y2, C3: y3, C4: y4, L: x2 + x3 + x4 + y2 + y3 + y4 };
      }),
    );
    const cell = (i: number, f2: string) => (rr[i].error ? new XlErr(rr[i].error!, rr[i].message) : rr[i].value ? rr[i].value[f2] : null);
    const sg = guard(() => ({ se: sum(reps.map((_, i) => cell(i, 'E'))), sl: sum(reps.map((_, i) => cell(i, 'L'))) }));
    if (sg.error && !short) throw new XlErr(sg.error, sg.message);
    const se = sg.error ? 0 : sg.value.se;
    const sl = sg.error ? 0 : sg.value.sl;
    const df = k.default_replacement_fraction;
    const a1r = anyRep ? (se !== 0 ? se + sl : a1 * df) : (a1 + a2 + a3 + a4) * df;
    const b3 = sl === 0 ? a1r + c24 * df : sl + se;

    const noBuf = a1 + a2 + a3 + a4 + b3 + c2 + c3 + c4;
    const withBuf = noBuf * k.mid_level_total_factor;
    const tot = withBuf + f.total;
    const gate = (v: number) => (short ? null : v);
    const buf = k.mid_level_total_factor;
    const tag = `TM65 leakage ${lk?.type_code ?? ''}`;
    const lines = [
      { code: 'A1', label: 'A1: Material extraction', value: gate(a1), note: 'TM65 assumption' },
      { code: 'A2', label: 'A2: Transport', value: gate(a2), note: 'TM65 assumption' },
      { code: 'A3', label: 'A3: Manufacturing', value: gate(a3) },
      { code: 'A4', label: 'A4: Transport to site', value: gate(a4), note: 'TM65 assumption' },
      { code: 'A5', label: 'A5: Construction', value: 'n/a' },
      { code: 'B1', label: 'B1: Refrigerant leakage during use', value: f.b1, note: tag },
      { code: 'B2', label: 'B2: Maintenance (if information given by manufacturer)', value: 'n/a' },
      { code: 'B3', label: 'B3: Repair', value: gate(b3), note: 'TM65 assumption' },
      { code: 'B4', label: 'B4: Replacement', value: 'n/a' },
      { code: 'B5', label: 'B5: Refurbishment', value: 'n/a' },
      { code: 'B6', label: 'B6: Operational energy', value: 'n/a' },
      { code: 'B7', label: 'B7: Operational water', value: 'n/a' },
      { code: 'C1', label: 'C1: Refrigerant leakage when decommissioning', value: f.c1, note: tag },
      { code: 'C2', label: 'C2: Transport', value: c2 },
      { code: 'C3', label: 'C3: Waste processing', value: c3 },
      { code: 'C4', label: 'C4: Disposal', value: c4, note: 'TM65 assumption' },
    ];

    const rawShare = (raw: string) => {
      const i = rows.findIndex((x) => x.raw.toLowerCase() === String(raw).toLowerCase());
      if (i < 0) throw na(`${raw} not in material list`);
      return num(mats[i].percent) ?? 0;
    };
    const rg = guard(() => (anyRep ? sum(reps.map((r) => (r.name !== '' ? rawShare(r.raw) : 0))) : df));
    if (rg.error && !short) throw new XlErr(rg.error, rg.message);

    return {
      materials: mrows,
      energyPerUnit: ((kwe + kwg) * ratio) / np,
      factory: { label: city.label },
      report: {
        lines,
        totalNoBuffer: gate(noBuf),
        totalWithBuffer: gate(withBuf),
        refrigerantLeakage: f.total,
        total: gate(tot),
      },
      chart: short
        ? null
        : [
            { label: lines[0].label, value: a1 * buf },
            { label: lines[1].label, value: a2 * buf },
            { label: lines[2].label, value: a3 * buf },
            { label: lines[3].label, value: a4 * buf },
            { label: lines[5].label, value: f.b1 },
            { label: lines[7].label, value: b3 * buf },
            { label: lines[12].label, value: f.c1 },
            { label: lines[13].label, value: c2 * buf },
            { label: lines[14].label, value: c3 * buf },
            { label: lines[15].label, value: c4 * buf },
          ],
    };
  }
}
