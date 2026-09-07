# Voice Agent Frontend

Modern Next.js 15 (React 19) voice portal featuring a warm **Retro Claude-Light** aesthetic, live bidirectional speech transcription, real-time multilingual translation, and test scenarios.

## Architecture

- **`app/`**: Next.js App Router root layout, styles, and main interactive page (`page.tsx`).
- **`components/`**:
  - `VoiceOrb.tsx`: Organic 3D-styled animated sphere with idle, listening, thinking, and speaking physics.
  - `CaptionBubble.tsx`: Real-time dialogue cards displaying original speech and neural translation into ES, FR, DE, HI, JA.
  - `BottomDock.tsx`: Floating action dock with dedicated **[STOP]** button, microphone mute, language selector, and quick drawer triggers.
  - `ScenarioPanel.tsx`: Interactive sliding drawer with 20 testing scenarios (#1 to #20), search, category filters, and a 1-click **COPY ALL 20 PROMPTS** feature.
  - `TranscriptPanel.tsx`: Full conversation log with copy and export functionality.
  - `SettingsModal.tsx`: Configuration modal for custom Vapi keys and assistant IDs.
  - `TopNav.tsx`: Header bar displaying connection status, audio visualizer levels, and shortcuts.
- **`hooks/useVapi.ts`**: Core voice lifecycle manager wrapping `@vapi-ai/web`, handling audio streams, transcripts, errors, and live translations.
- **`lib/vapiClient.ts`**: Singleton initialization and event dispatching for the Vapi Web SDK.

## Setup & Running

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) or your network IP on mobile.
