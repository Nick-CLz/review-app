"use client";

import Link from "next/link";
import { actions, useDB } from "@/lib/store";
import { baht, bestPrice, latestPrices, ratingStats, UNIT_BASE, unitPrice } from "@/lib/stats";
import { ItemImage, Stars, StoreBadge } from "@/components/ui";
import type { Item } from "@/lib/types";

type Cell = { node: React.ReactNode; score?: number };
type Row = { label: React.ReactNode; cells: Cell[]; better?: "low" | "high" };

export default function ComparePage() {
  const db = useDB();
  const items = db.compare.map((id) => db.items.find((i) => i.id === id)).filter((i): i is Item => !!i);
  const others = db.items.filter((i) => !db.compare.includes(i.id));
  const units = new Set(items.map((i) => i.unit));
  const sameUnit = units.size === 1;

  const rows: Row[] = [];
  if (items.length) {
    rows.push({ label: "Brand", cells: items.map((i) => ({ node: i.brand })) });
    rows.push({ label: "Category", cells: items.map((i) => ({ node: i.category })) });
    rows.push({ label: "Size", cells: items.map((i) => ({ node: `${i.size} ${i.unit}`, score: sameUnit ? i.size : undefined })), better: "high" });

    for (const s of db.stores) {
      if (!items.some((i) => latestPrices(db, i.id).some((p) => p.storeId === s.id))) continue;
      rows.push({
        label: <StoreBadge store={s} />,
        better: "low",
        cells: items.map((i) => {
          const p = latestPrices(db, i.id).find((x) => x.storeId === s.id);
          return p ? { node: <>{baht(p.price)}{p.promo && <div className="text-xs text-amber-600">🏷 {p.promo}</div>}</>, score: p.price } : { node: <span className="text-zinc-400">—</span> };
        }),
      });
    }

    rows.push({
      label: "Best price",
      better: "low",
      cells: items.map((i) => {
        const b = bestPrice(db, i.id);
        return b ? { node: <span className="inline-flex items-center gap-1">{baht(b.price)} <StoreBadge store={db.stores.find((s) => s.id === b.storeId)} /></span>, score: b.price } : { node: "—" };
      }),
    });

    rows.push({
      label: sameUnit ? `Price per ${UNIT_BASE[[...units][0]].label}` : "Unit price",
      better: "low",
      cells: items.map((i) => {
        const b = bestPrice(db, i.id);
        if (!b) return { node: "—" };
        const u = unitPrice(i, b.price);
        return { node: `${baht(u)} / ${UNIT_BASE[i.unit].label}`, score: sameUnit ? u : undefined };
      }),
    });

    rows.push({
      label: "Rating",
      better: "high",
      cells: items.map((i) => {
        const r = ratingStats(db, i.id);
        return r.count ? { node: <span className="inline-flex items-center gap-1"><Stars value={r.avg} /> {r.avg.toFixed(1)}</span>, score: r.avg } : { node: <span className="text-zinc-400">No reviews</span> };
      }),
    });
    rows.push({ label: "Reviews", cells: items.map((i) => ({ node: ratingStats(db, i.id).count })) });

    const attrKeys = [...new Set(items.flatMap((i) => Object.keys(i.attributes)))];
    for (const k of attrKeys) rows.push({ label: k, cells: items.map((i) => ({ node: i.attributes[k] ?? <span className="text-zinc-400">—</span> })) });
  }

  const verdict = buildVerdict(db, items, sameUnit);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-2xl font-bold">Compare</h1>
        {items.length < 4 && others.length > 0 && (
          <select className="input w-auto" value="" onChange={(e) => e.target.value && actions.toggleCompare(e.target.value)} aria-label="Add item to compare">
            <option value="">+ Add item to compare…</option>
            {others.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.size} {i.unit})</option>)}
          </select>
        )}
        {items.length > 0 && <button className="btn-ghost" onClick={() => actions.clearCompare()}>Clear all</button>}
      </div>

      {items.length === 0 ? (
        <div className="card p-10 text-center text-zinc-500">
          Pick up to 4 items with <b>+ Compare</b> on the <Link href="/" className="text-indigo-600 underline">browse page</Link>, or use the menu above.
        </div>
      ) : (
        <>
          {verdict.length > 0 && (
            <div className="card space-y-1 border-indigo-200 bg-indigo-50 p-4 text-sm dark:border-indigo-900 dark:bg-indigo-950">
              <div className="font-semibold text-indigo-900 dark:text-indigo-200">Quick verdict</div>
              {verdict.map((v, i) => <div key={i}>{v}</div>)}
            </div>
          )}
          {!sameUnit && items.length > 1 && (
            <p className="text-sm text-amber-600">These items use different units ({[...units].join(", ")}), so size and unit price aren&apos;t ranked against each other.</p>
          )}
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="w-36 p-3" />
                  {items.map((i) => (
                    <th key={i.id} className="p-3 text-left align-top font-normal">
                      <div className="flex items-start gap-2">
                        <ItemImage item={i} className="h-14 w-14 text-3xl" />
                        <div className="min-w-0 flex-1">
                          <Link href={`/items/${i.id}`} className="font-semibold hover:text-indigo-600">{i.name}</Link>
                          {i.nameTh && <div className="text-xs text-zinc-500">{i.nameTh}</div>}
                        </div>
                        <button onClick={() => actions.toggleCompare(i.id)} className="text-zinc-400 hover:text-red-600" aria-label={`Remove ${i.name}`}>✕</button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, ri) => {
                  const scores = r.cells.map((c) => c.score).filter((s): s is number => s != null);
                  const win = r.better && scores.length > 1 && new Set(scores).size > 1 ? (r.better === "low" ? Math.min(...scores) : Math.max(...scores)) : undefined;
                  return (
                    <tr key={ri} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                      <th className="p-3 text-left text-xs font-medium text-zinc-500">{r.label}</th>
                      {r.cells.map((c, ci) => (
                        <td key={ci} className={`p-3 ${win != null && c.score === win ? "bg-emerald-50 font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : ""}`}>
                          {c.node}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-zinc-500">Green = best in row. Unit price uses each item&apos;s cheapest store.</p>
        </>
      )}
    </div>
  );
}

function buildVerdict(db: ReturnType<typeof useDB>, items: Item[], sameUnit: boolean): string[] {
  if (items.length < 2) return [];
  const out: string[] = [];
  const withBest = items.map((i) => ({ i, b: bestPrice(db, i.id), r: ratingStats(db, i.id) })).filter((x) => x.b);
  if (sameUnit && withBest.length > 1) {
    const v = [...withBest].sort((a, b) => unitPrice(a.i, a.b!.price) - unitPrice(b.i, b.b!.price))[0];
    out.push(`💰 Best value: ${v.i.name} at ${baht(unitPrice(v.i, v.b!.price))} per ${UNIT_BASE[v.i.unit].label} (${db.stores.find((s) => s.id === v.b!.storeId)?.name}).`);
  }
  const rated = items.map((i) => ({ i, r: ratingStats(db, i.id) })).filter((x) => x.r.count);
  if (rated.length > 1) {
    const t = [...rated].sort((a, b) => b.r.avg - a.r.avg)[0];
    out.push(`⭐ Best rated: ${t.i.name} (${t.r.avg.toFixed(1)} from ${t.r.count} review${t.r.count > 1 ? "s" : ""}).`);
  }
  // Which store wins most head-to-heads across the compared items
  const wins = new Map<string, number>();
  for (const i of items) {
    const ps = latestPrices(db, i.id);
    if (ps.length > 1 && ps[0].price < ps[1].price) wins.set(ps[0].storeId, (wins.get(ps[0].storeId) ?? 0) + 1);
  }
  if (wins.size) {
    const [sid, n] = [...wins.entries()].sort((a, b) => b[1] - a[1])[0];
    out.push(`🏪 ${db.stores.find((s) => s.id === sid)?.name} is cheaper for ${n} of ${items.length} items.`);
  }
  return out;
}
