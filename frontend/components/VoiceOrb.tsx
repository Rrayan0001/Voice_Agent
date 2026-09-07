"use client";

import { useRef } from "react";
import { useVoiceOrb } from "@/hooks/useVoiceOrb";
import type { CallStatus } from "@/hooks/useVapi";

interface Props {
  callStatus: CallStatus;
  assistantSpeaking: boolean;
  volumeLevel: number;
}

export default function VoiceOrb({ callStatus, assistantSpeaking, volumeLevel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useVoiceOrb(canvasRef, { callStatus, assistantSpeaking, volumeLevel });

  const isActive = callStatus === "active";
  const isConnecting = callStatus === "connecting";

  return (
    <div className="relative flex items-center justify-center scale-80 xs:scale-90 sm:scale-100 origin-center my-[-15px] sm:my-0">
      {/* Outer retro ring frame */}
      <div
        className="absolute rounded-full"
        style={{
          width: 290,
          height: 290,
          border: "2px solid var(--color-warm-border)",
          boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.6), 3px 3px 0 var(--color-tan)",
        }}
      />

      {/* Tick marks ring */}
      <svg
        className="absolute"
        width={310}
        height={310}
        viewBox="0 0 320 320"
        style={{ opacity: 0.35 }}
      >
        {Array.from({ length: 36 }).map((_, i) => {
          const angle = (i * 10 * Math.PI) / 180;
          const r1 = i % 3 === 0 ? 148 : 152;
          const r2 = 158;
          const cx = 160, cy = 160;
          return (
            <line
              key={i}
              x1={cx + Math.cos(angle) * r1}
              y1={cy + Math.sin(angle) * r1}
              x2={cx + Math.cos(angle) * r2}
              y2={cy + Math.sin(angle) * r2}
              stroke="var(--color-warm-mid)"
              strokeWidth={i % 3 === 0 ? 2 : 1}
            />
          );
        })}
      </svg>

      {/* Ripple rings when active */}
      {isActive && (
        <>
          <div
            className="absolute rounded-full animate-ripple"
            style={{
              width: 210,
              height: 210,
              border: "2px solid var(--color-terra)",
              opacity: 0.35,
            }}
          />
          <div
            className="absolute rounded-full animate-ripple"
            style={{
              width: 210,
              height: 210,
              border: "2px solid var(--color-terra)",
              opacity: 0.2,
              animationDelay: "0.5s",
            }}
          />
        </>
      )}

      {/* Canvas orb */}
      <canvas
        ref={canvasRef}
        width={240}
        height={240}
        className="relative z-10"
      />

      {/* Status label inside ring */}
      <div
        className="absolute bottom-[54px] z-20 flex flex-col items-center gap-1"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <span
          className="text-[10px] font-bold tracking-[0.18em] uppercase"
          style={{
            color: isActive && assistantSpeaking
              ? "var(--color-terra)"
              : isActive
              ? "var(--color-amber)"
              : isConnecting
              ? "var(--color-amber)"
              : "var(--color-warm-mid)",
          }}
        >
          {isActive && assistantSpeaking
            ? "● APEX SPEAKING"
            : isActive
            ? "◆ LISTENING"
            : isConnecting
            ? "◌ CONNECTING"
            : "◇ READY"}
        </span>
      </div>
    </div>
  );
}
