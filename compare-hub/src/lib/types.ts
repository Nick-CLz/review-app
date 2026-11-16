/**
 * Generic "compare anything" model.
 * A Category defines which spec fields matter; Products fill those specs.
 * Insurance is the first vertical, but nothing here is insurance-specific.
 */

export type FieldType = "money" | "number" | "years" | "days" | "percent" | "text" | "bool";

export interface SpecField {
  key: string;
  label: string;
  type: FieldType;
  /** Which direction is better — used to highlight the winner in compare view. */
  better?: "higher" | "lower";
  /** Suffix shown after the value, e.g. "/ปี", "/วัน". */
  suffix?: string;
  hint?: string;
}

export interface Category {
  slug: string;
  group: string;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
  /** Spec key holding the price used for sorting & the headline price. */
  priceKey: string;
  priceSuffix: string;
  fields: SpecField[];
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

export interface Product {
  id: string;
  category: string;
  name: string;
  provider: string;
  tagline: string;
  badge?: string;
  highlights: string[];
  exclusions: string[];
  specs: Record<string, SpecValue>;
  reviews: SeedReview[];
}

export interface UserReview extends SeedReview {
  id: string;
  productId: string;
}

export interface Lead {
  id: string;
  productId: string;
  name: string;
  phone: string;
  email: string;
  birthDate: string;
  note: string;
  createdAt: string;
}
