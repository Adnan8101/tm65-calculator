import Link from "next/link";
import { LinkButton } from "@/components/ui";
import Pie from "@/components/pie";
import { BuildingArt } from "@/components/art2";
import { BasicArt, BoxArt, FactoryArt, GlobeArt, LayersArt, MidArt, ReportArt } from "@/components/art";
import { Box, Check, Clipboard, Factory, Layers, Right } from "@/components/icons";

const levels = [
  {
    key: "basic",
    title: "Basic",
    Icon: Layers,
    Art: BasicArt,
    text: "A quick, cautious estimate from the product's weight, material breakdown and refrigerant. Use it when that's all the manufacturer can give you.",
    points: ["Weight, materials and refrigerant", "Scale-up factor covers transport, manufacturing and end of life"],
  },
  {
    key: "mid",
    title: "Mid-level",
    Icon: Factory,
    Art: MidArt,
    text: "Adds the factory's energy use, output and location. Manufacturing uses the factory's real energy, and each life cycle stage is worked out separately instead of with one scale-up factor.",
    points: ["Everything in basic, plus factory data", "Each life cycle stage shown separately"],
  },
];

const how = [
  [Box, BoxArt, "Describe the product", "Type, manufacturer, weight and service life, straight from the TM65 manufacturer form."],
  [Layers, LayersArt, "Break down the materials", "Search 460+ materials, add shares of weight, and watch coverage build towards 95%."],
  [Clipboard, ReportArt, "Get your report", "A stage-by-stage breakdown you can save as a PDF or print, ready to use in a whole life carbon assessment."],
] as const;

const phases = [
  { name: "Materials and manufacturing", color: "var(--p1)", stages: [["A1", "Material extraction"], ["A2", "Transport to the factory"], ["A3", "Manufacturing"]] },
  { name: "Transport to site", color: "var(--p2)", stages: [["A4", "Transport to site"]] },
  { name: "Use", color: "var(--p3)", stages: [["B1", "Refrigerant leakage during use"], ["B3", "Repairs and replaced parts"]] },
  { name: "End of life", color: "var(--p4)", stages: [["C1", "Refrigerant leakage when decommissioning"], ["C2", "Transport to waste processing"], ["C3", "Waste processing"], ["C4", "Disposal"]] },
];

// Figures from the built-in BLS data (Blue Star 78 TR chiller, mid-level method), as calculated by the engine.
const preview = [
  ["Materials and manufacturing", "A1–A3", 32926.0849, "var(--p1)"],
  ["Transport to site", "A4", 866.7469, "var(--p2)"],
  ["Refrigerant leakage in use and repairs", "B1, B3", 67338.8545, "var(--p3)"],
  ["End of life", "C1–C4", 4921.2026, "var(--p4)"],
] as const;
const previewTotal = 106052.8889;
const dp2 = (v: number) => v.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Preview() {
  return (
    <div className="relative" aria-label="Example report preview">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-lime/30 via-transparent to-p1/10 blur-2xl" />
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-lift sm:p-7">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-text">BLS data · mid-level</span>
          <span className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-2 w-2 rounded-full bg-line-strong" />
            ))}
          </span>
        </div>
        <p className="mt-5 text-sm font-medium text-ink">Blue Star air-cooled screw chiller</p>
        <p className="text-xs text-muted">274.30 kW cooling (78 TR) · 3,081.00 kg · 25-year life</p>
        <p className="mt-5 text-xs text-muted">Total embodied carbon</p>
        <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          {dp2(previewTotal)}
          <span className="text-base font-normal text-muted">kgCO₂e</span>
        </p>
        <div className="mt-6 flex justify-center pb-10">
          <Pie size={190} label="Share of total by life cycle phase" slices={preview.map(([name, codes, value, color]) => ({ name, codes, value, color }))} />
        </div>
        <ul className="mt-5 space-y-2.5 text-[13px]">
          {preview.map(([n, codes, v, color]) => (
            <li key={n} className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: color }} />
              <span className="min-w-0 flex-1 text-ink-2">
                {n} <span className="font-mono text-xs text-muted">{codes}</span>
              </span>
              <span className="font-mono tabular-nums text-ink">{dp2(v)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <div className="grid-paper pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px]" />

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-24 lg:grid-cols-[1.1fr_1fr] lg:gap-20 lg:pb-28">
        <div className="rise min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-2 shadow-soft">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            CIBSE TM65 · basic and mid-level methods
          </p>
          <h1 className="mt-6 text-[2.15rem] font-semibold leading-[1.08] tracking-tight text-balance text-ink sm:text-6xl sm:leading-[1.05]">
            Embodied carbon for building services, <span className="text-accent-text">without the spreadsheet.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-2 sm:mt-6 sm:text-lg">Estimate the carbon of pumps, chillers, air handling units and other MEP equipment when no EPD is available, with a clear, stage-by-stage report.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-9">
            <LinkButton href="/calculator" size="lg" className="w-full sm:w-auto">
              Start a calculation <Right />
            </LinkButton>
          </div>
        </div>
        <div className="rise relative min-w-0" style={{ animationDelay: "120ms" }}>
          <FactoryArt className="pointer-events-none absolute -right-4 -top-24 hidden h-36 w-48 sm:block lg:-right-10 lg:-top-28" />
          <Preview />
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="text-[13px] font-medium text-accent-text">Two levels of detail</p>
          <h2 className="mt-2 max-w-xl text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Start with what the manufacturer can give you</h2>
          <div className="mt-8 grid gap-4 sm:mt-10 md:grid-cols-2">
            {levels.map(({ key, title, Icon, Art, text, points }) => (
              <Link key={key} href={`/calculator?level=${key}`} className="group flex flex-col rounded-2xl border border-line bg-bg p-5 transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lift active:scale-[.99] sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent-text transition-colors group-hover:bg-accent group-hover:text-on-accent">
                    <Icon className="h-5 w-5" />
                  </span>
                  <Art className="h-20 w-32 transition-transform group-hover:scale-105 sm:h-24 sm:w-40" />
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-tight text-ink">{title}</h3>
                <p className="mt-2 leading-relaxed text-ink-2">{text}</p>
                <ul className="mt-5 space-y-2">
                  {points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2.5 text-sm text-ink">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-text" />
                      {pt}
                    </li>
                  ))}
                </ul>
                <span className="mt-auto flex items-center gap-1.5 pt-7 text-sm font-medium text-accent-text">
                  Start a {title.toLowerCase()} report <Right className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-[13px] font-medium text-accent-text">How it works</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">From manufacturer data to a report in three steps</h2>
        <ol className="mt-8 grid gap-10 sm:mt-10 sm:grid-cols-2 md:grid-cols-3 md:gap-8">
          {how.map(([Icon, Art, title, text], i) => (
            <li key={title} className="relative">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface text-accent-text shadow-soft">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-mono text-xs text-muted">0{i + 1}</span>
              </div>
              <Art className="mt-5 h-36 w-full max-w-[220px]" />
              <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
              <p className="mt-2 leading-relaxed text-ink-2">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <BuildingArt className="order-last hidden h-40 w-56 sm:block" />
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-accent-text">What&apos;s included</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Ten life cycle stages, as reported in CIBSE TM65</h2>
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
            {phases.map((ph) => (
              <div key={ph.name} className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
                <div className="flex items-center gap-2.5">
                  <span className="h-3 w-3 rounded-[3px]" style={{ background: ph.color }} />
                  <h3 className="font-semibold text-ink">{ph.name}</h3>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {ph.stages.map(([code, text]) => (
                    <li key={code} className="flex gap-3 text-sm">
                      <span className="w-7 shrink-0 font-mono text-xs leading-5 text-muted">{code}</span>
                      <span className="text-ink-2">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-[#10241a] px-5 py-12 text-center sm:px-16 sm:py-14">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[min(36rem,120%)] -translate-x-1/2 rounded-full bg-lime/20 blur-3xl" />
          <GlobeArt className="relative mx-auto mb-4 h-24 w-24 sm:h-28 sm:w-28" />
          <h2 className="relative text-2xl font-semibold tracking-tight text-white sm:text-4xl">Ready to assess a product?</h2>
          <p className="relative mx-auto mt-3 max-w-md text-[#b9c8be]">Have the manufacturer&apos;s TM65 form to hand, or try it first with the built-in BLS chiller data.</p>
          <Link href="/calculator" className="relative mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-lime px-6 text-[15px] font-medium text-[#0c1a10] transition-transform hover:-translate-y-0.5">
            Start a calculation <Right />
          </Link>
        </div>
      </section>
    </div>
  );
}
