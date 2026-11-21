"use client";

import Link from "next/link";
import { ItemImage, StoreBadge } from "@/components/ui";
import { useT } from "@/lib/i18n";
import { baht, basketPlan } from "@/lib/stats";
import { actions, useDB } from "@/lib/store";

export default function ListPage() {
  const db = useDB();
  const t = useT();
  const plan = basketPlan(db, db.list);
  const storeMap = new Map(db.stores.map((s) => [s.id, s]));
  const pricedCount = plan.lines.length - plan.unpriced.length;
  const cheapestTotal = plan.byStore.find((s) => s.complete)?.total;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="mr-auto">
          <h1 className="text-2xl font-bold">{t("list.title")}</h1>
          <p className="text-sm text-zinc-500">
            {t("list.lead")} {t("list.private")}
          </p>
        </div>
        {plan.lines.length > 0 && (
          <button className="btn-ghost" onClick={() => actions.clearList()}>
            {t("list.clear")}
          </button>
        )}
      </div>

      {plan.lines.length === 0 ? (
        <div className="card p-10 text-center text-zinc-500">
          {t("list.empty")}{" "}
          <Link href="/" className="text-indigo-600 underline">{t("nav.browse")} →</Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <section className="card min-w-0 divide-y divide-zinc-100 lg:col-span-3 dark:divide-zinc-800">
            <h2 className="p-4 font-semibold">{t("list.items", { n: plan.lines.length })}</h2>
            {plan.lines.map(({ item, qty, prices }) => (
              <div key={item.id} className="flex items-center gap-3 p-3">
                <ItemImage item={item} />
                <div className="min-w-0 flex-1">
                  <Link href={`/items/${item.id}`} className="block truncate text-sm font-medium hover:text-indigo-600">{item.name}</Link>
                  <div className="flex flex-wrap items-center gap-1 text-xs text-zinc-500">
                    {prices[0] ? (
                      <>
                        {t("list.each", { price: baht(prices[0].price) })} <StoreBadge store={storeMap.get(prices[0].storeId)} />
                      </>
                    ) : (
                      t("list.noPrice")
                    )}
                  </div>
                </div>
                <div className="flex items-center rounded-lg ring-1 ring-zinc-300 dark:ring-zinc-700">
                  <button className="h-8 w-8 text-lg hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => actions.setListQty(item.id, qty - 1)} aria-label={`${t("list.less")}: ${item.name}`}>−</button>
                  <input
                    className="h-8 w-10 bg-transparent text-center text-sm tabular-nums outline-none"
                    inputMode="numeric"
                    value={qty}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      if (n > 0) actions.setListQty(item.id, n);
                    }}
                    aria-label={t("list.qty", { name: item.name })}
                  />
                  <button className="h-8 w-8 text-lg hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => actions.setListQty(item.id, qty + 1)} aria-label={`${t("list.more")}: ${item.name}`}>+</button>
                </div>
                <button className="text-zinc-400 hover:text-red-600" onClick={() => actions.setListQty(item.id, 0)} aria-label={t("list.remove", { name: item.name })}>✕</button>
              </div>
            ))}
          </section>

          <div className="min-w-0 space-y-4 lg:col-span-2">
            {pricedCount > 0 && (
              <section className="card space-y-2 p-4">
                <h2 className="font-semibold">{t("list.byStore")}</h2>
                {plan.byStore.map((s) => (
                  <div key={s.store.id} className="flex items-center gap-2 text-sm">
                    <StoreBadge store={s.store} />
                    <span className="flex-1 text-xs text-zinc-500">{s.complete ? t("list.hasAll") : t("list.missing", { n: s.missing.length, total: pricedCount })}</span>
                    {s.complete && s.total === cheapestTotal && plan.byStore.filter((x) => x.complete).length > 1 && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{t("list.cheapest")}</span>
                    )}
                    <b className={`tabular-nums ${s.complete ? "" : "text-zinc-400"}`}>{baht(s.total)}</b>
                  </div>
                ))}
              </section>
            )}

            {plan.split.length > 0 && (
              <section className="card space-y-3 p-4">
                <h2 className="font-semibold">{t("list.split")}</h2>
                {plan.split.length === 1 ? (
                  <p className="text-sm text-zinc-500">{t("list.splitSame")}</p>
                ) : (
                  <>
                    <p className="text-xs text-zinc-500">{t("list.splitLead")}</p>
                    {plan.split.map(({ store, rows, total }) => (
                      <div key={store.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <StoreBadge store={store} />
                          <b className="text-sm tabular-nums">{baht(total)}</b>
                        </div>
                        <ul className="pl-2 text-xs text-zinc-600 dark:text-zinc-400">
                          {rows.map(({ line, price }) => (
                            <li key={line.item.id} className="flex justify-between gap-2">
                              <span className="truncate">{line.qty} × {line.item.name}</span>
                              <span className="tabular-nums">{baht(price.price * line.qty)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <div className="flex items-center justify-between border-t border-zinc-100 pt-2 text-sm dark:border-zinc-800">
                      <span>{t("list.total")}</span>
                      <b className="tabular-nums">{baht(plan.splitTotal)}</b>
                    </div>
                    {plan.bestSingle && plan.splitSaving > 0.004 && (
                      <p className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                        {t("list.splitSave", { amount: baht(plan.splitSaving), store: plan.bestSingle.store.name })}
                      </p>
                    )}
                  </>
                )}
              </section>
            )}

            {plan.unpriced.length > 0 && <p className="text-xs text-amber-600">{t("list.unpriced", { names: plan.unpriced.map((i) => i.name).join(", ") })}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
