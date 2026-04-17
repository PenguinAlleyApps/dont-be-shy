"use client";

export function AttributionFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
      <p>
        Built by{" "}
        <span className="font-semibold text-slate-700">PA·co</span> — A{" "}
        <a
          href="https://penguinalley.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
        >
          Penguin Alley
        </a>{" "}
        System
      </p>
      <p className="mt-1 text-xs text-slate-400">
        Open source under AGPL-3.0
      </p>
    </footer>
  );
}
