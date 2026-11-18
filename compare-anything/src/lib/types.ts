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

export interface Category {
  slug: string;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
  /** Spec key that holds the headline price. */
  priceKey: string;
  fields: SpecField[];
  filters: FilterDef[];
  comingSoon?: boolean;
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
