"use client";

import { useEffect, useMemo, useState } from "react";

export function WeightsEditor({
  symbols,
  weights,
  onChange,
  topN = 12,
}: {
  symbols: string[];
  weights: number[];
  onChange: (next: number[]) => void;
  topN?: number;
}) {
  // Freeze the visible order so controls don't reorder while editing
  const [order, setOrder] = useState<number[] | null>(null);

  useEffect(() => {
    // Initialize order once (ranked by current weights)
    if (!order) {
      const idx = symbols.map((_, i) => i);
      idx.sort((a, b) => (weights[b] ?? 0) - (weights[a] ?? 0));
      setOrder(idx.slice(0, topN));
    }
  }, [order, symbols, weights, topN]);

  // If symbols list length changes (new universe), reset ordering
  useEffect(() => {
    if (order && order.some((i) => i >= symbols.length)) {
      setOrder(null);
    }
  }, [symbols.length, order]);

  const rows = useMemo(() => {
    if (!order) return [];
    return order.map((i) => ({
      symbol: symbols[i],
      i,
      w: weights[i] ?? 0,
    }));
  }, [order, symbols, weights]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
          Weight override (local)
        </div>

        <button
          type="button"
          onClick={() => setOrder(null)} // re-rank based on current weights
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/10"
        >
          Resort
        </button>
      </div>

      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.symbol} className="grid grid-cols-[64px_1fr_72px] items-center gap-3">
            <div className="font-semibold">{r.symbol}</div>

            <input
              type="range"
              min={0}
              max={0.25}
              step={0.0025}
              value={r.w}
              onChange={(e) => {
                const next = [...weights];
                next[r.i] = Number(e.target.value);
                onChange(next);
              }}
              className="w-full"
            />

            <input
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={Number(r.w.toFixed(4))}
              onChange={(e) => {
                const next = [...weights];
                next[r.i] = Number(e.target.value);
                onChange(next);
              }}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-white/90"
            />
          </div>
        ))}
      </div>

      <div className="text-xs text-white/60">
        Weights update in-browser only. Covariance is fixed for the selected regime.
      </div>
    </div>
  );
}
