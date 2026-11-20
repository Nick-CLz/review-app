"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDB } from "@/lib/store";
import { useLangToggle, useT, type TKey } from "@/lib/i18n";
import { AuthButtons } from "./auth";
import { SyncBadge } from "./SyncBadge";

const LINKS: [href: string, key: TKey][] = [
  ["/", "nav.browse"],
  ["/scan", "nav.scan"],
  ["/compare", "nav.compare"],
  ["/list", "nav.list"],
  ["/add", "nav.add"],
  ["/data", "nav.data"],
];

export function Nav() {
  const t = useT();
  const db = useDB();
  const path = usePathname();
  const { toggle } = useLangToggle();
  const listCount = db.list.reduce((n, e) => n + e.qty, 0);

  return (
    <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-4 py-3 text-sm">
      <Link href="/" className="mr-auto flex items-center gap-2 text-lg font-bold tracking-tight">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">S</span>
        Shelfie
      </Link>
      <div className="order-last flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto">
        {LINKS.map(([href, key]) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 rounded-md px-3 py-1.5 font-medium ${
                active
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              }`}
            >
              {t(key)}
              {href === "/list" && listCount > 0 && (
                <span className="ml-1 rounded-full bg-indigo-600 px-1.5 text-[10px] font-bold text-white">{listCount}</span>
              )}
            </Link>
          );
        })}
      </div>
      <SyncBadge />
      <button
        type="button"
        onClick={toggle}
        aria-label={t("lang.switchLabel")}
        className="rounded-md px-2 py-1.5 text-xs font-semibold text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-100 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-800"
      >
        {t("lang.switch")}
      </button>
      <AuthButtons />
    </nav>
  );
}
