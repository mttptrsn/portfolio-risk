"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { useRisk } from "./RiskProvider";
import { Segmented } from "./Segmented";
import { SlideOver } from "./SlideOver";
import { WeightsEditor } from "./WeightsEditor";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={[
        "rounded-xl px-3 py-2 text-sm font-semibold transition",
        active
          ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]"
          : "text-white/70 hover:bg-white/5 hover:text-white",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export function AppHeader() {
  const { data, regime, setRegime, m, weights, setWOverride, resetWeights, wOverride } = useRisk();
  const [weightsOpen, setWeightsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        {/* Row 1: Title + Actions */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="text-2xl font-semibold tracking-tight text-white">Portfolio Risk</div>
            <div className="mt-1 text-sm text-white/60">
              As of {data.asOf}. Normal vs stressed risk decomposition.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
              onClick={() => setWeightsOpen(true)}
            >
              <SlidersHorizontal size={16} />
              Weights
              {wOverride ? (
                <span className="ml-1 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-200">
                  Active
                </span>
              ) : null}
            </button>

            <Segmented
              options={[
                { value: "normal", label: "Normal" },
                { value: "stress", label: "Stress" },
              ]}
              value={regime}
              onChange={(v) => setRegime(v as "normal" | "stress")}
            />
          </div>
        </div>

        {/* Row 2: Navigation */}
        <div className="mt-3 flex flex-wrap gap-2">
          <NavLink href="/overview" label="Overview" />
          <NavLink href="/structure" label="Structure" />
          <NavLink href="/scenario" label="Scenario" />
          <NavLink href="/stress" label="Stress" />
          <NavLink href="/methodology" label="Methodology" />

        </div>
      </div>

      <SlideOver
        open={weightsOpen}
        onClose={() => setWeightsOpen(false)}
        title={
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white">Weight override</div>
            <div className="mt-1 text-xs text-white/60">
              Applies across all pages. Covariance stays fixed for the selected regime.
            </div>
          </div>
        }
      >
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
            Local scenario weights
          </div>
          <button
            type="button"
            onClick={() => resetWeights()}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10"
          >
            Reset
          </button>
        </div>

        <div className="mt-4">
          <WeightsEditor
            symbols={m.cov.symbols}
            weights={weights}
            onChange={(next) => setWOverride(next)}
            topN={12}
          />
        </div>
      </SlideOver>
    </header>
  );
}
