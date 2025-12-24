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
    <section className={`surface rounded-2xl p-4 sm:p-5 ${className}`}>
      {(title || right) && (
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
            {title}
          </div>
          <div className="text-xs text-white/60">{right}</div>
        </div>
      )}
      {children}
    </section>
  );
}
