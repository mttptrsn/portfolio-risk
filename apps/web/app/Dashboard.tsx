"use client";

import { useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { Card } from "../components/Card";
import { Pill } from "../components/Pill";
import { Kpi } from "../components/Kpi";
import { CorrHeatmap } from "../components/CorrHeatmap";
import { PcaScree } from "../components/PcaScree";
import { RiskDeltaTable } from "../components/RiskDeltaTable";


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

  const rows = useMemo(() => {
    const out = [...(m.assets ?? [])];
    out.sort((a, b) => b.riskShare - a.riskShare);
    return out;
  }, [m.assets]);

  const top25 = rows.slice(0, 25);
  const top1 = rows[0];

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: 22 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
        <div>
          <div style={{ fontSize: 34, fontWeight: 720, letterSpacing: -0.5 }}>Portfolio Risk</div>
          <div style={{ color: "var(--muted)", marginTop: 6 }}>
            As of {data.asOf}. Normal vs stressed risk decomposition.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Pill active={regime === "normal"} label="Normal" onClick={() => setRegime("normal")} />
          <Pill active={regime === "stress"} label="Stress" onClick={() => setRegime("stress")} />
        </div>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 18 }}>
        <Kpi label="Regime" value={regime === "normal" ? "Normal" : "Stress"} sub="Window-based estimate" />
        <Kpi label="Annualized Vol" value={fmtPct(m.portfolio.volAnn)} sub="Shrinkage covariance" />
        <Kpi
          label="Top Risk Share"
          value={top1 ? `${top1.symbol}  ${fmtPct(top1.riskShare)}` : "N/A"}
          sub="Largest contributor"
        />
        <Kpi label="Universe" value={`${m.portfolio.nAssets}`} sub={`Obs: ${m.nObs}`} />
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 12, marginTop: 12 }}>
        <Card title="Risk share by asset" right={<span style={{ color: "var(--muted)", fontSize: 12 }}>Top 25</span>}>
          <div style={{ height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top25} margin={{ left: 8, right: 8, top: 10, bottom: 10 }}>
                <XAxis dataKey="symbol" tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `${Math.round(v * 100)}%`} tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 11 }} />
                <Tooltip
                  formatter={(v: any, _name: any, item: any) => {
                    const r = item?.payload as AssetMetric;
                    return [fmtPct(Number(v)), `w=${fmtPct(r.weight)}  mcr=${r.mcr.toFixed(4)}`];
                  }}
                  contentStyle={{
                    background: "rgba(10,14,24,0.92)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 12,
                    color: "rgba(255,255,255,0.92)",
                  }}
                />
                <Bar dataKey="riskShare" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Top contributors">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rows.slice(0, 10).map((r) => (
              <div
                key={r.symbol}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: 14,
                  border: "1px solid var(--stroke)",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ fontWeight: 650 }}>{r.symbol}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                    weight {fmtPct(r.weight)} , mcr {r.mcr.toFixed(4)}
                  </div>
                </div>
                <div style={{ fontWeight: 700 }}>{fmtPct(r.riskShare)}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>
      <section style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12, marginTop: 12 }}>
        <Card title="Correlation heatmap" right={<span style={{ color: "var(--muted)", fontSize: 12 }}>Top risk assets</span>}>
            <CorrHeatmap corr={m.corr} assets={m.assets} topN={25} />
        </Card>

        <Card
            title="PCA explained variance"
            right={<span style={{ color: "var(--muted)", fontSize: 12 }}>PC 1–20</span>}
        >
            <PcaScree explainedVar={m.pca?.explainedVar ?? []} />
            <div style={{ marginTop: 10, color: "var(--muted)", fontSize: 12 }}>
            Effective bets: <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 650 }}>{m.pca?.effectiveBets?.toFixed?.(2) ?? "N/A"}</span>
            </div>
        </Card>
        </section>

        <section style={{ marginTop: 12 }}>
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
