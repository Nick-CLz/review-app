import "server-only";

// Open Food Facts: open, crowd-sourced product database (data ODbL, photos CC BY-SA).
// https://openfoodfacts.github.io/openfoodfacts-server/api/
// Everything returned from it is third-party data: we only read the fields below,
// treat them as plain text, and accept image URLs only from OFF's own image host.

const BASE = "https://world.openfoodfacts.org";
const UA = "Shelfie/0.1 (product review and price comparison app)";
const FIELDS = "code,product_name,product_name_th,product_name_en,brands,quantity,categories_tags,image_front_url,image_url";
const IMAGE_HOST = "images.openfoodfacts.org";

export interface OffProduct {
  barcode: string;
  name: string;
  nameTh?: string;
  brand: string;
  size?: number;
  unit?: "ml" | "g" | "pcs";
  quantity?: string;
  imageUrl?: string;
  sourceUrl: string;
}

type Raw = Record<string, unknown>;
const clean = (v: unknown, max = 160) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");

/** "325 ml", "1,5 L", "55g", "10 x 55 g" -> pack size in ml/g (multi-packs keep the single unit size). */
export function parseQuantity(q: string): { size: number; unit: "ml" | "g" } | undefined {
  const m = q.toLowerCase().replace(",", ".").match(/(\d+(?:\.\d+)?)\s*(ml|cl|l|g|kg)\b/);
  if (!m) return;
  const n = parseFloat(m[1]);
  const scale: Record<string, [number, "ml" | "g"]> = { ml: [1, "ml"], cl: [10, "ml"], l: [1000, "ml"], g: [1, "g"], kg: [1000, "g"] };
  const [mult, unit] = scale[m[2]];
  const size = Math.round(n * mult * 100) / 100;
  return size > 0 ? { size, unit } : undefined;
}

function safeImage(v: unknown): string | undefined {
  if (typeof v !== "string") return;
  try {
    const u = new URL(v);
    return u.protocol === "https:" && u.hostname === IMAGE_HOST ? u.toString() : undefined;
  } catch {
    return;
  }
}

function normalize(p: Raw): OffProduct | null {
  const barcode = clean(p.code, 32);
  if (!/^\d{6,14}$/.test(barcode)) return null;
  const nameTh = clean(p.product_name_th) || undefined;
  const name = clean(p.product_name_en) || clean(p.product_name) || nameTh || "";
  if (!name) return null;
  const quantity = clean(p.quantity, 40) || undefined;
  const parsed = quantity ? parseQuantity(quantity) : undefined;
  return {
    barcode,
    name,
    nameTh: nameTh && nameTh !== name ? nameTh : undefined,
    brand: (Array.isArray(p.brands) ? clean(p.brands[0], 80) : clean(p.brands, 80).split(",")[0]).trim(),
    size: parsed?.size,
    unit: parsed?.unit,
    quantity,
    imageUrl: safeImage(p.image_front_url) ?? safeImage(p.image_url),
    sourceUrl: `${BASE}/product/${barcode}`,
  };
}

const cache = new Map<string, { at: number; value: unknown }>();
const TTL = 6 * 60 * 60 * 1000;

async function getJSON(url: string): Promise<Raw | null> {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < TTL) return hit.value as Raw;
  let res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(15_000) });
  if (res.status === 503 || res.status === 429) {
    // OFF sheds load / rate-limits search; one polite retry
    await new Promise((r) => setTimeout(r, 2500));
    res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(15_000) });
  }
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Open Food Facts returned ${res.status}`);
  const value = (await res.json()) as Raw;
  if (cache.size > 500) cache.clear();
  cache.set(url, { at: Date.now(), value });
  return value;
}

export async function lookupBarcode(barcode: string): Promise<OffProduct | null> {
  if (!/^\d{6,14}$/.test(barcode)) throw new Error("Barcode must be 6–14 digits");
  const data = await getJSON(`${BASE}/api/v2/product/${barcode}?fields=${FIELDS}`);
  if (!data || data.status !== 1 || typeof data.product !== "object") return null;
  return normalize(data.product as Raw);
}

const SEARCH = "https://search.openfoodfacts.org/search";

/**
 * Full-text search. Uses OFF's newer search service first; if that fails, falls back to the
 * classic endpoint (rate-limited to ~10 requests/minute). Thai barcodes (GS1 prefix 885) sort first.
 */
export async function searchProducts(query: string, limit = 12): Promise<OffProduct[]> {
  const q = query.trim().slice(0, 80);
  if (q.length < 2) return [];
  let raw: Raw[] = [];
  try {
    const data = await getJSON(`${SEARCH}?${new URLSearchParams({ q, page_size: "40", fields: FIELDS })}`);
    raw = (data?.hits as Raw[]) ?? [];
  } catch (e) {
    console.warn("OFF search service failed, using classic search:", (e as Error).message);
    const params = new URLSearchParams({ search_terms: q, search_simple: "1", json: "1", page_size: "40", fields: FIELDS, sort_by: "unique_scans_n" });
    const data = await getJSON(`${BASE}/cgi/search.pl?${params}`);
    raw = (data?.products as Raw[]) ?? [];
  }
  const seen = new Set<string>();
  const out: OffProduct[] = [];
  for (const p of raw) {
    const n = normalize(p);
    if (n && !seen.has(n.barcode)) {
      seen.add(n.barcode);
      out.push(n);
    }
  }
  const score = (p: OffProduct) => (p.barcode.startsWith("885") ? 2 : 0) + (p.imageUrl ? 1 : 0);
  return out
    .map((p, i) => ({ p, i }))
    .sort((a, b) => score(b.p) - score(a.p) || a.i - b.i) // stable: keep relevance order within a tier
    .slice(0, limit)
    .map(({ p }) => p);
}
