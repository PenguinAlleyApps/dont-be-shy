"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main
          role="alert"
          aria-live="assertive"
          style={{
            margin: "0 auto",
            maxWidth: 480,
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Something broke.</h1>
          <p style={{ marginTop: 12, color: "#475569" }}>
            A critical error occurred. Refresh the page or try again.
          </p>
          {error?.digest && (
            <p style={{ marginTop: 16, fontFamily: "monospace", fontSize: 12, color: "#94a3b8" }}>
              ref: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: 24,
              padding: "8px 16px",
              borderRadius: 8,
              background: "#4f46e5",
              color: "white",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
