"use client";

import React from "react";
import { useRisk } from "../../../components/RiskProvider";
import { Card } from "../../../components/Card";
import { Kpi } from "../../../components/Kpi";
import { HelpLabel } from "../../../components/HelpLabel";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

function fmtPct(x: number) {
  return (x * 100).toFixed(2) + "%";
}

export default function OverviewPage() {
  const { data, regime, m, rows, riskView } = useRisk();

  return (
    <div>
      <section className="mt-2 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Regime" value={regime === "normal" ? "Normal" : "Stress"} sub="Window-based estimate" />
        <Kpi label="Annualized Vol" value={fmtPct(riskView.volAnn)} sub="Shrinkage covariance" />
        <Kpi label="Top Risk Share" value={rows[0] ? `${rows[0].symbol}  ${fmtPct(rows[0].riskShare)}` : "N/A"} sub="Largest contributor" />
        <Kpi label="Universe" value={`${m.portfolio.nAssets}`} sub={`Obs: ${m.nObs}`} />
      </section>

      <section className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title={
            <HelpLabel
              label="Risk share by asset"
              content={<>Bars show each asset’s share of total portfolio risk (variance), computed from marginal contribution to risk.</>}
            />
          }
          right={<span className="text-xs text-white/60">Top 12</span>}
        >
          <div className="h-[340px] sm:h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows.slice(0, 12)} margin={{ left: 8, right: 8, top: 10, bottom: 10 }}>
                <XAxis dataKey="symbol" interval={0} angle={-35} textAnchor="end" height={60} tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.10)" }} tickLine={false} />
                <YAxis tickFormatter={(v) => `${Math.round(v * 100)}%`} tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.10)" }} tickLine={false} />
                <Tooltip
                  formatter={(v: any, _name: any, item: any) => {
                    const r = item?.payload as any;
                    return [fmtPct(Number(v)), `w=${fmtPct(r.weight)}  mcr=${Number(r.mcr).toFixed(4)}`];
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

        <Card
          title={
            <HelpLabel
              label="Top contributors"
              content={
                <>
                  Assets ranked by their share of total portfolio risk. Contribution depends on volatility, correlation, and weight, not capital allocation.
                </>
              }
            />
          }
          right={<span className="text-xs text-white/60">Δ Stress vs Normal</span>}
        >
          <div className="space-y-2">
            {rows.slice(0, 10).map((r) => {
              const d = r.dRiskShare;
              const up = d >= 0;
              return (
                <div key={r.symbol} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{r.symbol}</div>
                      <div className={up ? "text-emerald-300" : "text-rose-300"}>
                        {up ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      </div>
                      <div className={["rounded-full px-2 py-1 text-xs font-semibold", up ? "bg-emerald-400/10 text-emerald-200" : "bg-rose-400/10 text-rose-200"].join(" ")}>
                        {(d >= 0 ? "+" : "") + fmtPct(d)}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-white/60">weight {fmtPct(r.weight)} , mcr {Number(r.mcr).toFixed(4)}</div>
                  </div>
                  <div className="font-semibold">{fmtPct(r.riskShare)}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>
    </div>
  );
}
