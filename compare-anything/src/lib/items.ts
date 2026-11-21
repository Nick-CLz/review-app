import { CAR_ITEMS } from "./cars";
import { CARS, getCategory } from "./categories";
import { MOTORCYCLE_ITEMS } from "./motorcycles";
import type { Category, Item } from "./types";

export const ITEMS: Item[] = [...CAR_ITEMS, ...MOTORCYCLE_ITEMS];

export function getItem(id: string) {
  return ITEMS.find((i) => i.id === id);
}

export function itemsIn(category: string) {
  return ITEMS.filter((i) => i.category === category);
}

export function categoryOf(item: Pick<Item, "category">): Category {
  return getCategory(item.category) ?? CARS;
}

export function fullName(i: Pick<Item, "brand" | "name">) {
  return i.name.startsWith(i.brand) ? i.name : `${i.brand} ${i.name}`;
}

export function avgRating(reviews: { rating: number }[]) {
  if (!reviews.length) return 0;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

// ── Spec-based scores (1–10), relative to every item in the same category ──

function num(v: unknown) {
  return typeof v === "number" ? v : v === true ? 1 : 0;
}

function normalizer(values: number[], dir: "higher" | "lower", log = false) {
  const t = (x: number) => (log ? Math.log(Math.max(x, 1)) : x);
  const xs = values.map(t);
  const min = Math.min(...xs);
  const max = Math.max(...xs);
  return (v: number) => {
    if (max === min) return 1;
    const n = (t(v) - min) / (max - min);
    return dir === "higher" ? n : 1 - n;
  };
}

const scoreCache = new Map<string, Record<string, number>>();

export function scores(item: Item): Record<string, number> {
  const hit = scoreCache.get(item.id);
  if (hit) return hit;
  const cat = categoryOf(item);
  const all = itemsIn(cat.slug);
  const to10 = (x: number) => Math.round((1 + 9 * x) * 10) / 10;
  const out: Record<string, number> = {};
  for (const d of cat.scoreDims) {
    const parts = d.parts.map((p) => normalizer(all.map((i) => num(i.specs[p.key])), p.better, p.log)(num(item.specs[p.key])));
    out[d.key] = to10(parts.reduce((a, b) => a + b, 0) / parts.length);
  }
  scoreCache.set(item.id, out);
  return out;
}

export function overallScore(item: Item) {
  const vals = Object.values(scores(item));
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}
