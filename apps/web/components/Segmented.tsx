"use client";

export function Segmented({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="surface inline-flex rounded-full p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={[
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              active
                ? "bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]"
                : "text-white/70 hover:text-white hover:bg-white/6",
            ].join(" ")}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
