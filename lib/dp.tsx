// Every number shown in the app is rounded to exactly 2 decimal places.
// Calculations always use the full-precision values the user entered; only the display is rounded.

const DP = 2;

export function fmt(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === "") return "";
  const n = typeof v === "number" ? v : Number(String(v).replace(/[\s,]/g, ""));
  if (!Number.isFinite(n)) return String(v);
  // Round half away from zero (avoids 1.005 → "1.00" float artefacts), and never show "-0.00".
  const r = Math.sign(n) * Math.round(Math.abs(n) * 10 ** DP + 1e-9) / 10 ** DP;
  return (r === 0 ? 0 : r).toLocaleString("en-GB", { minimumFractionDigits: DP, maximumFractionDigits: DP });
}

/** `f(value)` → value rounded to 2 decimals. The second argument is ignored (kept so existing calls compile). */
export function useDp() {
  const f = (v: string | number | null | undefined, _d?: number) => fmt(v);
  return { f };
}
