"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useVapi } from "@/hooks/useVapi";
import TopNav from "@/components/TopNav";
import BottomDock from "@/components/BottomDock";
import CaptionBubble from "@/components/CaptionBubble";
import Drawer from "@/components/Drawer";
import TranscriptPanel from "@/components/TranscriptPanel";
import ScenarioPanel from "@/components/ScenarioPanel";
import SettingsModal from "@/components/SettingsModal";

const VoiceOrb = dynamic(() => import("@/components/VoiceOrb"), { ssr: false });

type DrawerType = "transcript" | "scenario" | null;

export default function HomePage() {
  const {
    callStatus,
    transcript,
    liveText,
    liveRole,
    targetLang,
    setTargetLang,
    isMuted,
    volumeLevel,
    assistantSpeaking,
    startCall,
    endCall,
    stopSpeaking,
    toggleMute,
    sendTextQuery,
  } = useVapi();

  const [openDrawer, setOpenDrawer] = useState<DrawerType>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const toggleDrawer = (type: DrawerType) =>
    setOpenDrawer((prev) => (prev === type ? null : type));

  const handleToggleCall = useCallback(() => {
    if (callStatus === "active" || callStatus === "connecting") {
      endCall();
    } else {
      startCall();
    }
  }, [callStatus, startCall, endCall]);

  // Space shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body && !settingsOpen) {
        e.preventDefault();
        handleToggleCall();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleToggleCall, settingsOpen]);

  const isActive = callStatus === "active";

  return (
    <div
      className="relative flex flex-col h-[100dvh] w-full overflow-hidden select-none paper-texture"
      style={{ background: "var(--color-paper)" }}
    >
      {/* CRT scanlines overlay */}
      <div className="scanlines pointer-events-none" />

      {/* Top Navigation */}
      <TopNav
        callStatus={callStatus}
        assistantSpeaking={assistantSpeaking}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenScenario={() => toggleDrawer("scenario")}
        onToggleTranscript={() => toggleDrawer("transcript")}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-2 sm:px-4">
        {/* Background grid */}
        <div
          className="absolute inset-0 grid-bg pointer-events-none"
          style={{ opacity: 0.4 }}
        />

        {/* Corner measurement marks */}
        {[
          { top: 16, left: 16 },
          { top: 16, right: 16 },
          { bottom: 16, left: 16 },
          { bottom: 16, right: 16 },
        ].map((pos, i) => (
          <div
            key={i}
            className="absolute hidden md:block pointer-events-none"
            style={{
              ...pos,
              width: 18,
              height: 18,
              borderTop: i < 2 ? "2px solid var(--color-warm-border)" : "none",
              borderBottom: i >= 2 ? "2px solid var(--color-warm-border)" : "none",
              borderLeft: i % 2 === 0 ? "2px solid var(--color-warm-border)" : "none",
              borderRight: i % 2 !== 0 ? "2px solid var(--color-warm-border)" : "none",
            }}
          />
        ))}

        {/* Central Voice Unit */}
        <div className="relative z-10 flex flex-col items-center gap-3 sm:gap-6 w-full max-w-full">
          {/* VoiceOrb (scales smoothly on mobile) */}
          <VoiceOrb
            callStatus={callStatus}
            assistantSpeaking={assistantSpeaking}
            volumeLevel={volumeLevel}
          />

          {/* Live Captions / Speech & Translation Display */}
          <CaptionBubble
            callStatus={callStatus}
            assistantSpeaking={assistantSpeaking}
            transcript={transcript}
            liveText={liveText}
            liveRole={liveRole}
            targetLang={targetLang}
            onSetTargetLang={setTargetLang}
            onStopSpeaking={stopSpeaking}
          />
        </div>

        {/* Left Audio VU-meter (Desktop only) */}
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-1 pointer-events-none"
          style={{ opacity: 0.5 }}
        >
          <div
            className="text-[9px] tracking-widest uppercase font-mono text-warm-mid"
            style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }}
          >
            AUDIO LEVEL
          </div>
          <div className="flex gap-1 mt-2">
            {[...Array(6)].map((_, i) => {
              const thresh = i / 6;
              const lit = isActive && volumeLevel > thresh;
              return (
                <div
                  key={i}
                  style={{
                    width: 3,
                    height: 14,
                    background: lit ? "var(--color-terra)" : "var(--color-tan)",
                    border: "1px solid var(--color-warm-border)",
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Right Capability Tags (Desktop only) */}
        <div
          className="absolute right-6 top-1/2 -translate-y-1/2 hidden xl:block space-y-2 text-right pointer-events-none"
          style={{ opacity: 0.45, fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--color-warm-text)" }}
        >
          {["ORDER STATUS #1–#5", "LIVE TRACKING & ETA", "ADDRESS UPDATES", "CANCELLATIONS", "INSTANT RETURNS"].map((line) => (
            <div key={line} className="tracking-[0.1em]">
              {line} •
            </div>
          ))}
        </div>
      </main>

      {/* Bottom Dock with permanent dedicated STOP button */}
      <BottomDock
        callStatus={callStatus}
        isMuted={isMuted}
        assistantSpeaking={assistantSpeaking}
        onStartCall={startCall}
        onStopCall={endCall}
        onToggleMute={toggleMute}
        onOpenScenario={() => toggleDrawer("scenario")}
        onToggleTranscript={() => toggleDrawer("transcript")}
      />

      {/* Drawers */}
      <Drawer
        isOpen={openDrawer === "transcript"}
        onClose={() => setOpenDrawer(null)}
        title="Conversation Log"
        subtitle="Real-time transcript & order receipts"
      >
        <TranscriptPanel transcript={transcript} onSendQuery={sendTextQuery} />
      </Drawer>

      <Drawer
        isOpen={openDrawer === "scenario"}
        onClose={() => setOpenDrawer(null)}
        title="Your Active Orders"
        subtitle="Single-digit order numbers #1 to #5"
      >
        <ScenarioPanel
          onSendQuery={sendTextQuery}
          onClose={() => setOpenDrawer("transcript")}
        />
      </Drawer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onConfigSaved={() => {}}
      />
    </div>
  );
}
