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

const SARVAM_ENDPOINT = "https://api.sarvam.ai/v1/chat/completions"
const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions"

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

function resolveProvider(sarvamKey, openaiKey) {
  const providerEnv = (process.env.AI_PROVIDER || "").toLowerCase().trim()
  if (providerEnv === "openai") return "openai"
  if (providerEnv === "sarvam") return "sarvam"
  return sarvamKey ? "sarvam" : "openai"
}

export async function POST(request) {
  const { message, messages, patientStage } = await request.json()
  const sarvamKey = process.env.SARVAM_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY

  if (!sarvamKey && !openaiKey) {
    const debug = isDev ? " (Debug: missing OPENAI_API_KEY or SARVAM_API_KEY)" : ""
    return Response.json({ reply: `${baseFallback}${debug}` })
  }

  const provider = resolveProvider(sarvamKey, openaiKey)

  if (provider === "sarvam" && !sarvamKey) {
    const debug = isDev ? " (Debug: AI_PROVIDER=sarvam but SARVAM_API_KEY is missing)" : ""
    return Response.json({ reply: `${baseFallback}${debug}` })
  }
  if (provider === "openai" && !openaiKey) {
    const debug = isDev ? " (Debug: no OPENAI_API_KEY found)" : ""
    return Response.json({ reply: `${baseFallback}${debug}` })
  }

  const systemPrompt = buildSystemPrompt(patientStage)

  const rawConversation = Array.isArray(messages) && messages.length
    ? messages
        .map(msg => ({ role: msg.role === "assistant" ? "assistant" : "user", content: msg.text || msg.content || "" }))
        .filter(msg => msg.content)
    : [{ role: "user", content: message || "" }]

  const firstUserIndex = rawConversation.findIndex(msg => msg.role === "user")
  const conversation = firstUserIndex >= 0
    ? rawConversation.slice(firstUserIndex)
    : [{ role: "user", content: message || "" }]

  const endpoint = provider === "openai" ? OPENAI_ENDPOINT : SARVAM_ENDPOINT
  const activeKey = provider === "openai" ? openaiKey : sarvamKey

  try {
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(provider === "openai"
          ? { Authorization: `Bearer ${openaiKey}` }
          : { "api-subscription-key": sarvamKey })
      },
      body: JSON.stringify({
        model: provider === "openai" ? "gpt-4o-mini" : "sarvam-30b",
        messages: [{ role: "system", content: systemPrompt }, ...conversation],
        temperature: 0.3,
        stream: true
      })
    })

    if (!upstream.ok) {
      const errorText = await upstream.text()
      const debug = isDev
        ? ` (Debug: ${upstream.status} ${upstream.statusText} — ${errorText.slice(0, 200)} | key length: ${String(activeKey).trim().length})`
        : ""
      return Response.json({ reply: `${baseFallback}${debug}` })
    }

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
