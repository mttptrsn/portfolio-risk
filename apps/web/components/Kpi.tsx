import { Tooltip } from "./Tooltip";

export function Kpi({
  label,
  value,
  sub,
  help,
}: {
  label: string;
  value: string;
  sub?: string;
  help?: React.ReactNode;
}) {
  return (
    <div className="surface rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
          {label}
        </div>
        {help ? <Tooltip title={label} content={help} /> : null}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-white/95">{value}</div>
      {sub ? <div className="mt-2 text-xs text-white/55">{sub}</div> : null}
    </div>
  );
}
