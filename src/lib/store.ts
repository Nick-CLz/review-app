"use client";

// Client-side view of the shared database.
// - Items, prices, reviews and stores come from Neon via /api/db and are shared by everyone.
// - Writes go through Server Functions (src/app/actions.ts); the UI updates optimistically,
//   then re-syncs from the server.
// - The compare list is personal and stays in this browser's localStorage.

import { useSyncExternalStore } from "react";
import * as server from "@/app/actions";
import type { ActionResult } from "@/app/actions";
import type { DB, Item, Price, Review, Store } from "./types";

type Shared = Omit<DB, "compare" | "version">;
export type SyncStatus = "loading" | "ready" | "saving" | "error";

const CACHE_KEY = "shelfie-cache-v2"; // last server copy, for an instant first paint
const COMPARE_KEY = "shelfie-compare-v1";
const POLL_MS = 20_000;

const EMPTY: Shared = { stores: [], items: [], prices: [], reviews: [] };
const SERVER_SNAPSHOT: DB = { version: 1, ...EMPTY, compare: [] };

let shared: Shared = EMPTY;
let compare: string[] = [];
let status: SyncStatus = "loading";
let lastError = "";
let viewerId: string | undefined; // set by <ViewerSync> from the Clerk session
let snapshot: DB = SERVER_SNAPSHOT;
let started = false;
let pending = 0;
let writes = 0; // bumped by every write, so a refresh that started before it can be thrown away
const listeners = new Set<() => void>();

function emit() {
  snapshot = { version: 1, ...shared, compare: compare.filter((id) => shared.items.some((i) => i.id === id)) };
  listeners.forEach((l) => l());
}

function safeGet(key: string) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSet(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* blocked or full */ }
}

export async function refresh() {
  const startedAt = writes;
  try {
    const res = await fetch("/api/db", { cache: "no-store" });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const data = (await res.json()) as Shared;
    // A write started or finished while this request was in flight, so the response may be
    // older than what's on screen. The refresh that follows that write will land the final state.
    if (pending > 0 || writes !== startedAt) return;
    shared = { stores: data.stores, items: data.items, prices: data.prices, reviews: data.reviews };
    safeSet(CACHE_KEY, JSON.stringify(shared));
    status = "ready";
    lastError = "";
  } catch (e) {
    status = "error";
    lastError = (e as Error).message;
  }
  emit();
}

function start() {
  if (started) return;
  started = true;
  try {
    const cached = safeGet(CACHE_KEY);
    if (cached) shared = JSON.parse(cached) as Shared;
    compare = JSON.parse(safeGet(COMPARE_KEY) ?? "[]") as string[];
  } catch { /* ignore bad cache */ }
  emit();
  refresh();
  setInterval(() => document.visibilityState === "visible" && refresh(), POLL_MS);
  window.addEventListener("focus", () => refresh());
  window.addEventListener("storage", (e) => {
    if (e.key === COMPARE_KEY) {
      compare = JSON.parse(e.newValue ?? "[]");
      emit();
    }
  });
}

function subscribe(l: () => void) {
  listeners.add(l);
  start();
  return () => listeners.delete(l);
}

export function useDB(): DB {
  return useSyncExternalStore(subscribe, () => snapshot, () => SERVER_SNAPSHOT);
}

export function useSyncStatus() {
  return useSyncExternalStore(subscribe, () => status, () => "loading" as SyncStatus);
}
export const getLastError = () => lastError;
export function setViewerId(id: string | undefined) {
  viewerId = id;
}

/** Apply a change locally right away, persist it on the server, then re-sync. */
async function mutate(local: (s: Shared) => Shared, remote: () => Promise<ActionResult>) {
  shared = local(shared);
  pending++;
  writes++;
  status = "saving";
  emit();
  let error: string | undefined;
  try {
    const result = await remote();
    if (!result.ok) error = result.error;
  } catch (e) {
    // Network failure or a server crash before the action could report back
    console.error(e);
    error = "Couldn't reach the server.";
  } finally {
    pending--;
    writes++;
  }
  if (error) {
    lastError = `${error} Your change was undone.`;
    alert(lastError);
  }
  if (pending === 0) await refresh();
}

function setCompare(next: string[]) {
  compare = next;
  safeSet(COMPARE_KEY, JSON.stringify(next));
  emit();
}

export const uid = (p: string) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export const today = () => new Date().toLocaleDateString("en-CA"); // local YYYY-MM-DD

export const actions = {
  addItem(item: Omit<Item, "id" | "createdAt" | "userId">, prices: { storeId: string; price: number }[]) {
    const id = uid("item");
    const full: Item = { ...item, id, createdAt: today(), userId: viewerId };
    const rows: Price[] = prices.map((p) => ({ id: uid("p"), itemId: id, storeId: p.storeId, price: p.price, date: today(), userId: viewerId }));
    mutate(
      (s) => ({ ...s, items: [...s.items, full], prices: [...s.prices, ...rows] }),
      () => server.addItemAction({ ...item, id }, rows.map(({ id, storeId, price, date }) => ({ id, storeId, price, date }))),
    );
    return id;
  },
  deleteItem(id: string) {
    setCompare(compare.filter((c) => c !== id));
    mutate(
      (s) => ({ ...s, items: s.items.filter((i) => i.id !== id), prices: s.prices.filter((p) => p.itemId !== id), reviews: s.reviews.filter((r) => r.itemId !== id) }),
      () => server.deleteItemAction(id),
    );
  },
  addPrice(p: Omit<Price, "id" | "userId">) {
    const row = { ...p, id: uid("p") };
    mutate((s) => ({ ...s, prices: [...s.prices, { ...row, userId: viewerId }] }), () => server.addPriceAction(row));
  },
  deletePrice(id: string) {
    mutate((s) => ({ ...s, prices: s.prices.filter((p) => p.id !== id) }), () => server.deletePriceAction(id));
  },
  /** Posting again on the same item replaces your earlier review. */
  addReview(r: Omit<Review, "id" | "author" | "userId">, authorName: string) {
    const row = { ...r, id: uid("r") };
    const mine = (x: Review) => x.itemId === r.itemId && !!viewerId && x.userId === viewerId;
    mutate(
      (s) => ({ ...s, reviews: [{ ...row, author: authorName, userId: viewerId }, ...s.reviews.filter((x) => !mine(x))] }),
      () => server.addReviewAction(row),
    );
  },
  deleteReview(id: string) {
    mutate((s) => ({ ...s, reviews: s.reviews.filter((r) => r.id !== id) }), () => server.deleteReviewAction(id));
  },
  addStore(name: string, color: string): Store {
    const store = { id: uid("store"), name, color };
    mutate((s) => ({ ...s, stores: [...s.stores, { ...store, userId: viewerId }] }), () => server.addStoreAction(store));
    return store;
  },
  toggleCompare(id: string) {
    setCompare(compare.includes(id) ? compare.filter((c) => c !== id) : [...compare, id].slice(-4));
  },
  clearCompare() {
    setCompare([]);
  },
};
