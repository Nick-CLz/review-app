/**
 * Generic "review & compare anything" model.
 * A Category declares the spec fields that matter and which filters to show;
 * Items fill those specs. Cars are the first vertical — nothing in the UI is
 * car-specific except the data and a couple of car-only helpers in lib/cars.ts.
 */

export type FieldType = "money" | "number" | "text" | "bool" | "stars";

export interface SpecField {
  key: string;
  label: string;
  type: FieldType;
  /** Which direction is better — used to highlight the winner in the compare view. */
  better?: "higher" | "lower";
  unit?: string;
  group: string;
  hint?: string;
  /** Decimal places for number fields. */
  digits?: number;
}

export interface FilterDef {
  key: string;
  label: string;
  options: { value: string; label: string; icon?: string }[];
}

/** One spec-based score (1–10): the average of its normalized parts across the category. */
export interface ScoreDim {
  key: string;
  label: string;
  parts: { key: string; better: "higher" | "lower"; log?: boolean }[];
}

/** A "best in …" line in the compare summary — reads a spec or a score dimension. */
export interface VerdictDef {
  label: string;
  key: string;
  source: "spec" | "score";
  better: "higher" | "lower";
}

export interface Category {
  slug: string;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
  /** What one item is called, e.g. "รถ", "มอเตอร์ไซค์". */
  noun: string;
  /** Spec key that holds the headline price. */
  priceKey: string;
  /** Filter key whose value picks the artwork and groups items in pickers. */
  typeKey: string;
  fields: SpecField[];
  filters: FilterDef[];
  scoreDims: ScoreDim[];
  verdicts: VerdictDef[];
  /** Three spec keys shown as quick stats on cards. */
  cardStats: { key: string; label: string }[];
  /** Rough yearly servicing cost by powertrain (บาท/ปี) — enables the running-cost calculator. */
  maintenancePerYear?: Record<string, number>;
  /** Budget slider lower bound. */
  minBudget: number;
  budgetStep: number;
}

export type SpecValue = number | string | boolean | null;

export interface SeedReview {
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
}

export interface Item {
  id: string;
  category: string;
  brand: string;
  name: string;
  variant: string;
  tagline: string;
  /** Hue (0–360) for the generated card art. */
  hue: number;
  pros: string[];
  cons: string[];
  specs: Record<string, SpecValue>;
  reviews: SeedReview[];
}

export interface UserReview extends SeedReview {
  id: string;
  itemId: string;
}
