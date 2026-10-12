// AI provider chain shared by /api/chat and /api/health.
// Every provider speaks the OpenAI-compatible /chat/completions schema.
// Each provider has a list of models; the chat route walks every
// provider/model pair in order until one actually starts answering.

const modelList = (envName, fallback) =>
  (process.env[envName] || fallback).split(",").map(m => m.trim()).filter(Boolean)

export const PROVIDERS = {
  sarvam: {
    endpoint: "https://api.sarvam.ai/v1/chat/completions",
    envKey: "SARVAM_API_KEY",
    models: () => modelList("SARVAM_MODELS", "sarvam-105b-conversations,sarvam-105b"),
    headers: key => ({ "api-subscription-key": key })
  },
  gemini: {
    endpoint: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    envKey: "GEMINI_API_KEY",
    models: () => modelList("GEMINI_MODELS", "gemini-flash-latest,gemini-flash-lite-latest"),
    headers: key => ({ Authorization: `Bearer ${key}` })
  },
  openai: {
    endpoint: "https://api.openai.com/v1/chat/completions",
    envKey: "OPENAI_API_KEY",
    models: () => modelList("OPENAI_MODELS", "gpt-4o-mini"),
    headers: key => ({ Authorization: `Bearer ${key}` })
  }
}

// Every provider/model pair to try, in order: AI_PROVIDER first (if set), then
// Sarvam → Gemini → OpenAI. Only providers with a key configured are included.
export function attemptOrder() {
  const preferred = (process.env.AI_PROVIDER || "").toLowerCase().trim()
  const names = ["sarvam", "gemini", "openai"]
  if (PROVIDERS[preferred]) names.sort((a, b) => (b === preferred) - (a === preferred))
  return names
    .filter(name => process.env[PROVIDERS[name].envKey])
    .flatMap(name => PROVIDERS[name].models().map(model => ({ provider: name, model })))
}

// Parse an OpenAI-style SSE stream into answer-text chunks (reasoning tokens are skipped)
async function* readDeltas(body) {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) return

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop() // hold incomplete last line for next chunk

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith("data: ") || trimmed === "data: [DONE]") continue
      try {
        const delta = JSON.parse(trimmed.slice(6))?.choices?.[0]?.delta?.content
        if (delta) yield delta
      } catch {
        // Malformed SSE chunk — skip silently
      }
    }
  }
}

const STREAM_TIMEOUT_MS = 50000

// Start a streaming completion and wait for the first piece of real answer text.
// A provider that errors, hangs or streams nothing throws here, before anything
// reaches the patient, so the caller can move on to the next one.
export async function startCompletion({ provider, model }, messages, timeoutMs) {
  const config = PROVIDERS[provider]
  const key = process.env[config.envKey].trim()
  const controller = new AbortController()
  let timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(config.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...config.headers(key) },
      body: JSON.stringify({ model, messages, temperature: 0.3, stream: true }),
      signal: controller.signal
    })
    if (!res.ok) {
      const error = new Error(`${res.status} ${(await res.text()).slice(0, 200)}`)
      error.status = res.status
      throw error
    }

    const deltas = readDeltas(res.body)
    const first = await deltas.next()
    if (first.done) throw new Error("empty response")

    // Committed to this provider: give the rest of the answer a longer allowance
    clearTimeout(timer)
    timer = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS)

    return {
      first: first.value,
      rest: deltas,
      cancel: () => {
        clearTimeout(timer)
        controller.abort()
      }
    }
  } catch (error) {
    clearTimeout(timer)
    controller.abort()
    if (error.name === "AbortError") throw new Error(`timed out after ${Math.round(timeoutMs / 1000)}s`)
    throw error
  }
}
