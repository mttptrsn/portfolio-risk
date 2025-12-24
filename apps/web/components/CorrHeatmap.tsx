"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Corr = { symbols: string[]; data: number[][] };
type AssetMetric = { symbol: string; riskShare: number };

function clamp(x: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, x));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * High-contrast sequential palette for |corr|:
 *  - low: deep slate
 *  - mid: warm amber
 *  - high: hot red
 *
 * This makes 0.40 vs 0.85 look obviously different.
 */
function absCorrColor(v: number) {
  const x = clamp(Math.abs(v), 0, 1);

  // emphasize the range correlations actually live in for liquid ETFs/stocks
  // push contrast into 0.35–0.95
  const t = clamp((x - 0.25) / 0.75, 0, 1);
  const g = Math.pow(t, 0.65); // gamma for stronger separation in the upper range

  // stops (RGB):
  // low:  18, 24, 38  (deep slate)
  // mid:  245, 158, 11 (amber)
  // high: 244, 63, 94  (rose/red)
  let r: number, gg: number, b: number;

  if (g < 0.6) {
    const u = g / 0.6;
    r = lerp(18, 245, u);
    gg = lerp(24, 158, u);
    b = lerp(38, 11, u);
  } else {
    const u = (g - 0.6) / 0.4;
    r = lerp(245, 244, u);
    gg = lerp(158, 63, u);
    b = lerp(11, 94, u);
  }

  return `rgb(${Math.round(r)},${Math.round(gg)},${Math.round(b)})`;
}

export function CorrHeatmap({
  corr,
  assets,
  topN = 15,
}: {
  corr: Corr;
  assets: AssetMetric[];
  topN?: number;
}) {
  const view = useMemo(() => {
    const sorted = [...assets].sort((a, b) => b.riskShare - a.riskShare).slice(0, topN);
    const keep = new Set(sorted.map((a) => a.symbol));

    const idx = corr.symbols.map((s, i) => (keep.has(s) ? i : -1)).filter((i) => i >= 0);

    const symbols = idx.map((i) => corr.symbols[i]);
    const data = idx.map((i) => idx.map((j) => corr.data[i]?.[j] ?? 0));

    return { symbols, data };
  }, [corr, assets, topN]);

  const n = view.symbols.length;

  const topPairs = useMemo(() => {
    if (!n) return [];
    const pairs: { a: string; b: string; v: number }[] = [];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        pairs.push({ a: view.symbols[i], b: view.symbols[j], v: view.data[i]?.[j] ?? 0 });
      }
    }
    pairs.sort((p, q) => Math.abs(q.v) - Math.abs(p.v));
    return pairs.slice(0, 12);
  }, [n, view.symbols, view.data]);

  const [active, setActive] = useState<{ a: string; b: string; v: number } | null>(null);

  // Dynamic sizing so the heatmap fills the left panel
  const heatWrapRef = useRef<HTMLDivElement | null>(null);
  const [cell, setCell] = useState(20);

  const labelColW = 130;
  const gap = 6;

  useEffect(() => {
    const el = heatWrapRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      // available space for cells after the label column and a small buffer
      const avail = Math.max(240, w - labelColW - 16);

      // compute a cell size that expands to fill width
      // clamp so it doesn't get ridiculous
      const c = clamp(Math.floor((avail - (n - 1) * gap) / Math.max(1, n)), 18, 34);

      setCell(c);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [n]);

  if (!n) return <div className="text-white/60">No correlation data.</div>;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* Heatmap */}
      <div ref={heatWrapRef} className="min-w-0">
        <div className="overflow-x-auto">
          <div
            className="w-full"
            style={{
              display: "grid",
              gridTemplateColumns: `${labelColW}px repeat(${n}, ${cell}px)`,
              gap,
              alignItems: "center",
              minWidth: "100%",
            }}
          >
            {/* Column labels */}
            <div />
            {view.symbols.map((s) => (
              <div
                key={`c-${s}`}
                className="text-[10px] text-white/55"
                style={{
                  textAlign: "center",
                  lineHeight: 1.1,
                  width: cell,
                }}
              >
                {s}
              </div>
            ))}

            {/* Rows */}
            {view.symbols.map((rowSym, i) => (
              <React.Fragment key={`row-${rowSym}`}>
                <div className="text-[11px] font-semibold text-white/80">{rowSym}</div>

                {view.data[i].map((v, j) => {
                  if (j <= i) {
                    return <div key={`blank-${rowSym}-${j}`} style={{ width: cell, height: cell }} />;
                  }

                  const colSym = view.symbols[j];
                  const isActive =
                    (active?.a === rowSym && active?.b === colSym) ||
                    (active?.a === colSym && active?.b === rowSym);

                  const absV = Math.abs(v);

                  return (
                    <button
                      type="button"
                      key={`cell-${rowSym}-${colSym}`}
                      className={[
                        "block",
                        isActive ? "ring-2 ring-white/60" : "",
                      ].join(" ")}
                      style={{
                        width: cell,
                        height: cell,
                        borderRadius: Math.max(6, Math.floor(cell * 0.28)),
                        background: absCorrColor(v),
                        border: "1px solid rgba(255,255,255,0.10)",
                      }}
                      onMouseEnter={() => setActive({ a: rowSym, b: colSym, v })}
                      onMouseLeave={() => setActive(null)}
                      onClick={() => setActive({ a: rowSym, b: colSym, v })}
                      aria-label={`${rowSym} x ${colSym} corr ${v.toFixed(2)}`}
                      title={`${rowSym} × ${colSym}: ${v.toFixed(2)}`}
                    >
                      {/* optional: add a subtle inner dot for ultra-high correlations */}
                      {absV >= 0.85 ? (
                        <span
                          className="block"
                          style={{
                            width: Math.max(4, Math.floor(cell * 0.22)),
                            height: Math.max(4, Math.floor(cell * 0.22)),
                            margin: "0 auto",
                            borderRadius: 999,
                            background: "rgba(255,255,255,0.35)",
                          }}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-1 text-xs text-white/55">
          <div>
            Upper triangle shown. Color reflects <span className="font-semibold text-white/80">|correlation|</span> (strength).
          </div>
          <div>
            {active ? (
              <>
                Selected:{" "}
                <span className="font-semibold text-white/85">
                  {active.a} × {active.b}
                </span>{" "}
                = <span className="font-mono text-white/85">{active.v.toFixed(2)}</span>
              </>
            ) : (
              <>
                Selected: <span className="text-white/40">none</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right rail */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
          Top correlated pairs
        </div>

        <div className="space-y-2">
          {topPairs.map((p) => (
            <button
              type="button"
              key={`${p.a}-${p.b}`}
              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left hover:bg-white/10"
              onClick={() => setActive({ a: p.a, b: p.b, v: p.v })}
            >
              <div className="min-w-0 truncate text-sm font-semibold text-white/85">
                {p.a} <span className="text-white/45">×</span> {p.b}
              </div>
              <div className="ml-3 font-mono text-sm text-white/80">{p.v.toFixed(2)}</div>
            </button>
          ))}
        </div>

        <div className="text-xs text-white/55">
          Higher |correlation| implies more redundant exposure, especially in Stress.
        </div>
      </div>
    </div>
  );
}
