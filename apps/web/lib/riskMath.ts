export type AssetMetric = {
  symbol: string;
  weight: number;
  mcr: number;
  riskContrib: number;
  riskShare: number;
};

export function computeDeltas(normal: AssetMetric[], stress: AssetMetric[]) {
  const n = new Map(normal.map((a) => [a.symbol, a]));
  const s = new Map(stress.map((a) => [a.symbol, a]));
  const all = new Set<string>([...n.keys(), ...s.keys()]);

  return Array.from(all).map((symbol) => {
    const na = n.get(symbol);
    const sa = s.get(symbol);
    const nRiskShare = na?.riskShare ?? 0;
    const sRiskShare = sa?.riskShare ?? 0;
    const nMcr = na?.mcr ?? 0;
    const sMcr = sa?.mcr ?? 0;

    return {
      symbol,
      nRiskShare,
      sRiskShare,
      dRiskShare: sRiskShare - nRiskShare,
      nMcr,
      sMcr,
      dMcr: sMcr - nMcr,
    };
  });
}
