"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { actions, today, useDB } from "@/lib/store";
import { baht, latestPrices, ratingStats, savings, UNIT_BASE, unitPrice } from "@/lib/stats";
import { CompareToggle, StarInput, Stars, StoreBadge } from "@/components/ui";

export default function ItemPage() {
  const { id } = useParams<{ id: string }>();
  const db = useDB();
  const router = useRouter();
  const item = db.items.find((i) => i.id === id);
  const storeMap = useMemo(() => new Map(db.stores.map((s) => [s.id, s])), [db.stores]);

  if (!item) {
    return (
      <div className="card p-10 text-center">
        <p className="text-zinc-500">Item not found.</p>
        <Link href="/" className="mt-3 inline-block text-indigo-600 underline">Back to browse</Link>
      </div>
    );
  }

  const prices = latestPrices(db, item.id);
  const history = db.prices.filter((p) => p.itemId === item.id).sort((a, b) => b.date.localeCompare(a.date));
  const reviews = db.reviews.filter((r) => r.itemId === item.id);
  const rating = ratingStats(db, item.id);
  const save = savings(db, item.id);
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: reviews.filter((r) => r.rating === n).length }));

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">← All items</Link>

      <section className="card flex flex-wrap items-start gap-5 p-6">
        <div className="grid h-20 w-20 place-items-center rounded-xl bg-zinc-100 text-5xl dark:bg-zinc-800">{item.emoji || "📦"}</div>
        <div className="min-w-0 flex-1">
          <div className="text-sm text-zinc-500">{item.brand} · {item.category}</div>
          <h1 className="text-2xl font-bold">{item.name}</h1>
          {item.nameTh && <div className="text-zinc-500">{item.nameTh}</div>}
          <div className="mt-2 flex items-center gap-2">
            <Stars value={rating.avg} size="lg" />
            <span className="text-sm text-zinc-500">{rating.count ? `${rating.avg.toFixed(1)} · ${rating.count} review${rating.count > 1 ? "s" : ""}` : "No reviews yet"}</span>
          </div>
          <dl className="mt-3 flex flex-wrap gap-2 text-xs">
            <Spec k="Size" v={`${item.size} ${item.unit}`} />
            {item.barcode && <Spec k="Barcode" v={item.barcode} />}
            {Object.entries(item.attributes).map(([k, v]) => <Spec key={k} k={k} v={v} />)}
          </dl>
        </div>
        <div className="flex gap-2">
          <CompareToggle itemId={item.id} />
          <button
            className="btn-ghost text-red-600"
            onClick={() => {
              if (confirm(`Delete "${item.name}" with its prices and reviews?`)) {
                actions.deleteItem(item.id);
                router.push("/");
              }
            }}
          >
            Delete
          </button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="card p-5 lg:col-span-2">
          <h2 className="mb-3 font-semibold">Prices by store</h2>
          {save && (
            <div className="mb-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
              <b>{storeMap.get(save.cheapest)?.name}</b> is cheaper by <b>{baht(save.amount)}</b> ({save.pct.toFixed(0)}%).
            </div>
          )}
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-zinc-500">
              <tr><th className="py-1">Store</th><th className="text-right">Price</th><th className="text-right">Per {UNIT_BASE[item.unit].label}</th></tr>
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
          {!prices.length && <p className="text-sm text-zinc-500">No prices yet.</p>}
          <AddPrice itemId={item.id} />
          {history.length > prices.length && (
            <details className="mt-4 text-sm">
              <summary className="cursor-pointer text-zinc-500">Price history ({history.length})</summary>
              <ul className="mt-2 space-y-1">
                {history.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2">
                    <span className="text-zinc-500">{p.date}</span>
                    <StoreBadge store={storeMap.get(p.storeId)} />
                    <span>{baht(p.price)}</span>
                    <button className="text-xs text-zinc-400 hover:text-red-600" onClick={() => actions.deletePrice(p.id)} aria-label="Delete price">✕</button>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>

        <section className="space-y-4 lg:col-span-3">
          <div className="card p-5">
            <h2 className="mb-3 font-semibold">Reviews</h2>
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
            <ReviewForm itemId={item.id} />
          </div>
          {reviews.map((r) => (
            <article key={r.id} className="card p-4">
              <div className="flex items-center gap-2">
                <Stars value={r.rating} />
                <b className="text-sm">{r.title}</b>
                <button className="ml-auto text-xs text-zinc-400 hover:text-red-600" onClick={() => actions.deleteReview(r.id)} aria-label="Delete review">✕</button>
              </div>
              {r.body && <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{r.body}</p>}
              <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                <span>{r.author || "Anonymous"} · {r.date}</span>
                {r.storeId && <>· bought at <StoreBadge store={storeMap.get(r.storeId)} /></>}
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
  const [storeId, setStoreId] = useState(db.stores[0]?.id ?? "");
  const [price, setPrice] = useState("");
  const [promo, setPromo] = useState("");
  const [date, setDate] = useState(today());

  return (
    <form
      className="mt-4 space-y-2 border-t border-zinc-100 pt-4 dark:border-zinc-800"
      onSubmit={(e) => {
        e.preventDefault();
        const n = parseFloat(price);
        if (!storeId || !(n > 0)) return;
        actions.addPrice({ itemId, storeId, price: n, promo: promo.trim() || undefined, date });
        setPrice("");
        setPromo("");
      }}
    >
      <div className="text-xs font-medium text-zinc-500">Seen a price? Log it</div>
      <div className="grid grid-cols-2 gap-2">
        <select className="input" value={storeId} onChange={(e) => setStoreId(e.target.value)} aria-label="Store">
          {db.stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input className="input" type="number" step="0.25" min="0" placeholder="Price ฿" value={price} onChange={(e) => setPrice(e.target.value)} aria-label="Price" required />
        <input className="input" placeholder="Promo (optional)" value={promo} onChange={(e) => setPromo(e.target.value)} aria-label="Promo" />
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Date" />
      </div>
      <button className="btn-primary w-full">Save price</button>
    </form>
  );
}

function ReviewForm({ itemId }: { itemId: string }) {
  const db = useDB();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");
  const [storeId, setStoreId] = useState("");
  const [err, setErr] = useState("");

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!rating) return setErr("Pick a star rating.");
        if (!title.trim()) return setErr("Add a short title.");
        actions.addReview({ itemId, rating, title: title.trim(), body: body.trim(), author: author.trim(), storeId: storeId || undefined, date: today() });
        setRating(0); setTitle(""); setBody(""); setErr("");
      }}
    >
      <StarInput value={rating} onChange={(n) => { setRating(n); setErr(""); }} />
      <input className="input" placeholder="Title — e.g. “Best value noodle”" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Review title" />
      <textarea className="input min-h-20" placeholder="What did you think? Taste, quality, value…" value={body} onChange={(e) => setBody(e.target.value)} aria-label="Review body" />
      <div className="grid grid-cols-2 gap-2">
        <input className="input" placeholder="Your name (optional)" value={author} onChange={(e) => setAuthor(e.target.value)} aria-label="Your name" />
        <select className="input" value={storeId} onChange={(e) => setStoreId(e.target.value)} aria-label="Bought at">
          <option value="">Bought at… (optional)</option>
          {db.stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button className="btn-primary">Post review</button>
    </form>
  );
}
