"use client";

import { refresh, useDB, useSyncStatus } from "@/lib/store";

export default function DataPage() {
  const db = useDB();
  const status = useSyncStatus();

  function exportJSON() {
    const { compare: _compare, ...shared } = db;
    void _compare;
    const blob = new Blob([JSON.stringify(shared, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `shelfie-${new Date().toLocaleDateString("en-CA")}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Data</h1>
      <p className="text-sm text-zinc-500">
        Items, prices, reviews and stores are saved in a shared database, so everyone sees the same data.
        Your compare list stays in this browser only.
      </p>
      <div className="card grid gap-3 p-5 sm:grid-cols-2">
        <button className="btn-primary" onClick={exportJSON} disabled={!db.items.length}>Download backup (JSON)</button>
        <button className="btn-ghost" onClick={() => refresh()}>Refresh now</button>
      </div>
      <div className="card grid grid-cols-2 gap-3 p-5 text-sm sm:grid-cols-4">
        {[["Items", db.items.length], ["Prices", db.prices.length], ["Reviews", db.reviews.length], ["Stores", db.stores.length]].map(([k, v]) => (
          <div key={k}>
            <div className="text-2xl font-bold">{v}</div>
            <div className="text-zinc-500">{k}</div>
          </div>
        ))}
        <div className="col-span-full text-xs text-zinc-500">Status: {status}</div>
      </div>
      <div className="card p-5 text-sm">
        <h2 className="mb-2 font-semibold">Stores</h2>
        <ul className="space-y-1">
          {db.stores.map((s) => (
            <li key={s.id} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ background: s.color }} /> {s.name}
              <span className="text-zinc-500">· {db.prices.filter((p) => p.storeId === s.id).length} prices</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
