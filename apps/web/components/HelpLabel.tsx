import { Tooltip } from "./Tooltip";

export function HelpLabel({
  label,
  title,
  content,
}: {
  label: string;
  title?: string;
  content: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
        {label}
      </span>
      <Tooltip title={title ?? label} content={content} />
    </div>
  );
}
