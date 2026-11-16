import type { DB, Item, Price, Unit } from "./types";

export const UNIT_BASE: Record<Unit, { per: number; label: string }> = {
  ml: { per: 100, label: "100 ml" },
  g: { per: 100, label: "100 g" },
  pcs: { per: 1, label: "piece" },
};

export const baht = (n: number) =>
  `฿${n.toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

export function unitPrice(item: Item, price: number) {
  return (price / item.size) * UNIT_BASE[item.unit].per;
}

/** Latest price per store for an item. */
export function latestPrices(db: DB, itemId: string): Price[] {
  const byStore = new Map<string, Price>();
  for (const p of db.prices) {
    if (p.itemId !== itemId) continue;
    const cur = byStore.get(p.storeId);
    if (!cur || p.date >= cur.date) byStore.set(p.storeId, p);
  }
  return [...byStore.values()].sort((a, b) => a.price - b.price);
}

export function bestPrice(db: DB, itemId: string): Price | undefined {
  return latestPrices(db, itemId)[0];
}

export function ratingStats(db: DB, itemId: string) {
  const rs = db.reviews.filter((r) => r.itemId === itemId);
  const avg = rs.length ? rs.reduce((s, r) => s + r.rating, 0) / rs.length : 0;
  return { avg, count: rs.length };
}

export function savings(db: DB, itemId: string) {
  const ps = latestPrices(db, itemId);
  if (ps.length < 2) return null;
  const lo = ps[0], hi = ps[ps.length - 1];
  if (hi.price === lo.price) return null;
  return { amount: hi.price - lo.price, pct: ((hi.price - lo.price) / hi.price) * 100, cheapest: lo.storeId };
}
