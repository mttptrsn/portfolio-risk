export function Card({
  title,
  right,
  children,
  className = "",
}: {
  title?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`surface rounded-2xl p-4 sm:p-5 ${className}`}>
      {(title || right) && (
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>{title}</div>
          <div className="text-xs text-white/60">{right}</div>
        </div>
      )}

      {children}
    </section>
  );
}
