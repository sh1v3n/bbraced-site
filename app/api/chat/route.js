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
import { attemptOrder, startCompletion } from '@/lib/ai-providers'

export const maxDuration = 60

const unavailableReply =
  `Sorry, the assistant can't answer right now. Please call or WhatsApp the clinic on ${CLINIC_INFO.phone} (${CLINIC_INFO.hours}) and the team will help you directly.`
const cutOffNote =
  `\n\n_(This reply was cut off. Please send your message again, or contact the clinic on ${CLINIC_INFO.phone}.)_`
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
- Always reply in the same language as the patient's latest message. If they write in English, reply only in English. If they write in Hindi, Marathi, Tamil, etc. (or Hinglish), reply in that same language.
- You are an AI assistant — be transparent about this. Never diagnose or prescribe.
- For pricing: never give a number. Explain complexity-based pricing and direct to the clinic for a personalised quote.
- For emergencies: lead immediately with the action (call now / seek help), then explain briefly.
- Clinic contact: ${CLINIC_INFO.name} | ${CLINIC_INFO.phone} | ${CLINIC_INFO.hours} — include only when genuinely relevant.`
}

const MAX_HISTORY_MESSAGES = 20
const MAX_MESSAGE_CHARS = 2000
const ATTEMPT_TIMEOUT_MS = 25000 // per provider/model, until the first words arrive
const TOTAL_BUDGET_MS = 45000    // stop trying new providers after this

export async function POST(request) {
  const limit = checkRateLimit(getClientIp(request))
  if (!limit.allowed) {
    return Response.json(
      { reply: limit.message },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    )
  }

  const { message, messages, patientStage } = await request.json()
  const attempts = attemptOrder()

  if (!attempts.length) {
    const debug = isDev ? " (Debug: set SARVAM_API_KEY, GEMINI_API_KEY or OPENAI_API_KEY)" : ""
    return Response.json({ reply: `${unavailableReply}${debug}` })
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

  const fullMessages = [{ role: "system", content: systemPrompt }, ...conversation]
  const started = Date.now()
  const errors = []
  let completion = null

  // Walk every provider/model until one actually starts answering
  for (const attempt of attempts) {
    const remaining = TOTAL_BUDGET_MS - (Date.now() - started)
    if (remaining < 3000) break
    try {
      completion = await startCompletion(attempt, fullMessages, Math.min(ATTEMPT_TIMEOUT_MS, remaining))
      break
    } catch (error) {
      errors.push(`${attempt.provider}/${attempt.model}: ${error.message}`)
      console.error(`[chat] ${attempt.provider}/${attempt.model} failed (${error.message}), trying next`)
    }
  }

  if (!completion) {
    console.error(`[chat] all providers failed: ${errors.join(" | ")}`)
    const debug = isDev ? ` (Debug: ${errors.join(" | ")})` : ""
    return Response.json({ reply: `${unavailableReply}${debug}` })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(completion.first))
      try {
        for await (const delta of completion.rest) controller.enqueue(encoder.encode(delta))
      } catch (err) {
        console.error(`[chat] stream interrupted: ${err.message}`)
        controller.enqueue(encoder.encode(cutOffNote))
      } finally {
        completion.cancel()
        controller.close()
      }
    },
    cancel() {
      completion.cancel() // patient closed the page or pressed stop
    }
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache"
    }
  })
}
