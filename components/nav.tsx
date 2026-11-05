"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Close, Logo, Menu } from "./icons";
import { LinkButton } from "./ui";

const links = [
  ["/calculator", "Calculator"],
];

export default function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const on = (href: string) => path.startsWith(href);
  return (
    <header className="no-print sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">
          <Logo />
          <span className="text-[15px] font-semibold tracking-tight text-ink">
            TM65 <span className="font-normal text-muted">Calculator</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 text-sm sm:flex">
          {links.map(([h, l]) => (
            <Link key={h} href={h} aria-current={on(h) ? "page" : undefined} className={`rounded-lg px-3 py-1.5 transition-colors ${on(h) ? "bg-sunken font-medium text-ink" : "text-ink-2 hover:text-ink"}`}>
              {l}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 sm:flex">
          {!on("/calculator") && (
            <LinkButton href="/calculator" size="sm">
              Start calculating
            </LinkButton>
          )}
        </div>
        <button type="button" className="-mr-2 grid h-10 w-10 place-items-center rounded-lg text-ink-2 transition-colors hover:bg-sunken active:bg-sunken sm:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
          {open ? <Close className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="fade border-t border-line px-4 pb-4 pt-2 sm:hidden">
          {links.map(([h, l]) => (
            <Link key={h} href={h} className={`block rounded-lg px-3 py-3 text-[15px] ${on(h) ? "bg-sunken font-medium text-ink" : "text-ink-2"}`}>
              {l}
            </Link>
          ))}
          {!on("/calculator") && (
            <LinkButton href="/calculator" className="mt-2 w-full">
              Start calculating
            </LinkButton>
          )}
        </nav>
      )}
    </header>
  );
}
