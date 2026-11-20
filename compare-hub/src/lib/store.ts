"use client";

import { useSyncExternalStore } from "react";
import type { Lead, UserReview } from "./types";

/**
 * Tiny localStorage-backed store. Per-browser only — swap for a real
 * database/API when reviews and leads need to be shared or reach a broker.
 */

const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function read<T>(key: string, fallback: T): T {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    /* storage blocked */
  }
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
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage blocked — state will reset on reload */
    cache.set(key, { raw: JSON.stringify(value), value });
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = () => cb();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

const EMPTY: never[] = [];

function useKey<T>(key: string): T[] {
  return useSyncExternalStore(
    subscribe,
    () => read<T[]>(key, EMPTY),
    () => EMPTY,
  );
}

// ── Compare list ──────────────────────────────────────────
const COMPARE = "ch.compare";
export const MAX_COMPARE = 4;

export function useCompare() {
  return useKey<string>(COMPARE);
}

/** Toggle a product. Compare list holds one category at a time. */
export function toggleCompare(id: string, category: string, categoryOf: (id: string) => string | undefined) {
  const cur = read<string[]>(COMPARE, EMPTY);
  if (cur.includes(id)) {
    write(COMPARE, cur.filter((x) => x !== id));
    return "removed" as const;
  }
  const same = cur.filter((x) => categoryOf(x) === category);
  if (same.length >= MAX_COMPARE) return "full" as const;
  write(COMPARE, [...same, id]);
  return same.length !== cur.length ? ("replaced" as const) : ("added" as const);
}

/** Replace the whole compare list, e.g. when adopting a shared link. */
export function setCompare(ids: string[]) {
  write(COMPARE, ids.slice(0, MAX_COMPARE));
}

export function clearCompare() {
  write(COMPARE, []);
}

export function removeFromCompare(id: string) {
  write(COMPARE, read<string[]>(COMPARE, EMPTY).filter((x) => x !== id));
}

// ── Reviews ───────────────────────────────────────────────
const REVIEWS = "ch.reviews";

export function useUserReviews() {
  return useKey<UserReview>(REVIEWS);
}

export function addReview(review: UserReview) {
  write(REVIEWS, [review, ...read<UserReview[]>(REVIEWS, EMPTY)]);
}

// ── Purchase leads ────────────────────────────────────────
const LEADS = "ch.leads";

export function useLeads() {
  return useKey<Lead>(LEADS);
}

export function addLead(lead: Lead) {
  write(LEADS, [lead, ...read<Lead[]>(LEADS, EMPTY)]);
}
