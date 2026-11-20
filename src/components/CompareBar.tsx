"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { actions, useDB } from "@/lib/store";
import { useT } from "@/lib/i18n";

export function CompareBar() {
  const db = useDB();
  const pathname = usePathname();
  const t = useT();
  if (!db.compare.length || pathname === "/compare") return null;
  const items = db.compare.map((id) => db.items.find((i) => i.id === id)).filter(Boolean);

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
        <span className="text-sm font-semibold">{t("compareBar.title", { n: items.length })}</span>
        {items.map((i) => (
          <button
            key={i!.id}
            onClick={() => actions.toggleCompare(i!.id)}
            className="rounded-full bg-zinc-100 px-3 py-1 text-xs hover:bg-red-100 hover:text-red-700 dark:bg-zinc-800 dark:hover:bg-red-950"
            title={t("compareBar.remove")}
          >
            {i!.emoji} {i!.name} ✕
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <button className="btn-ghost" onClick={() => actions.clearCompare()}>
            {t("compareBar.clear")}
          </button>
          <Link href="/compare" className={`btn-primary ${items.length < 2 ? "pointer-events-none opacity-50" : ""}`}>
            {t("compareBar.go")}
          </Link>
        </div>
      </div>
    </div>
  );
}
