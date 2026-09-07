# 📦 Apex Customer Support — AI Voice Assistant

> **AI-Powered Customer Service Voice Assistant with Real-Time Speech, Live Translation, and 20 Realistic Order Scenarios**  
> Built with **Next.js 15 (React 19)**, **Tailwind CSS**, **FastAPI (Python)**, and **Vapi.ai**.

---

## 🌟 Highlights

- 🎙 **Real-Time Duplex Voice Link**: Ultra-low latency voice streaming with Deepgram Nova-2 transcription, OpenAI GPT-4o-mini reasoning, and ElevenLabs speech synthesis.
- 🌐 **Live Portal Transcription & Translation**: Real-time subtitles of customer speech and assistant responses, with one-click live neural translation into **Español**, **Français**, **Deutsch**, **हिन्दी**, and **日本語**.
- 🛑 **Dedicated Stop Controls**: Prominent, always-visible **`[STOP]`** button in the bottom dock and inside the live dialogue console to halt audio and cancel speech instantly.
- 📦 **20 Realistic Customer Order Scenarios**: Orders #1 through #20 covering:
  - Live Courier Tracking & Same-Day ETAs (Orders #1, #9, #11)
  - In-Transit Status & Expedited Air Shipping (Orders #2, #6, #17)
  - In-Warehouse Pre-Shipment Cancellations & Refunds (Orders #3, #16, #20)
  - Delivered Package Verification & 30-Day Returns (Orders #4, #8, #10, #18, #19)
  - Severe Weather & Freight Transit Delays (Orders #5, #13)
  - Address Incomplete Corrections & Rerouting (Orders #7, #12, #14)
  - Smart Parcel Locker Pin Pickups (Order #15)
- 📱 **Mobile & Cross-Platform Ready**: Dynamic `100dvh` viewport, touch-first responsive controls, and zero CORS errors across local devices and mobile phones.

---

## 🚀 Quick Start & Setup

### 1. Start the Python FastAPI Backend
```bash
cd backend
uv run --with fastapi --with uvicorn --with httpx --with python-dotenv --with pydantic uvicorn main:app --host 0.0.0.0 --port 8000
```
Backend runs on: `http://localhost:8000`

### 2. Start the Next.js Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on:
- Local: `http://localhost:3000`
- Mobile / Local WiFi: `http://192.168.1.7:3000` (or your machine's local IP)

---

## 🔑 Connecting Your Free Vapi AI Key

1. Sign up for free at [https://vapi.ai/](https://vapi.ai/) (includes **$10 free credits**, ~50–100 minutes of voice calls).
2. Go to **"API Keys"** in your Vapi dashboard.
3. Copy:
   - **Public Key** (used by browser for WebRTC voice stream).
   - **Private API Key** (used by backend to automatically provision the assistant).
4. Open the web app at `http://localhost:3000`.
5. Click the **⚙ (Settings)** icon in the top right, paste your keys, and click **"1-Click Auto-Create IRIS in Vapi"**.
6. Click **`[START CALL]`** to begin speaking live!

---

## 📋 Teammate Testing Guide

A complete test matrix with voice prompts and expected assistant responses for all 20 orders is available in [teammate_testing_guide.md](./teammate_testing_guide.md).

---

## 📁 Repository Structure

```
voiceagent/
├── backend/
│   ├── main.py              # FastAPI server, CORS middleware, webhooks & translation
│   ├── order_service.py     # 20 customer order database, tracking, returns & cancellations
│   ├── vapi_manager.py      # Vapi assistant auto-provisioning & system prompt
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── globals.css      # Retro × Claude light styling & design tokens
│   │   ├── layout.tsx       # Fonts, mobile viewport & hydration configuration
│   │   └── page.tsx         # Main customer portal, orb & layout
│   ├── components/
│   │   ├── BottomDock.tsx   # Touch-friendly dock with permanent START & STOP buttons
│   │   ├── CaptionBubble.tsx# Live dialogue console, speech wave & translation
│   │   ├── Drawer.tsx       # Mobile-responsive slide-over drawers
│   │   ├── ScenarioPanel.tsx# 20-order interactive directory with copy test prompts
│   │   ├── SettingsModal.tsx# 1-click Vapi provisioning modal
│   │   ├── TopNav.tsx       # Responsive mobile navigation header
│   │   ├── TranscriptPanel.tsx # Chat log with timestamps & receipts
│   │   └── VoiceOrb.tsx     # Fluid voice canvas animation
│   ├── hooks/
│   │   ├── useVapi.ts       # WebRTC voice link, live transcription & translation
│   │   └── useVoiceOrb.ts   # Audio reactive fluid orb engine
│   └── next.config.ts       # Reverse proxy rewrites & CORS headers
├── teammate_testing_guide.md# 20-scenario testing reference for team testing
└── README.md
```
