export async function POST(req) {
  try {
    const { prompt } = await req.json();

    // Call Sarvam API
    const response = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SARVAM_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sarvam-m",   // <-- Your model
        messages: [
          { role: "system", content: "You are the AI assistant for b.Braced Clinic." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    return new Response(
      JSON.stringify({ reply: data.choices?.[0]?.message?.content || "No response" }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error)
    return new Response(
      JSON.stringify({ reply: "Error contacting AI server." }),
      { status: 500 }
    );
  }
}