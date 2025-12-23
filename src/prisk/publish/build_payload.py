# Payload contract v1.0
# - regimes.{normal,stress}.metrics.assets[*]
# - regimes.{normal,stress}.metrics.portfolio
# - regimes.{normal,stress}.metrics.pca
# - regimes.{normal,stress}.metrics.corr
#
# Frontend depends on this shape. Do not change keys without bumping version.

from __future__ import annotations

import json
from pathlib import Path
from datetime import date

import numpy as np
import pandas as pd
from sklearn.covariance import LedoitWolf

REPO_ROOT = Path(__file__).resolve().parents[3]
PROC_DIR = REPO_ROOT / "data" / "processed"
RETURNS_PATH = PROC_DIR / "log_returns.parquet"
OUT_PATH = PROC_DIR / "risk_payload.json"


def load_returns() -> pd.DataFrame:
    if not RETURNS_PATH.exists():
        raise FileNotFoundError(f"Missing returns file: {RETURNS_PATH}")

    df = pd.read_parquet(RETURNS_PATH)
    if "date" not in df.columns:
        raise ValueError("log_returns.parquet must contain a 'date' column.")

    df["date"] = pd.to_datetime(df["date"])
    df = df.set_index("date").sort_index()

    # Ensure numeric
    for c in df.columns:
        df[c] = pd.to_numeric(df[c], errors="coerce")

    df = df.dropna(how="all")
    return df


def pick_windows(R: pd.DataFrame, n: int = 252, lookback: int = 2520):
    Rlb = R.tail(lookback).dropna(axis=1, how="any")  # strict panel

    if len(Rlb) < n + 5:
        raise ValueError(f"Not enough rows for windows. Have {len(Rlb)}, need {n}.")

    normal = Rlb.tail(n)

    # Stress window = max realized vol of equal-weight proxy
    ew = Rlb.mean(axis=1)
    roll_vol = ew.rolling(n).std() * np.sqrt(252)
    end = roll_vol.idxmax()
    end_loc = Rlb.index.get_loc(end)
    stress = Rlb.iloc[end_loc - n + 1 : end_loc + 1]

    return normal, stress


def corr_from_cov(cov: np.ndarray) -> np.ndarray:
    d = np.sqrt(np.diag(cov))
    denom = np.outer(d, d)
    with np.errstate(divide="ignore", invalid="ignore"):
        corr = cov / denom
    corr[np.isnan(corr)] = 0.0
    corr[np.isinf(corr)] = 0.0
    np.fill_diagonal(corr, 1.0)
    return corr

def pca_from_cov(cov: np.ndarray):
    # Eigen decomposition of covariance (symmetric)
    eigvals, eigvecs = np.linalg.eigh(cov)  # ascending
    idx = np.argsort(eigvals)[::-1]
    eigvals = eigvals[idx]
    eigvecs = eigvecs[:, idx]  # columns are PCs

    total = float(eigvals.sum())
    explained = (eigvals / total) if total > 0 else np.zeros_like(eigvals)

    # Effective number of bets (diversification metric)
    enb = float(1.0 / np.sum(explained**2)) if total > 0 else 0.0

    return eigvals, explained, eigvecs, enb


def regime_metrics(Rwin: pd.DataFrame, w: np.ndarray):
    X = Rwin.values
    symbols = list(Rwin.columns)  # define early, used by PCA + asset table

    lw = LedoitWolf().fit(X)
    cov = lw.covariance_
    corr = corr_from_cov(cov)

    w = w / w.sum()
    port_var = float(w.T @ cov @ w)
    if port_var <= 0:
        raise ValueError("Non-positive portfolio variance from covariance.")
    port_sigma = np.sqrt(port_var)

    vol_ann = float(port_sigma * np.sqrt(252))

    mcr = (cov @ w) / port_sigma
    rc = w * mcr
    rshare = rc / rc.sum()

    assets = [
        {
            "symbol": sym,
            "weight": float(w[i]),
            "mcr": float(mcr[i]),
            "riskContrib": float(rc[i]),
            "riskShare": float(rshare[i]),
        }
        for i, sym in enumerate(symbols)
    ]

    top = sorted(assets, key=lambda a: a["riskShare"], reverse=True)[:10]

    # PCA + effective bets
    eigvals, explained, loadings, enb = pca_from_cov(cov)

    pc1 = loadings[:, 0]
    pc1_load = [{"symbol": symbols[i], "loading": float(pc1[i])} for i in range(len(symbols))]
    pc1_top = sorted(pc1_load, key=lambda x: abs(x["loading"]), reverse=True)[:15]

    return {
        "nObs": int(Rwin.shape[0]),
        "portfolio": {
            "volAnn": float(vol_ann),
            "nAssets": int(len(symbols)),
            "topRiskContributors": top,
        },
        "assets": assets,
        "pca": {
            "eigvals": eigvals.tolist(),
            "explainedVar": explained.tolist(),
            "effectiveBets": float(enb),
            "pc1TopLoadings": pc1_top,
        },
        "cov": {"symbols": symbols, "data": cov.tolist()},
        "corr": {"symbols": symbols, "data": corr.tolist()},
    }




def main():
    R = load_returns()
    n = 252
    lookback = 2520
    Rn, Rs = pick_windows(R, n=n, lookback=lookback)

    symbols = list(Rn.columns)
    w = np.ones(len(symbols), dtype=float)  # equal weight for now

    payload = {
        "version": "1.0",
        "asOf": date.today().isoformat(),
        "universe": symbols,
        "regimes": {
            "normal": {
                "window": {"type": "trailing", "length": n},
                "metrics": regime_metrics(Rn, w),
            },
            "stress": {
                "window": {
                    "type": "max_realized_vol",
                    "length": n,
                    "lookback": lookback,
                    "proxy": "equal_weight",
                },
                "metrics": regime_metrics(Rs, w),
            },
        },
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(payload), encoding="utf-8")
    print(f"Wrote {OUT_PATH}")



if __name__ == "__main__":
    main()
