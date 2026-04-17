"use client";

import { Snowflake } from "lucide-react";

export function NavHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <a
          href="/"
          aria-label="Don&apos;t Be Shy home"
          className="flex items-center gap-2 font-bold text-indigo-600"
        >
          <Snowflake aria-hidden="true" className="h-6 w-6" />
          <span className="text-lg">Don&rsquo;t Be Shy</span>
        </a>
        <nav aria-label="Primary" className="flex items-center gap-4 text-sm text-slate-600">
          <a href="/" className="hover:text-indigo-600 transition-colors">
            Home
          </a>
          <a
            href="https://github.com/PenguinAlleyApps/dont-be-shy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-600 transition-colors"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
