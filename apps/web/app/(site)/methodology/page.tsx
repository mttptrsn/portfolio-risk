"use client";

import React from "react";
import { Card } from "../../../components/Card";
import { HelpLabel } from "../../../components/HelpLabel";

export default function MethodologyPage() {
  return (
    <div className="space-y-6">
      {/* Intro */}
      <Card title="Methodology overview">
        <div className="space-y-3 text-sm text-white/80">
          <p>
            This application decomposes portfolio risk using modern risk attribution techniques.
            The goal is not to forecast returns, but to explain <b>where risk comes from</b>,
            how it behaves under stress, and how portfolio structure changes when weights are adjusted.
          </p>
          <p>
            All outputs are derived from the covariance matrix of asset returns.
            This is a <b>structural risk model</b>, not a pricing or alpha model.
          </p>
        </div>
      </Card>

      {/* Data */}
      <Card
        title={
          <HelpLabel
            label="Data & preprocessing"
            content={
              <>
                Inputs are adjusted close prices. Returns are log returns.
                Cleaning ensures a consistent panel across assets.
              </>
            }
          />
        }
      >
        <ul className="list-disc space-y-2 pl-5 text-sm text-white/80">
          <li>Daily adjusted close prices sourced from Yahoo Finance</li>
          <li>Log returns: ln(Pₜ / Pₜ₋₁)</li>
          <li>Assets with missing data in the window are excluded</li>
          <li>All calculations use a strictly aligned return matrix</li>
        </ul>
      </Card>

      {/* Regimes */}
      <Card
        title={
          <HelpLabel
            label="Normal vs stress regimes"
            content={
              <>
                Risk is evaluated under two regimes to expose changes in diversification.
              </>
            }
          />
        }
      >
        <div className="space-y-3 text-sm text-white/80">
          <p>
            <b>Normal regime</b> uses a trailing 252-day window of returns.
          </p>
          <p>
            <b>Stress regime</b> selects the 252-day window with the highest realized volatility
            (based on an equal-weight proxy) within a longer historical lookback.
          </p>
          <p>
            This allows comparison of portfolio structure under benign versus adverse conditions.
          </p>
        </div>
      </Card>

      {/* Covariance */}
      <Card
        title={
          <HelpLabel
            label="Covariance estimation"
            content={
              <>
                Shrinkage improves stability and reduces estimation error.
              </>
            }
          />
        }
      >
        <div className="space-y-3 text-sm text-white/80">
          <p>
            The covariance matrix is estimated using <b>Ledoit-Wolf shrinkage</b>.
          </p>
          <p>
            Shrinkage blends the sample covariance with a structured target,
            reducing noise when the number of assets is large relative to observations.
          </p>
          <p>
            All downstream risk metrics are derived from this covariance matrix.
          </p>
        </div>
      </Card>

      {/* Portfolio risk */}
      <Card
        title={
          <HelpLabel
            label="Portfolio volatility"
            content={
              <>
                Volatility is a function of weights and covariance.
              </>
            }
          />
        }
      >
        <div className="space-y-3 text-sm text-white/80">
          <p>
            Portfolio variance is computed as:
          </p>
          <pre className="rounded-xl bg-black/40 p-3 text-xs text-white/85">
            σ² = wᵀ Σ w
          </pre>
          <p>
            Annualized volatility is √(σ² × 252).
          </p>
          <p>
            This is a <b>risk estimate</b>, not a forecast.
          </p>
        </div>
      </Card>

      {/* Risk attribution */}
      <Card
        title={
          <HelpLabel
            label="Risk contribution & risk share"
            content={
              <>
                Explains why weights do not equal risk.
              </>
            }
          />
        }
      >
        <div className="space-y-3 text-sm text-white/80">
          <p>
            Marginal contribution to risk (MCR) measures how much total portfolio volatility
            changes with a small increase in an asset’s weight.
          </p>
          <pre className="rounded-xl bg-black/40 p-3 text-xs text-white/85">
            MCRᵢ = (Σ w)ᵢ / σ
          </pre>
          <p>
            Risk contribution:
          </p>
          <pre className="rounded-xl bg-black/40 p-3 text-xs text-white/85">
            RCᵢ = wᵢ × MCRᵢ
          </pre>
          <p>
            Risk share is RCᵢ normalized to sum to 100%.
          </p>
          <p>
            An asset with a small weight can dominate risk if it is volatile
            or highly correlated.
          </p>
        </div>
      </Card>

      {/* Correlation */}
      <Card
        title={
          <HelpLabel
            label="Correlation analysis"
            content={
              <>
                Correlation drives diversification failure.
              </>
            }
          />
        }
      >
        <div className="space-y-3 text-sm text-white/80">
          <p>
            Correlation is derived from the covariance matrix.
          </p>
          <p>
            In stress regimes, correlations typically rise, causing
            portfolios to behave as fewer independent bets.
          </p>
          <p>
            Correlation analysis is most useful for identifying
            <b>crowding and redundancy</b>, not for timing.
          </p>
        </div>
      </Card>

      {/* PCA */}
      <Card
        title={
          <HelpLabel
            label="Principal component analysis (PCA)"
            content={
              <>
                PCA reveals the true dimensionality of risk.
              </>
            }
          />
        }
      >
        <div className="space-y-3 text-sm text-white/80">
          <p>
            PCA performs an eigen-decomposition of the covariance matrix.
          </p>
          <p>
            Eigenvalues represent variance explained by each independent factor.
          </p>
          <p>
            The <b>first principal component (PC1)</b> often corresponds
            to a market-wide or risk-on factor.
          </p>
          <p>
            A high share of variance in PC1 indicates concentration,
            even if the portfolio holds many assets.
          </p>
        </div>
      </Card>

      {/* Effective bets */}
      <Card
        title={
          <HelpLabel
            label="Effective number of bets"
            content={
              <>
                A diversification metric based on PCA.
              </>
            }
          />
        }
      >
        <div className="space-y-3 text-sm text-white/80">
          <p>
            The effective number of bets is computed as:
          </p>
          <pre className="rounded-xl bg-black/40 p-3 text-xs text-white/85">
            N_eff = 1 / Σ (explained varianceᵢ²)
          </pre>
          <p>
            This measures how many independent risk sources
            the portfolio actually has.
          </p>
          <p>
            A portfolio with 50 holdings may have only 5 effective bets.
          </p>
        </div>
      </Card>

      {/* Scenario */}
      <Card
        title={
          <HelpLabel
            label="Weight override scenarios"
            content={
              <>
                Local scenario analysis without changing regime assumptions.
              </>
            }
          />
        }
      >
        <div className="space-y-3 text-sm text-white/80">
          <p>
            Weight overrides allow you to adjust position sizing while holding
            the covariance matrix fixed.
          </p>
          <p>
            This isolates the impact of sizing decisions from changes in market structure.
          </p>
          <p>
            Use this to see whether risk is genuinely reduced
            or merely shifted to the next most correlated asset.
          </p>
        </div>
      </Card>

      {/* Limitations */}
      <Card
        title={
          <HelpLabel
            label="Limitations & interpretation"
            content={
              <>
                This is a risk explanation tool, not a crystal ball.
              </>
            }
          />
        }
      >
        <ul className="list-disc space-y-2 pl-5 text-sm text-white/80">
          <li>No return forecasts or alpha signals</li>
          <li>Assumes covariance stability within a regime</li>
          <li>Historical stress ≠ future stress</li>
          <li>Best used as a complement to judgment, not a replacement</li>
        </ul>
      </Card>
    </div>
  );
}
