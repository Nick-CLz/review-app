"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getCategory } from "@/lib/categories";
import { getProduct } from "@/lib/products";
import { clearCompare, MAX_COMPARE, removeFromCompare, useCompare } from "@/lib/store";

export default function CompareTray() {
  const ids = useCompare();
  const pathname = usePathname();
  const items = ids.map(getProduct).filter((p) => p !== undefined);
  if (!items.length || pathname === "/compare") return null;
  const cat = getCategory(items[0].category);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <span className="text-sm font-semibold">
          {cat?.icon} เทียบ{cat?.name} ({items.length}/{MAX_COMPARE})
        </span>
        <div className="flex flex-1 flex-wrap gap-2">
          {items.map((p) => (
            <span key={p.id} className="inline-flex items-center gap-1 rounded-full bg-surface-2 py-1 pr-1 pl-3 text-xs">
              {p.name}
              <button
                type="button"
                onClick={() => removeFromCompare(p.id)}
                className="grid h-5 w-5 place-items-center rounded-full hover:bg-line"
                aria-label={`นำ ${p.name} ออก`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <button type="button" onClick={clearCompare} className="text-xs text-muted hover:text-fg">
          ล้าง
        </button>
        <Link
          href="/compare"
          className={`btn-primary ${items.length < 2 ? "pointer-events-none opacity-50" : ""}`}
          aria-disabled={items.length < 2}
        >
          {items.length < 2 ? "เลือกอีกอย่างน้อย 1" : "เปรียบเทียบเลย →"}
        </Link>
      </div>
    </div>
  );
}
