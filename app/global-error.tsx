"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          color: "#0f172a",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            padding: "32px",
            textAlign: "center",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>
            Something went wrong
          </h1>
          <p style={{ marginTop: 12, color: "#475569", lineHeight: 1.6 }}>
            The app hit an unexpected error. This is usually fixed by reloading —
            especially right after a release.
          </p>
          {error?.digest && (
            <p style={{ marginTop: 8, fontSize: 12, color: "#94a3b8" }}>
              Ref: {error.digest}
            </p>
          )}
          <div
            style={{
              marginTop: 24,
              display: "flex",
              gap: 12,
              justifyContent: "center",
            }}
          >
            <button
              onClick={() => reset()}
              style={{
                padding: "10px 18px",
                border: "1px solid #cbd5e1",
                background: "white",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "10px 18px",
                border: "none",
                background: "#0f172a",
                color: "white",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Reload app
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
