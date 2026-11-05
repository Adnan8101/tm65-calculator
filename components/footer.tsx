import Link from "next/link";
import { Logo } from "./icons";

export default function Footer() {
  return (
    <footer className="no-print mt-24 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <Logo className="h-6 w-6 opacity-80" />
          <div>
            <p>
              A product of{" "}
              <a href="https://blackcurrantlabs.com/" target="_blank" rel="noopener noreferrer" className="font-medium text-ink transition-colors hover:text-accent-text">
                Blackcurrant Labs
              </a>
            </p>
            <p className="mt-0.5 text-xs">An independent implementation of CIBSE TM65. Not affiliated with CIBSE.</p>
          </div>
        </div>
        <nav className="flex gap-6">
          <Link href="/calculator" className="transition-colors hover:text-ink">
            Calculator
          </Link>
        </nav>
      </div>
    </footer>
  );
}
