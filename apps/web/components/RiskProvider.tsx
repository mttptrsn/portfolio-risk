"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { computeDeltas } from "../lib/riskMath";
import { computeRiskFromCov } from "../lib/portfolioRisk";

type AssetMetric = {
  symbol: string;
  weight: number;
  mcr: number;
  riskContrib: number;
  riskShare: number;
};

type RegimeMetrics = {
  nObs: number;
  portfolio: { volAnn: number; nAssets: number; topRiskContributors: AssetMetric[] };
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

type Ctx = {
  data: RiskPayload;
  regime: "normal" | "stress";
  setRegime: (r: "normal" | "stress") => void;

  m: RegimeMetrics;

  baseWeights: number[];
  wOverride: number[] | null;
  setWOverride: (w: number[] | null) => void;

  weights: number[];
  resetWeights: () => void;

  riskView: ReturnType<typeof computeRiskFromCov>;
  rows: Array<{
    symbol: string;
    weight: number;
    mcr: number;
    riskShare: number;
    dRiskShare: number;
  }>;

  normalAssets: AssetMetric[];
  stressAssets: AssetMetric[];
};

const RiskCtx = createContext<Ctx | null>(null);

export function RiskProvider({
  data,
  children,
}: {
  data: RiskPayload;
  children: React.ReactNode;
}) {
  const [regime, setRegimeState] = useState<"normal" | "stress">("normal");
  const [wOverride, setWOverride] = useState<number[] | null>(null);

  const m = data.regimes[regime].metrics;

  const normalAssets = data.regimes.normal.metrics.assets;
  const stressAssets = data.regimes.stress.metrics.assets;

  const deltas = useMemo(
    () => computeDeltas(normalAssets, stressAssets),
    [normalAssets, stressAssets]
  );
  const deltaMap = useMemo(() => new Map(deltas.map((d) => [d.symbol, d])), [deltas]);

  const baseWeights = useMemo(() => m.assets.map((a) => a.weight), [m.assets]);
  const weights = useMemo(() => wOverride ?? baseWeights, [wOverride, baseWeights]);

  const resetWeights = () => setWOverride(null);

  const setRegime = (r: "normal" | "stress") => {
    setRegimeState(r);
    setWOverride(null); // reset scenario weights on regime switch
  };

  const riskView = useMemo(() => {
    return computeRiskFromCov(m.cov.data, weights);
  }, [m.cov.data, weights]);

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

  const value: Ctx = {
    data,
    regime,
    setRegime,

    m,

    baseWeights,
    wOverride,
    setWOverride,

    weights,
    resetWeights,

    riskView,
    rows,

    normalAssets,
    stressAssets,
  };

  return <RiskCtx.Provider value={value}>{children}</RiskCtx.Provider>;
}

export function useRisk() {
  const ctx = useContext(RiskCtx);
  if (!ctx) throw new Error("useRisk must be used within RiskProvider");
  return ctx;
}
