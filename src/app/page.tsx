"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useDB, useSyncStatus } from "@/lib/store";
import { baht, bestPrice, latestPrices, ratingStats, savings, UNIT_BASE, unitPrice } from "@/lib/stats";
import { CompareToggle, ItemImage, ListButton, Stars, StoreBadge } from "@/components/ui";
import { useT } from "@/lib/i18n";

type Sort = "rating" | "price" | "unit" | "savings" | "name";

export default function BrowsePage() {
  const db = useDB();
  const status = useSyncStatus();
  const t = useT();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [store, setStore] = useState("all");
  const [sort, setSort] = useState<Sort>("rating");

  const categories = useMemo(() => ["All", ...new Set(db.items.map((i) => i.category))].sort((a, b) => (a === "All" ? -1 : b === "All" ? 1 : a.localeCompare(b))), [db.items]);
  const storeMap = useMemo(() => new Map(db.stores.map((s) => [s.id, s])), [db.stores]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return db.items
      .filter((i) => cat === "All" || i.category === cat)
      .filter((i) => !needle || [i.name, i.nameTh, i.brand, i.category, i.barcode].some((f) => f?.toLowerCase().includes(needle)))
      .filter((i) => store === "all" || db.prices.some((p) => p.itemId === i.id && p.storeId === store))
      .map((i) => {
        const best = bestPrice(db, i.id);
        return { item: i, best, prices: latestPrices(db, i.id), rating: ratingStats(db, i.id), save: savings(db, i.id), unit: best ? unitPrice(i, best.price) : Infinity };
      })
      .sort((a, b) => {
        switch (sort) {
          case "rating": return b.rating.avg - a.rating.avg || b.rating.count - a.rating.count;
          case "price": return (a.best?.price ?? Infinity) - (b.best?.price ?? Infinity);
          case "unit": return a.unit - b.unit;
          case "savings": return (b.save?.pct ?? 0) - (a.save?.pct ?? 0);
          default: return a.item.name.localeCompare(b.item.name);
        }
      });
  }, [db, q, cat, store, sort]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow">
        <h1 className="text-2xl font-bold sm:text-3xl">{t("browse.title")}</h1>
        <p className="mt-1 max-w-2xl text-indigo-100">{t("browse.lead")}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <Stat n={db.items.length} label={t("stat.items")} />
          <Stat n={db.prices.length} label={t("stat.prices")} />
          <Stat n={db.reviews.length} label={t("stat.reviews")} />
          <Stat n={db.stores.length} label={t("stat.stores")} />
        </div>
      </section>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <label className="label" htmlFor="q">{t("browse.search")}</label>
          <input id="q" className="input" placeholder={t("browse.searchPh")} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="store">{t("browse.soldAt")}</label>
          <select id="store" className="input" value={store} onChange={(e) => setStore(e.target.value)}>
            <option value="all">{t("browse.anyStore")}</option>
            {db.stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="sort">{t("browse.sortBy")}</label>
          <select id="sort" className="input" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="rating">{t("sort.rating")}</option>
            <option value="price">{t("sort.price")}</option>
            <option value="unit">{t("sort.unit")}</option>
            <option value="savings">{t("sort.savings")}</option>
            <option value="name">{t("sort.name")}</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition ${c === cat ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800"}`}
          >
            {c === "All" ? t("cat.all") : c}
          </button>
        ))}
      </div>

      {rows.length === 0 && !db.items.length && status === "loading" ? (
        <div className="card p-10 text-center text-zinc-500">{t("browse.loading")}</div>
      ) : rows.length === 0 && !db.items.length && status === "error" ? (
        <div className="card p-10 text-center text-red-600">{t("browse.offline")}</div>
      ) : rows.length === 0 ? (
        <div className="card p-10 text-center text-zinc-500">
          {t("browse.empty")} <Link href="/add" className="text-indigo-600 underline">{t("browse.addIt")}</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ item, best, prices, rating, save }) => (
            <Link key={item.id} href={`/items/${item.id}`} className="card group flex flex-col p-4 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start gap-3">
                <ItemImage item={item} />
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-zinc-500">{item.brand} · {item.category}</div>
                  <h2 className="font-semibold leading-snug group-hover:text-indigo-600">{item.name}</h2>
                  {item.nameTh && <div className="text-sm text-zinc-500">{item.nameTh}</div>}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <Stars value={rating.avg} />
                <span className="text-zinc-500">{rating.count ? `${rating.avg.toFixed(1)} (${rating.count})` : t("browse.noReviews")}</span>
              </div>
              <div className="mt-3 space-y-1">
                {prices.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <StoreBadge store={storeMap.get(p.storeId)} />
                    <span className={p.id === best?.id && prices.length > 1 ? "font-bold text-emerald-600" : ""}>
                      {baht(p.price)}
                      <span className="ml-1 text-xs font-normal text-zinc-500">({baht(unitPrice(item, p.price))}/{UNIT_BASE[item.unit].label})</span>
                    </span>
                  </div>
                ))}
                {!prices.length && <div className="text-sm text-zinc-500">{t("browse.noPrices")}</div>}
              </div>
              <div className="mt-auto flex items-center justify-between pt-4">
                <span className="text-xs text-zinc-500">
                  {item.size} {item.unit}
                  {save && <> · {t("browse.saveAt", { amount: baht(save.amount), store: storeMap.get(save.cheapest)?.name ?? "" })}</>}
                </span>
                <span className="flex gap-1">
                  <ListButton itemId={item.id} compact />
                  <CompareToggle itemId={item.id} compact />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
      <p className="text-center text-xs text-zinc-500">{t("browse.footer")}
        <br />
        {t("browse.credit")} <a href="https://world.openfoodfacts.org" target="_blank" rel="noreferrer" className="underline">Open Food Facts</a> (ODbL / CC BY-SA).
      </p>
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-lg bg-white/15 px-3 py-1.5">
      <b className="text-lg">{n}</b> <span className="text-indigo-100">{label}</span>
    </div>
  );
}
