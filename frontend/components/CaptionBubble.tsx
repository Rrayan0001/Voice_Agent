"use client";

import { useMemo, useState, useEffect } from "react";
import type { CallStatus, TranscriptEntry } from "@/hooks/useVapi";

interface Props {
  callStatus: CallStatus;
  assistantSpeaking: boolean;
  transcript: TranscriptEntry[];
  liveText: string;
  liveRole: "user" | "assistant" | null;
  targetLang: string;
  onSetTargetLang: (lang: string) => void;
  onStopSpeaking: () => void;
}

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "hi", label: "हिन्दी" },
  { code: "ja", label: "日本語" },
];

export default function CaptionBubble({
  callStatus,
  assistantSpeaking,
  transcript,
  liveText,
  liveRole,
  targetLang,
  onSetTargetLang,
  onStopSpeaking,
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isActive = callStatus === "active";
  const isConnecting = callStatus === "connecting";

  // Find latest user entry and latest assistant entry
  const { latestUser, latestAssistant, latestTool } = useMemo(() => {
    let u: TranscriptEntry | null = null;
    let a: TranscriptEntry | null = null;
    let t: TranscriptEntry | null = null;

    for (let i = transcript.length - 1; i >= 0; i--) {
      const e = transcript[i];
      if (!u && e.role === "user") u = e;
      if (!a && e.role === "assistant") a = e;
      if (!t && e.role === "tool") t = e;
      if (u && a) break;
    }
    return { latestUser: u, latestAssistant: a, latestTool: t };
  }, [transcript]);

  const currentUserText = liveRole === "user" ? liveText : latestUser?.text || "";
  const isUserSpeakingNow = liveRole === "user" && Boolean(liveText);
  const currentAssistantText = liveRole === "assistant" && liveText ? liveText : latestAssistant?.text || "";

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
    <div className="w-full flex flex-col items-center gap-2 px-2 sm:px-4 max-w-[620px]">
      {/* Phosphor terminal display console */}
      <div
        className="w-full phosphor-screen transition-all"
        style={{
          border: "2px solid var(--color-warm-border)",
          boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.7), 3px 3px 0 var(--color-tan), 4px 4px 0 rgba(0,0,0,0.05)",
          padding: "12px 14px sm:16px 18px",
          position: "relative",
          background: "var(--color-cream)",
        }}
      >
        {/* Corner glyphs */}
        <span style={{ position: "absolute", top: 4, left: 6, fontSize: 9, color: "var(--color-warm-mid)", fontFamily: "var(--font-mono)", opacity: 0.5 }}>◤</span>
        <span style={{ position: "absolute", top: 4, right: 6, fontSize: 9, color: "var(--color-warm-mid)", fontFamily: "var(--font-mono)", opacity: 0.5 }}>◥</span>
        <span style={{ position: "absolute", bottom: 4, left: 6, fontSize: 9, color: "var(--color-warm-mid)", fontFamily: "var(--font-mono)", opacity: 0.5 }}>◣</span>
        <span style={{ position: "absolute", bottom: 4, right: 6, fontSize: 9, color: "var(--color-warm-mid)", fontFamily: "var(--font-mono)", opacity: 0.5 }}>◢</span>

        {/* Top Header Row: Status + Translation Dropdown + Permanent STOP Button */}
        <div className="flex items-center justify-between border-b pb-2 mb-2.5 gap-2" style={{ borderColor: "var(--color-warm-border)" }}>
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{
                background: isActive ? "var(--color-success)" : isConnecting ? "var(--color-amber)" : "var(--color-warm-mid)",
                boxShadow: isActive ? "0 0 6px rgba(77,124,95,0.6)" : "none",
              }}
            />
            <span
              className="text-[10px] sm:text-[11px] font-bold tracking-[0.08em] uppercase"
              style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink)" }}
            >
              LIVE DIALOGUE
            </span>
          </div>

          {/* Controls: Translation dropdown + Console STOP button */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-mono text-warm-mid uppercase hidden xs:inline">TRANSLATE:</span>
              <select
                value={targetLang}
                onChange={(e) => onSetTargetLang(e.target.value)}
                aria-label="Select translation language"
                className="text-[10px] font-mono px-1 py-0.5 rounded-none cursor-pointer"
                style={{
                  background: "var(--color-parchment)",
                  border: "1px solid var(--color-warm-border)",
                  color: "var(--color-ink)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Permanent STOP button inside console */}
            <button
              onClick={onStopSpeaking}
              id="caption-stop-btn"
              title="Stop speech & audio"
              className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold transition-all cursor-pointer"
              style={{
                background: "#B84040",
                color: "#FFFFFF",
                border: "1px solid #7A2424",
                boxShadow: "1px 1px 0 #541818",
                fontFamily: "var(--font-mono)",
              }}
              onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translate(1px, 1px)"; }}
              onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ""; }}
            >
              <div style={{ width: 7, height: 7, background: "#FFFFFF" }} />
              <span>STOP</span>
            </button>
          </div>
        </div>

        {/* Live Speech Stream Cards */}
        <div className="space-y-2">
          {/* USER SPEECH CARD */}
          <div
            className="p-2 sm:p-2.5 transition-all text-left"
            style={{
              background: isUserSpeakingNow ? "rgba(217,119,87,0.08)" : "var(--color-parchment)",
              border: `1px solid ${isUserSpeakingNow ? "var(--color-terra)" : "var(--color-tan)"}`,
            }}
          >
            <div className="flex items-center justify-between text-[9px] font-mono mb-1" style={{ color: "var(--color-warm-mid)" }}>
              <div className="flex items-center gap-1.5 font-bold">
                <span style={{ color: isUserSpeakingNow ? "var(--color-terra)" : "var(--color-ink)" }}>
                  {isUserSpeakingNow ? "▶ YOU (SPEAKING)" : "YOU"}
                </span>
                {isUserSpeakingNow && (
                  <div className="flex gap-0.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="animate-pulse"
                        style={{ width: 2, height: 8 + i * 2, background: "var(--color-terra)" }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <span suppressHydrationWarning>{formatTimestamp(latestUser?.timestamp)}</span>
            </div>

            <p
              className="text-xs sm:text-sm font-medium leading-snug"
              style={{
                fontFamily: "var(--font-body)",
                color: isUserSpeakingNow ? "var(--color-terra)" : "var(--color-ink)",
              }}
            >
              {currentUserText || (isActive ? "Say 'Check Order 1' or speak your request..." : "Press 'START CALL' below or speak to test.")}
              {isUserSpeakingNow && (
                <span
                  className="inline-block ml-1 animate-blink"
                  style={{ width: 5, height: 11, background: "var(--color-terra)", verticalAlign: "middle" }}
                />
              )}
            </p>

            {/* Translated User text */}
            {targetLang !== "en" && latestUser?.translatedText && (
              <div
                className="mt-1 pt-1 border-t text-[10px] sm:text-[11px] font-mono flex items-start gap-1"
                style={{ borderColor: "rgba(0,0,0,0.06)", color: "var(--color-terra)" }}
              >
                <span className="font-bold uppercase text-[8px] px-1 bg-terra/10">[{targetLang.toUpperCase()}]:</span>
                <span>{latestUser.translatedText}</span>
              </div>
            )}
          </div>

          {/* ASSISTANT SPEECH CARD */}
          <div
            className="p-2 sm:p-2.5 transition-all text-left"
            style={{
              background: assistantSpeaking ? "rgba(217,119,87,0.05)" : "var(--color-cream)",
              border: `1px solid ${assistantSpeaking ? "var(--color-terra)" : "var(--color-warm-border)"}`,
            }}
          >
            <div className="flex items-center justify-between text-[9px] font-mono mb-1" style={{ color: "var(--color-warm-mid)" }}>
              <div className="flex items-center gap-1.5 font-bold">
                <span style={{ color: assistantSpeaking ? "var(--color-terra)" : "var(--color-ink)" }}>
                  {assistantSpeaking ? "▶ APEX SUPPORT (SPEAKING)" : "APEX SUPPORT"}
                </span>
                {assistantSpeaking && (
                  <div className="flex gap-0.5">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="animate-pulse"
                        style={{
                          width: 2.5,
                          height: 9 + (i % 2) * 3,
                          background: "var(--color-terra)",
                          animationDelay: `${i * 120}ms`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <span suppressHydrationWarning>{formatTimestamp(latestAssistant?.timestamp)}</span>
            </div>

            <div
              className="text-xs sm:text-sm leading-relaxed"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-ink)",
                fontWeight: 500,
              }}
            >
              {currentAssistantText ? (
                <span>{currentAssistantText}</span>
              ) : isConnecting ? (
                <span className="italic opacity-60">Connecting voice link...</span>
              ) : (
                <span className="italic opacity-60">Welcome! Ask about Order 1, 2, 3, 4, or 5 to check status, change delivery address, or request returns.</span>
              )}
              {assistantSpeaking && (
                <span
                  className="inline-block ml-1 animate-blink"
                  style={{ width: 5, height: 11, background: "var(--color-terra)", verticalAlign: "middle" }}
                />
              )}
            </div>

            {/* Translated Assistant response */}
            {targetLang !== "en" && latestAssistant?.translatedText && (
              <div
                className="mt-1.5 pt-1 border-t text-[10px] sm:text-[11px] font-mono flex items-start gap-1"
                style={{ borderColor: "rgba(0,0,0,0.06)", color: "var(--color-terra)" }}
              >
                <span className="font-bold uppercase text-[8px] px-1 bg-terra/10">[{targetLang.toUpperCase()}]:</span>
                <span>{latestAssistant.translatedText}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
