export function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div
      style={{
        background: "var(--card2)",
        border: "1px solid var(--stroke)",
        borderRadius: 16,
        padding: 14,
      }}
    >
      <div style={{ fontSize: 12, color: "var(--muted)", letterSpacing: 0.4, textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: 24, marginTop: 8, fontWeight: 650 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}
