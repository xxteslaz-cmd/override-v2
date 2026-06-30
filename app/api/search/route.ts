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

// ─── Newegg scraper ───────────────────────────────────────────────────────────

async function scrapeNewegg(query: string, category: string): Promise<SearchResult[]> {
  const N   = NEWEGG_CATEGORIES[category] ?? "100161658";
  const url = `https://www.newegg.com/p/pl?N=${N}&d=${encodeURIComponent(query)}&PageSize=20&isNodeId=1`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Referer": "https://www.newegg.com/",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) throw new Error(`Newegg returned ${res.status}`);
  const html = await res.text();

  const results: SearchResult[] = [];
  const seen   = new Set<string>();

  // Newegg product pages use /p/N82E… URLs — find each unique one then
  // extract the alt= title and $XX.XX price from the following ~3000 chars.
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

    // Strip trailing part numbers like " (100-100000589WOF)"
    const name  = titleM[1].replace(/\s*\([^)]{5,}\)\s*$/, "").trim();
    const price = parseFloat(priceM[1]);
    if (isNaN(price) || price <= 0) continue;

    // Grab a spec snippet from the product slug
    const slugParts = productUrl.split("/").filter(Boolean);
    const specs     = slugParts[slugParts.length - 2]
      ?.replace(/-/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase())
      .slice(0, 60) ?? "";

    results.push({ id: `newegg-${results.length}`, name, price, specs, url: productUrl, source: "newegg" });
  }

  return results;
}

// ─── Claude fallback ──────────────────────────────────────────────────────────

async function claudeSearch(query: string, category: string): Promise<SearchResult[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("No ANTHROPIC_API_KEY");

  const prompt = `You are a PC hardware expert. Return a JSON array of 8 real ${category} products matching "${query}".
Each entry: { "name": string, "price": number (USD, realistic 2024 street price), "specs": string (key specs, max 60 chars), "neweggSlug": string (URL slug for newegg.com search) }
Only JSON, no other text.`;

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
  const text: string = data.content?.[0]?.text ?? "[]";
  const clean = text.replace(/```json|```/g, "").trim();
  const raw: { name: string; price: number; specs: string; neweggSlug: string }[] = JSON.parse(clean);

  return raw.map((r, i) => ({
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

  // Fall back to Claude if Newegg returned nothing
  try {
    const parts = await claudeSearch(query, category);
    return Response.json(parts);
  } catch (err) {
    console.error("Claude fallback failed:", err);
    return Response.json([]);
  }
}
