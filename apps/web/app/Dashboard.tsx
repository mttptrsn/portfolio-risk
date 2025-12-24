"use client";

import { useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { Card } from "../components/Card";
import { Segmented } from "@/components/Segmented";
import { Pill } from "../components/Pill";
import { Kpi } from "../components/Kpi";
import { CorrHeatmap } from "../components/CorrHeatmap";
import { PcaScree } from "../components/PcaScree";
import { RiskDeltaTable } from "../components/RiskDeltaTable";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { computeDeltas } from "../lib/riskMath";
import { computeRiskFromCov } from "../lib/portfolioRisk";
import { WeightsEditor } from "../components/WeightsEditor";
import { Pc1Panel } from "../components/Pc1Panel";
import { CartesianGrid } from "recharts";



type AssetMetric = {
  symbol: string;
  weight: number;
  mcr: number;
  riskContrib: number;
  riskShare: number;
};

type RegimeMetrics = {
  nObs: number;
  portfolio: {
    volAnn: number;
    nAssets: number;
    topRiskContributors: AssetMetric[];
  };
  assets: AssetMetric[];
  corr: { symbols: string[]; data: number[][] };
  cov: { symbols: string[]; data: number[][] };
  pca?: {
    eigvals: number[];
    explainedVar: number[];
    effectiveBets: number;
    pc1TopLoadings: { symbol: string; loading: number }[];
};

};

type RiskPayload = {
  version: string;
  asOf: string;
  universe: string[];
  regimes: {
    normal: { window: any; metrics: RegimeMetrics };
    stress: { window: any; metrics: RegimeMetrics };
  };
};

function fmtPct(x: number) {
  return (x * 100).toFixed(2) + "%";
}

export default function Dashboard({ data }: { data: RiskPayload }) {
  const [regime, setRegime] = useState<"normal" | "stress">("normal");
  const m = data.regimes[regime].metrics;

  const normalAssets = data.regimes.normal.metrics.assets;
  const stressAssets = data.regimes.stress.metrics.assets;

  const deltas = useMemo(() => computeDeltas(normalAssets, stressAssets), [normalAssets, stressAssets]);
  const deltaMap = useMemo(() => new Map(deltas.map((d) => [d.symbol, d])), [deltas]);

  const [wOverride, setWOverride] = useState<number[] | null>(null);
  const baseWeights = useMemo(() => m.assets.map((a) => a.weight), [m.assets]);

  const riskView = useMemo(() => {
  const w = wOverride ?? baseWeights;
return computeRiskFromCov(m.cov.data, w);
}, [m.cov.data, baseWeights, wOverride]);


  const deltaBySymbol = useMemo(() => {
  const n = new Map(normalAssets.map(a => [a.symbol, a]));
  const s = new Map(stressAssets.map(a => [a.symbol, a]));
  const out = new Map<string, { dRiskShare: number; dMcr: number }>();

  for (const sym of new Set([...n.keys(), ...s.keys()])) {
    const na = n.get(sym);
    const sa = s.get(sym);
    out.set(sym, {
      dRiskShare: (sa?.riskShare ?? 0) - (na?.riskShare ?? 0),
      dMcr: (sa?.mcr ?? 0) - (na?.mcr ?? 0),
    });
  }
  return out;
}, [normalAssets, stressAssets]);


const rows = useMemo(() => {
  const out = m.assets.map((a, i) => {
    const d = deltaMap.get(a.symbol);
    return {
      symbol: a.symbol,
      weight: riskView.w[i] ?? a.weight,
      mcr: riskView.mcr[i] ?? a.mcr,
      riskShare: riskView.riskShare[i] ?? a.riskShare,
      dRiskShare: d?.dRiskShare ?? 0,
    };
  });
  out.sort((x, y) => y.riskShare - x.riskShare);
  return out;
}, [m.assets, deltaMap, riskView]);


  const top25 = rows.slice(0, 25);
  const top1 = rows[0];


  return (
  <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
    {/* Header */}
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
  <div className="text-3xl font-semibold tracking-tight sm:text-4xl text-white/95">
    Portfolio Risk
  </div>
  <div className="mt-2 text-sm text-white/60">
    As of {data.asOf}. Normal vs stressed risk decomposition.
  </div>
</div>


      <Segmented
  options={[
    { value: "normal", label: "Normal" },
    { value: "stress", label: "Stress" },
  ]}
  value={regime}
  onChange={(v) => {
    setRegime(v as "normal" | "stress");
    setWOverride(null);
  }}
/>

    </header>

    {/* KPI row: 2 cols on mobile, 4 cols on desktop */}
    <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Kpi
        label="Regime"
        value={regime === "normal" ? "Normal" : "Stress"}
        sub="Window-based estimate"
      />
      <Kpi
        label="Annualized Vol"
        value={fmtPct(riskView.volAnn)}
        sub="Shrinkage covariance"
      />
      <Kpi
        label="Top Risk Share"
        value={rows[0] ? `${rows[0].symbol}  ${fmtPct(rows[0].riskShare)}` : "N/A"}
        sub="Largest contributor"
      />
      <Kpi
        label="Universe"
        value={`${m.portfolio.nAssets}`}
        sub={`Obs: ${m.nObs}`}
      />
    </section>

    {/* Main: 1 col mobile, 3 cols desktop */}
    <section className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
      {/* Risk share chart */}
      <Card
        className="lg:col-span-2"
        title="Risk share by asset"
        right={<span className="text-xs text-white/60">Top 25</span>}
      >
        <div className="h-[340px] sm:h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows.slice(0, 25)} margin={{ left: 8, right: 8, top: 10, bottom: 10 }}>
              <XAxis dataKey="symbol" tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.10)" }} tickLine={false} />
<YAxis tickFormatter={(v) => `${Math.round(v * 100)}%`} tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.10)" }} tickLine={false} />

              <Tooltip
                formatter={(v: any, _name: any, item: any) => {
                  const r = item?.payload as any;
                  const d = deltaMap.get(r.symbol)?.dRiskShare ?? 0;
                  const sign = d >= 0 ? "+" : "";
                  return [
                    fmtPct(Number(v)),
                    `w=${fmtPct(r.weight)}  mcr=${Number(r.mcr).toFixed(4)}  Δ=${sign}${fmtPct(d)}`,
                  ];
                }}
                contentStyle={{
                  background: "rgba(10,14,24,0.92)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 12,
                  color: "rgba(255,255,255,0.92)",
                }}
              />
              <Bar dataKey="riskShare" fill="var(--bar)" />
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />


            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top contributors with delta arrows */}
      <Card title="Top contributors" right={<span className="text-xs text-white/60">Δ Stress vs Normal</span>}>
        <div className="space-y-2">
          {rows.slice(0, 10).map((r) => {
            const d = r.dRiskShare;
            const up = d >= 0;
            return (
              <div
                key={r.symbol}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{r.symbol}</div>
                    <div className={up ? "text-emerald-300" : "text-rose-300"}>
                      {up ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    </div>
                    <div className={[
                        "rounded-full px-2 py-1 text-xs font-semibold",
                        up ? "bg-emerald-400/10 text-emerald-200" : "bg-rose-400/10 text-rose-200",
                    ].join(" ")}
                    >
                    {(d >= 0 ? "+" : "") + fmtPct(d)}
                    </div>

                  </div>
                  <div className="mt-1 text-xs text-white/60">
                    weight {fmtPct(r.weight)} , mcr {Number(r.mcr).toFixed(4)}
                  </div>
                </div>

                <div className="font-semibold">{fmtPct(r.riskShare)}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </section>

    {/* Correlation + PCA */}
    <section className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
      <Card
        className="lg:col-span-2"
        title="Correlation heatmap"
        right={<span className="text-xs text-white/60">Top risk assets</span>}
      >
        <CorrHeatmap corr={m.corr} assets={m.assets} topN={25} />
      </Card>

      <Card title="PCA explained variance" right={<span className="text-xs text-white/60">PC 1–20</span>}>
        <PcaScree explainedVar={m.pca?.explainedVar ?? []} />
        <div className="mt-3 text-xs text-white/60">
          Effective bets:{" "}
          <span className="font-semibold text-white/90">
            {m.pca?.effectiveBets?.toFixed?.(2) ?? "N/A"}
          </span>
        </div>
      </Card>
    </section>

    {/* PC1 + Weight override */}
    <section className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
      <Card title="Primary factor exposure (PC1)">
        <Pc1Panel rows={m.pca?.pc1TopLoadings ?? []} />
      </Card>

      <Card
        className="lg:col-span-2"
        title="Weight override"
        right={
          <button
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/10"
            onClick={() => setWOverride(null)}
          >
            Reset
          </button>
        }
      >
        <WeightsEditor
          symbols={m.cov.symbols}
          weights={wOverride ?? baseWeights}
          onChange={(next) => setWOverride(next)}
          topN={12}
        />
      </Card>
    </section>

    {/* Delta table */}
    <section className="mt-4">
      <Card title="Stress minus normal risk share deltas">
        <RiskDeltaTable
          normal={data.regimes.normal.metrics.assets}
          stress={data.regimes.stress.metrics.assets}
          topN={20}
        />
      </Card>
    </section>
  </main>
);

}
