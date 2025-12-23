"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export function PcaScree({ explainedVar }: { explainedVar: number[] }) {
  const rows = explainedVar.slice(0, 20).map((v, i) => {
    const cum = explainedVar.slice(0, i + 1).reduce((a, b) => a + b, 0);
    return { pc: i + 1, explained: v, cum };
  });

  return (
    <div style={{ height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ left: 8, right: 8, top: 10, bottom: 10 }}>
          <XAxis dataKey="pc" tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 11 }} />
          <YAxis tickFormatter={(v) => `${Math.round(v * 100)}%`} tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 11 }} />
          <Tooltip
            formatter={(v: any, name: any) => [
              `${(Number(v) * 100).toFixed(2)}%`,
              name === "cum" ? "Cumulative" : "Explained",
            ]}
            contentStyle={{
              background: "rgba(10,14,24,0.92)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              color: "rgba(255,255,255,0.92)",
            }}
          />
          <Line type="monotone" dataKey="explained" dot={false} />
          <Line type="monotone" dataKey="cum" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
