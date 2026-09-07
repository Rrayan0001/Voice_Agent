"use client";

import { useEffect, useRef, useCallback } from "react";

interface OrbOptions {
  callStatus: "idle" | "connecting" | "active" | "ending";
  assistantSpeaking: boolean;
  volumeLevel: number;
}

export function useVoiceOrb(canvasRef: React.RefObject<HTMLCanvasElement | null>, options: OrbOptions) {
  const animRef = useRef<number>(0);
  const phaseRef = useRef(0);
  const scaleRef = useRef(1);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const phase = phaseRef.current;
    const { callStatus, assistantSpeaking, volumeLevel } = options;

    ctx.clearRect(0, 0, W, H);

    const isActive = callStatus === "active";
    const isConnecting = callStatus === "connecting";

    // Target scale
    let targetScale = 1;
    if (isConnecting) targetScale = 1 + Math.sin(phase * 3) * 0.07;
    else if (isActive && assistantSpeaking) targetScale = 1.1 + volumeLevel * 0.2 + Math.sin(phase * 7) * 0.04;
    else if (isActive) targetScale = 1.03 + Math.sin(phase * 2) * 0.025 + volumeLevel * 0.1;
    else targetScale = 1 + Math.sin(phase * 0.7) * 0.012;

    scaleRef.current += (targetScale - scaleRef.current) * 0.1;
    const s = scaleRef.current;
    const blobR = 88 * s;

    // ── WARM AMBIENT GLOW ──
    const glowGrad = ctx.createRadialGradient(cx, cy, blobR * 0.3, cx, cy, blobR * 1.8);
    if (isActive && assistantSpeaking) {
      glowGrad.addColorStop(0, "rgba(201,106,63,0.22)");
      glowGrad.addColorStop(0.6, "rgba(201,106,63,0.08)");
      glowGrad.addColorStop(1, "rgba(201,106,63,0)");
    } else if (isActive) {
      glowGrad.addColorStop(0, "rgba(212,149,42,0.18)");
      glowGrad.addColorStop(0.5, "rgba(212,149,42,0.06)");
      glowGrad.addColorStop(1, "rgba(212,149,42,0)");
    } else if (isConnecting) {
      glowGrad.addColorStop(0, "rgba(212,149,42,0.25)");
      glowGrad.addColorStop(1, "rgba(212,149,42,0)");
    } else {
      glowGrad.addColorStop(0, "rgba(160,120,80,0.10)");
      glowGrad.addColorStop(1, "rgba(160,120,80,0)");
    }
    ctx.beginPath();
    ctx.arc(cx, cy, blobR * 1.8, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    // ── FLUID BLOB ──
    const numPoints = 9;
    const noiseAmp = isActive && assistantSpeaking
      ? 16 + volumeLevel * 22
      : isActive
      ? 6 + volumeLevel * 10
      : isConnecting
      ? 9
      : 2.5;

    ctx.beginPath();
    for (let i = 0; i <= numPoints * 2; i++) {
      const angle = (i / (numPoints * 2)) * Math.PI * 2;
      const noise =
        Math.sin(angle * 3 + phase * 2.2) * noiseAmp * 0.55 +
        Math.cos(angle * 2 - phase * 1.6) * noiseAmp * 0.38 +
        Math.sin(angle * 5 + phase * 3.8) * noiseAmp * 0.18;
      const r = blobR + noise;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    // Blob fill — warm terracotta / amber palette
    const blobGrad = ctx.createRadialGradient(cx - blobR * 0.25, cy - blobR * 0.25, 0, cx, cy, blobR * 1.2);
    if (isActive && assistantSpeaking) {
      blobGrad.addColorStop(0, "rgba(232, 137, 93, 0.92)");
      blobGrad.addColorStop(0.45, "rgba(201, 106, 63, 0.85)");
      blobGrad.addColorStop(1, "rgba(160, 80, 40, 0.70)");
    } else if (isActive) {
      blobGrad.addColorStop(0, "rgba(240, 184, 74, 0.88)");
      blobGrad.addColorStop(0.5, "rgba(212, 149, 42, 0.80)");
      blobGrad.addColorStop(1, "rgba(175, 120, 30, 0.65)");
    } else if (isConnecting) {
      blobGrad.addColorStop(0, "rgba(240, 184, 74, 0.75)");
      blobGrad.addColorStop(0.5, "rgba(212, 149, 42, 0.65)");
      blobGrad.addColorStop(1, "rgba(175, 120, 30, 0.50)");
    } else {
      blobGrad.addColorStop(0, "rgba(200, 175, 140, 0.60)");
      blobGrad.addColorStop(0.5, "rgba(175, 150, 115, 0.48)");
      blobGrad.addColorStop(1, "rgba(150, 125, 90, 0.30)");
    }
    ctx.fillStyle = blobGrad;
    ctx.fill();

    // Glossy highlight — warm white
    const highlight = ctx.createRadialGradient(cx - blobR * 0.3, cy - blobR * 0.35, 0, cx, cy, blobR);
    highlight.addColorStop(0, "rgba(255,245,225,0.45)");
    highlight.addColorStop(0.35, "rgba(255,245,225,0.10)");
    highlight.addColorStop(1, "rgba(255,245,225,0)");
    ctx.fillStyle = highlight;
    ctx.fill();

    // ── INNER CROSSHAIR (idle only) ──
    if (callStatus === "idle") {
      ctx.save();
      ctx.strokeStyle = "rgba(160,120,80,0.25)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(cx - blobR * 0.5, cy);
      ctx.lineTo(cx + blobR * 0.5, cy);
      ctx.moveTo(cx, cy - blobR * 0.5);
      ctx.lineTo(cx, cy + blobR * 0.5);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // ── VU-STYLE CONCENTRIC RINGS (speaking) ──
    if (isActive) {
      [0.45, 0.65, 0.85].forEach((frac, i) => {
        const rr = blobR * (1 + frac * ((phase * 0.3 + i * 0.7) % 1));
        const alpha = (1 - frac * ((phase * 0.3 + i * 0.7) % 1)) * (assistantSpeaking ? 0.5 : 0.2);
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.strokeStyle = assistantSpeaking
          ? `rgba(201,106,63,${alpha})`
          : `rgba(212,149,42,${alpha})`;
        ctx.lineWidth = 1.5 - i * 0.3;
        ctx.stroke();
      });
    }

    phaseRef.current += isActive && assistantSpeaking ? 0.065 : isActive ? 0.03 : isConnecting ? 0.05 : 0.01;
    animRef.current = requestAnimationFrame(draw);
  }, [canvasRef, options]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);
}
