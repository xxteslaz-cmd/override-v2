export const runtime = "nodejs";

const NEWEGG_CATEGORIES: Record<string, string> = {
  cpu:         "100007671",
  gpu:         "100007709",
  motherboard: "100007627",
  ram:         "100007611",
  storage:     "100167523",
  psu:         "100007588",
  case:        "100011602",
  cooler:      "100007565",
};

export interface SearchResult {
  id: string;
  name: string;
  price: number;
  specs: string;
  url: string;
  source: "newegg" | "ai";
}

// Jaccard-style similarity: rewards matches, penalizes extra significant words in the result
const NOISE = new Set(["geforce","radeon","graphics","card","processor","desktop","amd","intel","nvidia","pci","express","gddr6","gddr7","ddr5","atx","black"]);
function nameScore(query: string, name: string): number {
  const qWords = new Set(query.toLowerCase().split(/[\s\-]+/).filter(w => w.length > 1));
  const nWords = new Set(name.toLowerCase().split(/[\s\-]+/).filter(w => w.length > 1 && !NOISE.has(w)));
  let matches = 0;
  for (const w of qWords) { if (nWords.has(w)) matches++; }
  const extra = [...nWords].filter(w => !qWords.has(w)).length;
  // Penalize for every extra word not in the query (catches "Ti", "Super", "XT" etc.)
  return matches / (qWords.size + extra * 0.5);
}

// ─── Newegg scraper ───────────────────────────────────────────────────────────

async function scrapeNewegg(query: string, category: string): Promise<SearchResult[]> {
  const N   = NEWEGG_CATEGORIES[category];
  // Try with category node first, fall back to plain keyword search
  const urls = N
    ? [`https://www.newegg.com/p/pl?N=${N}&d=${encodeURIComponent(query)}&PageSize=20`,
       `https://www.newegg.com/p/pl?d=${encodeURIComponent(query)}&PageSize=20`]
    : [`https://www.newegg.com/p/pl?d=${encodeURIComponent(query)}&PageSize=20`];

  const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.newegg.com/",
  };

  let html = "";
  for (const url of urls) {
    const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(12000) });
    if (res.ok) { html = await res.text(); break; }
  }
  if (!html) throw new Error("Newegg returned no usable response");

  const results: SearchResult[] = [];
  const seen   = new Set<string>();

  const urlRe = /href="(https:\/\/www\.newegg\.com\/[^"]+\/p\/N82E[^"#\s]+)"/g;
  let m: RegExpExecArray | null;

  while ((m = urlRe.exec(html)) !== null && results.length < 10) {
    const productUrl = m[1];
    if (seen.has(productUrl)) continue;
    seen.add(productUrl);

    const chunk = html.slice(m.index, m.index + 3000);

    const titleM = chunk.match(/alt="([^"]{15,120})"/);
    const priceM = chunk.match(/\$(\d{2,4}\.\d{2})/);
    if (!titleM || !priceM) continue;

    const name  = titleM[1].replace(/\s*\([^)]{5,}\)\s*$/, "").trim();
    const price = parseFloat(priceM[1]);
    if (isNaN(price) || price <= 0) continue;

    results.push({ id: `newegg-${results.length}`, name, price, specs: "", url: productUrl, source: "newegg" });
  }

  // Sort by name similarity to query so the best match comes first
  return results.sort((a, b) => nameScore(query, b.name) - nameScore(query, a.name));
}

// ─── Claude fallback ──────────────────────────────────────────────────────────

async function claudeSearch(query: string, category: string): Promise<SearchResult[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("No ANTHROPIC_API_KEY");

  const prompt = `You are a PC hardware pricing expert with knowledge of current retail prices as of mid-2025.
Return a JSON array of up to 8 real ${category} products matching "${query}".
Use accurate, realistic street prices from Newegg/Amazon in USD.
Each entry: { "name": string, "price": number, "specs": string (key specs, max 60 chars) }
IMPORTANT: Return ONLY valid JSON, no other text.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  if (data.type === "error") throw new Error(`Claude API: ${data.error?.message}`);
  const text: string = data.content?.[0]?.text ?? "[]";
  const clean = text.replace(/```json|```/g, "").trim();
  const raw: { name: string; price: number; specs: string }[] = JSON.parse(clean);

  const sorted = [...raw].sort((a, b) => nameScore(query, b.name) - nameScore(query, a.name));

  return sorted.map((r, i) => ({
    id:     `ai-${i}`,
    name:   r.name,
    price:  r.price,
    specs:  r.specs,
    url:    `https://www.newegg.com/p/pl?d=${encodeURIComponent(r.name)}`,
    source: "ai" as const,
  }));
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query    = (searchParams.get("q") ?? "").trim();
  const category = searchParams.get("category") ?? "all";

  if (!query) return Response.json([]);

  // Try Newegg first
  try {
    const parts = await scrapeNewegg(query, category);
    if (parts.length >= 1) return Response.json(parts);
  } catch (err) {
    console.error("Newegg scrape failed:", err);
  }

  // Fall back to Claude
  try {
    const parts = await claudeSearch(query, category);
    return Response.json(parts);
  } catch (err) {
    console.error("Claude fallback failed:", err);
    return Response.json([]);
  }
}
