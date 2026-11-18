import { CAR_ITEMS } from "./cars";
import type { Item } from "./types";

export const ITEMS: Item[] = [...CAR_ITEMS];

export function getItem(id: string) {
  return ITEMS.find((i) => i.id === id);
}

export function itemsIn(category: string) {
  return ITEMS.filter((i) => i.category === category);
}

export function fullName(i: Pick<Item, "brand" | "name">) {
  return i.name.startsWith(i.brand) ? i.name : `${i.brand} ${i.name}`;
}

export function avgRating(reviews: { rating: number }[]) {
  if (!reviews.length) return 0;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

// ── Spec-based scores (1–10), relative to the whole category ──

export interface ScoreDim {
  key: string;
  label: string;
}

export const CAR_SCORE_DIMS: ScoreDim[] = [
  { key: "economy", label: "ประหยัด" },
  { key: "performance", label: "สมรรถนะ" },
  { key: "practical", label: "ใช้งานจริง" },
  { key: "safety", label: "ความปลอดภัย" },
  { key: "value", label: "ราคาเข้าถึงง่าย" },
];

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

export function carScores(item: Item): Record<string, number> {
  const hit = scoreCache.get(item.id);
  if (hit) return hit;
  const all = itemsIn("cars");
  const col = (k: string) => all.map((i) => num(i.specs[k]));
  const n = {
    energy: normalizer(col("energyCost"), "lower"),
    hp: normalizer(col("powerHp"), "higher", true),
    accel: normalizer(col("accel"), "lower"),
    seats: normalizer(col("seats"), "higher"),
    trunk: normalizer(col("trunkL"), "higher"),
    clear: normalizer(col("clearanceMm"), "higher"),
    bags: normalizer(col("airbags"), "higher"),
    ncap: normalizer(col("ncap"), "higher"),
    price: normalizer(col("price"), "lower", true),
  };
  const s = item.specs;
  const avg = (...xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const to10 = (x: number) => Math.round((1 + 9 * x) * 10) / 10;
  const out = {
    economy: to10(n.energy(num(s.energyCost))),
    performance: to10(avg(n.hp(num(s.powerHp)), n.accel(num(s.accel)))),
    practical: to10(avg(n.seats(num(s.seats)), n.trunk(num(s.trunkL)), n.clear(num(s.clearanceMm)))),
    safety: to10(avg(n.bags(num(s.airbags)), n.ncap(num(s.ncap)), num(s.adas))),
    value: to10(n.price(num(s.price))),
  };
  scoreCache.set(item.id, out);
  return out;
}

export function overallScore(item: Item) {
  const s = carScores(item);
  const vals = Object.values(s);
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}
