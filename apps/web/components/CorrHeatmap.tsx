"use client";
import React from "react";
import { useMemo } from "react";

type Corr = { symbols: string[]; data: number[][] };
type AssetMetric = { symbol: string; riskShare: number };

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

// simple diverging color without libs: blue (neg) -> gray (0) -> pink (pos)
function corrColor(v: number) {
  const x = clamp01((v + 1) / 2); // map [-1,1] to [0,1]
  const r = Math.round(30 + 190 * x);
  const g = Math.round(35 + 90 * (1 - Math.abs(v)));
  const b = Math.round(220 - 170 * x);
  return `rgb(${r},${g},${b})`;
}

export function CorrHeatmap({
  corr,
  assets,
  topN = 25,
}: {
  corr: Corr;
  assets: AssetMetric[];
  topN?: number;
}) {
  const view = useMemo(() => {
    const sorted = [...assets].sort((a, b) => b.riskShare - a.riskShare).slice(0, topN);
    const keep = new Set(sorted.map((a) => a.symbol));

    const idx = corr.symbols
      .map((s, i) => (keep.has(s) ? i : -1))
      .filter((i) => i >= 0);

    const symbols = idx.map((i) => corr.symbols[i]);
    const data = idx.map((i) => idx.map((j) => corr.data[i]?.[j] ?? 0));

    return { symbols, data };
  }, [corr, assets, topN]);

  const n = view.symbols.length;
  if (!n) return <div style={{ color: "var(--muted)" }}>No correlation data.</div>;

  return (
    <div style={{ overflowX: "auto" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `120px repeat(${n}, 18px)`,
          gap: 4,
          alignItems: "center",
          minWidth: 120 + n * 22,
        }}
      >
        <div />
        {view.symbols.map((s) => (
          <div key={`c-${s}`} style={{ fontSize: 10, color: "var(--muted)", textAlign: "center" }}>
            {s}
          </div>
        ))}

        {view.symbols.map((rowSym, i) => (
        <React.Fragment key={`row-${rowSym}`}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)" }}>
            {rowSym}
            </div>
            {view.data[i].map((v, j) => (
            <div
                key={`cell-${rowSym}-${view.symbols[j]}`}
                title={`${rowSym} × ${view.symbols[j]}: ${v.toFixed(2)}`}
                style={{
                width: 18,
                height: 18,
                borderRadius: 5,
                background: corrColor(v),
                border: "1px solid rgba(255,255,255,0.08)",
                }}
            />
            ))}
        </React.Fragment>
        ))}

      </div>
    </div>
  );
}
