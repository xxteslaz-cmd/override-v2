export const runtime = "nodejs";
export const maxDuration = 300; // 5 min — enough for ~80 products

import { Redis } from "@upstash/redis";
const kv = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL!, token: process.env.UPSTASH_REDIS_REST_TOKEN! });
import CATALOG from "@/lib/product-catalog";

interface StoredPrice {
  price: number;
  inStock: boolean;
  link: string;
  updatedAt: string;
}

interface ProductPrices {
  newegg: StoredPrice | null;
  amazon: StoredPrice | null;
}

// ─── SerpApi Google Shopping search ──────────────────────────────────────────

async function searchShopping(
  query: string,
  site: "newegg.com" | "amazon.com",
  apiKey: string
): Promise<StoredPrice | null> {
  const q = `${query} site:${site}`;
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_shopping");
  url.searchParams.set("q", q);
  url.searchParams.set("num", "5");
  url.searchParams.set("api_key", apiKey);

  try {
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    const data = await res.json();

    const results: any[] = data.shopping_results ?? [];
    if (!results.length) return null;

    // Pick the first result whose source matches the target site
    const match = results.find(r =>
      (r.source ?? "").toLowerCase().includes(site === "newegg.com" ? "newegg" : "amazon")
    ) ?? results[0];

    const rawPrice: string | number = match.price ?? "";
    const price = typeof rawPrice === "number"
      ? rawPrice
      : parseFloat(String(rawPrice).replace(/[^0-9.]/g, ""));
    if (!price || isNaN(price)) return null;

    return {
      price,
      inStock: match.delivery !== "Out of stock" && !String(match.delivery ?? "").toLowerCase().includes("out of stock"),
      link: match.link ?? match.product_link ?? `https://www.${site}/s?k=${encodeURIComponent(query)}`,
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  // Vercel sets CRON_SECRET and sends it as Authorization: Bearer <secret>
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    return Response.json({ error: "SERPAPI_KEY not set" }, { status: 500 });
  }

  const results: Record<string, { newegg: string; amazon: string }> = {};
  let updated = 0;
  let failed = 0;

  // Process in small batches to avoid rate-limiting
  const BATCH = 4;
  for (let i = 0; i < CATALOG.length; i += BATCH) {
    const batch = CATALOG.slice(i, i + BATCH);
    await Promise.all(batch.map(async (entry) => {
      try {
        const [newegg, amazon] = await Promise.all([
          searchShopping(entry.query, "newegg.com", apiKey),
          searchShopping(entry.query, "amazon.com", apiKey),
        ]);

        const prices: ProductPrices = { newegg, amazon };
        await kv.set(`prices:${entry.id}`, JSON.stringify(prices));

        results[entry.id] = {
          newegg: newegg ? `$${newegg.price}` : "failed",
          amazon: amazon ? `$${amazon.price}` : "failed",
        };
        updated++;
      } catch (err) {
        console.error(`Failed to refresh ${entry.id}:`, err);
        failed++;
      }
    }));

    // Small pause between batches to be polite to SerpApi
    if (i + BATCH < CATALOG.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  // Store last-run metadata
  await kv.set("prices:_meta", JSON.stringify({ lastRun: new Date().toISOString(), updated, failed }));

  return Response.json({ ok: true, updated, failed, results });
}
