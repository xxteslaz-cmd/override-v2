export const runtime = "nodejs";

import { Redis } from "@upstash/redis";
const kv = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL!, token: process.env.UPSTASH_REDIS_REST_TOKEN! });
import { getCatalogEntry } from "@/lib/product-catalog";

export interface PriceEntry {
  price: number;
  inStock: boolean;
  link: string;
  updatedAt: string | null;
}

export interface ProductPriceResponse {
  newegg: PriceEntry | null;
  amazon: PriceEntry | null;
  lastChecked: string | null; // ISO string
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  const entry = getCatalogEntry(id);

  try {
    const raw = await kv.get<string>(`prices:${id}`);
    if (raw) {
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      return Response.json({
        newegg: data.newegg ?? null,
        amazon: data.amazon ?? null,
        lastChecked: data.newegg?.updatedAt ?? data.amazon?.updatedAt ?? null,
      } satisfies ProductPriceResponse);
    }
  } catch {
    // KV unavailable — fall through to fallback
  }

  // No KV data: return fallback prices with search links
  const fallback = entry?.fallbackPrice;
  const name = entry?.name ?? id;
  return Response.json({
    newegg: fallback ? {
      price: fallback,
      inStock: true,
      link: `https://www.newegg.com/p/pl?d=${encodeURIComponent(name)}`,
      updatedAt: null,
    } : null,
    amazon: fallback ? {
      price: fallback,
      inStock: true,
      link: `https://www.amazon.com/s?k=${encodeURIComponent(name)}`,
      updatedAt: null,
    } : null,
    lastChecked: null,
  } satisfies ProductPriceResponse);
}
