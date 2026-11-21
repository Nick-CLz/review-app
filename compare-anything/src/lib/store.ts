"use client";

import { useSyncExternalStore } from "react";
import { getItem } from "./items";
import type { UserReview } from "./types";

/**
 * Tiny localStorage-backed store (per browser). Swap for a real database
 * when reviews need to be shared between users.
 */

const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; value: unknown }>();
const memory = new Map<string, string>();

function getRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return memory.get(key) ?? null;
  }
}

function read<T>(key: string, fallback: T): T {
  const raw = getRaw(key);
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  if (raw) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

function write<T>(key: string, value: T) {
  const raw = JSON.stringify(value);
  try {
    window.localStorage.setItem(key, raw);
  } catch {
    memory.set(key, raw);
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

const EMPTY: never[] = [];

function useList<T>(key: string): T[] {
  return useSyncExternalStore(
    subscribe,
    () => read<T[]>(key, EMPTY),
    () => EMPTY,
  );
}

// ── Compare list (any items, any type — up to 4) ──────────
const COMPARE = "ca.compare";
export const MAX_COMPARE = 4;

export function useCompare() {
  return useList<string>(COMPARE);
}

/**
 * Add or remove an item. The list holds one category at a time (cars and
 * motorcycles have different specs), so adding from another category starts a new list.
 */
export function toggleCompare(id: string): "added" | "removed" | "full" | "replaced" {
  const cur = read<string[]>(COMPARE, EMPTY);
  if (cur.includes(id)) {
    write(COMPARE, cur.filter((x) => x !== id));
    return "removed";
  }
  const cat = getItem(id)?.category;
  if (cur.length && getItem(cur[0])?.category !== cat) {
    write(COMPARE, [id]);
    return "replaced";
  }
  if (cur.length >= MAX_COMPARE) return "full";
  write(COMPARE, [...cur, id]);
  return "added";
}

export function setCompare(ids: string[]) {
  write(COMPARE, ids.slice(0, MAX_COMPARE));
}

export function clearCompare() {
  write(COMPARE, []);
}

// ── Reviews ───────────────────────────────────────────────
const REVIEWS = "ca.reviews";

export function useUserReviews() {
  return useList<UserReview>(REVIEWS);
}

export function addReview(review: UserReview) {
  write(REVIEWS, [review, ...read<UserReview[]>(REVIEWS, EMPTY)]);
}
