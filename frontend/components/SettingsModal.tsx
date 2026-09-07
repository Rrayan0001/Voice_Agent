"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export default function SettingsModal({ isOpen, onClose, onConfigSaved }: Props) {
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [assistantId, setAssistantId] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    api.getConfig().then((cfg) => {
      setPublicKey(cfg.public_key || "");
      setAssistantId(cfg.assistant_id || "");
    }).catch(() => {});
  }, [isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      await api.saveConfig({ vapi_public_key: publicKey, vapi_private_key: privateKey, assistant_id: assistantId });
      setFeedback({ type: "success", msg: "CONFIG SAVED — Refresh page to apply new Public Key." });
      onConfigSaved();
    } catch (err: unknown) {
      setFeedback({ type: "error", msg: `ERROR: ${err instanceof Error ? err.message : String(err)}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!privateKey) {
      setFeedback({ type: "error", msg: "ERROR: Private Key required to authenticate with Vapi API." });
      return;
    }
    setSyncing(true);
    setFeedback(null);
    try {
      await api.saveConfig({ vapi_public_key: publicKey, vapi_private_key: privateKey });
      const result = await api.setupAssistant();
      setAssistantId(result.assistant_id);
      setFeedback({ type: "success", msg: `IRIS-70B ${result.action.toUpperCase()} — ID: ${result.assistant_id.slice(0, 16)}...` });
      onConfigSaved();
    } catch (err: unknown) {
      setFeedback({ type: "error", msg: `SYNC FAILED: ${err instanceof Error ? err.message : String(err)}` });
    } finally {
      setSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        style={{ background: "rgba(46,37,32,0.45)" }}
        onClick={onClose}
      />

      <div
        className="relative w-full"
        style={{
          maxWidth: 480,
          background: "var(--color-paper)",
          border: "3px solid var(--color-warm-border)",
          boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.7), 6px 6px 0 var(--color-tan), 10px 10px 0 rgba(0,0,0,0.08)",
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{
            borderBottom: "2px solid var(--color-warm-border)",
            background: "var(--color-cream)",
            boxShadow: "0 2px 0 var(--color-tan)",
          }}
        >
          <div>
            <div
              className="text-[9px] tracking-[0.2em] uppercase mb-0.5"
              style={{ fontFamily: "var(--font-mono)", color: "var(--color-warm-mid)" }}
            >
              ── SYSTEM CONFIG ──
            </div>
            <h2
              className="font-bold tracking-wider uppercase"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)", fontSize: 13 }}
            >
              VAPI API CREDENTIALS
            </h2>
          </div>
          <button onClick={onClose} className="retro-btn" style={{ padding: "5px 10px", fontSize: 10 }}>
            ✕ CLOSE
          </button>
        </div>

        {/* Free key guide */}
        <div
          className="mx-5 mt-4"
          style={{
            background: "rgba(201,106,63,0.08)",
            border: "1px solid rgba(201,106,63,0.3)",
            padding: "12px 14px",
          }}
        >
          <div
            className="text-[9px] tracking-[0.15em] uppercase mb-2 font-bold"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-terra)" }}
          >
            ▶ HOW TO GET YOUR FREE VAPI KEY
          </div>
          <ol
            className="space-y-1 text-xs"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-warm-text)", listStyle: "none", paddingLeft: 0 }}
          >
            {[
              <span key={1}>01. Go to <a href="https://vapi.ai" target="_blank" rel="noopener" style={{ color: "var(--color-terra)", textDecoration: "underline" }}>vapi.ai</a> → sign up (free $10 credit)</span>,
              <span key={2}>02. Click <strong style={{ color: "var(--color-ink)" }}>"API Keys"</strong> in the left sidebar</span>,
              <span key={3}>03. Copy <strong style={{ color: "var(--color-ink)" }}>Public Key</strong> and <strong style={{ color: "var(--color-ink)" }}>Private API Key</strong></span>,
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span style={{ color: "var(--color-terra)" }}>›</span>
                {item}
              </li>
            ))}
          </ol>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {[
            { label: "PUBLIC KEY", sublabel: "(required for live voice)", val: publicKey, setter: setPublicKey, ph: "a81d1ca1-225f-4c97-...", type: "text" },
            { label: "PRIVATE API KEY", sublabel: "(for assistant sync)", val: privateKey, setter: setPrivateKey, ph: "sk-...", type: "password" },
            { label: "ASSISTANT ID", sublabel: "(auto-filled after sync)", val: assistantId, setter: setAssistantId, ph: "e596cf19-1893-473c-...", type: "text" },
          ].map((field) => (
            <div key={field.label}>
              <div
                className="flex items-baseline gap-2 mb-1.5"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <label className="text-[11px] font-bold tracking-[0.1em]" style={{ color: "var(--color-ink)" }}>
                  {field.label}
                </label>
                <span className="text-[10px]" style={{ color: "var(--color-warm-mid)" }}>{field.sublabel}</span>
              </div>
              <input
                type={field.type}
                value={field.val}
                onChange={(e) => field.setter(e.target.value)}
                placeholder={field.ph}
                className="retro-input"
                spellCheck={false}
              />
            </div>
          ))}

          {feedback && (
            <div
              className="text-[11px] px-3 py-2.5"
              style={{
                fontFamily: "var(--font-mono)",
                background: feedback.type === "success" ? "rgba(74,124,89,0.1)" : "rgba(184,64,64,0.1)",
                border: `1px solid ${feedback.type === "success" ? "rgba(74,124,89,0.3)" : "rgba(184,64,64,0.3)"}`,
                color: feedback.type === "success" ? "var(--color-success)" : "var(--color-danger)",
              }}
            >
              {feedback.msg}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="retro-btn retro-btn-primary flex-1"
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "SAVING..." : "SAVE CONFIG"}
            </button>
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className="retro-btn flex-1"
              style={{
                opacity: syncing ? 0.6 : 1,
                background: syncing ? "var(--color-parchment)" : "var(--color-cream)",
                color: "var(--color-success)",
                borderColor: "rgba(74,124,89,0.4)",
              }}
            >
              {syncing ? "SYNCING..." : "⚡ AUTO-SYNC IRIS"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
