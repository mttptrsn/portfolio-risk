export function Card({
  title,
  right,
  children,
  className = "",
}: {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={className}
      style={{
        background: "var(--card)",
        border: "1px solid var(--stroke)",
        borderRadius: 18,
        padding: 16,
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        backdropFilter: "blur(10px)",
      }}
    >
      {(title || right) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 13, letterSpacing: 0.6, color: "var(--muted)", textTransform: "uppercase" }}>
            {title}
          </div>
          <div>{right}</div>
        </div>
      )}
      {children}
    </section>
  );
}
