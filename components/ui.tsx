"use client";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type { City } from "@/lib/types";
import { searchCities } from "@/app/actions";
import { Alert, Check, Close, Down, Info, Pencil, Pin, Plus, Search, Trash } from "./icons";

type Kind = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const kinds: Record<Kind, string> = {
  primary: "bg-accent text-on-accent shadow-soft hover:bg-accent-hover disabled:opacity-50",
  secondary: "border border-line-strong bg-surface text-ink hover:bg-sunken disabled:opacity-50",
  ghost: "text-ink-2 hover:bg-sunken hover:text-ink disabled:opacity-40",
  danger: "bg-danger text-white hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "h-8 gap-1.5 rounded-lg px-3 text-[13px]",
  md: "h-10 gap-2 rounded-xl px-4 text-sm",
  lg: "h-12 gap-2.5 rounded-xl px-6 text-[15px]",
};

const btn = "inline-flex shrink-0 select-none items-center justify-center font-medium transition-[background-color,color,opacity,transform] active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none";

export function Button({ kind = "primary", size = "md", className = "", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { kind?: Kind; size?: Size }) {
  return <button type="button" className={`${btn} ${sizes[size]} ${kinds[kind]} ${className}`} {...p} />;
}

export function LinkButton({ href, kind = "primary", size = "md", className = "", children }: { href: string; kind?: Kind; size?: Size; className?: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={`${btn} ${sizes[size]} ${kinds[kind]} ${className}`}>
      {children}
    </Link>
  );
}

type Tone = "neutral" | "accent" | "ok" | "warn" | "danger";

const tones: Record<Tone, string> = {
  neutral: "bg-sunken text-ink-2",
  accent: "bg-accent-soft text-accent-text",
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
};

export const Badge = ({ tone = "neutral", className = "", children }: { tone?: Tone; className?: string; children: React.ReactNode }) => <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}>{children}</span>;

export function Callout({ tone = "neutral", title, children, className = "" }: { tone?: Tone; title?: string; children: React.ReactNode; className?: string }) {
  const Icon = tone === "danger" || tone === "warn" ? Alert : Info;
  return (
    <div className={`flex gap-3 rounded-xl px-4 py-3 text-sm ${tones[tone]} ${className}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0 leading-relaxed">
        {title && <p className="font-medium">{title}</p>}
        <div className={title ? "mt-0.5 opacity-90" : ""}>{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, hint, error, optional, id, children, className = "" }: { label: string; hint?: React.ReactNode; error?: string; optional?: boolean; id?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between gap-2 text-[13px] font-medium text-ink">
        {label}
        {optional && <span className="text-xs font-normal text-muted">Optional</span>}
      </label>
      {children}
      {error ? (
        <p className="fade mt-1.5 flex items-start gap-1.5 text-xs text-danger">
          <Alert className="mt-px h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs leading-relaxed text-muted">{hint}</p>
      )}
    </div>
  );
}

export const Err = ({ msg, small }: { msg?: string; small?: boolean }) =>
  msg ? (
    small ? (
      <p data-err className="fade mt-2 flex items-start gap-1.5 text-xs text-danger">
        <Alert className="mt-px h-3.5 w-3.5 shrink-0" />
        {msg}
      </p>
    ) : (
      <div data-err className="fade mt-4">
        <Callout tone="danger">{msg}</Callout>
      </div>
    )
  ) : null;

export const Card = ({ className = "", children }: { className?: string; children: React.ReactNode }) => <div className={`rounded-2xl border border-line bg-surface shadow-soft ${className}`}>{children}</div>;

export function Section({ title, text, icon, aside, children }: { title: string; text?: string; icon?: React.ReactNode; aside?: React.ReactNode; top?: boolean; children: React.ReactNode }) {
  return (
    <Card>
      <header className="flex items-start gap-3 border-b border-line px-5 py-4 sm:px-6">
        {icon && <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent-text">{icon}</span>}
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
          {text && <p className="mt-0.5 text-[13px] leading-relaxed text-ink-2">{text}</p>}
        </div>
        {aside}
      </header>
      <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
    </Card>
  );
}

const box = "h-11 w-full rounded-xl border bg-surface px-3.5 text-base text-ink placeholder:text-muted/80 transition-[border-color,box-shadow] focus:outline-none focus:ring-4 sm:h-10 sm:text-sm";
const ok = "border-line-strong hover:border-muted/60 focus:border-accent focus:ring-accent/15";
const bad = "border-danger/70 focus:border-danger focus:ring-danger/15";

export function Input({ invalid, unit, className = "", ...p }: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean; unit?: string }) {
  return (
    <div className="relative">
      <input aria-invalid={invalid || undefined} className={`${box} ${invalid ? bad : ok} ${unit ? "pr-20" : ""} ${className}`} {...p} />
      {unit && <span className="pointer-events-none absolute inset-y-1.5 right-1.5 flex items-center rounded-lg bg-sunken px-2.5 font-mono text-xs text-ink-2">{unit}</span>}
    </div>
  );
}

export function Select({ invalid, placeholder, list, show = (x) => x, children, ...p }: React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean; placeholder?: string; list?: string[]; show?: (x: string) => string }) {
  return (
    <div className="relative">
      <select aria-invalid={invalid || undefined} className={`${box} ${invalid ? bad : ok} cursor-pointer appearance-none pr-10 ${p.value === "" ? "text-muted" : ""}`} {...p}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {list?.map((x) => (
          <option key={x} value={x}>
            {show(x)}
          </option>
        ))}
        {children}
      </select>
      <Down className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
    </div>
  );
}

export type Opt = { value: string; label: string; group?: string; disabled?: boolean; note?: string };

export function Combo({ id, value, onChange, options, placeholder = "Select…", invalid }: { id?: string; value: string; onChange: (v: string) => void; options: Opt[]; placeholder?: string; invalid?: boolean }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hi, setHi] = useState(-1);
  const list = useRef<HTMLUListElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const lid = useId();
  const sel = options.find((o) => o.value === value);
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const shown = options.filter((o) => words.every((w) => `${o.label} ${o.group ?? ""}`.toLowerCase().includes(w)));
  const step = (from: number, dir: 1 | -1) => {
    for (let i = from + dir; i >= 0 && i < shown.length; i += dir) if (!shown[i].disabled) return i;
    return from;
  };

  useEffect(() => {
    if (open) list.current?.querySelector(`[data-i="${hi}"]`)?.scrollIntoView({ block: "nearest" });
  }, [hi, open]);

  const show = () => {
    setOpen(true);
    setQ("");
    const at = options.findIndex((o) => o.value === value);
    setHi(at >= 0 ? at : step(-1, 1));
  };

  const pick = (o: Opt) => {
    if (o.disabled) return;
    onChange(o.value);
    setOpen(false);
    setQ("");
  };

  const key = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") (e.preventDefault(), show());
      return;
    }
    const moves: Record<string, () => void> = {
      ArrowDown: () => setHi((h) => step(h, 1)),
      ArrowUp: () => setHi((h) => step(h, -1)),
      Enter: () => shown[hi] && pick(shown[hi]),
      Escape: () => setOpen(false),
    };
    if (moves[e.key]) {
      e.preventDefault();
      moves[e.key]();
    }
  };

  let group: string | undefined;
  return (
    <div className="relative">
      {open && <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />}
      <input
        ref={input}
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={lid}
        aria-autocomplete="list"
        aria-invalid={invalid || undefined}
        autoComplete="off"
        className={`${box} ${invalid ? bad : ok} cursor-pointer pr-10 ${open ? "pl-10" : ""} ${!open && !sel ? "placeholder:text-muted" : ""}`}
        value={open ? q : (sel?.label ?? "")}
        placeholder={open ? (sel?.label ?? "Type to search") : placeholder}
        onChange={(e) => {
          setQ(e.target.value);
          setHi(0);
          if (!open) setOpen(true);
        }}
        onClick={() => !open && show()}
        onKeyDown={key}
        onBlur={() => setOpen(false)}
      />
      <Down className={`pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      {open && (
        <ul ref={list} id={lid} role="listbox" className="pop absolute z-40 mt-1.5 max-h-72 w-full overflow-auto rounded-xl border border-line bg-surface p-1 shadow-lift">
          {shown.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">No matches for “{q}”</li>}
          {shown.map((o, i) => {
            const head = o.group && o.group !== group ? o.group : null;
            group = o.group;
            return (
              <li key={o.value} role="presentation">
                {head && <p className="px-3 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted">{head}</p>}
                <div
                  role="option"
                  data-i={i}
                  aria-selected={o.value === value}
                  aria-disabled={o.disabled || undefined}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(o)}
                  onMouseMove={() => !o.disabled && setHi(i)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm sm:py-2 ${o.disabled ? "cursor-not-allowed text-muted/70" : "cursor-pointer text-ink"} ${i === hi ? "bg-sunken" : ""}`}
                >
                  <span className="min-w-0 flex-1">{o.label}</span>
                  {o.note && <span className="shrink-0 text-xs text-muted">{o.note}</span>}
                  {o.value === value && <Check className="h-4 w-4 shrink-0 text-accent-text" />}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export const opts = (list: string[], show: (x: string) => string = (x) => x): Opt[] => list.map((x) => ({ value: x, label: show(x) }));

export function Toggle({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: [string, string][]; label?: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-xl bg-sunken p-1">
      {options.map(([v, text]) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)} className={`h-8 min-w-16 rounded-lg px-4 text-sm transition-all ${value === v ? "bg-surface font-medium text-ink shadow-soft" : "text-ink-2 hover:text-ink"}`}>
          {text}
        </button>
      ))}
    </div>
  );
}

export function Choice({ value, onChange, options, invalid, id }: { value: string; onChange: (v: string) => void; options: { value: string; label: string; text?: string }[]; invalid?: boolean; id?: string }) {
  return (
    <div id={id} role="radiogroup" aria-invalid={invalid || undefined} className="grid gap-2" tabIndex={-1}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`group flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/15 ${on ? "border-accent bg-accent-soft" : invalid ? "border-danger/60 hover:bg-sunken" : "border-line-strong hover:border-muted/60 hover:bg-sunken/60"}`}
          >
            <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border-[1.5px] transition-colors ${on ? "border-accent bg-accent" : "border-line-strong group-hover:border-muted"}`}>{on && <span className="h-1.5 w-1.5 rounded-full bg-on-accent" />}</span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-ink">{o.label}</span>
              {o.text && <span className="mt-0.5 block text-[13px] leading-relaxed text-ink-2">{o.text}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function Items({ add, onAdd, disabled, empty, children }: { add: string; onAdd: () => void; disabled?: boolean; empty?: React.ReactNode; children: React.ReactNode }) {
  const has = Array.isArray(children) ? children.length > 0 : !!children;
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-line">
      {has ? <ul className="divide-y divide-line">{children}</ul> : empty && <div className="px-6 py-10 text-center">{empty}</div>}
      <button type="button" disabled={disabled} onClick={onAdd} className={`flex w-full items-center justify-center gap-2 bg-sunken/50 px-4 py-3 text-sm font-medium text-accent-text transition-colors hover:bg-sunken disabled:cursor-not-allowed disabled:text-muted disabled:hover:bg-sunken/50 ${has || empty ? "border-t border-line" : ""}`}>
        <Plus /> {add}
      </button>
    </div>
  );
}

export function Item({ title, meta, value, bar, error, onEdit, onDrop }: { title: string; meta?: React.ReactNode; value: string; bar?: number; error?: string; onEdit: () => void; onDrop: () => void }) {
  const icon = "rounded-lg p-2 text-muted transition-colors";
  return (
    <li className={`group px-4 py-3 transition-colors hover:bg-sunken/40 ${error ? "bg-danger-soft/40" : ""}`}>
      <div className="flex items-center gap-3 sm:gap-4">
        <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-medium text-ink">{title}</p>
          {meta && <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted">{meta}</p>}
        </button>
        {bar !== undefined && (
          <div className="hidden h-1.5 w-28 overflow-hidden rounded-full bg-sunken sm:block">
            <div className="grow h-full rounded-full bg-accent" style={{ width: `${Math.min(Math.max(bar, 0), 100)}%` }} />
          </div>
        )}
        <p className="w-16 text-right font-mono text-sm tabular-nums text-ink">{value}</p>
        <div className="flex shrink-0 sm:opacity-60 sm:transition-opacity sm:group-hover:opacity-100">
          <button type="button" aria-label={`Edit ${title}`} onClick={onEdit} className={`${icon} hover:bg-sunken hover:text-ink`}>
            <Pencil />
          </button>
          <button type="button" aria-label={`Remove ${title}`} onClick={onDrop} className={`${icon} hover:bg-danger-soft hover:text-danger`}>
            <Trash />
          </button>
        </div>
      </div>
      <Err msg={error} small />
    </li>
  );
}

export function Modal({ open, onClose, title, sub, wide, onSubmit, children, foot }: { open: boolean; onClose: () => void; title: React.ReactNode; sub?: React.ReactNode; wide?: boolean; onSubmit?: () => void; children: React.ReactNode; foot?: React.ReactNode }) {
  const shut = useRef(onClose);
  const panel = useRef<HTMLDivElement>(null);
  const hid = useId();
  shut.current = onClose;
  useEffect(() => {
    if (!open) return;
    const back = document.activeElement as HTMLElement | null;
    const key = (e: KeyboardEvent) => e.key === "Escape" && shut.current();
    document.addEventListener("keydown", key);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Focus the first field for mouse/keyboard users; skip on touch so the keyboard doesn't pop up uninvited.
    const fine = window.matchMedia?.("(pointer: fine)").matches;
    const t = setTimeout(() => {
      const first = panel.current?.querySelector<HTMLElement>("input:not([disabled]), select, button[role=radio]");
      if (fine && first && !panel.current?.contains(document.activeElement)) first.focus();
    }, 40);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", key);
      document.body.style.overflow = prev;
      back?.focus?.();
    };
  }, [open]);
  if (!open || typeof document === "undefined") return null;
  const body = (
    <>
      <div className="flex items-start justify-between gap-4 px-5 pb-2 pt-5 sm:px-6 sm:pt-6">
        <div className="min-w-0">
          <h2 id={hid} className="text-lg font-semibold tracking-tight text-ink">
            {title}
          </h2>
          {sub && <p className="mt-1 text-sm text-ink-2">{sub}</p>}
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="-mr-2 -mt-1 rounded-lg p-2 text-muted transition-colors hover:bg-sunken hover:text-ink">
          <Close className="h-5 w-5" />
        </button>
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
      {foot && <div className="flex flex-wrap items-center justify-end gap-2 rounded-b-2xl border-t border-line bg-sunken/50 px-5 py-4 sm:px-6">{foot}</div>}
    </>
  );
  return createPortal(
    <div className="fade fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/30 px-3 py-4 backdrop-blur-[2px] sm:px-4 sm:py-16" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={hid} className={`pop mx-auto w-full ${wide ? "max-w-4xl" : "max-w-lg"} rounded-2xl border border-line bg-surface shadow-lift`}>
        {onSubmit ? (
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              // React bubbles submit through the portal to the wizard's <form>; don't advance the step.
              e.stopPropagation();
              onSubmit();
            }}
          >
            {body}
          </form>
        ) : (
          body
        )}
      </div>
    </div>,
    document.body,
  );
}

export function FormModal({ open, onClose, title, sub, save, onSave, children }: { open: boolean; onClose: () => void; title: string; sub?: string; save: string; onSave: () => void; children: React.ReactNode }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      sub={sub}
      onSubmit={onSave}
      foot={
        <>
          <Button kind="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{save}</Button>
        </>
      }
    >
      <div className="space-y-5">{children}</div>
    </Modal>
  );
}

export function CitySearch({ value, onPick, invalid, id }: { value: string; onPick: (c: City | null, text: string) => void; invalid?: boolean; id?: string }) {
  const [q, setQ] = useState(value);
  const [list, setList] = useState<City[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hi, setHi] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const seq = useRef(0);
  const lid = useId();

  useEffect(() => setQ(value), [value]);

  const type = (s: string) => {
    setQ(s);
    onPick(null, s);
    clearTimeout(timer.current);
    seq.current++;
    if (s.trim().length < 2) {
      setOpen(false);
      setBusy(false);
      return setList([]);
    }
    setBusy(true);
    timer.current = setTimeout(async () => {
      const mine = ++seq.current;
      try {
        const data = await searchCities(s.trim());
        if (mine !== seq.current) return;
        setList(Array.isArray(data) ? data : []);
        setHi(0);
        setOpen(true);
      } catch {
        if (mine === seq.current) setList([]);
      }
      if (mine === seq.current) setBusy(false);
    }, 220);
  };

  const pick = (c: City) => {
    setQ(c.label);
    setOpen(false);
    onPick(c, c.label);
  };

  const key = (e: React.KeyboardEvent) => {
    if (!open || !list.length) return;
    const moves: Record<string, () => void> = {
      ArrowDown: () => setHi((h) => Math.min(h + 1, list.length - 1)),
      ArrowUp: () => setHi((h) => Math.max(h - 1, 0)),
      Enter: () => pick(list[hi]),
      Escape: () => setOpen(false),
    };
    if (moves[e.key]) {
      e.preventDefault();
      moves[e.key]();
    }
  };

  return (
    <div className="relative">
      <Pin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={lid}
        aria-invalid={invalid || undefined}
        autoComplete="off"
        className={`${box} ${invalid ? bad : ok} pl-10 pr-10`}
        value={q}
        placeholder="Search for a city"
        onChange={(e) => type(e.target.value)}
        onKeyDown={key}
        onFocus={() => list.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
      />
      {busy && (
        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2">
          <Spinner className="h-4 w-4" />
        </span>
      )}
      {open && (
        <ul id={lid} role="listbox" className="pop absolute z-40 mt-1.5 max-h-64 w-full overflow-auto rounded-xl border border-line bg-surface p-1 shadow-lift">
          {list.length === 0 && <li className="px-3 py-5 text-center text-sm text-muted">No cities match “{q}”</li>}
          {list.map((c, i) => (
            <li key={c.label} role="option" aria-selected={i === hi} onMouseDown={() => pick(c)} onMouseEnter={() => setHi(i)} className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-ink sm:py-2 ${i === hi ? "bg-sunken" : ""}`}>
              <Pin className="h-3.5 w-3.5 shrink-0 text-muted" />
              {c.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return <span className={`inline-block animate-spin rounded-full border-2 border-current/20 border-t-current text-accent-text ${className}`} />;
}
