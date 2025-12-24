"use client";

import React, {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Info } from "lucide-react";
import { createPortal } from "react-dom";

type Props = {
  title?: string;
  content: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
};

type Pos = {
  left: number;
  top: number;
  placement: "top" | "bottom" | "left" | "right";
};

function clamp(x: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, x));
}

export function Tooltip({
  title,
  content,
  side = "top",
  className = "",
}: Props) {
  const id = useId();
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);

  useEffect(() => setMounted(true), []);

  // Close on outside click or Esc
  useEffect(() => {
    if (!open) return;

    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (btnRef.current?.contains(t)) return;
      if (tipRef.current?.contains(t)) return;
      setOpen(false);
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Reposition on resize / scroll
  useEffect(() => {
    if (!open) return;

    function onChange() {
      computePosition();
    }

    window.addEventListener("resize", onChange);
    window.addEventListener("scroll", onChange, true);
    return () => {
      window.removeEventListener("resize", onChange);
      window.removeEventListener("scroll", onChange, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, side]);

  function computePosition() {
    const btn = btnRef.current;
    const tip = tipRef.current;
    if (!btn || !tip) return;

    const r = btn.getBoundingClientRect();
    const tw = tip.offsetWidth;
    const th = tip.offsetHeight;

    const pad = 10;
    const gap = 10;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const order: Array<"top" | "bottom" | "left" | "right"> =
      side === "top"
        ? ["top", "bottom", "right", "left"]
        : side === "bottom"
        ? ["bottom", "top", "right", "left"]
        : side === "left"
        ? ["left", "right", "top", "bottom"]
        : ["right", "left", "top", "bottom"];

    function place(p: "top" | "bottom" | "left" | "right"): Pos {
      if (p === "top") {
        return {
          left: r.left + r.width / 2 - tw / 2,
          top: r.top - gap - th,
          placement: "top",
        };
      }
      if (p === "bottom") {
        return {
          left: r.left + r.width / 2 - tw / 2,
          top: r.bottom + gap,
          placement: "bottom",
        };
      }
      if (p === "left") {
        return {
          left: r.left - gap - tw,
          top: r.top + r.height / 2 - th / 2,
          placement: "left",
        };
      }
      return {
        left: r.right + gap,
        top: r.top + r.height / 2 - th / 2,
        placement: "right",
      };
    }

    function fits(p: Pos) {
      return (
        p.left >= pad &&
        p.top >= pad &&
        p.left + tw <= vw - pad &&
        p.top + th <= vh - pad
      );
    }

    let chosen = place(order[0]);
    for (const o of order) {
      const c = place(o);
      if (fits(c)) {
        chosen = c;
        break;
      }
    }

    setPos({
      ...chosen,
      left: clamp(chosen.left, pad, vw - pad - tw),
      top: clamp(chosen.top, pad, vh - pad - th),
    });
  }

  useLayoutEffect(() => {
    if (!open) return;
    computePosition();
    requestAnimationFrame(() => computePosition());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, side]);

  const root = useMemo(() => (mounted ? document.body : null), [mounted]);

  return (
    <span className={`relative inline-flex ${className}`}>
      <button
        ref={btnRef}
        type="button"
        aria-describedby={id}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
      >
        <Info size={16} />
      </button>

      {open && root
        ? createPortal(
            <div
              ref={tipRef}
              id={id}
              role="tooltip"
              className="fixed z-[9999] w-[300px] rounded-2xl border border-white/10 bg-black/75 p-3 text-sm text-white/85 shadow-[0_24px_70px_rgba(0,0,0,0.6)] backdrop-blur-xl"
              style={{
                left: pos?.left ?? -9999,
                top: pos?.top ?? -9999,
              }}
            >
              {title ? (
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-white/60">
                  {title}
                </div>
              ) : null}
              <div className="leading-snug">{content}</div>
            </div>,
            root
          )
        : null}
    </span>
  );
}
