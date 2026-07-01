export const runtime = "nodejs";

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

// ─── Newegg price ─────────────────────────────────────────────────────────────

async function fetchNeweggPrice(query: string): Promise<number | null> {
  const url = `https://www.newegg.com/p/pl?d=${encodeURIComponent(query)}&PageSize=20`;
  try {
    const res = await fetch(url, {
      headers: { ...BROWSER_HEADERS, Referer: "https://www.newegg.com/" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Walk through href+product chunks looking for first price match
    const urlRe = /href="(https:\/\/www\.newegg\.com\/[^"]+\/p\/N82E[^"#\s]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = urlRe.exec(html)) !== null) {
      const chunk = html.slice(m.index, m.index + 3000);
      const priceM = chunk.match(/\$(\d{2,4}\.\d{2})/);
      if (priceM) {
        const price = parseFloat(priceM[1]);
        if (price > 0) return price;
      }
    }
  } catch {}
  return null;
}

// ─── Amazon price ─────────────────────────────────────────────────────────────

async function fetchAmazonPrice(query: string): Promise<number | null> {
  const url = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        ...BROWSER_HEADERS,
        Referer: "https://www.amazon.com/",
        "Accept-Encoding": "gzip, deflate, br",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Try structured JSON blobs first ("priceAmount":299.99)
    const jsonM = html.match(/"priceAmount"\s*:\s*(\d{2,4}(?:\.\d{1,2})?)/);
    if (jsonM) {
      const price = parseFloat(jsonM[1]);
      if (price > 0) return price;
    }

    // Fall back to price spans in search results
    // Amazon structure: <span class="a-price"><span ...>$<span ...>299</span>.<span>99</span>
    const priceRe = /\$(\d{2,4}\.\d{2})/g;
    const prices: number[] = [];
    let pm: RegExpExecArray | null;
    while ((pm = priceRe.exec(html)) !== null) {
      const p = parseFloat(pm[1]);
      if (p > 10 && p < 10000) prices.push(p);
    }
    if (prices.length > 0) {
      // Return the median-ish price (skip outliers) — pick the value closest to the 40th percentile
      prices.sort((a, b) => a - b);
      return prices[Math.floor(prices.length * 0.4)];
    }
  } catch {}
  return null;
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("q") ?? "").trim();
  if (!query) return Response.json({ newegg: null, amazon: null });

  const [newegg, amazon] = await Promise.all([
    fetchNeweggPrice(query),
    fetchAmazonPrice(query),
  ]);

  return Response.json({ newegg, amazon });
}
