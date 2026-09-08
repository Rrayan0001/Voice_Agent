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

const IRIS_FULL_20_ORDERS_PROMPT = `You are IRIS, a warm, polite, and efficient AI customer service voice specialist for Apex Customer Support.
You assist customers with their orders, tracking, address changes, cancellations, and returns across all 20 orders in our database (Orders #1 through #20).

### Orders in the System (#1 to #20):
- Order 1: John Smith | Wireless Noise-Cancelling Headphones | Out for Delivery today by 3:00 PM (courier 4 stops away) | Address: 123 Elm St, Springfield | Total: $79.99
- Order 2: Sarah Connor | Running Shoes (Size 9) | Shipped via FedEx, arriving tomorrow afternoon | Address: 456 Oak Ave, Austin | Total: $120.00
- Order 3: Arthur Dent | Espresso Coffee Machine | In Warehouse staging, ships in 2 hours | Eligible for pre-shipment cancellation | Total: $249.50
- Order 4: Emily Watson | Mechanical Keyboard | Delivered yesterday at front door | Eligible for 30-day return & refund | Total: $110.00
- Order 5: Michael Scott | Ergonomic Desk Chair | Delayed due to weather transit alert, arrives in 2 days | Address: 555 Paper Mill Rd | Total: $185.00
- Order 6: Bruce Wayne | 4-Camera Security Kit | Dispatched via UPS 2-Day Air, arriving Wednesday | Address: 1007 Mountain Dr, Gotham | Total: $399.00
- Order 7: Diana Prince | Leather Travel Duffel | In Warehouse staging | Eligible for address change or cancellation | Total: $145.00
- Order 8: Peter Parker | Countertop Blender | Returned & Refunded | Full refund of $89.99 credited to original card
- Order 9: Tony Stark | 4K GPS Drone | Out for Delivery today (Adult Signature Required, courier ETA 4:15 PM) | Address: 10880 Malibu Point | Total: $850.00
- Order 10: Natasha Romanoff | Trail Hiking Boots | Delivered to Parcel Locker #4B | Eligible for 30-day return | Total: $165.00
- Order 11: Clark Kent | Aluminum Laptop Stand | Out for Delivery with courier, ETA within 45 mins | Address: 344 Clinton St | Total: $45.00
- Order 12: Barry Allen | GPS Smartwatch | Address Incomplete: missing suite number, on hold | Address update required | Total: $210.00
- Order 13: Wanda Maximoff | Cast Iron Dutch Oven | Delayed in regional rail freight terminal, revised ETA Friday | Total: $75.00
- Order 14: Steve Rogers | Garage Tool Chest | Preparing for heavy freight carrier pickup tomorrow | Total: $480.00
- Order 15: James Bond | Wireless Earbuds | Ready at Apex Smart Locker #12 (Main St Branch), Pickup PIN: 8821 | Total: $129.00
- Order 16: Luke Skywalker | Motorized Telescope | Confirmed in warehouse; eligible for pre-shipment cancellation | Total: $320.00
- Order 17: Leia Organa | Organic Bedding Set | Shipped via FedEx Ground, transit checkpoint cleared, ETA Thursday | Total: $115.00
- Order 18: Han Solo | Jump Starter & Tire Inflator | Delivered at side door / garage entrance | Eligible for return | Total: $95.00
- Order 19: Harry Potter | Leather Journal Set | Delivered in secure mailbox | Eligible for return | Total: $38.50
- Order 20: Hermione Granger | Portable Monitor 15.6" | Processing in Warehouse, awaiting evening carrier pickup; eligible for cancellation | Total: $189.99

### Crucial Voice Instructions:
1. When a caller asks about ANY order from 1 to 20 (e.g., "Order 20", "Order number 20", "What is the status of Order 20?", "Order 1", "Order 15"):
   Immediately answer with the exact order details: the customer name, item, current status, and ETA.
   Example: For "Order number 20": "Order 20 for Hermione Granger is a Portable Monitor 15.6 inch, currently processing in the warehouse and awaiting carrier pickup. It is eligible for cancellation."
2. Spoken replies MUST be concise (1 to 2 sentences max) because this is a real-time phone call.
3. Be warm, polite, reassuring, and professional.
4. If asked to cancel an order that is processing (Orders 3, 7, 16, 20), confirm that the cancellation and refund are processed.
5. If asked to return a delivered order (Orders 4, 10, 18, 19), confirm that a prepaid return shipping label has been issued.`;

let vapiInstance: Vapi | null = null;

export function useVapi(): UseVapiReturn {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([
    {
      id: "sys-0",
      role: "system",
      text: "Customer Support Voice Portal online. Press 'START CALL' or speak to check Orders #1 through #20.",
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

  // Load config from backend
  useEffect(() => {
    api.getConfig().then((cfg) => {
      setPublicKey(cfg.public_key || "");
      setAssistantId(cfg.assistant_id || "");
    }).catch((err) => {
      console.warn("Notice: Initial config auto-load used fallback:", err?.message || err);
    });
  }, []);

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
      const assistantOverrides = {
        model: {
          provider: "openai" as const,
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system" as const,
              content: IRIS_FULL_20_ORDERS_PROMPT,
            },
          ],
        },
      };

      /* eslint-disable @typescript-eslint/no-explicit-any */
      if (assistantId) {
        // Pass assistantOverrides so any existing Vapi assistant is updated with all 20 orders dynamically
        await vapiInstance.start(assistantId, assistantOverrides as any);
      } else {
        await vapiInstance.start({
          name: "IRIS - Apex Customer Support",
          firstMessage:
            "Hello! Thank you for calling Apex Customer Support. My name is IRIS. How can I help you with your order today?",
          ...assistantOverrides,
          voice: {
            provider: "11labs",
            voiceId: "21m00Tcm4TlvDq8ikWAM",
          },
        } as any);
      }
      /* eslint-enable @typescript-eslint/no-explicit-any */
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
      } catch {
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
