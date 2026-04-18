"use client";

export function AttributionFooter() {
  return (
    <footer
      className="border-t px-6 py-10 sm:px-10"
      style={{ borderColor: "var(--hairline)", color: "var(--color-deep-green)" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-2 font-mono text-xs uppercase tracking-widest sm:flex-row sm:items-baseline sm:justify-between">
        <p>
          Built by{" "}
          <span style={{ color: "var(--surface-ink)" }}>PA·co</span> · A{" "}
          <a
            href="https://penguinalley.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-1 underline-offset-4 hover:opacity-70"
            style={{ color: "var(--surface-ink)" }}
          >
            Penguin Alley
          </a>{" "}
          system
        </p>
        <p>
          AGPL-3.0 ·{" "}
          <a
            href="https://github.com/PenguinAlleyApps/dont-be-shy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-1 underline-offset-4 hover:opacity-70"
          >
            github
          </a>
        </p>
      </div>
    </footer>
  );
}
