export async function POST(req) {
  const { budget, useCase, notes } = await req.json();

  // MOCK MODE — no API credits needed. Swap back to real call when ready.
  await new Promise((r) => setTimeout(r, 800)); // fake loading delay

  return Response.json({
    cpu: { name: "AMD Ryzen 5 7600", price: 219, reason: `Strong value for ${useCase}, great multi-core performance.` },
    gpu: { name: "RTX 4060", price: 299, reason: "Solid 1080p/1440p performance within budget." },
    motherboard: { name: "MSI B650 Gaming Plus", price: 159, reason: "AM5 socket, supports the 7600, good VRM for the price." },
    ram: { name: "32GB DDR5 6000MHz", price: 99, reason: "Sweet spot for AM5 platform performance." },
    storage: { name: "1TB NVMe Gen4 SSD", price: 69, reason: "Fast boot and load times." },
    psu: { name: "650W 80+ Gold", price: 79, reason: "Comfortable headroom for this build." },
    case: { name: "NZXT H5 Flow", price: 89, reason: "Good airflow, clean build quality." },
    cooler: { name: "Stock AMD Wraith Cooler", price: 0, reason: "Included with CPU, sufficient for this power draw." },
    totalEstimate: budget,
  });

  /* REAL CLAUDE VERSION — restore this when you add API credits:

  const systemPrompt = `You are a PC build advisor...`; // (full prompt from before)

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: `Budget: $${budget}. Use case: ${useCase}. Notes: ${notes || "none"}` }],
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text || "";
  const clean = text.replace(/```json|```/g, "").trim();
  const build = JSON.parse(clean);
  return Response.json(build);

  */
}
