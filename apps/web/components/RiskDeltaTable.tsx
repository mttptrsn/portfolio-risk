"use client";

import { useMemo } from "react";

type Asset = { symbol: string; weight: number; riskShare: number; mcr: number };

function fmtPct(x: number) {
  return (x * 100).toFixed(2) + "%";
}

export function RiskDeltaTable({
  normal,
  stress,
  topN = 20,
}: {
  normal: Asset[];
  stress: Asset[];
  topN?: number;
}) {
  const rows = useMemo(() => {
    const nMap = new Map(normal.map((a) => [a.symbol, a]));
    const sMap = new Map(stress.map((a) => [a.symbol, a]));

    const all = Array.from(new Set([...nMap.keys(), ...sMap.keys()]));

    const out = all.map((sym) => {
      const n = nMap.get(sym);
      const s = sMap.get(sym);
      const dn = n?.riskShare ?? 0;
      const ds = s?.riskShare ?? 0;
      return {
        symbol: sym,
        normal: dn,
        stress: ds,
        delta: ds - dn,
        weight: s?.weight ?? n?.weight ?? 0,
      };
    });

    out.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
    return out.slice(0, topN);
  }, [normal, stress, topN]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {rows.map((r) => (
        <div
          key={r.symbol}
          style={{
            display: "grid",
            gridTemplateColumns: "70px 1fr 1fr 1fr",
            gap: 10,
            alignItems: "center",
            padding: "10px 12px",
            borderRadius: 14,
            border: "1px solid var(--stroke)",
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <div style={{ fontWeight: 700 }}>{r.symbol}</div>
          <div style={{ color: "var(--muted)", fontSize: 12 }}>Normal {fmtPct(r.normal)}</div>
          <div style={{ color: "var(--muted)", fontSize: 12 }}>Stress {fmtPct(r.stress)}</div>
          <div style={{ fontWeight: 700 }}>
            {r.delta >= 0 ? "+" : ""}
            {fmtPct(r.delta)}
          </div>
        </div>
      ))}
    </div>
  );
}
