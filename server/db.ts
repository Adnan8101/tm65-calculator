import 'server-only';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { key } from './excel';

const file = process.env.TM65_DB || path.join(process.cwd(), 'data', 'tm65.db');
// Read-only: the app never writes, and serverless filesystems (e.g. Vercel) are read-only.
export const db = new DatabaseSync(file, { readOnly: true });

// node:sqlite returns null-prototype rows; React can't serialize those to the client
// (server actions fail with an opaque digest error), so always copy into plain objects.
const plain = (r: any) => (r ? { ...r } : r);
const all = (sql: string): any[] => (db.prepare(sql).all() as any[]).map(plain);

const firstBy = (rows: any[], f: (r: any) => string) => {
  const m = new Map<string, any>();
  for (const r of rows) if (!m.has(key(f(r)))) m.set(key(f(r)), r);
  return m;
};

function load() {
  const types = all('SELECT * FROM product_types ORDER BY source_row');
  const tm65 = all('SELECT * FROM tm65_materials ORDER BY source_row');
  const ice = all('SELECT * FROM ice_materials ORDER BY source_row');
  const grid = all('SELECT * FROM grid_factors ORDER BY source_row');
  const refs = all('SELECT * FROM refrigerants ORDER BY source_row');
  const leaks = all('SELECT * FROM refrigerant_leakage ORDER BY source_row');
  const transport = all('SELECT * FROM transport_factors ORDER BY source_row');
  const slots = all('SELECT * FROM input_material_slots ORDER BY slot');
  const k: Record<string, number> = Object.fromEntries(all('SELECT key,value FROM calc_constants').map((r) => [r.key, r.value]));
  return {
    types,
    tm65,
    ice,
    grid,
    refs,
    leaks,
    transport,
    slots,
    k,
    byType: firstBy(types, (r) => r.name),
    byIce: firstBy(ice, (r) => r.name),
    byGrid: firstBy(grid, (r) => r.name),
    byRef: firstBy(refs, (r) => r.name),
    byLeak: firstBy(leaks, (r) => r.name),
    iceKeys: ice.map((r) => r.source_name as string),
    mode: (m: string) => transport.find((t) => t.mode === m && t.kgco2e_per_tonne_km != null),
  };
}

let memo: ReturnType<typeof load> | null = null;
export const getRef = () => (memo ||= load());

export function findCity(label: any): any {
  const sql = 'SELECT * FROM cities WHERE label = ? COLLATE NOCASE ORDER BY source_row LIMIT 1';
  return plain(db.prepare(sql).get(String(label ?? '').trim())) || null;
}

export function searchCities(q: string, limit = 30): any[] {
  const clean = q.replace(/[%_]/g, '');
  const like = `%${clean}%`;
  const prefix = `${clean}%`;
  const sql =
    'SELECT label, lat, lng FROM cities WHERE is_primary=1 AND (label LIKE ? OR city_ascii LIKE ?) ' +
    'ORDER BY (city_ascii LIKE ? OR city LIKE ?) DESC, population DESC LIMIT ?';
  return (db.prepare(sql).all(like, like, prefix, prefix, limit) as any[]).map((r) => ({ label: String(r.label), lat: Number(r.lat), lng: Number(r.lng) }));
}
