"use client";

import React from "react";
import { useRisk } from "../../../components/RiskProvider";
import { Card } from "../../../components/Card";
import { HelpLabel } from "../../../components/HelpLabel";
import { CorrHeatmap } from "../../../components/CorrHeatmap";
import { PcaScree } from "../../../components/PcaScree";
import { Pc1Panel } from "../../../components/Pc1Panel";

export default function StructurePage() {
  const { m } = useRisk();

  return (
    <div className="space-y-3">
      {/* Row 1: Heatmap gets the full width */}
      <section className="grid grid-cols-1 gap-3">
        <Card
          title={
            <HelpLabel
              label="Correlation structure"
              content={
                <>
                  Correlation implied by the covariance matrix. Use this to spot crowding and
                  diversification failure. In stress regimes, correlations tend to rise and portfolios
                  behave like fewer independent bets.
                </>
              }
            />
          }
          right={<span className="text-xs text-white/60">Top risk assets</span>}
        >
          {/* give it more vertical room too */}
          <div className="min-h-[520px]">
            <CorrHeatmap corr={m.corr} assets={m.assets} topN={15} />
          </div>
        </Card>
      </section>

      {/* Row 2: PCA (big) + PC1 (small) */}
<section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
  <Card
    className="lg:col-span-2"
    title={
      <HelpLabel
        label="PCA explained variance"
        content={
          <>
            Eigen decomposition of covariance. Explained variance answers: “How many independent
            factors drive this portfolio?” A dominant PC1 indicates a strong common factor.
          </>
        }
      />
    }
    right={<span className="text-xs text-white/60">PC 1–20</span>}
  >
    <PcaScree explainedVar={m.pca?.explainedVar ?? []} />
    <div className="mt-3 text-xs text-white/60">
      Effective bets:{" "}
      <span className="font-semibold text-white/90">
        {m.pca?.effectiveBets?.toFixed?.(2) ?? "N/A"}
      </span>
    </div>
  </Card>

  <Card
    title={
      <HelpLabel
        label="Primary factor exposure (PC1)"
        content={
          <>
            Assets with the largest absolute loadings on PC1. These define the dominant risk factor
            (often the market mode). Use to identify what is truly driving the portfolio.
          </>
        }
      />
    }
    right={<span className="text-xs text-white/60">Top loadings</span>}
  >
    <Pc1Panel rows={m.pca?.pc1TopLoadings ?? []} />
  </Card>
</section>


      {/* Row 3: quick guidance */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card
          title={
            <HelpLabel
              label="How to use this page"
              content={
                <>
                  If correlations are broadly high and PC1 explains a large share of variance, the
                  portfolio is effectively “one trade”. Diversification must come from low-correlation
                  exposures to the dominant factor, not just more tickers.
                </>
              }
            />
          }
        >
          <ul className="space-y-2 text-sm text-white/75">
            <li>
              <span className="font-semibold text-white/90">High corr clusters</span> indicate redundant
              exposures that can draw down together.
            </li>
            <li>
              <span className="font-semibold text-white/90">High PC1</span> means market mode dominates.
            </li>
            <li>
              <span className="font-semibold text-white/90">Low effective bets</span> means fewer
              independent risk sources than holdings imply.
            </li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
