"use client";

import { useState, useEffect, useRef } from "react";
import type { TranscriptEntry } from "@/hooks/useVapi";

interface Props {
  transcript: TranscriptEntry[];
  onSendQuery: (query: string) => void;
}

const ROLE_CONFIG: Record<string, { label: string; cls: string; prefix: string }> = {
  user:      { label: "YOU",           cls: "msg-user",      prefix: ">" },
  assistant: { label: "APEX SUPPORT",  cls: "msg-assistant", prefix: "◈" },
  system:    { label: "SYSTEM",        cls: "msg-system",    prefix: "•" },
  tool:      { label: "ORDER ACTION",  cls: "msg-tool",      prefix: "✓" },
};

export default function TranscriptPanel({ transcript, onSendQuery }: Props) {
  const [inputVal, setInputVal] = useState("");
  const [mounted, setMounted] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [transcript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    onSendQuery(inputVal.trim());
    setInputVal("");
  };

  const formatTimestamp = (date?: Date) => {
    if (!mounted || !date) return "";
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Feed */}
      <div ref={feedRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
        {transcript.map((entry) => {
          const cfg = ROLE_CONFIG[entry.role] || ROLE_CONFIG.system;
          return (
            <div
              key={entry.id}
              className={`${cfg.cls}`}
              style={{
                padding: "8px 12px",
                border: "1px solid var(--color-warm-border)",
                borderRadius: 0,
              }}
            >
              {/* Header row */}
              <div
                className="flex items-center gap-1.5 mb-1"
                style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}
              >
                <span style={{ color: "var(--color-terra)", fontWeight: 700 }}>
                  {cfg.prefix}
                </span>
                <span style={{ color: "var(--color-warm-text)", fontWeight: 700, letterSpacing: "0.06em" }}>
                  {cfg.label}
                </span>
                <span
                  suppressHydrationWarning
                  style={{ color: "var(--color-warm-mid)", marginLeft: "auto", fontSize: 9 }}
                >
                  {formatTimestamp(entry.timestamp)}
                </span>
              </div>

              {/* Message text */}
              <p
                className="text-xs sm:text-sm leading-relaxed"
                style={{
                  fontFamily: entry.role === "system" ? "var(--font-mono)" : "var(--font-body)",
                  color: "var(--color-ink)",
                  fontSize: entry.role === "system" ? 11 : 13,
                }}
              >
                {entry.text}
              </p>

              {/* Translation line if available */}
              {entry.translatedText && (
                <div
                  className="mt-1 pt-1 border-t text-[11px] font-mono flex items-start gap-1"
                  style={{ borderColor: "rgba(0,0,0,0.06)", color: "var(--color-terra)" }}
                >
                  <span className="font-bold text-[8px] uppercase px-1 bg-terra/10">[TRANSLATION]:</span>
                  <span>{entry.translatedText}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Input Form */}
      <div
        style={{
          borderTop: "2px solid var(--color-warm-border)",
          background: "var(--color-cream)",
          padding: "10px 14px",
        }}
      >
        <form onSubmit={handleSubmit}>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask about Order 1, 2, 3, 4, or 5..."
              className="retro-input flex-1 text-xs sm:text-sm px-3 py-2"
            />
            <button
              type="submit"
              className="retro-btn retro-btn-primary cursor-pointer px-4 text-xs font-bold font-mono"
            >
              SEND
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
