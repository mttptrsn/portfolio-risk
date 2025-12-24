"use client";

export function Pc1Panel({ rows }: { rows: { symbol: string; loading: number }[] }) {
  const top = [...rows].sort((a, b) => Math.abs(b.loading) - Math.abs(a.loading)).slice(0, 12);

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
        Largest absolute loadings
      </div>

      <div className="space-y-2">
        {top.map((r) => (
          <div key={r.symbol} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <div className="font-semibold">{r.symbol}</div>
            <div className="font-mono text-sm text-white/80">
              {(r.loading >= 0 ? "+" : "") + r.loading.toFixed(3)}
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-white/60">
        PC1 is typically the “market mode”, assets moving together.
      </div>
    </div>
  );
}
