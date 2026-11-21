"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { actions, today, useDB, useSyncStatus } from "@/lib/store";
import { baht, latestPrices, ratingStats, savings, UNIT_BASE, unitPrice } from "@/lib/stats";
import { CompareToggle, ItemImage, ListButton, StarInput, Stars, StoreBadge } from "@/components/ui";
import { PriceChart } from "@/components/PriceChart";
import { useT } from "@/lib/i18n";
import { SignInGate, useViewer } from "@/components/auth";
import type { Review } from "@/lib/types";

export default function ItemPage() {
  const { id } = useParams<{ id: string }>();
  const db = useDB();
  const router = useRouter();
  const status = useSyncStatus();
  const viewer = useViewer();
  const t = useT();
  const item = db.items.find((i) => i.id === id);
  const storeMap = useMemo(() => new Map(db.stores.map((s) => [s.id, s])), [db.stores]);

  if (!item) {
    if (status === "loading") return <div className="card p-10 text-center text-zinc-500">{t("common.loading")}</div>;
    return (
      <div className="card p-10 text-center">
        <p className="text-zinc-500">{t("item.notFound")}</p>
        <Link href="/" className="mt-3 inline-block text-indigo-600 underline">{t("item.back")}</Link>
      </div>
    );
  }

  const prices = latestPrices(db, item.id);
  const itemPrices = db.prices.filter((p) => p.itemId === item.id);
  const history = [...itemPrices].sort((a, b) => b.date.localeCompare(a.date));
  const reviews = db.reviews.filter((r) => r.itemId === item.id);
  const rating = ratingStats(db, item.id);
  const save = savings(db, item.id);
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: reviews.filter((r) => r.rating === n).length }));

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">{t("item.all")}</Link>

      <section className="card flex flex-wrap items-start gap-5 p-6">
        <div className="space-y-1">
          <ItemImage item={item} className="h-28 w-28 text-5xl" />
          {item.imageUrl?.startsWith("https://images.openfoodfacts.org/") && (
            <a
              href={item.barcode ? `https://world.openfoodfacts.org/product/${item.barcode}` : "https://world.openfoodfacts.org"}
              target="_blank"
              rel="noreferrer"
              className="block w-28 text-center text-[10px] leading-tight text-zinc-500 hover:underline"
            >
              {t("item.photoCredit")}
            </a>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm text-zinc-500">{item.brand} · {item.category}</div>
          <h1 className="text-2xl font-bold">{item.name}</h1>
          {item.nameTh && <div className="text-zinc-500">{item.nameTh}</div>}
          <div className="mt-2 flex items-center gap-2">
            <Stars value={rating.avg} size="lg" />
            <span className="text-sm text-zinc-500">{rating.count ? t("item.reviewCount", { avg: rating.avg.toFixed(1), n: rating.count }) : t("browse.noReviews")}</span>
          </div>
          <dl className="mt-3 flex flex-wrap gap-2 text-xs">
            <Spec k={t("item.size")} v={`${item.size} ${item.unit}`} />
            {item.barcode && <Spec k={t("item.barcode")} v={item.barcode} />}
            {Object.entries(item.attributes).map(([k, v]) => <Spec key={k} k={k} v={v} />)}
          </dl>
        </div>
        <div className="flex gap-2">
          <ListButton itemId={item.id} />
          <CompareToggle itemId={item.id} />
          {viewer.canDelete(item) && (
          <button
            className="btn-ghost text-red-600"
            onClick={() => {
              if (confirm(t("item.deleteConfirm", { name: item.name }))) {
                actions.deleteItem(item.id);
                router.push("/");
              }
            }}
          >
            {t("item.delete")}
          </button>
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="card min-w-0 p-5 lg:col-span-2">
          <h2 className="mb-3 font-semibold">{t("item.pricesByStore")}</h2>
          {save && (
            <div className="mb-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
              {t("item.cheaperBy", { store: storeMap.get(save.cheapest)?.name ?? "", amount: baht(save.amount), pct: save.pct.toFixed(0) })}
            </div>
          )}
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-zinc-500">
              <tr><th className="py-1">{t("item.store")}</th><th className="text-right">{t("item.price")}</th><th className="text-right">{t("item.per", { unit: UNIT_BASE[item.unit].label })}</th></tr>
            </thead>
            <tbody>
              {prices.map((p, i) => (
                <tr key={p.id} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="py-2">
                    <StoreBadge store={storeMap.get(p.storeId)} />
                    {p.promo && <div className="mt-1 text-xs text-amber-600">🏷 {p.promo}</div>}
                  </td>
                  <td className={`text-right ${i === 0 && prices.length > 1 ? "font-bold text-emerald-600" : ""}`}>{baht(p.price)}</td>
                  <td className="text-right text-zinc-500">{baht(unitPrice(item, p.price))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!prices.length && <p className="text-sm text-zinc-500">{t("item.noPrices")}</p>}
          <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <SignInGate action="action.logPrice">
              <AddPrice itemId={item.id} />
            </SignInGate>
          </div>
          {history.length > 0 && (
            <details className="mt-4 text-sm">
              <summary className="cursor-pointer text-zinc-500">{t("item.history", { n: history.length })}</summary>
              <ul className="mt-2 space-y-1">
                {history.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2">
                    <span className="text-zinc-500">{p.date}</span>
                    <StoreBadge store={storeMap.get(p.storeId)} />
                    <span>{baht(p.price)}</span>
                    {viewer.canDelete(p) ? (
                      <button className="text-xs text-zinc-400 hover:text-red-600" onClick={() => actions.deletePrice(p.id)} aria-label={t("item.deletePrice")}>✕</button>
                    ) : <span className="w-3" />}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>

        <section className="min-w-0 space-y-4 lg:col-span-3">
          <div className="card p-5">
            <h2 className="mb-3 font-semibold">{t("chart.title")}</h2>
            <PriceChart itemName={item.name} prices={itemPrices} stores={db.stores} />
          </div>
          <div className="card p-5">
            <h2 className="mb-3 font-semibold">{t("item.reviews")}</h2>
            {rating.count > 0 && (
              <div className="mb-4 space-y-1">
                {dist.map(({ n, c }) => (
                  <div key={n} className="flex items-center gap-2 text-xs">
                    <span className="w-6 text-right">{n}★</span>
                    <div className="h-2 flex-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div className="h-2 rounded-full bg-amber-400" style={{ width: `${(c / rating.count) * 100}%` }} />
                    </div>
                    <span className="w-4 text-zinc-500">{c}</span>
                  </div>
                ))}
              </div>
            )}
            <SignInGate action="action.review">
              <ReviewForm
                key={reviews.find((r) => viewer.userId && r.userId === viewer.userId)?.id ?? "new"}
                itemId={item.id}
                mine={reviews.find((r) => viewer.userId && r.userId === viewer.userId)}
                authorName={viewer.name}
              />
            </SignInGate>
          </div>
          {reviews.map((r) => (
            <article key={r.id} className="card p-4">
              <div className="flex items-center gap-2">
                <Stars value={r.rating} />
                <b className="text-sm">{r.title}</b>
                {viewer.userId && r.userId === viewer.userId && <span className="ml-auto rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{t("item.yourReview")}</span>}
                {viewer.canDelete(r) && (
                  <button className={`${viewer.userId && r.userId === viewer.userId ? "" : "ml-auto "}text-xs text-zinc-400 hover:text-red-600`} onClick={() => confirm(t("item.deleteReviewConfirm")) && actions.deleteReview(r.id)} aria-label={t("item.deleteReview")}>✕</button>
                )}
              </div>
              {r.body && <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{r.body}</p>}
              <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                <span>{r.author || t("item.anonymous")} · {r.date}</span>
                {r.storeId && <>· {t("item.boughtAt")} <StoreBadge store={storeMap.get(r.storeId)} /></>}
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-md bg-zinc-100 px-2 py-1 dark:bg-zinc-800">
      <dt className="inline text-zinc-500">{k}: </dt>
      <dd className="inline font-medium">{v}</dd>
    </div>
  );
}

function AddPrice({ itemId }: { itemId: string }) {
  const db = useDB();
  const t = useT();
  const [storeId, setStoreId] = useState(db.stores[0]?.id ?? "");
  const [price, setPrice] = useState("");
  const [promo, setPromo] = useState("");
  const [date, setDate] = useState(today());

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        const n = parseFloat(price);
        if (!storeId || !(n > 0)) return;
        actions.addPrice({ itemId, storeId, price: n, promo: promo.trim() || undefined, date });
        setPrice("");
        setPromo("");
      }}
    >
      <div className="text-xs font-medium text-zinc-500">{t("price.log")}</div>
      <div className="grid grid-cols-2 gap-2">
        <select className="input" value={storeId} onChange={(e) => setStoreId(e.target.value)} aria-label={t("price.store")}>
          {db.stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input className="input" type="number" step="0.25" min="0" placeholder={t("price.ph")} value={price} onChange={(e) => setPrice(e.target.value)} aria-label={t("item.price")} required />
        <input className="input" placeholder={t("price.promo")} value={promo} onChange={(e) => setPromo(e.target.value)} aria-label={t("price.promo")} />
        <input className="input" type="date" max={today()} value={date} onChange={(e) => setDate(e.target.value)} aria-label={t("price.date")} />
      </div>
      <button className="btn-primary w-full">{t("price.save")}</button>
    </form>
  );
}

function ReviewForm({ itemId, mine, authorName }: { itemId: string; mine?: Review; authorName: string }) {
  const db = useDB();
  const t = useT();
  const [rating, setRating] = useState(mine?.rating ?? 0);
  const [title, setTitle] = useState(mine?.title ?? "");
  const [body, setBody] = useState(mine?.body ?? "");
  const [storeId, setStoreId] = useState(mine?.storeId ?? "");
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!rating) return setErr(t("review.pickStars"));
        if (!title.trim()) return setErr(t("review.addTitle"));
        actions.addReview({ itemId, rating, title: title.trim(), body: body.trim(), storeId: storeId || undefined, date: today() }, authorName);
        setErr("");
        setSaved(true);
      }}
    >
      {mine && <p className="text-xs text-zinc-500">{t("review.mine", { date: mine.date })}</p>}
      <StarInput value={rating} onChange={(n) => { setRating(n); setErr(""); setSaved(false); }} />
      <input className="input" placeholder={t("review.titlePh")} value={title} onChange={(e) => { setTitle(e.target.value); setSaved(false); }} aria-label={t("review.title")} />
      <textarea className="input min-h-20" placeholder={t("review.bodyPh")} value={body} onChange={(e) => { setBody(e.target.value); setSaved(false); }} aria-label={t("review.body")} />
      <select className="input" value={storeId} onChange={(e) => setStoreId(e.target.value)} aria-label={t("review.boughtAt")}>
        <option value="">{t("review.boughtAt")}</option>
        {db.stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <div className="flex items-center gap-3">
        <button className="btn-primary">{mine ? t("review.update") : t("review.post")}</button>
        <span className="text-xs text-zinc-500">{saved ? t("review.saved") : t("review.postingAs", { name: authorName || t("review.you") })}</span>
      </div>
    </form>
  );
}
