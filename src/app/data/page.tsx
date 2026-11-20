"use client";

import { refresh, useDB, useSyncStatus } from "@/lib/store";
import { useT } from "@/lib/i18n";

export default function DataPage() {
  const db = useDB();
  const status = useSyncStatus();
  const t = useT();

  function exportJSON() {
    const { stores, items, prices, reviews } = db;
    const shared = { stores, items, prices, reviews };
    const blob = new Blob([JSON.stringify(shared, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `shelfie-${new Date().toLocaleDateString("en-CA")}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{t("data.title")}</h1>
      <p className="text-sm text-zinc-500">{t("data.lead")}</p>
      <div className="card grid gap-3 p-5 sm:grid-cols-2">
        <button className="btn-primary" onClick={exportJSON} disabled={!db.items.length}>{t("data.backup")}</button>
        <button className="btn-ghost" onClick={() => refresh()}>{t("data.refresh")}</button>
      </div>
      <div className="card grid grid-cols-2 gap-3 p-5 text-sm sm:grid-cols-4">
        {([["data.items", db.items.length], ["data.prices", db.prices.length], ["data.reviews", db.reviews.length], ["data.stores", db.stores.length]] as const).map(([k, v]) => (
          <div key={k}>
            <div className="text-2xl font-bold">{v}</div>
            <div className="text-zinc-500">{t(k)}</div>
          </div>
        ))}
        <div className="col-span-full text-xs text-zinc-500">{t("data.status", { status: t(`sync.${status}`) })}</div>
      </div>
      <div className="card p-5 text-sm">
        <h2 className="mb-2 font-semibold">{t("data.stores")}</h2>
        <ul className="space-y-1">
          {db.stores.map((s) => (
            <li key={s.id} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ background: s.color }} /> {s.name}
              <span className="text-zinc-500">· {t("data.priceCount", { n: db.prices.filter((p) => p.storeId === s.id).length })}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
