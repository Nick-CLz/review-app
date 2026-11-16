"use client";

import { useSyncExternalStore } from "react";
import { buildSeed } from "./seed";
import type { DB, Item, Price, Review, Store } from "./types";

const KEY = "review-app-db-v1";
const SERVER_DB = buildSeed();

let db: DB | null = null;
const listeners = new Set<() => void>();

function load(): DB {
  if (db) return db;
  try {
    const raw = localStorage.getItem(KEY);
    db = raw ? (JSON.parse(raw) as DB) : buildSeed();
  } catch {
    db = buildSeed();
  }
  return db;
}

function commit(next: DB) {
  db = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage full or blocked: keep in memory */
  }
  listeners.forEach((l) => l());
}

function update(fn: (d: DB) => DB) {
  commit(fn(load()));
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      db = null;
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

export function useDB(): DB {
  return useSyncExternalStore(subscribe, load, () => SERVER_DB);
}

export const uid = (p: string) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export const today = () => new Date().toLocaleDateString("en-CA"); // local YYYY-MM-DD

export const actions = {
  addItem(item: Omit<Item, "id" | "createdAt">, prices: { storeId: string; price: number }[]) {
    const id = uid("item");
    update((d) => ({
      ...d,
      items: [...d.items, { ...item, id, createdAt: today() }],
      prices: [
        ...d.prices,
        ...prices.map((p) => ({ id: uid("p"), itemId: id, storeId: p.storeId, price: p.price, date: today() })),
      ],
    }));
    return id;
  },
  updateItem(id: string, patch: Partial<Item>) {
    update((d) => ({ ...d, items: d.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));
  },
  deleteItem(id: string) {
    update((d) => ({
      ...d,
      items: d.items.filter((i) => i.id !== id),
      prices: d.prices.filter((p) => p.itemId !== id),
      reviews: d.reviews.filter((r) => r.itemId !== id),
      compare: d.compare.filter((c) => c !== id),
    }));
  },
  addPrice(p: Omit<Price, "id">) {
    update((d) => ({ ...d, prices: [...d.prices, { ...p, id: uid("p") }] }));
  },
  deletePrice(id: string) {
    update((d) => ({ ...d, prices: d.prices.filter((p) => p.id !== id) }));
  },
  addReview(r: Omit<Review, "id">) {
    update((d) => ({ ...d, reviews: [{ ...r, id: uid("r") }, ...d.reviews] }));
  },
  deleteReview(id: string) {
    update((d) => ({ ...d, reviews: d.reviews.filter((r) => r.id !== id) }));
  },
  addStore(name: string, color: string): Store {
    const store = { id: uid("store"), name, color };
    update((d) => ({ ...d, stores: [...d.stores, store] }));
    return store;
  },
  toggleCompare(id: string) {
    update((d) => ({
      ...d,
      compare: d.compare.includes(id) ? d.compare.filter((c) => c !== id) : [...d.compare, id].slice(-4),
    }));
  },
  clearCompare() {
    update((d) => ({ ...d, compare: [] }));
  },
  reset() {
    commit(buildSeed());
  },
  importJSON(json: string) {
    const parsed = JSON.parse(json) as DB;
    if (!Array.isArray(parsed.items) || !Array.isArray(parsed.stores)) throw new Error("Not a valid export file");
    commit({ ...buildSeed(), ...parsed, compare: parsed.compare ?? [] });
  },
};
