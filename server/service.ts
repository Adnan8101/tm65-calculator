import 'server-only';
import { db, getRef, searchCities } from './db';
import { calculate } from './engine';
import { validate } from './validate';
import { XlErr } from './excel';
import { view } from './view';
import fs from 'node:fs';
import path from 'node:path';

export function reference() {
  const ref = getRef();
  const opts: Record<string, string[]> = {};
  const rows = db.prepare('SELECT list_name,value FROM ui_options ORDER BY list_name,sort_order').all() as any[];
  for (const r of rows) (opts[r.list_name] ||= []).push(r.value);
  return {
    productTypes: ref.types.map((p) => p.name),
    slots: ref.slots.map((s) => ({ slot: s.slot, name: s.name, locked: !!s.locked })),
    extra: ref.ice.map((m) => m.name),
    refrigerants: ref.refs.map((r) => r.name),
    leaks: ref.leaks.map((l) => l.name),
    regions: ref.grid.filter((g) => g.kind === 'electricity').map((g) => g.name),
    fuels: ref.grid.filter((g) => g.kind === 'fuel').map((g) => g.name),
    units: opts.capacity_unit || [],
  };
}

export const cities = (q: string) => {
  const s = String(q || '').trim();
  return s.length < 2 ? [] : searchCities(s);
};

const readData = (name: string) => JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', name), 'utf8'));

export const example = () => readData('stulz.json');
export const blsData = () => readData('bls.json');

export type CalcOutcome = { results: unknown } | { errors: string[] };

export function run(inputs: unknown, mode: string = 'both'): CalcOutcome {
  if (!inputs || typeof inputs !== 'object') return { errors: ['inputs required'] };
  const errors = validate(inputs, mode);
  if (errors.length) return { errors: errors.map((e) => e.message) };
  try {
    return { results: view(calculate(inputs, { mode })) };
  } catch (e) {
    if (e instanceof XlErr) return { errors: ['The calculation could not be completed for these inputs.'] };
    console.error(e);
    return { errors: ['calculation failed'] };
  }
}
