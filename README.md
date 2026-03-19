# LessonLens — AI Screen Tutor

**Share your screen. Nova teaches you.**

LessonLens is a real-time AI tutoring platform that watches your screen and teaches you what's visible — code, math, slides, documents, anything. Powered by Google Gemini's multimodal AI.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)

---

## ✨ What is LessonLens?

LessonLens is a screen-aware AI tutoring platform. The main value is **not** generic chat — it's **screen-based tutoring**.

You share your screen, and **Nova** (the AI tutor) watches in real time, explaining code, solving math, summarizing slides, guiding you through documents, and more — with both text and voice.

## 🧠 Meet Nova

Nova is your AI tutor inside LessonLens:
- **Smart** — Understands code, math, slides, websites, diagrams
- **Patient** — Breaks down concepts step by step
- **Adaptive** — Adjusts to beginner, intermediate, or advanced
- **Interactive** — Asks check-in questions, quizzes, and guides
- **Vocal** — Speaks explanations aloud while you work

## 🚀 Features

| Feature | Status |
|---------|--------|
| Premium landing page | ✅ |
| Screen sharing (full screen, window, tab) | ✅ |
| Screen recording with download | ✅ |
| Live AI screen analysis | ✅ |
| Voice tutoring output | ✅ |
| Interactive chat with Nova | ✅ |
| Multiple tutoring modes (Explain, Quiz, Guide, Summarize) | ✅ |
| Difficulty levels (Beginner, Intermediate, Advanced) | ✅ |
| Quick action buttons | ✅ |
| Session memory & context | ✅ |
| Session summary generation | ✅ |
| What Nova sees insight panel | ✅ |
| Session timer | ✅ |
| Voice mute/unmute + speed control | ✅ |
| Collapsible tutor panel | ✅ |
| Status indicators (idle, connecting, analyzing, tutoring, etc.) | ✅ |
| Server-side API key protection | ✅ |
| Dark mode premium UI | ✅ |

## 🏗️ Architecture

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout with fonts & metadata
│   ├── globals.css           # Design system
│   ├── app/
│   │   └── page.tsx          # Main tutoring dashboard
│   └── api/
│       └── tutor/
│           ├── analyze/route.ts   # Screen analysis API (Gemini)
│           ├── chat/route.ts      # Chat API
│           └── summary/route.ts   # Session summary API
├── services/
│   ├── screenCapture.ts      # Screen sharing service
│   ├── screenRecording.ts    # Screen recording service
│   ├── speechOutput.ts       # Voice output (Web Speech API)
│   └── ai/
│       ├── geminiService.ts  # Gemini API client
│       └── promptBuilder.ts  # Nova system prompts
├── hooks/
│   ├── useScreenShare.ts     # Screen sharing hook
│   ├── useScreenRecording.ts # Recording hook
│   ├── useSpeech.ts          # Voice output hook
│   └── useTutor.ts           # Tutoring orchestration hook
├── stores/
│   └── sessionStore.ts       # Zustand state management
├── types/
│   └── index.ts              # TypeScript type definitions
└── lib/
    └── utils.ts              # Utility functions
```

### Key Design Decisions

1. **Server-side API mediation** — The Gemini API key never reaches the browser. All AI calls go through Next.js API routes.
2. **Service abstraction** — Each capability (screen capture, recording, speech, AI) has its own service class with a clean API.
3. **Zustand for state** — Lightweight, type-safe global state without boilerplate.
4. **Intelligent frame sampling** — Frames are captured every 6 seconds (not every frame) to balance latency and API cost.
5. **Prompt engineering** — Nova has specialized prompts for different tutoring modes, difficulty levels, and content types.

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- npm
- A Google Gemini API key

### Installation

```bash
# Navigate to the project
cd lessonlens

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Edit .env.local and add your Gemini API key
# GEMINI_API_KEY=your_key_here

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.
Navigate to [http://localhost:3000/app](http://localhost:3000/app) for the tutoring dashboard.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key for AI tutoring |

## 🖥️ Usage

1. **Visit the app** at `/app`
2. **Click "Start Sharing"** to share your screen
3. **Choose a tutoring mode**: Explain, Quiz Me, Guide Me, or Summarize
4. **Select difficulty**: Beginner, Intermediate, or Advanced
5. **Nova begins tutoring** — watch text responses and hear voice explanations
6. **Ask questions** using the chat input or quick action buttons
7. **Record the session** if you want to review later
8. **Stop sharing** to get a session summary

## 🔮 Future Scaling Plan

The architecture is designed to support:
- **User accounts & auth** (NextAuth.js ready)
- **Session history** (database schema ready)
- **Cloud recording storage** (upload interface prepared)
- **Multiple AI providers** (service abstraction allows swapping)
- **Real-time WebSocket** (upgrade from polling to streaming)
- **Subscription billing** (Stripe-ready route boundaries)
- **Team/classroom plans** (multi-tenant architecture)
- **File upload analysis** (PDFs, images, documents)
- **Subject-specific tutor modes** (custom prompts per domain)
- **Analytics & observability** (hook points in place)

## 📝 Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State**: Zustand
- **AI**: Google Gemini 2.0 Flash (vision + text)
- **Voice**: Web Speech API (SpeechSynthesis)
- **Screen**: getDisplayMedia API
- **Recording**: MediaRecorder API
- **Icons**: Lucide React

## 📄 License

MIT
