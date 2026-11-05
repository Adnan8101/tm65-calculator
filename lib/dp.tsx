"use client";
import { createContext, useContext, useEffect, useState } from "react";

const KEY = "tm65.round";

type S = { on: boolean; dp: number };

const Ctx = createContext<{ s: S; set: (s: S) => void }>({ s: { on: false, dp: 2 }, set: () => {} });

export function DpProvider({ children }: { children: React.ReactNode }) {
  const [s, put] = useState<S>({ on: false, dp: 2 });

  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) || "null");
      if (v && typeof v.on === "boolean" && Number.isInteger(v.dp) && v.dp >= 0 && v.dp <= 6) put(v);
    } catch {}
  }, []);

  const set = (n: S) => {
    put(n);
    try {
      localStorage.setItem(KEY, JSON.stringify(n));
    } catch {}
  };

  return <Ctx.Provider value={{ s, set }}>{children}</Ctx.Provider>;
}

export function useDp() {
  const { s } = useContext(Ctx);
  const f = (v: string | number | null | undefined, d?: number) => {
    if (v === null || v === undefined || v === "") return "";
    const n = typeof v === "number" ? v : Number(String(v).replace(/[\s,]/g, ""));
    if (!Number.isFinite(n)) return String(v);
    const k = d ?? (s.on ? s.dp : null);
    if (k === null) return n.toLocaleString("en-GB", { maximumFractionDigits: 10 });
    if (n !== 0 && Math.abs(n) < 10 ** -k / 2) return `<${(10 ** -k).toFixed(k)}`;
    return n.toLocaleString("en-GB", { minimumFractionDigits: k, maximumFractionDigits: k });
  };
  return { f };
}

export function Rounding() {
  const { s, set } = useContext(Ctx);
  const [text, setText] = useState(String(s.dp));
  useEffect(() => setText(String(s.dp)), [s.dp]);

  const type = (t: string) => {
    setText(t);
    if (/^[0-6]$/.test(t)) set({ ...s, dp: Number(t) });
  };

  return (
    <div className="flex min-h-8 items-center justify-between gap-3">
      <button type="button" role="switch" aria-checked={s.on} onClick={() => set({ ...s, on: !s.on })} className="flex items-center gap-2.5 text-[13px] text-ink-2 transition-colors hover:text-ink">
        <span className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${s.on ? "bg-accent" : "bg-line-strong"}`}>
          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${s.on ? "left-[18px]" : "left-0.5"}`} />
        </span>
        Round values
      </button>
      {s.on && (
        <label className="fade flex items-center gap-2 text-[13px] text-muted">
          <input
            aria-label="Decimal places"
            inputMode="numeric"
            maxLength={1}
            value={text}
            onChange={(e) => type(e.target.value.replace(/\D/g, ""))}
            onBlur={() => setText(String(s.dp))}
            className={`h-8 w-10 rounded-lg border bg-surface text-center font-mono text-sm tabular-nums text-ink focus:outline-none focus:ring-4 ${/^[0-6]$/.test(text) ? "border-line-strong focus:border-accent focus:ring-accent/15" : "border-danger focus:ring-danger/15"}`}
          />
          dp
        </label>
      )}
    </div>
  );
}
