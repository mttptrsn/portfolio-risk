"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

export function SlideOver({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    // prevent background scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const node = useMemo(() => {
    if (!mounted) return null;
    return document.body;
  }, [mounted]);

  if (!open || !node) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
      />

      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-[420px] border-l border-white/10 bg-black/70 shadow-[0_30px_90px_rgba(0,0,0,0.75)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3 border-b border-white/10 p-4">
          <div className="min-w-0">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="h-[calc(100%-64px)] overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>,
    node
  );
}
