"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Draft, Errs, Level, Ref, Step } from "@/lib/types";
import { blank, fromSample, toInputs } from "@/lib/api";
import { calculate, getBls, getExample, getReference } from "@/app/actions";
import { checkStep, share } from "@/lib/check";
import { useDp } from "@/lib/dp";
import { Button, Callout, Card, Modal, Spinner } from "../ui";
import { BoxArt, FactoryArt, LayersArt } from "../art";
import { ChecklistArt, OfflineArt, RefrigerantArt } from "../art2";
import { Alert, Box, Check, Clipboard, Drop, Factory, Layers, Left, Reset, Right, Sparkle } from "../icons";
import LevelPick from "./level";
import ProductStep from "./product";
import MaterialsStep from "./materials";
import UpkeepStep from "./upkeep";
import FactoryStep from "./factory";
import Review from "./review";
import ReportView from "./report";

const plan: Record<Level, Step[]> = {
  basic: ["product", "materials", "upkeep", "review"],
  mid: ["product", "materials", "upkeep", "factory", "review"],
};

export const titles: Record<Step, string> = {
  product: "Product",
  materials: "Materials",
  upkeep: "Refrigerant and repairs",
  factory: "Manufacturing",
  review: "Review",
};

const intro: Record<Step, string> = {
  product: "Identify the product and give its key specification. The manufacturer's TM65 form has everything you need.",
  materials: "Break the product's weight down by material. Together the materials need to cover at least 95%.",
  upkeep: "Refrigerant leakage in use and at end of life, plus parts replaced over the product's service life.",
  factory: "Where the product is assembled, and how much energy the factory uses to make it.",
  review: "Check the details, then calculate. You can come back and change anything afterwards.",
};

const arts: Record<Step, (p: { className?: string }) => React.ReactElement> = { product: BoxArt, materials: LayersArt, upkeep: RefrigerantArt, factory: FactoryArt, review: ChecklistArt };
const icons: Record<Step, typeof Box> = { product: Box, materials: Layers, upkeep: Drop, factory: Factory, review: Clipboard };

const offline = "Check your connection, then try again.";
const KEY = "tm65.draft";

type Saved = { d: Draft; level: Level; at: number; seen: number; t: number };

const focusBad = () =>
  setTimeout(() => {
    const el = document.querySelector<HTMLElement>('[aria-invalid="true"], [data-err]');
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (el?.matches("input, select, textarea")) el.focus({ preventScroll: true });
  }, 30);

const started = (d: Draft) => !!(d.type || d.maker || d.name || d.weight || d.mats.length);

export default function Wizard() {
  const qs = useSearchParams();
  const router = useRouter();
  const { f } = useDp();
  const [refs, setRefs] = useState<Ref | null>(null);
  const [fail, setFail] = useState(false);
  const [level, setLevel] = useState<Level | null>(null);
  const [picking, setPicking] = useState(true);
  const [at, setAt] = useState(0);
  const [seen, setSeen] = useState(0);
  const [d, setD] = useState<Draft>(blank);
  const [errs, setErrs] = useState<Errs>({});
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [out, setOut] = useState({ open: false, res: null as unknown, err: [] as string[] });
  const [saved, setSaved] = useState<Saved | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [reset, setReset] = useState(false);

  const load = () => {
    setFail(false);
    getReference().then(setRefs).catch(() => setFail(true));
  };

  useEffect(load, []);

  useEffect(() => {
    try {
      const s: Saved | null = JSON.parse(localStorage.getItem(KEY) || "null");
      if (s?.d && (s.level === "basic" || s.level === "mid")) {
        setSaved(s);
        setD({ ...blank(), ...s.d });
        if (qs.get("level") === s.level) {
          setAt(s.at);
          setSeen(s.seen);
        }
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    const l = qs.get("level");
    const ok = l === "basic" || l === "mid";
    if (ok) setLevel(l);
    setPicking(!ok);
  }, [qs]);

  useEffect(() => {
    if (!loaded || !level) return;
    try {
      if (started(d)) localStorage.setItem(KEY, JSON.stringify({ d, level, at, seen, t: Date.now() }));
      else localStorage.removeItem(KEY);
    } catch {}
  }, [d, level, at, seen, loaded]);

  const steps = level ? plan[level] : [];
  const step = steps[Math.min(at, steps.length - 1)];
  const check = (s: Step) => checkStep(s, d, refs!, level ?? "mid");

  useEffect(() => {
    if (tried && refs && step && step !== "review") setErrs(check(step));
  }, [d, tried, refs, step, level]);

  const up = (p: Partial<Draft>) => setD((x) => ({ ...x, ...p }));

  const go = (i: number) => {
    setAt(i);
    setSeen((s) => Math.max(s, i));
    setTried(false);
    setErrs({});
    setNote("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fault = (i: number, e: Errs) => {
    setAt(i);
    setErrs(e);
    setTried(true);
    focusBad();
  };

  const choose = (l: Level, resume?: boolean) => {
    const n = plan[l].length - 1;
    setLevel(l);
    setPicking(false);
    setAt(resume && saved ? Math.min(saved.at, n) : 0);
    setSeen(resume && saved ? Math.min(saved.seen, n) : started(d) ? n : 0);
    router.replace(`/calculator?level=${l}`, { scroll: false });
  };

  const next = () => {
    const e = check(step);
    if (Object.keys(e).length) return fault(at, e);
    go(at + 1);
  };

  const calc = async () => {
    if (!refs || !level) return;
    for (let i = 0; i < steps.length - 1; i++) {
      const e = check(steps[i]);
      if (Object.keys(e).length) return fault(i, e);
    }
    setBusy(true);
    const wait = new Promise((r) => setTimeout(r, 1100));
    let res: unknown = null;
    let err: string[] = [];
    try {
      const j = await calculate(toInputs(d, refs, level), level);
      if ("results" in j) res = j.results;
      else err = j.errors;
    } catch {
      err = [`Couldn't reach the calculation service. ${offline}`];
    }
    await wait;
    setBusy(false);
    setOut({ open: true, res, err });
    window.scrollTo({ top: 0 });
  };

  const loadData = async (which: "sample" | "bls") => {
    if (!refs || !level) return;
    setNote("");
    try {
      setD(fromSample(await (which === "bls" ? getBls() : getExample()), refs));
      go(which === "bls" ? 0 : steps.length - 1);
      setSeen(steps.length - 1); // every step is filled in, so let the user jump anywhere
    } catch {
      setNote(`Couldn't load the ${which === "bls" ? "BLS data" : "sample"}. ${offline}`);
    }
  };

  const restart = () => {
    try {
      localStorage.removeItem(KEY);
    } catch {}
    setSaved(null);
    setD(blank());
    setOut({ open: false, res: null, err: [] });
    setReset(false);
    setSeen(0);
    go(0);
  };

  if (fail)
    return (
      <div className="rise mx-auto max-w-md px-6 py-28 text-center">
        <OfflineArt className="mx-auto h-28 w-40" />
        <h1 className="mt-5 text-xl font-semibold tracking-tight text-ink">The calculator is unavailable</h1>
        <p className="mt-2 text-ink-2">We couldn&apos;t load the reference data. Check your connection, then try again.</p>
        <Button className="mt-6" kind="secondary" onClick={load}>
          <Reset /> Try again
        </Button>
      </div>
    );

  if (!refs) return <Skeleton />;

  if (picking || !level) return <LevelPick initial={level} saved={saved && started(d) ? { ...saved, d } : null} onPick={choose} onDiscard={restart} />;

  if (out.open)
    return (
      <ReportView
        {...out}
        d={d}
        level={level}
        onBack={() => {
          setOut((o) => ({ ...o, open: false }));
          window.scrollTo({ top: 0 });
        }}
        onNew={() => setReset(true)}
        extra={<ResetModal open={reset} onClose={() => setReset(false)} onConfirm={restart} />}
      />
    );

  const props = { d, up, errs, refs };
  const count = Object.keys(errs).length;
  const issues = Object.fromEntries(steps.map((s) => [s, s === "review" ? 0 : Object.keys(check(s)).length])) as Record<Step, number>;
  const ready = steps.every((s) => !issues[s]);
  const Icon = icons[step];
  const sub: Record<Step, string> = {
    product: d.name || "Not started",
    materials: d.mats.length ? `${d.mats.length} material${d.mats.length === 1 ? "" : "s"} · ${f(share(d), 1)}%` : "None added",
    upkeep: d.hasRef ? d.ref || "Refrigerant" : "No refrigerant",
    factory: d.cityOk ? d.city.split(",")[0] : "Not started",
    review: ready ? "Ready to calculate" : "",
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 lg:pt-10">
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
        <aside className="no-print lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">New calculation</p>
              <p className="mt-0.5 truncate font-semibold text-ink">{level === "basic" ? "Basic" : "Mid-level"} report</p>
            </div>
            <Button kind="secondary" size="sm" onClick={() => setPicking(true)}>
              Change
            </Button>
          </div>

          {/* Compact progress for small screens */}
          <div className="mt-5 lg:hidden">
            <div className="flex gap-1.5">
              {steps.map((s, i) => (
                <button key={s} type="button" aria-label={`${i + 1}. ${titles[s]}`} disabled={i > seen} onClick={() => go(i)} className={`h-1.5 flex-1 rounded-full transition-colors ${i === at ? "bg-accent" : i <= seen ? (issues[s] && i < at ? "bg-warn" : "bg-accent/40") : "bg-line"}`} />
              ))}
            </div>
          </div>

          <nav aria-label="Steps" className="mt-6 hidden lg:block">
            <ol className="relative space-y-1">
              {steps.map((s, i) => {
                const cur = i === at;
                const reach = i <= seen;
                const done = reach && !cur && !issues[s] && s !== "review";
                const warn = reach && !cur && issues[s] > 0;
                return (
                  <li key={s} className="relative">
                    {i < steps.length - 1 && <span className={`absolute left-[19px] top-10 h-[calc(100%-28px)] w-px ${i < seen ? "bg-accent/40" : "bg-line"}`} />}
                    <button type="button" disabled={!reach} onClick={() => go(i)} aria-current={cur ? "step" : undefined} className={`flex w-full items-start gap-3 rounded-xl px-1.5 py-2 text-left transition-colors ${cur ? "" : reach ? "hover:bg-sunken" : "cursor-default"}`}>
                      <span className={`relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full font-mono text-xs transition-all ${cur ? "bg-accent text-on-accent shadow-soft ring-4 ring-accent/15" : done ? "bg-accent-soft text-accent-text" : warn ? "bg-warn-soft text-warn" : "border border-line-strong bg-surface text-muted"}`}>
                        {done ? <Check className="h-3.5 w-3.5" /> : warn ? <Alert className="h-3.5 w-3.5" /> : i + 1}
                      </span>
                      <span className="min-w-0 pt-0.5">
                        <span className={`block text-sm ${cur ? "font-semibold text-ink" : reach ? "font-medium text-ink" : "text-muted"}`}>{titles[s]}</span>
                        {reach && sub[s] && <span className={`mt-0.5 block truncate text-xs ${warn ? "text-warn" : "text-muted"}`}>{warn ? `${issues[s]} to fix` : sub[s]}</span>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <Card className="mt-6 hidden p-4 lg:block">
            <div>
              <button type="button" onClick={() => loadData("bls")} className="flex w-full items-center gap-2.5 rounded-lg py-1 text-[13px] text-ink-2 transition-colors hover:text-ink">
                <Sparkle className="h-4 w-4 text-accent-text" /> Load BLS data
              </button>
              <button type="button" onClick={() => setReset(true)} className="mt-1 flex w-full items-center gap-2.5 rounded-lg py-1 text-[13px] text-ink-2 transition-colors hover:text-danger">
                <Reset className="h-4 w-4" /> Start over
              </button>
            </div>
          </Card>
          {started(d) && (
            <p className="mt-3 hidden items-center gap-1.5 px-1 text-xs text-muted lg:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-ok" /> Draft saved on this device
            </p>
          )}
        </aside>

        <form
          noValidate
          className="min-w-0"
          onSubmit={(e) => {
            e.preventDefault();
            if (step === "review") calc();
            else next();
          }}
        >
          <div key={step} className="rise">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-[13px] font-medium text-accent-text">
                  <Icon className="h-4 w-4" />
                  Step {at + 1} of {steps.length}
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-[2rem]">{titles[step]}</h1>
                <p className="mt-2 max-w-2xl leading-relaxed text-ink-2">{intro[step]}</p>
              </div>
              {(() => {
                const Art = arts[step];
                return <Art className="hidden h-28 w-40 shrink-0 sm:block" />;
              })()}
            </div>

            <div className="lg:hidden">
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                <button type="button" onClick={() => loadData("bls")} className="flex min-h-9 items-center gap-1.5 text-[13px] text-ink-2 hover:text-ink">
                  <Sparkle className="h-4 w-4 text-accent-text" /> Load BLS data
                </button>
                <button type="button" onClick={() => setReset(true)} className="flex min-h-9 items-center gap-1.5 text-[13px] text-ink-2 hover:text-danger">
                  <Reset className="h-4 w-4" /> Start over
                </button>
              </div>
            </div>

            <div className="mt-8">
              {step === "product" && <ProductStep {...props} />}
              {step === "materials" && <MaterialsStep {...props} level={level} />}
              {step === "upkeep" && <UpkeepStep {...props} />}
              {step === "factory" && <FactoryStep {...props} />}
              {step === "review" && <Review d={d} level={level} issues={issues} onEdit={(s) => go(steps.indexOf(s))} />}
            </div>
          </div>

          {tried && count > 0 && (
            <Callout tone="danger" className="fade mt-6">
              Please fix the highlighted {count === 1 ? "field" : `${count} fields`} to continue.
            </Callout>
          )}
          {note && (
            <Callout tone="danger" className="fade mt-6">
              {note}
            </Callout>
          )}

          <div className="no-print sticky bottom-0 z-30 -mx-4 mt-10 border-t border-line bg-bg/85 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl sm:mx-0 sm:rounded-t-2xl sm:px-0 sm:py-4">
            <div className="flex items-center justify-between gap-3">
              {at > 0 ? (
                <Button kind="secondary" onClick={() => go(at - 1)}>
                  <Left /> Back
                </Button>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-4">
                {step === "review" ? (
                  <Button type="submit" size="lg" disabled={busy} className="sm:min-w-48">
                    {busy ? <Spinner className="h-4 w-4 text-on-accent!" /> : <Sparkle />}
                    {busy ? "Calculating…" : "Calculate report"}
                  </Button>
                ) : (
                  <Button type="submit" size="lg">
                    <span className="sm:hidden">Continue</span>
                    <span className="hidden sm:inline">Continue to {titles[steps[at + 1]].toLowerCase()}</span> <Right />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      {busy && <Calculating level={level} />}
      <ResetModal open={reset} onClose={() => setReset(false)} onConfirm={restart} />
    </div>
  );
}

function ResetModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Start a new calculation?"
      sub="Everything you've entered will be cleared. This can't be undone."
      foot={
        <>
          <Button kind="ghost" onClick={onClose}>
            Keep editing
          </Button>
          <Button kind="danger" onClick={onConfirm}>
            Clear and start over
          </Button>
        </>
      }
    >
      <p className="text-sm text-ink-2">Tip: save the current report as a PDF first if you want to keep it.</p>
    </Modal>
  );
}

const codes = ["A1", "A2", "A3", "A4", "B1", "B3", "C1", "C2", "C3", "C4"];

function Calculating({ level }: { level: Level }) {
  const list = level === "basic" ? ["A1", "B3", "B1", "C1"] : codes;
  return (
    <div className="fade fixed inset-0 z-50 grid place-items-center bg-bg/80 px-6 backdrop-blur-md" role="status" aria-live="polite">
      <div className="pop w-full max-w-sm rounded-2xl border border-line bg-surface p-8 text-center shadow-lift">
        <Spinner className="h-8 w-8" />
        <p className="mt-5 font-semibold text-ink">Calculating your {level === "basic" ? "basic" : "mid-level"} report</p>
        <p className="mt-1 text-sm text-ink-2">Working through each life cycle stage…</p>
        <div className="mt-6 flex flex-wrap justify-center gap-1.5">
          {list.map((c, i) => (
            <span key={c} className="rounded-md bg-sunken px-2 py-1 font-mono text-[11px] text-ink-2" style={{ animation: `pulse-dot 1.2s ${i * 0.1}s ease-in-out infinite` }}>
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  const bar = "animate-pulse rounded-lg bg-sunken";
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6" aria-busy="true" aria-label="Loading calculator">
      <div className="grid gap-12 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="hidden space-y-4 lg:block">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-9 ${bar}`} />
          ))}
        </div>
        <div className="space-y-4">
          <div className={`h-4 w-24 ${bar}`} />
          <div className={`h-9 w-64 ${bar}`} />
          <div className={`h-4 w-full max-w-xl ${bar}`} />
          <div className={`mt-8 h-64 rounded-2xl ${bar}`} />
        </div>
      </div>
    </div>
  );
}
