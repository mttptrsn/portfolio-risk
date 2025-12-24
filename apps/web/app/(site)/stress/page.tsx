"use client";

import React from "react";
import { useRisk } from "../../../components/RiskProvider";
import { Card } from "../../../components/Card";
import { HelpLabel } from "../../../components/HelpLabel";
import { RiskDeltaTable } from "../../../components/RiskDeltaTable";

export default function StressPage() {
  const { data } = useRisk();

  return (
    <div className="space-y-3">
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card
          className="lg:col-span-2"
          title={
            <HelpLabel
              label="Stress minus normal risk share deltas"
              content={
                <>
                  Stress risk share minus Normal risk share. Positive delta means the asset becomes
                  more important in stress. This is often where “hidden” crowding shows up.
                </>
              }
            />
          }
          right={<span className="text-xs text-white/60">Top 20 movers</span>}
        >
          <RiskDeltaTable
            normal={data.regimes.normal.metrics.assets}
            stress={data.regimes.stress.metrics.assets}
            topN={20}
          />
        </Card>

        <Card
          title={
            <HelpLabel
              label="How to use this page"
              content={
                <>
                  Use deltas to identify which exposures become dangerous when correlations rise.
                  Traders often hedge or reduce the names that expand risk share the most under stress.
                </>
              }
            />
          }
        >
          <ul className="space-y-2 text-sm text-white/75">
            <li>
              <span className="font-semibold text-white/90">Large positive Δ</span> = candidate for hedge
              or resize in adverse regimes.
            </li>
            <li>
              <span className="font-semibold text-white/90">Large negative Δ</span> = tends to diversify
              or “hold up” better in stress.
            </li>
            <li>
              If many equities show positive Δ together, you likely have a single-factor book.
            </li>
          </ul>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card
          title={
            <HelpLabel
              label="Next upgrade"
              content={
                <>
                  The best stress test is not only historical “max realized vol”. Next step is to add
                  custom stress scenarios: correlation shock, vol shock, and factor shocks.
                </>
              }
            />
          }
        >
          <div className="text-sm text-white/75">
            Add scenario types:
            <ul className="mt-2 list-disc space-y-1 pl-5 text-white/70">
              <li>Correlation shock (push corr toward 1)</li>
              <li>Vol shock (scale diagonals)</li>
              <li>Factor shock (PC1 loading shock)</li>
            </ul>
          </div>
        </Card>
      </section>
    </div>
  );
}
