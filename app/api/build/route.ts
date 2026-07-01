export const runtime = "nodejs";

const SYSTEM = `You are an expert PC build advisor. The user gives you a budget, use case, and optional notes.
Return a JSON object recommending one specific real product for each component. Use realistic mid-2025 street prices from Newegg/Amazon.

Rules:
- Stay within budget total across all 8 parts
- Match the use case (Gaming = fast GPU; Video Editing = more RAM/cores; Programming = balanced; General Use = value)
- Pick compatible parts (CPU socket must match motherboard socket: AM5↔AM5, LGA1700↔LGA1700)
- Choose a PSU with at least 20% headroom above total system wattage
- For budget builds prefer AMD Ryzen 5 + mid-range GPU; for high-end prefer Ryzen 9 or i9 + high-end GPU
- Use real product names (e.g. "AMD Ryzen 5 7600", "NVIDIA RTX 4070 Super", "Corsair RM850x")

Return ONLY valid JSON, no markdown, no explanation:
{
  "cpu":         { "name": "...", "price": 000, "reason": "one sentence why" },
  "gpu":         { "name": "...", "price": 000, "reason": "..." },
  "motherboard": { "name": "...", "price": 000, "reason": "..." },
  "ram":         { "name": "...", "price": 000, "reason": "..." },
  "storage":     { "name": "...", "price": 000, "reason": "..." },
  "psu":         { "name": "...", "price": 000, "reason": "..." },
  "case":        { "name": "...", "price": 000, "reason": "..." },
  "cooler":      { "name": "...", "price": 000, "reason": "..." },
  "totalEstimate": 000
}`;

export async function POST(req: Request) {
  const { budget, useCase, notes } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return Response.json({ error: "No API key" }, { status: 500 });

  const userMsg = budget == null
    ? `Budget: No limit — recommend the absolute best parts available regardless of cost. Use case: ${useCase}.${notes ? ` Notes: ${notes}` : ""}`
    : `Budget: $${budget}. Use case: ${useCase}.${notes ? ` Notes: ${notes}` : ""}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: SYSTEM,
      messages: [{ role: "user", content: userMsg }],
    }),
  });

  const data = await res.json();
  if (data.type === "error") {
    return Response.json({ error: data.error?.message }, { status: 500 });
  }

  const text: string = data.content?.[0]?.text ?? "{}";
  try {
    const build = JSON.parse(text.replace(/```json|```/g, "").trim());
    return Response.json(build);
  } catch {
    return Response.json({ error: "Failed to parse AI response", raw: text }, { status: 500 });
  }
}
