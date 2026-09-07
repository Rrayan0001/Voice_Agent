"use client";

const METRICS = [
  { value: "72%", label: "Cost Reduction", desc: "From $5–9/call (human) to $0.15–0.25 via Vapi AI." },
  { value: "<500ms", label: "Voice Latency", desc: "Ultra-low turn-taking latency for natural speech interruptions." },
  { value: "∞", label: "Concurrent Calls", desc: "Zero hold queues. Unlimited simultaneous voice sessions." },
  { value: "88%", label: "First-Call Resolution", desc: "Live Python tool-calling resolves issues without agent handoff." },
];

const INDUSTRIES = [
  { icon: "✈", title: "Airlines & Travel", desc: "Re-booking, luggage tracking, delay credits." },
  { icon: "⚕", title: "Healthcare", desc: "Patient intake triage, appointments, prescription refills." },
  { icon: "⬡", title: "Banking", desc: "Instant card freeze, fraud alerts, transfer status." },
  { icon: "⊞", title: "Logistics", desc: "Driver dispatch, missed delivery rescheduling, warehouse intake." },
];

const COMPARISON = [
  { metric: "UX", legacy: "Press 1 for Sales. Wait 45 mins.", vapi: "Natural conversation. Multi-intent speech." },
  { metric: "Actions", legacy: "Passive routing → human handoff.", vapi: "Autonomous Python calls into DB/CRM." },
  { metric: "Interrupts", legacy: "Bot ignores customer.", vapi: "Native end-pointing & natural turns." },
  { metric: "Setup", legacy: "Months of PBX integration.", vapi: "Minutes with WebRTC + Vapi SDK." },
];

export default function BusinessPanel() {
  return (
    <div className="p-4 space-y-5">
      {/* KPI grid */}
      <div>
        <div
          className="text-[9px] tracking-[0.2em] uppercase mb-3"
          style={{ fontFamily: "var(--font-mono)", color: "var(--color-warm-mid)" }}
        >
          ── PERFORMANCE METRICS ──
        </div>
        <div className="grid grid-cols-2 gap-2">
          {METRICS.map((m) => (
            <div
              key={m.label}
              className="retro-card"
              style={{ padding: "14px 16px" }}
            >
              <div
                className="text-2xl font-bold mb-0.5"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-terra)", fontSize: 24 }}
              >
                {m.value}
              </div>
              <div
                className="text-xs font-bold uppercase tracking-wider mb-1"
                style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink)" }}
              >
                {m.label}
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--color-warm-text)" }}>
                {m.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Industries */}
      <div>
        <div
          className="text-[9px] tracking-[0.2em] uppercase mb-3"
          style={{ fontFamily: "var(--font-mono)", color: "var(--color-warm-mid)" }}
        >
          ── ENTERPRISE APPLICATIONS ──
        </div>
        <div className="space-y-2">
          {INDUSTRIES.map((ind) => (
            <div
              key={ind.title}
              className="flex items-start gap-3"
              style={{
                background: "var(--color-cream)",
                border: "1px solid var(--color-warm-border)",
                padding: "10px 14px",
                boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.5)",
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  color: "var(--color-terra)",
                  fontFamily: "var(--font-retro)",
                  flexShrink: 0,
                  lineHeight: 1.4,
                }}
              >
                {ind.icon}
              </span>
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--color-ink)" }}
                >
                  {ind.title}
                </p>
                <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: "var(--color-warm-text)" }}>
                  {ind.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison table */}
      <div>
        <div
          className="text-[9px] tracking-[0.2em] uppercase mb-3"
          style={{ fontFamily: "var(--font-mono)", color: "var(--color-warm-mid)" }}
        >
          ── LEGACY IVR vs. VAPI AGENT ──
        </div>
        <div
          style={{
            border: "2px solid var(--color-warm-border)",
            boxShadow: "2px 2px 0 var(--color-tan)",
          }}
        >
          <div
            className="grid grid-cols-3"
            style={{
              borderBottom: "2px solid var(--color-warm-border)",
              background: "var(--color-parchment)",
              padding: "8px 14px",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fontWeight: 700,
              color: "var(--color-warm-text)",
              letterSpacing: "0.1em",
            }}
          >
            <span>METRIC</span>
            <span>LEGACY IVR</span>
            <span style={{ color: "var(--color-terra)" }}>VAPI + PYTHON</span>
          </div>
          {COMPARISON.map((row, i) => (
            <div
              key={row.metric}
              className="grid grid-cols-3"
              style={{
                borderBottom: i < COMPARISON.length - 1 ? "1px solid var(--color-tan)" : "none",
                background: i % 2 === 0 ? "var(--color-cream)" : "var(--color-paper)",
                padding: "9px 14px",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                alignItems: "start",
                gap: 8,
              }}
            >
              <span style={{ color: "var(--color-ink)", fontWeight: 700 }}>{row.metric}</span>
              <span style={{ color: "var(--color-warm-mid)" }}>{row.legacy}</span>
              <span style={{ color: "var(--color-ink)" }}>{row.vapi}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
