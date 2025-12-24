"use client";

import React, { useMemo } from "react";
import { useRisk } from "../../../components/RiskProvider";
import { Card } from "../../../components/Card";
import { HelpLabel } from "../../../components/HelpLabel";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

function fmtPct(x: number) {
  return (x * 100).toFixed(2) + "%";
}

export default function ScenarioPage() {
  const { rows, riskView, m } = useRisk();

  const top = useMemo(() => rows.slice(0, 12), [rows]);
  const topList = useMemo(() => rows.slice(0, 10), [rows]);

  return (
    <div className="space-y-3">
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title={
            <HelpLabel
              label="Scenario risk share"
              content={
                <>
                  Uses your current weights (including overrides) against the regime’s covariance.
                  This shows where risk migrates when you change sizing, without changing the market
                  regime assumptions.
                </>
              }
            />
          }
          right={<span className="text-xs text-white/60">Top 12</span>}
        >
          <div className="h-[340px] sm:h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top} margin={{ left: 8, right: 8, top: 10, bottom: 10 }}>
                <XAxis
                  dataKey="symbol"
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                  height={60}
                  tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.10)" }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `${Math.round(v * 100)}%`}
                  tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.10)" }}
                  tickLine={false}
                />
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
              label="Scenario summary"
              content={
                <>
                  Portfolio volatility is recomputed using the same covariance and your current
                  weights. Use this to quickly sanity check whether your weight changes reduce
                  concentration or just move it around.
                </>
              }
            />
          }
        >
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/60">Annualized vol</div>
              <div className="mt-2 text-3xl font-semibold text-white">{fmtPct(riskView.volAnn)}</div>
              <div className="mt-1 text-xs text-white/60">Recomputed from weights × covariance × weights</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/60">Universe</div>
              <div className="mt-2 text-3xl font-semibold text-white">{m.portfolio.nAssets}</div>
              <div className="mt-1 text-xs text-white/60">Assets in the covariance panel</div>
            </div>

            <div className="text-xs text-white/60">
              Adjust weights via the <span className="font-semibold text-white/80">Weights</span> button in the header.
            </div>
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title={
            <HelpLabel
              label="Top contributors under scenario weights"
              content={
                <>
                  Ranked by risk share after applying your weight overrides. If you reduce one name
                  and another jumps up, you may have simply shifted risk into the next most correlated
                  exposure.
                </>
              }
            />
          }
          right={<span className="text-xs text-white/60">Top 10</span>}
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {topList.map((r) => (
              <div
                key={r.symbol}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-white/90">{r.symbol}</div>
                  <div className="mt-1 text-xs text-white/60">
                    weight {fmtPct(r.weight)} , mcr {Number(r.mcr).toFixed(4)}
                  </div>
                </div>
                <div className="font-semibold text-white/90">{fmtPct(r.riskShare)}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title={
            <HelpLabel
              label="Trader use"
              content={
                <>
                  Common workflow: (1) identify the top 3 risk contributors, (2) size down the one
                  that is redundant, (3) re-check correlation and PC1, (4) repeat until the top
                  contributors are intentionally chosen.
                </>
              }
            />
          }
        >
          <ul className="space-y-2 text-sm text-white/75">
            <li>
              Aim to avoid a single name contributing an outsized share unless it is a deliberate
              view.
            </li>
            <li>
              If vol doesn’t fall after resizing, correlations may be dominating.
            </li>
            <li>
              Watch for “risk popping up” in the next ticker, that signals clustered exposure.
            </li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
