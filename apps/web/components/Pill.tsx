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
      className={[
        "rounded-full px-3 py-2 text-sm font-semibold transition",
        "border",
        active
          ? "border-cyan-300/50 bg-cyan-300/15 text-white"
          : "border-white/10 bg-white/5 text-white/85 hover:bg-white/10",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
