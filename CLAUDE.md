# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Next.js on http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint via next lint
npm run start    # Serve production build
```

There are no tests in this project.

## Environment Variables

Copy `.env.local` (deleted from git) and set at least one AI provider key:

```
SARVAM_API_KEY=...      # Uses sarvam-30b (Indian multilingual model) — primary
GEMINI_API_KEY=...      # Uses gemini-flash-latest (override with GEMINI_MODEL) — free-tier backup
OPENAI_API_KEY=...      # Uses gpt-4o-mini
AI_PROVIDER=sarvam      # which provider to try first — optional
```

Provider logic in `app/api/chat/route.js`: providers with a key are tried in order (AI_PROVIDER first, then Sarvam → Gemini → OpenAI). If one fails (bad key, no credits, outage) the next is tried automatically.

`/api/chat` is rate-limited per IP (10/min, 1000/day) by `lib/rate-limit.js`, in memory and best-effort on serverless. Conversation history is capped at 20 messages × 2000 chars.

## Architecture

This is a Next.js 14 App Router project with no database — all clinic knowledge is hardcoded in `lib/clinic-knowledge.js`.

**Data flow:**
1. `lib/clinic-knowledge.js` — single source of truth for all clinic content: `CLINIC_INFO`, `TREATMENT_STAGES`, `SYMPTOM_TRIAGE`, `CARE_INSTRUCTIONS`, `FAQ_BANK`, `PRICING`. Edit here to change any clinic facts, triage rules, or FAQs.
2. `app/api/chat/route.js` — POST endpoint that builds a system prompt from the knowledge base using `buildSystemPrompt(patientStage)`, then proxies to OpenAI or Sarvam AI. The system prompt is stage-aware: it injects different expectations and tips depending on which of the five patient stages is passed (`new_patient`, `early`, `mid`, `advanced`, `completed`).
3. `app/chat/ChatClient.jsx` — full chat UI (client component). Renders an onboarding screen first to collect `patientStage`, then opens the chat. Sends the full message history on every request (not just the latest message). Includes voice input via the Web Speech API, stage-specific suggested questions, and a language selector (23 Indian languages).
4. `app/page.jsx` — marketing landing page. Imports `CLINIC_INFO` and `WHATSAPP_NUMBER` directly from the knowledge base.
5. `app/components/BookingModal.jsx` — collects name/phone/date/reason, then opens WhatsApp with a pre-filled message. No server-side booking logic.
6. `app/components/BookingButton.jsx` — thin wrapper that toggles `BookingModal`.

**Styling:** Global CSS only (`app/globals.css`). CSS custom properties define the entire design token system (colours, fonts, radii, shadows). No CSS modules or Tailwind. Fonts: Fraunces (display/headings) and Manrope (body). The chat layout uses `.chat-shell` / `.chat-sidebar` / `.chat-main` flex classes; sidebar hides below 960 px.

**AI provider abstraction:** Sarvam, Gemini and OpenAI all use the same OpenAI-compatible `/v1/chat/completions` schema. Per-provider endpoint, auth header and model live in the `PROVIDERS` table in `route.js`.

