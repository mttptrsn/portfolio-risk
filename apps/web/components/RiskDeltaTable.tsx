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
<div className="space-y-2">
  {rows.map((r) => (
    <div
      key={r.symbol}
      className="grid grid-cols-[70px_1fr] items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 sm:grid-cols-[70px_1fr_1fr_1fr]"
    >
      {/* Symbol */}
      <div className="font-semibold">{r.symbol}</div>

      {/* Delta (always visible) */}
      <div className="font-semibold">
        {(r.delta >= 0 ? "+" : "") + fmtPct(r.delta)}
        <span className="ml-2 text-xs text-white/60 sm:hidden">Δ risk share</span>
      </div>

      {/* Normal/Stress hidden on mobile */}
      <div className="hidden text-xs text-white/60 sm:block">
        Normal {fmtPct(r.normal)}
      </div>
      <div className="hidden text-xs text-white/60 sm:block">
        Stress {fmtPct(r.stress)}
      </div>
    </div>
  ))}
</div>

  );
}
