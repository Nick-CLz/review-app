import "server-only";
import { neon } from "@neondatabase/serverless";
import type { DB, Item, Price, Review, Store } from "./types";

let _sql: ReturnType<typeof neon> | null = null;

/** Lazily created so `next build` works without DATABASE_URL. */
export function getSql() {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    _sql = neon(url);
  }
  return _sql;
}

type Row = Record<string, unknown>;
const str = (v: unknown) => (v == null ? undefined : String(v));
const day = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v).slice(0, 10));

/** Everything except the per-browser compare list. Small enough to ship in one response. */
export async function readAll(): Promise<Omit<DB, "compare" | "list">> {
  const sql = getSql();
  // to_char keeps dates as plain YYYY-MM-DD, independent of the server's time zone
  const [stores, items, prices, reviews] = (await Promise.all([
    sql`SELECT id, name, color, user_id FROM stores ORDER BY name`,
    sql`SELECT id, name, name_th, brand, category, size::float8 AS size, unit, barcode, emoji, image_url, attributes, user_id,
               to_char(created_at, 'YYYY-MM-DD') AS created_at FROM items ORDER BY created_at, name`,
    sql`SELECT id, item_id, store_id, price::float8 AS price, promo, user_id, to_char(date, 'YYYY-MM-DD') AS date FROM prices`,
    sql`SELECT id, item_id, rating, title, body, author, store_id, user_id, to_char(date, 'YYYY-MM-DD') AS date
          FROM reviews ORDER BY date DESC, id DESC`,
  ])) as Row[][];

  return {
    version: 1,
    stores: stores.map((r): Store => ({ id: String(r.id), name: String(r.name), color: String(r.color), userId: str(r.user_id) })),
    items: items.map((r): Item => ({
      id: String(r.id), name: String(r.name), nameTh: str(r.name_th), brand: String(r.brand), category: String(r.category),
      size: Number(r.size), unit: r.unit as Item["unit"], barcode: str(r.barcode), emoji: str(r.emoji), imageUrl: str(r.image_url),
      attributes: (r.attributes as Record<string, string>) ?? {}, createdAt: day(r.created_at), userId: str(r.user_id),
    })),
    prices: prices.map((r): Price => ({
      id: String(r.id), itemId: String(r.item_id), storeId: String(r.store_id), price: Number(r.price), promo: str(r.promo), date: day(r.date), userId: str(r.user_id),
    })),
    reviews: reviews.map((r): Review => ({
      id: String(r.id), itemId: String(r.item_id), rating: Number(r.rating), title: String(r.title), body: String(r.body),
      author: String(r.author), storeId: str(r.store_id), date: day(r.date), userId: str(r.user_id),
    })),
  };
}
