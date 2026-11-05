"use client";
import type { Draft, Level } from "@/lib/types";
import { Badge, Button } from "../ui";
import { Check, Factory, Layers, Right } from "../icons";
import { BasicArt, MidArt } from "../art";
import { WelcomeArt } from "../art2";

const opts: { key: Level; title: string; tag: string; text: string; needs: string[]; steps: number; Icon: typeof Layers; Art: typeof BasicArt }[] = [
  {
    key: "basic",
    title: "Basic report",
    tag: "Quicker",
    text: "Transport, manufacturing and end of life are estimated with TM65 scale-up factors. Use it when the manufacturer can only give product data.",
    needs: ["Product weight and service life", "Material breakdown by weight", "Refrigerant type and charge"],
    steps: 4,
    Icon: Layers,
    Art: BasicArt,
  },
  {
    key: "mid",
    title: "Mid-level report",
    tag: "More robust",
    text: "Each stage is calculated separately. Manufacturing uses the factory's real energy use; transport and end of life use TM65 assumptions for the product type and region. More robust than basic.",
    needs: ["Everything in the basic report", "Final assembly location", "Factory energy use and output"],
    steps: 5,
    Icon: Factory,
    Art: MidArt,
  },
];

type Saved = { d: Draft; level: Level; t: number };

export default function LevelPick({ initial, saved, onPick, onDiscard }: { initial: Level | null; saved: Saved | null; onPick: (l: Level, resume?: boolean) => void; onDiscard: () => void }) {
  const when = saved && new Date(saved.t).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  return (
    <div className="relative">
      <div className="grid-paper pointer-events-none absolute inset-x-0 top-0 -z-10 h-80" />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20">
        <div className="rise text-center">
          <WelcomeArt className="mx-auto mb-2 h-28 w-40" />
          <p className="text-[13px] font-medium text-accent-text">New calculation</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">How much detail do you have?</h1>
          <p className="mx-auto mt-3 max-w-lg leading-relaxed text-ink-2">Pick a level to start. You can switch at any time without losing what you&apos;ve entered.</p>
        </div>

        {saved && (
          <div className="rise mx-auto mt-10 flex max-w-2xl flex-col gap-4 rounded-2xl border border-accent/30 bg-accent-soft p-4 sm:flex-row sm:items-center sm:p-5" style={{ animationDelay: "60ms" }}>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">Continue where you left off</p>
              <p className="mt-0.5 truncate text-[13px] text-ink-2">
                {saved.d.name || "Untitled product"} · {saved.level === "basic" ? "Basic" : "Mid-level"} report · saved {when}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button kind="ghost" size="sm" onClick={onDiscard}>
                Discard
              </Button>
              <Button size="sm" onClick={() => onPick(saved.level, true)}>
                Resume <Right />
              </Button>
            </div>
          </div>
        )}

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {opts.map(({ key, title, tag, text, needs, steps, Icon, Art }, i) => (
            <button
              key={key}
              type="button"
              onClick={() => onPick(key)}
              className="rise group relative flex flex-col rounded-2xl border border-line bg-surface p-6 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lift focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 sm:p-7"
              style={{ animationDelay: `${100 + i * 70}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent-text transition-colors group-hover:bg-accent group-hover:text-on-accent">
                  <Icon className="h-5 w-5" />
                </span>
                {initial === key ? <Badge tone="accent">Current</Badge> : <Badge>{tag}</Badge>}
              </div>
              <Art className="mt-4 h-28 w-full" />
              <h2 className="mt-3 text-xl font-semibold tracking-tight text-ink">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{text}</p>
              <p className="mt-6 text-[11px] font-semibold uppercase tracking-wider text-muted">You&apos;ll need</p>
              <ul className="mt-2.5 space-y-2">
                {needs.map((n) => (
                  <li key={n} className="flex items-start gap-2.5 text-sm text-ink">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-text" />
                    {n}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-7">
                <div className="flex items-center justify-between border-t border-line pt-4 text-sm">
                  <span className="text-muted">{steps} steps</span>
                  <span className="flex items-center gap-1.5 font-medium text-accent-text">
                    Start {key === "basic" ? "basic" : "mid-level"}
                    <Right className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
