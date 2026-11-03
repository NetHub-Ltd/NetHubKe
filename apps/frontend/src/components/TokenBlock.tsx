"use client";

import { CopyButton } from "./CopyButton";

export function TokenBlock({
  title,
  token,
  claims,
}: {
  title: string;
  token: string | null | undefined;
  claims?: Record<string, unknown> | null;
}) {
  return (
    <section style={{ marginTop: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <h2 style={{ fontSize: "1rem", margin: 0 }}>{title}</h2>
        {token ? <CopyButton text={token} /> : null}
      </div>
      {token ? (
        <pre style={{ marginTop: "0.5rem", wordBreak: "break-all", whiteSpace: "pre-wrap" }}>
          {token}
        </pre>
      ) : (
        <p className="muted">Not present in session JWT</p>
      )}
      {claims && (
        <>
          <h3 style={{ fontSize: "0.9rem", marginBottom: 0 }}>Decoded payload</h3>
          <pre>{JSON.stringify(claims, null, 2)}</pre>
        </>
      )}
    </section>
  );
}
