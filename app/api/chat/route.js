import {
  CLINIC_INFO,
  TREATMENT_STAGES,
  SYMPTOM_TRIAGE,
  CLINICAL_OVERVIEW,
  PROCEDURE_GUIDE,
  STAGE_DEEP_DIVE,
  SYMPTOM_REASONING,
  CARE_DEEP_DIVE,
  APPOINTMENT_GUIDE,
  PRICING_CONTEXT,
  ANXIETY_GUIDE
} from '@/lib/clinic-knowledge'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const SARVAM_ENDPOINT = "https://api.sarvam.ai/v1/chat/completions"
const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions"
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"

const baseFallback =
  "Thanks for your question! This assistant provides general guidance only. For case-specific advice, please contact the clinic."
const isDev = process.env.NODE_ENV !== "production"

function buildSystemPrompt(patientStage) {
  const stage = TREATMENT_STAGES[patientStage] || TREATMENT_STAGES.new_patient

  const triageSection = `
SYMPTOM TRIAGE RULES — follow these strictly, they are not suggestions:

These symptoms are NORMAL — reassure the patient:
${SYMPTOM_TRIAGE.normal.map(s => `• ${s}`).join('\n')}

These symptoms should be MONITORED — advise to watch and contact clinic if they worsen:
${SYMPTOM_TRIAGE.monitor.map(s => `• ${s}`).join('\n')}

These require CALLING THE CLINIC TODAY — be firm, not alarmist:
${SYMPTOM_TRIAGE.call_today.map(s => `• ${s}`).join('\n')}
→ Clinic: ${CLINIC_INFO.phone} | WhatsApp: wa.me/${CLINIC_INFO.whatsapp}

These are EMERGENCIES — tell the patient to act immediately:
${SYMPTOM_TRIAGE.emergency.map(s => `• ${s}`).join('\n')}
→ Call ${CLINIC_INFO.phone} right now. Do not wait.`

  return `IDENTITY
You are the AI clinical assistant for ${CLINIC_INFO.name}, Dr. ${CLINIC_INFO.doctor}'s clear aligner clinic in Mumbai. You reason like a thoroughly trained clinic assistant who has studied Dr. ${CLINIC_INFO.doctor}'s protocols in depth. You are not a doctor and must never claim to be.

PATIENT CONTEXT
This patient is: ${stage.label}
${stage.expectations}
Stage tip: ${stage.tip}

CLINICAL KNOWLEDGE
Use the following to reason through patient questions. Do not pattern-match — think through each question using this context and give a genuinely helpful, specific answer.

${CLINICAL_OVERVIEW}

${PROCEDURE_GUIDE}

${STAGE_DEEP_DIVE}

${SYMPTOM_REASONING}

${CARE_DEEP_DIVE}

${APPOINTMENT_GUIDE}

${PRICING_CONTEXT}

${ANXIETY_GUIDE}

${triageSection}

RESPONSE RULES
- Use markdown: **bold** for key points, bullet lists for steps, ## headers only if the response spans multiple distinct topics
- Keep responses concise: 2–4 short paragraphs or an equivalent list. Never write an essay.
- Respond in the same language the patient writes in (Hindi, Marathi, Tamil, etc. — match their language exactly)
- You are an AI assistant — be transparent about this. Never diagnose or prescribe.
- For pricing: never give a number. Explain complexity-based pricing and direct to the clinic for a personalised quote.
- For emergencies: lead immediately with the action (call now / seek help), then explain briefly.
- Clinic contact: ${CLINIC_INFO.name} | ${CLINIC_INFO.phone} | ${CLINIC_INFO.hours} — include only when genuinely relevant.`
}

// All three providers speak the OpenAI-compatible /chat/completions schema
const PROVIDERS = {
  sarvam: {
    endpoint: SARVAM_ENDPOINT,
    envKey: "SARVAM_API_KEY",
    model: () => "sarvam-105b-conversations",
    headers: key => ({ "api-subscription-key": key })
  },
  gemini: {
    endpoint: GEMINI_ENDPOINT,
    envKey: "GEMINI_API_KEY",
    model: () => process.env.GEMINI_MODEL || "gemini-flash-latest",
    headers: key => ({ Authorization: `Bearer ${key}` })
  },
  openai: {
    endpoint: OPENAI_ENDPOINT,
    envKey: "OPENAI_API_KEY",
    model: () => "gpt-4o-mini",
    headers: key => ({ Authorization: `Bearer ${key}` })
  }
}

// Order to try providers in: AI_PROVIDER first (if set), then Sarvam → Gemini → OpenAI.
// Only providers with a key configured are included, so Gemini acts as a backup
// whenever the primary fails (bad key, no credits, outage).
function providerOrder() {
  const preferred = (process.env.AI_PROVIDER || "").toLowerCase().trim()
  const names = ["sarvam", "gemini", "openai"]
  if (PROVIDERS[preferred]) names.sort((a, b) => (b === preferred) - (a === preferred))
  return names.filter(name => process.env[PROVIDERS[name].envKey])
}

const MAX_HISTORY_MESSAGES = 20
const MAX_MESSAGE_CHARS = 2000

export async function POST(request) {
  const limit = checkRateLimit(getClientIp(request))
  if (!limit.allowed) {
    return Response.json(
      { reply: limit.message },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    )
  }

  const { message, messages, patientStage } = await request.json()
  const providers = providerOrder()

  if (!providers.length) {
    const debug = isDev ? " (Debug: set SARVAM_API_KEY, GEMINI_API_KEY or OPENAI_API_KEY)" : ""
    return Response.json({ reply: `${baseFallback}${debug}` })
  }

  const systemPrompt = buildSystemPrompt(patientStage)

  const rawConversation = Array.isArray(messages) && messages.length
    ? messages
        .map(msg => ({ role: msg.role === "assistant" ? "assistant" : "user", content: String(msg.text || msg.content || "").slice(0, MAX_MESSAGE_CHARS) }))
        .filter(msg => msg.content)
        .slice(-MAX_HISTORY_MESSAGES)
    : [{ role: "user", content: String(message || "").slice(0, MAX_MESSAGE_CHARS) }]

  const firstUserIndex = rawConversation.findIndex(msg => msg.role === "user")
  const conversation = firstUserIndex >= 0
    ? rawConversation.slice(firstUserIndex)
    : [{ role: "user", content: String(message || "").slice(0, MAX_MESSAGE_CHARS) }]

  const errors = []
  let upstream = null

  for (const name of providers) {
    const provider = PROVIDERS[name]
    const key = process.env[provider.envKey].trim()
    try {
      const res = await fetch(provider.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...provider.headers(key) },
        body: JSON.stringify({
          model: provider.model(),
          messages: [{ role: "system", content: systemPrompt }, ...conversation],
          temperature: 0.3,
          stream: true
        })
      })
      if (res.ok) {
        upstream = res
        break
      }
      const errorText = await res.text()
      errors.push(`${name}: ${res.status} ${res.statusText} — ${errorText.slice(0, 200)}`)
      console.error(`[chat] ${name} failed with ${res.status}, trying next provider`)
    } catch (error) {
      errors.push(`${name}: ${error.message || "network error"}`)
      console.error(`[chat] ${name} request error: ${error.message}`)
    }
  }

  if (!upstream) {
    const debug = isDev ? ` (Debug: ${errors.join(" | ")})` : ""
    return Response.json({ reply: `${baseFallback}${debug}` })
  }

  try {
    // Proxy the SSE stream, forwarding only the text delta from each chunk
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstream.body.getReader()
        let buffer = ""

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split("\n")
            buffer = lines.pop() // hold incomplete last line for next chunk

            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed || trimmed === "data: [DONE]") continue
              if (!trimmed.startsWith("data: ")) continue

              try {
                const json = JSON.parse(trimmed.slice(6))
                const delta = json?.choices?.[0]?.delta?.content
                if (delta) controller.enqueue(encoder.encode(delta))
              } catch {
                // Malformed SSE chunk — skip silently
              }
            }
          }
        } catch (err) {
          if (isDev) controller.enqueue(encoder.encode(`\n\n[Stream error: ${err.message}]`))
        } finally {
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache"
      }
    })
  } catch (error) {
    const debug = isDev ? ` (Debug: ${error.message || "network error"})` : ""
    return Response.json({ reply: `${baseFallback}${debug}` })
  }
}
