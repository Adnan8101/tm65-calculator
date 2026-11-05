export class XlErr extends Error {
  code: string;
  constructor(code: string, msg?: string) {
    super(msg || code);
    this.code = code;
  }
}

export const na = (msg?: string) => new XlErr('#N/A', msg);

export const canon = (s: any): string =>
  s == null ? '' : String(s).replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

export const key = (s: any): string => canon(s).toLowerCase();

const coll = new Intl.Collator('en', { sensitivity: 'base' });
const strip = (s: string) => s.replace(/[-'’]/g, '');
const cmp = (a: string, b: string) => coll.compare(strip(a), strip(b));

export function approx(keys: string[], target: string): number {
  let lo = 0;
  let hi = keys.length - 1;
  let hit = -1;
  const t = String(target);
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (cmp(keys[mid], t) <= 0) {
      hit = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  if (hit < 0) throw na('no match');
  return hit;
}

export function hav(lat1: number, lng1: number, lat2: number, lng2: number, r: number): number {
  const d = Math.PI / 180;
  const s = Math.sin((lat1 * d - lat2 * d) / 2) ** 2;
  const a = s + Math.cos(lat2 * d) * Math.cos(lat1 * d) * Math.sin((lng1 * d - lng2 * d) / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function sum(vals: any[]): number {
  let t = 0;
  for (const v of vals) {
    if (v == null) continue;
    if (v instanceof XlErr) throw v;
    t += v;
  }
  return t;
}
