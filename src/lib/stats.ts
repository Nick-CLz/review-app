import type { DB, Item, ListEntry, Price, Unit } from "./types";

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

export interface BasketLine {
  item: Item;
  qty: number;
  /** Latest price per store, cheapest first */
  prices: Price[];
}

/**
 * What a shopping list costs at each store, and the cheapest split across stores.
 * Items with no price anywhere are left out of every total (and reported).
 */
export function basketPlan(db: DB, list: ListEntry[]) {
  const lines: BasketLine[] = list
    .map((e) => ({ item: db.items.find((i) => i.id === e.itemId), qty: e.qty }))
    .filter((l): l is { item: Item; qty: number } => !!l.item)
    .map((l) => ({ ...l, prices: latestPrices(db, l.item.id) }));
  const priced = lines.filter((l) => l.prices.length);
  const unpriced = lines.filter((l) => !l.prices.length).map((l) => l.item);

  const byStore = db.stores
    .map((store) => {
      let total = 0;
      const missing: Item[] = [];
      for (const l of priced) {
        const p = l.prices.find((x) => x.storeId === store.id);
        if (p) total += p.price * l.qty;
        else missing.push(l.item);
      }
      return { store, total, missing, complete: missing.length === 0 };
    })
    .filter((s) => s.missing.length < priced.length) // stores that carry at least one item
    .sort((a, b) => Number(b.complete) - Number(a.complete) || a.missing.length - b.missing.length || a.total - b.total);

  const split = new Map<string, { line: BasketLine; price: Price }[]>();
  let splitTotal = 0;
  for (const l of priced) {
    const p = l.prices[0];
    splitTotal += p.price * l.qty;
    if (!split.has(p.storeId)) split.set(p.storeId, []);
    split.get(p.storeId)!.push({ line: l, price: p });
  }

  const bestSingle = byStore.find((s) => s.complete);
  return {
    lines,
    unpriced,
    byStore,
    split: [...split.entries()].map(([storeId, rows]) => ({ store: db.stores.find((s) => s.id === storeId)!, rows, total: rows.reduce((n, r) => n + r.price.price * r.line.qty, 0) })),
    splitTotal,
    bestSingle,
    /** Saving from splitting, compared with the cheapest store that has everything */
    splitSaving: bestSingle ? bestSingle.total - splitTotal : 0,
  };
}
