"use client";

import React, { useEffect, useState } from "react";
import { fetchLatestRisk } from "../lib/riskFetch";
import { RiskProvider } from "./RiskProvider";

export function RiskApp({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    fetchLatestRisk().then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="mx-auto max-w-6xl px-4 py-10 text-white/70">Loading…</div>;

  return <RiskProvider data={data}>{children}</RiskProvider>;
}
