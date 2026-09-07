"use client";

import type { CallStatus } from "@/hooks/useVapi";

interface Props {
  callStatus: CallStatus;
  isMuted: boolean;
  assistantSpeaking?: boolean;
  onStartCall: () => void;
  onStopCall: () => void;
  onToggleMute: () => void;
  onOpenScenario: () => void;
  onToggleTranscript: () => void;
}

export default function BottomDock({
  callStatus,
  isMuted,
  assistantSpeaking = false,
  onStartCall,
  onStopCall,
  onToggleMute,
  onOpenScenario,
  onToggleTranscript,
}: Props) {
  const isActive = callStatus === "active";
  const isConnecting = callStatus === "connecting";

  return (
    <nav
      aria-label="Call controls"
      className="w-full flex justify-center px-2 sm:px-4 pb-3 sm:pb-6 pt-2 shrink-0 z-30"
    >
      <div
        className="flex items-center w-full max-w-[480px] justify-between sm:justify-center"
        style={{
          background: "var(--color-cream)",
          border: "2px solid var(--color-warm-border)",
          boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.7), 3px 3px 0 var(--color-tan), 4px 4px 0 rgba(0,0,0,0.05)",
        }}
      >
        {/* Chat / Transcript Logs */}
        <button
          onClick={onToggleTranscript}
          title="Conversation Log"
          className="flex-1 sm:w-16 h-14 sm:h-16 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-warm-text hover:bg-parchment"
          style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>CHAT</span>
        </button>

        <div style={{ width: 1, background: "var(--color-warm-border)", alignSelf: "stretch" }} />

        {/* Mute Button */}
        <button
          onClick={onToggleMute}
          disabled={!isActive}
          title={isMuted ? "Unmute Mic" : "Mute Mic"}
          className="flex-1 sm:w-16 h-14 sm:h-16 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: isMuted && isActive ? "var(--color-danger)" : "var(--color-warm-text)",
            background: isMuted && isActive ? "rgba(184,64,64,0.08)" : "transparent",
          }}
        >
          {isMuted ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
          <span>{isMuted ? "MUTED" : "MIC"}</span>
        </button>

        <div style={{ width: 1, background: "var(--color-warm-border)", alignSelf: "stretch" }} />

        {/* 1. START CALL BUTTON */}
        <button
          onClick={onStartCall}
          disabled={isActive || isConnecting}
          title="Start voice session"
          className="flex-1.5 sm:w-28 h-14 sm:h-16 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
          style={{
            background: isActive
              ? "rgba(77, 124, 95, 0.12)"
              : isConnecting
              ? "var(--color-amber)"
              : "var(--color-terra)",
            border: isActive ? "2px solid #4D7C5F" : isConnecting ? "2px solid #A07020" : "2px solid #A0522D",
            boxShadow: isActive
              ? "none"
              : "inset 1px 1px 0 rgba(255,255,255,0.25), 2px 2px 0 #7A3E24",
            color: isActive ? "#4D7C5F" : "#FAF8F5",
            cursor: isActive || isConnecting ? "not-allowed" : "pointer",
            fontFamily: "var(--font-mono)",
            opacity: isActive ? 0.6 : 1,
            padding: "0 8px",
          }}
          onMouseDown={(e) => {
            if (!isActive && !isConnecting) (e.currentTarget as HTMLButtonElement).style.transform = "translate(1px, 1px)";
          }}
          onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ""; }}
        >
          {isConnecting ? (
            <>
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <span style={{ fontSize: 9, letterSpacing: "0.06em", fontWeight: 700 }}>CONNECTING</span>
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
              </svg>
              <span style={{ fontSize: 10, letterSpacing: "0.08em", fontWeight: 700 }}>
                {isActive ? "ACTIVE" : "START CALL"}
              </span>
            </>
          )}
        </button>

        <div style={{ width: 1, background: "var(--color-warm-border)", alignSelf: "stretch" }} />

        {/* 2. DEDICATED STOP BUTTON - PERMANENTLY VISIBLE */}
        <button
          onClick={onStopCall}
          id="dock-stop-call-btn"
          title="Stop Call / Silence (Space)"
          className="flex-1.5 sm:w-24 h-14 sm:h-16 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
          style={{
            background: isActive || assistantSpeaking ? "#B84040" : "#A84C4C",
            border: "2px solid #7A2424",
            boxShadow: isActive || assistantSpeaking
              ? "inset 1px 1px 0 rgba(255,255,255,0.3), 2px 2px 0 #541818, 0 0 8px rgba(184,64,64,0.4)"
              : "inset 1px 1px 0 rgba(255,255,255,0.2), 2px 2px 0 #541818",
            color: "#FAF8F5",
            fontFamily: "var(--font-mono)",
            padding: "0 8px",
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translate(1px, 1px)";
          }}
          onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ""; }}
        >
          <div
            className="flex items-center justify-center rounded-xs"
            style={{ width: 16, height: 16, background: "#FAF8F5" }}
          >
            <div style={{ width: 9, height: 9, background: "#B84040" }} />
          </div>
          <span style={{ fontSize: 10, letterSpacing: "0.1em", fontWeight: 800 }}>
            STOP
          </span>
        </button>

        <div style={{ width: 1, background: "var(--color-warm-border)", alignSelf: "stretch" }} />

        {/* Orders Button */}
        <button
          onClick={onOpenScenario}
          title="Active Orders List"
          className="flex-1 sm:w-16 h-14 sm:h-16 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-warm-text hover:bg-parchment"
          style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
          </svg>
          <span>ORDERS</span>
        </button>
      </div>
    </nav>
  );
}
