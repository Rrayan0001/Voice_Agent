"use client";

import type { CallStatus } from "@/hooks/useVapi";

interface Props {
  callStatus: CallStatus;
  assistantSpeaking: boolean;
  onOpenSettings: () => void;
  onOpenScenario: () => void;
  onToggleTranscript: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  idle: { label: "ONLINE", color: "var(--color-warm-mid)", dot: "#A89880" },
  connecting: { label: "CONNECTING", color: "var(--color-amber)", dot: "#D4952A" },
  active: { label: "VOICE ACTIVE", color: "var(--color-success)", dot: "#4A7C59" },
  ending: { label: "ENDING", color: "var(--color-warm-mid)", dot: "#A89880" },
};

export default function TopNav({
  callStatus,
  assistantSpeaking,
  onOpenSettings,
  onOpenScenario,
  onToggleTranscript,
}: Props) {
  const status = STATUS_CONFIG[callStatus] || STATUS_CONFIG.idle;

  return (
    <header
      className="flex items-stretch justify-between w-full select-none"
      style={{
        borderBottom: "2px solid var(--color-warm-border)",
        background: "var(--color-cream)",
        boxShadow: "0 2px 0 var(--color-tan)",
        height: 52,
      }}
    >
      {/* Brand logo & title */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5">
        <div
          className="flex items-center justify-center text-sm sm:text-base font-bold shrink-0"
          style={{
            width: 32,
            height: 32,
            background: "var(--color-terra)",
            color: "var(--color-paper)",
            border: "1.5px solid #A0522D",
            boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.25), 1.5px 1.5px 0 #7A3E24",
          }}
        >
          📦
        </div>
        <div>
          <div
            className="text-xs sm:text-sm font-bold tracking-[0.1em] uppercase leading-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            APEX SUPPORT
          </div>
          <div
            className="text-[9px] sm:text-[10px] tracking-[0.04em] leading-tight hidden xs:block"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-warm-text)" }}
          >
            Customer Care &amp; Orders
          </div>
        </div>
      </div>

      {/* Center Status Pill */}
      <div className="flex items-center gap-1.5 px-2 sm:px-3">
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{
            background: status.dot,
            boxShadow: callStatus === "active" ? "0 0 6px var(--color-success)" : "none",
          }}
        />
        <span
          className="text-[9px] sm:text-[10px] font-bold tracking-[0.1em] uppercase font-mono"
          style={{ color: status.color }}
        >
          {assistantSpeaking ? "SPEAKING" : status.label}
        </span>
      </div>

      {/* Right Navigation Actions */}
      <div className="flex items-stretch">
        {/* Orders button */}
        <button
          onClick={onOpenScenario}
          title="View Your Orders"
          className="flex items-center gap-1 px-3 sm:px-4 text-[10px] font-bold tracking-[0.08em] uppercase transition-all cursor-pointer"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-warm-text)",
            borderLeft: "1px solid var(--color-warm-border)",
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--color-parchment)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--color-terra)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--color-warm-text)";
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
          </svg>
          <span>ORDERS</span>
        </button>

        {/* Chat log button */}
        <button
          onClick={onToggleTranscript}
          title="View Conversation Log"
          className="hidden sm:flex items-center gap-1 px-3 sm:px-4 text-[10px] font-bold tracking-[0.08em] uppercase transition-all cursor-pointer"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-warm-text)",
            borderLeft: "1px solid var(--color-warm-border)",
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--color-parchment)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--color-terra)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--color-warm-text)";
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>CHAT LOG</span>
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          title="Account & Voice Settings"
          className="flex items-center justify-center px-3 sm:px-4 transition-all cursor-pointer"
          style={{
            borderLeft: "1px solid var(--color-warm-border)",
            background: "transparent",
            color: "var(--color-warm-text)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--color-parchment)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--color-terra)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--color-warm-text)";
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
