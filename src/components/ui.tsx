"use client";

import type { Store } from "@/lib/types";
import { actions, useDB } from "@/lib/store";

export function Stars({ value, size = "sm" }: { value: number; size?: "sm" | "lg" }) {
  const full = Math.round(value * 2) / 2;
  return (
    <span className={`inline-flex ${size === "lg" ? "text-xl" : "text-sm"} leading-none`} aria-label={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= full ? "text-amber-400" : i - 0.5 === full ? "text-amber-300" : "text-zinc-300 dark:text-zinc-700"}>
          ★
        </span>
      ))}
    </span>
  );
}

export function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1 text-2xl" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} star${i > 1 ? "s" : ""}`}
          onClick={() => onChange(i)}
          className={`transition hover:scale-110 ${i <= value ? "text-amber-400" : "text-zinc-300 dark:text-zinc-700"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function StoreBadge({ store, className = "" }: { store?: Store; className?: string }) {
  if (!store) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-white ${className}`}
      style={{ backgroundColor: store.color }}
    >
      {store.name}
    </span>
  );
}

export function CompareToggle({ itemId, compact = false }: { itemId: string; compact?: boolean }) {
  const db = useDB();
  const on = db.compare.includes(itemId);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        actions.toggleCompare(itemId);
      }}
      className={`btn ${compact ? "px-2 py-1 text-xs" : ""} ${
        on ? "bg-indigo-600 text-white hover:bg-indigo-500" : "border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
      }`}
      aria-pressed={on}
    >
      {on ? "✓ Comparing" : "+ Compare"}
    </button>
  );
}

/** Product photo when we have one, otherwise the emoji. */
export function ItemImage({ item, className = "h-12 w-12 text-2xl" }: { item: { name: string; emoji?: string; imageUrl?: string }; className?: string }) {
  return (
    <div className={`grid shrink-0 place-items-center overflow-hidden rounded-lg bg-white ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700 ${className}`}>
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary external hosts
        <img src={item.imageUrl} alt={item.name} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-contain" />
      ) : (
        item.emoji || "📦"
      )}
    </div>
  );
}
