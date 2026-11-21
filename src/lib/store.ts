"use client";

// Client-side view of the shared database.
// - Items, prices, reviews and stores come from Neon via /api/db and are shared by everyone.
// - Writes go through Server Functions (src/app/actions.ts). What's on screen is always
//   `base` (the last state the server confirmed) with the unanswered writes (`ops`) applied
//   on top, so a failed write is undone at once just by dropping its op.
// - The compare list and shopping list are personal and stay in this browser's localStorage.

import { useSyncExternalStore } from "react";
import * as server from "@/app/actions";
import type { ActionResult, ErrorCode } from "@/app/actions";
import type { DB, Item, ListEntry, Price, Review, Store } from "./types";

type Shared = Omit<DB, "compare" | "list" | "version">;
export type SyncStatus = "loading" | "ready" | "saving" | "error";

const CACHE_KEY = "shelfie-cache-v2"; // last server copy, for an instant first paint
const COMPARE_KEY = "shelfie-compare-v1";
const LIST_KEY = "shelfie-list-v1";
const POLL_MS = 20_000;

const EMPTY: Shared = { stores: [], items: [], prices: [], reviews: [] };
const SERVER_SNAPSHOT: DB = { version: 1, ...EMPTY, compare: [], list: [] };

type Op = (s: Shared) => Shared;
/** A failed save, shown as a toast (src/components/Toaster.tsx) in the reader's language. */
export interface Notice {
  id: number;
  code: ErrorCode | "network";
  message: string; // English detail from the server; shown as-is for "invalid"
}

let base: Shared = EMPTY; // last state confirmed by the server
let ops: Op[] = []; // optimistic changes the server hasn't answered yet
let shared: Shared = EMPTY; // base + ops: what the UI shows
let settled = 0; // writes that have finished; a refresh that overlaps one may be out of date
let lastPayload = ""; // raw text of the last /api/db response that was applied
let notice: Notice | null = null;
let noticeSeq = 0;
let compare: string[] = [];
let list: ListEntry[] = [];
let status: SyncStatus = "loading";
let lastError = "";
let viewerId: string | undefined; // set by <ViewerSync> from the Clerk session
let snapshot: DB = SERVER_SNAPSHOT;
let started = false;
const listeners = new Set<() => void>();

function rebuild() {
  shared = ops.reduce((s, op) => op(s), base);
}

function emit() {
  const known = (id: string) => shared.items.some((i) => i.id === id);
  snapshot = { version: 1, ...shared, compare: compare.filter(known), list: list.filter((e) => known(e.itemId)) };
  listeners.forEach((l) => l());
}

function safeGet(key: string) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSet(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* blocked or full */ }
}

export async function refresh() {
  const seen = settled;
  try {
    const res = await fetch("/api/db", { cache: "no-store" });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const text = await res.text();
    // A write is in flight or finished while this request was, so the response may be older
    // than what's on screen. The refresh that follows that write will land the final state.
    if (ops.length > 0 || settled !== seen) return;
    // Nothing changed since the last poll: keep the same objects so nothing re-renders.
    if (text === lastPayload && status === "ready") return;
    const data = JSON.parse(text) as Shared;
    base = { stores: data.stores, items: data.items, prices: data.prices, reviews: data.reviews };
    lastPayload = text;
    rebuild();
    safeSet(CACHE_KEY, JSON.stringify(base));
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
    if (cached) base = shared = JSON.parse(cached) as Shared;
    compare = JSON.parse(safeGet(COMPARE_KEY) ?? "[]") as string[];
    list = parseList(safeGet(LIST_KEY));
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
    if (e.key === LIST_KEY) {
      list = parseList(e.newValue);
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

export function useNotice() {
  return useSyncExternalStore(subscribe, () => notice, () => null);
}
export function dismissNotice() {
  notice = null;
  emit();
}

/**
 * Apply a change locally right away and persist it on the server.
 * Resolves to true once the server has saved it, or false if it was rejected and undone.
 */
async function mutate(local: Op, remote: () => Promise<ActionResult>): Promise<boolean> {
  ops.push(local);
  rebuild();
  status = "saving";
  emit();
  let failure: Pick<Notice, "code" | "message"> | null = null;
  try {
    const result = await remote();
    if (!result.ok) failure = { code: result.code, message: result.error };
  } catch (e) {
    // Network failure or a server crash before the action could report back
    console.error(e);
    failure = { code: "network", message: "Couldn't reach the server." };
  }
  ops = ops.filter((op) => op !== local);
  settled++;
  if (failure) {
    notice = { id: ++noticeSeq, ...failure };
  } else {
    base = local(base); // confirmed; the refresh below replaces it with the server's own copy
  }
  rebuild();
  emit();
  // Re-sync in the background; callers get their answer without waiting for it.
  if (ops.length === 0) void refresh();
  return !failure;
}

function parseList(raw: string | null): ListEntry[] {
  try {
    const v = JSON.parse(raw ?? "[]") as unknown;
    if (!Array.isArray(v)) return [];
    return v
      .filter((e): e is ListEntry => !!e && typeof e.itemId === "string" && Number.isInteger(e.qty) && e.qty > 0)
      .map((e) => ({ itemId: e.itemId, qty: Math.min(e.qty, 99) }));
  } catch {
    return [];
  }
}

function setList(next: ListEntry[]) {
  list = next;
  safeSet(LIST_KEY, JSON.stringify(next));
  emit();
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
    const saved = mutate(
      (s) => ({ ...s, items: [...s.items, full], prices: [...s.prices, ...rows] }),
      () => server.addItemAction({ ...item, id }, rows.map(({ id, storeId, price, date }) => ({ id, storeId, price, date }))),
    );
    return { id, saved };
  },
  async deleteItem(id: string) {
    const ok = await mutate(
      (s) => ({ ...s, items: s.items.filter((i) => i.id !== id), prices: s.prices.filter((p) => p.itemId !== id), reviews: s.reviews.filter((r) => r.itemId !== id) }),
      () => server.deleteItemAction(id),
    );
    // emit() already hides unknown items; forget them for good only once the delete is real,
    // so a rejected delete doesn't cost the person their compare or shopping list entry.
    if (ok) {
      if (compare.includes(id)) setCompare(compare.filter((c) => c !== id));
      if (list.some((e) => e.itemId === id)) setList(list.filter((e) => e.itemId !== id));
    }
    return ok;
  },
  addPrice(p: Omit<Price, "id" | "userId">) {
    const row = { ...p, id: uid("p") };
    return mutate((s) => ({ ...s, prices: [...s.prices, { ...row, userId: viewerId }] }), () => server.addPriceAction(row));
  },
  deletePrice(id: string) {
    return mutate((s) => ({ ...s, prices: s.prices.filter((p) => p.id !== id) }), () => server.deletePriceAction(id));
  },
  /** Posting again on the same item replaces your earlier review. */
  addReview(r: Omit<Review, "id" | "author" | "userId">, authorName: string) {
    const mine = (x: Review) => x.itemId === r.itemId && !!viewerId && x.userId === viewerId;
    // The server keeps the id of the review being replaced; do the same so the row (and any
    // UI keyed on it) stays put instead of flipping to a new id and back.
    const fresh = uid("r");
    const row = { ...r, id: shared.reviews.find(mine)?.id ?? fresh };
    return mutate(
      (s) => ({ ...s, reviews: [{ ...row, author: authorName, userId: viewerId }, ...s.reviews.filter((x) => !mine(x))] }),
      // Always send a new id: on a replace the server ignores it and keeps the existing row's id.
      () => server.addReviewAction({ ...r, id: fresh }),
    );
  },
  deleteReview(id: string) {
    return mutate((s) => ({ ...s, reviews: s.reviews.filter((r) => r.id !== id) }), () => server.deleteReviewAction(id));
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
  /** Add one more of an item to the shopping list. */
  addToList(itemId: string) {
    const cur = list.find((e) => e.itemId === itemId);
    setList(cur ? list.map((e) => (e.itemId === itemId ? { ...e, qty: Math.min(e.qty + 1, 99) } : e)) : [...list, { itemId, qty: 1 }]);
  },
  /** Set the quantity; 0 removes the item. */
  setListQty(itemId: string, qty: number) {
    const n = Math.max(0, Math.min(99, Math.round(qty)));
    setList(n ? list.map((e) => (e.itemId === itemId ? { ...e, qty: n } : e)) : list.filter((e) => e.itemId !== itemId));
  },
  clearList() {
    setList([]);
  },
};
