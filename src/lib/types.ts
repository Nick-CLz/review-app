export type Unit = "ml" | "g" | "pcs";

export interface Store {
  id: string;
  name: string;
  color: string; // hex, used for badges
  userId?: string; // who added it; undefined = sample data
}

export interface Item {
  id: string;
  name: string;
  nameTh?: string;
  brand: string;
  category: string;
  size: number; // quantity per pack, in `unit`
  unit: Unit;
  barcode?: string;
  emoji?: string;
  imageUrl?: string;
  attributes: Record<string, string>; // free-form specs so we can review "anything"
  createdAt: string;
  userId?: string;
}

export interface Price {
  id: string;
  itemId: string;
  storeId: string;
  price: number; // THB
  promo?: string;
  date: string; // ISO date the price was seen
  userId?: string;
}

export interface Review {
  id: string;
  itemId: string;
  rating: number; // 1-5
  title: string;
  body: string;
  author: string;
  storeId?: string;
  date: string;
  userId?: string;
}

export interface DB {
  version: number;
  stores: Store[];
  items: Item[];
  prices: Price[];
  reviews: Review[];
  compare: string[]; // item ids queued for comparison
}
