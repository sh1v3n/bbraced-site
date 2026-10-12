// Simple in-memory, per-IP rate limiter for the chat API.
// Note: on serverless hosts (e.g. Vercel) each instance keeps its own memory,
// so limits are best-effort — enough to stop casual spam from draining credits.

const WINDOWS = [
  { ms: 60 * 1000, max: 10, message: "You're sending messages too quickly. Please wait a minute and try again." },
  { ms: 24 * 60 * 60 * 1000, max: 1000, message: "You've reached today's message limit. Please contact the clinic directly or try again tomorrow." }
]

const hits = new Map() // ip -> array of request timestamps
const LONGEST_WINDOW = Math.max(...WINDOWS.map(w => w.ms))
const MAX_TRACKED_IPS = 10000

export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return request.headers.get("x-real-ip") || "unknown"
}

export function checkRateLimit(ip) {
  const now = Date.now()
  const timestamps = (hits.get(ip) || []).filter(t => now - t < LONGEST_WINDOW)

  for (const window of WINDOWS) {
    const inWindow = timestamps.filter(t => now - t < window.ms)
    if (inWindow.length >= window.max) {
      hits.set(ip, timestamps)
      const retryAfter = Math.ceil((inWindow[0] + window.ms - now) / 1000)
      return { allowed: false, message: window.message, retryAfter }
    }
  }

  timestamps.push(now)
  hits.set(ip, timestamps)

  // Keep memory bounded: drop the oldest-inserted IPs if the map grows too large
  if (hits.size > MAX_TRACKED_IPS) {
    const excess = hits.size - MAX_TRACKED_IPS
    let i = 0
    for (const key of hits.keys()) {
      if (i++ >= excess) break
      hits.delete(key)
    }
  }

  return { allowed: true }
}
