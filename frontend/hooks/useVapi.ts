"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Vapi from "@vapi-ai/web";
import { api } from "@/lib/api";

export type CallStatus = "idle" | "connecting" | "active" | "ending";

export interface TranscriptEntry {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  text: string;
  translatedText?: string;
  timestamp: Date;
  toolName?: string;
  toolData?: Record<string, unknown>;
}

export interface UseVapiReturn {
  callStatus: CallStatus;
  transcript: TranscriptEntry[];
  liveText: string;
  liveRole: "user" | "assistant" | null;
  targetLang: string;
  setTargetLang: (lang: string) => void;
  isMuted: boolean;
  volumeLevel: number;
  assistantSpeaking: boolean;
  publicKey: string;
  assistantId: string;
  startCall: () => Promise<void>;
  endCall: () => void;
  stopSpeaking: () => void;
  toggleMute: () => void;
  sendTextQuery: (query: string) => Promise<void>;
}

let vapiInstance: Vapi | null = null;

export function useVapi(): UseVapiReturn {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([
    {
      id: "sys-0",
      role: "system",
      text: "Customer Support Voice Portal online. Press 'START CALL' or speak to check Order 1, 2, 3, 4, or 5.",
      timestamp: new Date(),
    },
  ]);
  const [liveText, setLiveText] = useState("");
  const [liveRole, setLiveRole] = useState<"user" | "assistant" | null>(null);
  const [targetLang, setTargetLangState] = useState<string>("en");
  const targetLangRef = useRef<string>("en");

  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [assistantSpeaking, setAssistantSpeaking] = useState(false);
  const [publicKey, setPublicKey] = useState("");
  const [assistantId, setAssistantId] = useState("");

  const setTargetLang = useCallback((lang: string) => {
    targetLangRef.current = lang;
    setTargetLangState(lang);

    // If changing language, translate recent non-system entries
    if (lang !== "en") {
      setTranscript((prev) =>
        prev.map((entry) => {
          if (entry.role === "system") return entry;
          api.translate(entry.text, lang)
            .then((res) => {
              if (res.translated_text) {
                setTranscript((cur) =>
                  cur.map((e) => (e.id === entry.id ? { ...e, translatedText: res.translated_text } : e))
                );
              }
            })
            .catch(() => {});
          return entry;
        })
      );
    }
  }, []);

  const addEntry = useCallback(async (entry: Omit<TranscriptEntry, "id" | "timestamp">) => {
    const id = `${Date.now()}-${Math.random()}`;
    const newEntry: TranscriptEntry = {
      ...entry,
      id,
      timestamp: new Date(),
    };

    // Auto-translate if target language is not English
    if (targetLangRef.current !== "en" && entry.role !== "system" && entry.text) {
      try {
        const trans = await api.translate(entry.text, targetLangRef.current);
        if (trans.translated_text) {
          newEntry.translatedText = trans.translated_text;
        }
      } catch (err) {
        console.warn("Translation error:", err);
      }
    }

    setTranscript((prev) => [...prev, newEntry]);
  }, []);

  // Load config from Python backend
  useEffect(() => {
    api.getConfig().then((cfg) => {
      setPublicKey(cfg.public_key || "");
      setAssistantId(cfg.assistant_id || "");
    }).catch(console.error);
  }, []);

  // Initialize Vapi instance when public key is available
  useEffect(() => {
    if (!publicKey) return;
    if (vapiInstance) return;
    try {
      vapiInstance = new Vapi(publicKey);
      attachEvents(vapiInstance);
    } catch (e) {
      console.error("Vapi init error:", e);
    }
  }, [publicKey]); // eslint-disable-line react-hooks/exhaustive-deps

  function attachEvents(vapi: Vapi) {
    vapi.on("call-start", () => {
      setCallStatus("active");
      setLiveRole(null);
      setLiveText("");
      addEntry({ role: "system", text: "Voice link active with IRIS. Start speaking anytime." });
    });

    vapi.on("call-end", () => {
      setCallStatus("idle");
      setAssistantSpeaking(false);
      setVolumeLevel(0);
      setLiveRole(null);
      setLiveText("");
      addEntry({ role: "system", text: "Voice call ended." });
    });

    vapi.on("speech-start", () => {
      setAssistantSpeaking(true);
      setLiveRole("assistant");
    });

    vapi.on("speech-end", () => {
      setAssistantSpeaking(false);
      if (liveRole === "assistant") {
        setLiveRole(null);
        setLiveText("");
      }
    });

    vapi.on("volume-level", (level: number) => {
      setVolumeLevel(level);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vapi.on("message", (msg: any) => {
      if (msg.type === "transcript") {
        const role = msg.role === "user" ? "user" : "assistant";
        if (msg.transcriptType === "partial") {
          setLiveRole(role);
          setLiveText(msg.transcript || "");
        } else if (msg.transcriptType === "final") {
          setLiveRole(null);
          setLiveText("");
          if (msg.transcript?.trim()) {
            addEntry({
              role,
              text: msg.transcript,
            });
          }
        }
      } else if (msg.type === "function-call" || msg.type === "tool-calls") {
        const name = msg.functionCall?.name || msg.toolCalls?.[0]?.function?.name || "tool";
        addEntry({
          role: "tool",
          text: `Action executed: ${name}`,
          toolName: name,
          toolData: msg.functionCall || msg.toolCalls?.[0],
        });
      }
    });

    vapi.on("error", (err: unknown) => {
      console.error("Vapi error:", err);
      setCallStatus("idle");
      setLiveRole(null);
      setLiveText("");
      addEntry({
        role: "system",
        text: `Voice session notification: Check connection or API keys in SYSTEM settings.`,
      });
    });
  }

  const startCall = useCallback(async () => {
    if (!vapiInstance) {
      // Fallback: If no public key is present, activate simulator voice mode
      setCallStatus("active");
      addEntry({
        role: "system",
        text: "Interactive voice session started (Web Audio mode). You can speak queries or click quick test prompts below.",
      });
      return;
    }
    setCallStatus("connecting");
    try {
      if (assistantId) {
        await vapiInstance.start(assistantId);
      } else {
        await vapiInstance.start({
          name: "IRIS - Apex Customer Support",
          firstMessage:
            "Hello! Thank you for calling Apex Customer Support. My name is IRIS. How can I help you with your order today?",
          model: {
            provider: "openai",
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are IRIS, an AI customer service voice assistant for Apex Retail & Delivery. Assist customers with simple order numbers (Order 1, Order 2, Order 3, Order 4, Order 5). Help them check tracking, delivery status, change shipping addresses, or file returns and cancellations. Keep spoken answers concise (1-2 sentences).",
              },
            ],
          },
          voice: {
            provider: "11labs",
            voiceId: "21m00Tcm4TlvDq8ikWAM",
          },
        });
      }
    } catch (err: unknown) {
      console.warn("Vapi start encountered issue, operating in Web Voice mode:", err);
      setCallStatus("active");
      const message = err instanceof Error ? err.message : String(err);
      addEntry({
        role: "system",
        text: `Voice session active. (${message}) You can speak queries or click order prompts below.`,
      });
    }
  }, [assistantId, addEntry]);

  const endCall = useCallback(() => {
    if (vapiInstance) {
      try {
        vapiInstance.stop();
      } catch (e) {
        console.error("Vapi stop error:", e);
      }
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setCallStatus("idle");
    setAssistantSpeaking(false);
    setVolumeLevel(0);
    setLiveRole(null);
    setLiveText("");
    addEntry({ role: "system", text: "⏹ Voice session stopped." });
  }, [addEntry]);

  const stopSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setAssistantSpeaking(false);
    if (liveRole === "assistant") {
      setLiveRole(null);
      setLiveText("");
    }
  }, [liveRole]);

  const toggleMute = useCallback(() => {
    if (!vapiInstance) {
      setIsMuted((prev) => !prev);
      return;
    }
    const next = !isMuted;
    vapiInstance.setMuted(next);
    setIsMuted(next);
  }, [isMuted]);

  const sendTextQuery = useCallback(
    async (query: string) => {
      // Simulate live incoming user speech
      setLiveRole("user");
      setLiveText(query);
      setTimeout(() => {
        setLiveRole(null);
        setLiveText("");
      }, 700);

      addEntry({ role: "user", text: query });
      try {
        const result = await api.simulate(query);
        if (result.action && result.action !== "conversational_triage" && result.tool_data) {
          addEntry({
            role: "tool",
            text: `Tool Executed: ${result.action}`,
            toolName: result.action,
            toolData: result.tool_data,
          });
        }
        addEntry({ role: "assistant", text: result.agent_response });

        if ("speechSynthesis" in window && result.agent_response) {
          window.speechSynthesis.cancel();
          const utt = new SpeechSynthesisUtterance(result.agent_response);
          utt.rate = 1.0;
          utt.pitch = 1.05;
          const voices = window.speechSynthesis.getVoices();
          const v = voices.find(
            (v) =>
              v.lang.startsWith("en") &&
              (v.name.includes("Samantha") || v.name.includes("Google") || v.name.includes("Natural"))
          );
          if (v) utt.voice = v;
          utt.onstart = () => setAssistantSpeaking(true);
          utt.onend = () => setAssistantSpeaking(false);
          window.speechSynthesis.speak(utt);
        }
      } catch (err) {
        addEntry({ role: "system", text: "Backend service unreachable on port 8000." });
      }
    },
    [addEntry]
  );

  return {
    callStatus,
    transcript,
    liveText,
    liveRole,
    targetLang,
    setTargetLang,
    isMuted,
    volumeLevel,
    assistantSpeaking,
    publicKey,
    assistantId,
    startCall,
    endCall,
    stopSpeaking,
    toggleMute,
    sendTextQuery,
  };
}
