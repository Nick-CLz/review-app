import type { Category, Product, SpecField } from "./types";
import { formatSpec } from "./format";

export interface Pick {
  product: Product;
  /** 0–100: how well the plan does on the chosen priorities, relative to the other plans in the category. */
  score: number;
  /** Chosen priorities this plan is strong on, e.g. "ค่ารักษาต่ออุบัติเหตุ ฿60,000". */
  reasons: string[];
  /** Chosen priorities the insurer doesn't state a figure for; they score zero. */
  missing: string[];
}

/** Fields a user can prioritise: anything with a better/worse direction. */
export function priorityFields(c: Category): SpecField[] {
  return c.fields.filter((f) => f.better);
}

const num = (v: unknown) => (typeof v === "number" ? v : typeof v === "boolean" ? Number(v) : null);

/**
 * Rank plans by the priorities the user picked. Each priority is scaled 0–1 between the
 * worst and best plan in the category, then averaged. A figure the insurer doesn't state
 * scores 0 for that priority and is reported in `missing`, never guessed.
 */
export function recommend(c: Category, products: Product[], keys: string[]): Pick[] {
  const fields = priorityFields(c).filter((f) => keys.includes(f.key));
  if (!fields.length) return [];

  const range = new Map(
    fields.map((f) => {
      const vals = products.map((p) => num(p.specs[f.key])).filter((v) => v !== null);
      return [f.key, { min: Math.min(...vals), max: Math.max(...vals) }] as const;
    }),
  );

  return products
    .map((product) => {
      const parts = fields.map((f) => {
        const v = num(product.specs[f.key]);
        const { min, max } = range.get(f.key)!;
        if (v === null) return { f, n: 0, missing: true };
        if (max === min) return { f, n: 1, missing: false };
        const n = (v - min) / (max - min);
        return { f, n: f.better === "lower" ? 1 - n : n, missing: false };
      });
      return {
        product,
        score: Math.round((parts.reduce((s, x) => s + x.n, 0) / parts.length) * 100),
        reasons: parts
          .filter((x) => !x.missing && x.n >= 0.5)
          .sort((a, b) => b.n - a.n)
          .slice(0, 2)
          .map((x) => `${x.f.label} ${formatSpec(x.f, product.specs[x.f.key])}`),
        missing: parts.filter((x) => x.missing).map((x) => x.f.label),
      };
    })
    .sort((a, b) => b.score - a.score);
}
