"use client";

import Link from "next/link";
import { Lockup } from "@/components/brand/logo";

/**
 * Internal nav for /setup, /interview, /results.
 * Landing page (/) uses its own inline header for tighter control over rhythm.
 */
export function NavHeader() {
  return (
    <header
      className="border-b px-6 py-4 sm:px-10"
      style={{ borderColor: "var(--color-charcoal-soft)", background: "var(--color-bone)" }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link
          href="/"
          aria-label="Don&apos;t Be Shy home"
          className="transition-opacity hover:opacity-70"
          style={{ color: "var(--color-charcoal)" }}
        >
          <Lockup size={24} ink="var(--color-charcoal)" spark="var(--color-coral)" />
        </Link>
        <nav
          aria-label="Primary"
          className="flex items-center gap-6 font-mono text-xs uppercase tracking-widest"
          style={{ color: "var(--color-deep-green)" }}
        >
          <a
            href="https://github.com/PenguinAlleyApps/dont-be-shy"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-70"
          >
            Source ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
