const SARVAM_ENDPOINT = "https://api.sarvam.ai/v1/chat/completions";
const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";

const clinic = {
  name: "b.Braced Clinic",
  phone: "+91 93217 39096",
  whatsapp: "https://wa.me/919321739096",
  address:
    "1st floor, Anand Vihar co.soc, 20th B Rd, corner, Ambedkar Colony, Khar West, Mumbai, Maharashtra 400052"
};

const baseFallback =
  "Thanks for your question! This assistant provides general guidance only. For case-specific advice, please contact the clinic.";
const isDev = process.env.NODE_ENV !== "production";
const keySummary = (key) =>
  key ? ` (Debug: key length ${String(key).trim().length})` : "";

export async function POST(request) {
  const { message, language, messages } = await request.json();
  const sarvamKey = process.env.SARVAM_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const providerEnv = (process.env.AI_PROVIDER || "").toLowerCase().trim();

  if (!sarvamKey && !openaiKey) {
    return Response.json({
      reply: isDev
        ? `${baseFallback} (Debug: missing OPENAI_API_KEY or SARVAM_API_KEY)`
        : baseFallback
    });
  }

  if (providerEnv === "sarvam" && !sarvamKey) {
    return Response.json({
      reply: isDev
        ? `${baseFallback} (Debug: missing SARVAM_API_KEY)`
        : baseFallback
    });
  }

  if (providerEnv === "openai" && !openaiKey) {
    return Response.json({
      reply: isDev
        ? `${baseFallback} (Debug: missing OPENAI_API_KEY)`
        : baseFallback
    });
  }

  const selectedLanguage =
    language && language !== "Auto Detect"
      ? language
      : "the user's language";

  const systemPrompt = [
    "You are Dr. Pravin Shetty's AI assistant for b.Braced Clinic in Mumbai.",
    "Be transparent that you are an AI assistant, not the doctor, and keep a warm, professional tone.",
    "Give concise, friendly answers about clear aligners, aftercare, wear schedule, and common issues.",
    "Do not provide diagnosis or emergency medical advice.",
    `Respond in ${selectedLanguage}.`,
    "If the user describes severe pain, bleeding, broken trays, or an urgent issue, tell them to call the clinic.",
    "End every reply with: For more details, contact the clinic.",
    `Clinic details: ${clinic.name}, Phone ${clinic.phone}, WhatsApp ${clinic.whatsapp}, Address ${clinic.address}.`
  ].join(" ");

  const rawConversation =
    Array.isArray(messages) && messages.length
      ? messages
          .map((msg) => ({
            role: msg.role === "assistant" ? "assistant" : "user",
            content: msg.text || msg.content || ""
          }))
          .filter((msg) => msg.content)
      : [{ role: "user", content: message || "" }];

  const firstUserIndex = rawConversation.findIndex(
    (msg) => msg.role === "user"
  );

  const conversation =
    firstUserIndex >= 0
      ? rawConversation.slice(firstUserIndex)
      : [{ role: "user", content: message || "" }];

  try {
    const useOpenAI =
      providerEnv === "openai"
        ? true
        : providerEnv === "sarvam"
        ? false
        : !sarvamKey && Boolean(openaiKey);
    const response = await fetch(useOpenAI ? OPENAI_ENDPOINT : SARVAM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(useOpenAI
          ? { Authorization: `Bearer ${openaiKey}` }
          : { "api-subscription-key": sarvamKey })
      },
      body: JSON.stringify(
        useOpenAI
          ? {
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: systemPrompt
                },
                ...conversation
              ],
              temperature: 0.2
            }
          : {
              model: "sarvam-m",
              messages: [
                {
                  role: "system",
                  content: systemPrompt
                },
                ...conversation
              ],
              temperature: 0.2
            }
      )
    });

    if (!response.ok) {
      const errorText = await response.text();
      const debug = isDev
        ? ` (Debug: ${response.status} ${response.statusText} - ${errorText.slice(
            0,
            180
          )}${keySummary(useOpenAI ? openaiKey : sarvamKey)})`
        : "";
      return Response.json({
        reply: `${baseFallback}${debug}`
      });
    }

    const data = await response.json();
    const reply = useOpenAI
      ? data?.choices?.[0]?.message?.content?.trim() || baseFallback
      : data?.choices?.[0]?.message?.content?.trim() || baseFallback;

    return Response.json({ reply });
  } catch (error) {
    const debug = isDev
      ? ` (Debug: ${error.message || "network error"}${keySummary(
          openaiKey || sarvamKey
        )})`
      : "";
    return Response.json({ reply: `${baseFallback}${debug}` });
  }
}
