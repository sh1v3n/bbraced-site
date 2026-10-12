import { attemptOrder, startCompletion } from '@/lib/ai-providers'

// Daily check that every configured AI provider/model still answers.
// Called by .github/workflows/ai-health.yml; a non-200 fails that workflow,
// and GitHub emails the repo owner. Protected by HEALTH_CHECK_TOKEN.

export const dynamic = "force-dynamic"
export const maxDuration = 60

const PING = [{ role: "user", content: "Reply with just OK." }]

export async function GET(request) {
  const token = process.env.HEALTH_CHECK_TOKEN
  if (!token || request.headers.get("authorization") !== `Bearer ${token}`) {
    return new Response("Not found", { status: 404 })
  }

  const results = await Promise.all(attemptOrder().map(async attempt => {
    try {
      const completion = await startCompletion(attempt, PING, 30000)
      completion.cancel()
      return { ...attempt, ok: true }
    } catch (error) {
      // 4xx (except 429) means a bad key, no credits or a retired model: needs fixing.
      // 5xx, 429 and timeouts are usually temporary overloads.
      const needsFix = error.status >= 400 && error.status < 500 && error.status !== 429
      return { ...attempt, ok: false, needsFix, error: error.message }
    }
  }))

  const anyWorking = results.some(r => r.ok)
  const healthy = anyWorking && !results.some(r => r.needsFix)

  return Response.json({ healthy, anyWorking, results }, { status: healthy ? 200 : 500 })
}
