export function Pill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 12px",
        borderRadius: 999,
        border: `1px solid ${active ? "rgba(0,180,255,0.55)" : "var(--stroke)"}`,
        background: active ? "rgba(0,180,255,0.16)" : "rgba(255,255,255,0.05)",
        color: "rgba(255,255,255,0.92)",
        cursor: "pointer",
        fontSize: 13,
      }}
    >
      {label}
    </button>
  );
}
