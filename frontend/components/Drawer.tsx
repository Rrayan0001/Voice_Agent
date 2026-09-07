"use client";

import { useEffect, useRef } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function Drawer({ isOpen, onClose, title, subtitle, children }: Props) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: "rgba(46,37,32,0.4)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside
        ref={drawerRef}
        className="drawer-panel fixed top-0 right-0 z-50 h-full flex flex-col w-full sm:max-w-[440px]"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.26s cubic-bezier(0.33, 1, 0.68, 1)",
        }}
      >
        {/* Header */}
        <div
          className="flex-shrink-0 flex items-start justify-between px-4 sm:px-5 py-3.5 sm:py-4"
          style={{
            borderBottom: "2px solid var(--color-warm-border)",
            background: "var(--color-cream)",
            boxShadow: "0 2px 0 var(--color-tan)",
          }}
        >
          <div>
            <div
              className="text-[9px] tracking-[0.15em] uppercase mb-0.5 font-bold"
              style={{ fontFamily: "var(--font-mono)", color: "var(--color-warm-mid)" }}
            >
              APEX CUSTOMER CARE
            </div>
            <h2
              className="text-xs sm:text-sm font-bold tracking-[0.08em] uppercase"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className="text-[10px] sm:text-[11px] mt-0.5"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-warm-text)" }}
              >
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="retro-btn flex items-center gap-1 ml-3 flex-shrink-0 text-xs cursor-pointer"
            style={{ padding: "6px 10px" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            CLOSE
          </button>
        </div>

        {/* Body */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ background: "var(--color-paper)" }}
        >
          {children}
        </div>
      </aside>
    </>
  );
}
