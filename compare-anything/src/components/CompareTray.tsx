"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { fullName, getItem } from "@/lib/items";
import { clearCompare, MAX_COMPARE, toggleCompare, useCompare } from "@/lib/store";

export default function CompareTray() {
  const ids = useCompare();
  const path = usePathname();
  if (!ids.length || path === "/compare") return null;
  const items = ids.map(getItem).filter((x) => x !== undefined);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
        <span className="text-sm font-semibold">
          เทียบ {items.length}/{MAX_COMPARE}
        </span>
        <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
          {items.map((i) => (
            <span key={i.id} className="inline-flex items-center gap-1 rounded-full bg-surface-2 py-1 pl-3 pr-1 text-xs">
              {fullName(i)}
              <button
                type="button"
                onClick={() => toggleCompare(i.id)}
                aria-label={`เอา ${fullName(i)} ออก`}
                className="grid h-5 w-5 place-items-center rounded-full hover:bg-line"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <button type="button" onClick={clearCompare} className="text-xs text-muted hover:text-fg">
          ล้าง
        </button>
        <Link href="/compare" className={`btn-primary ${items.length < 2 ? "pointer-events-none opacity-50" : ""}`}>
          เปรียบเทียบเลย →
        </Link>
      </div>
    </div>
  );
}
