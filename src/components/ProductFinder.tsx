"use client";

import Link from "next/link";
import { useState } from "react";
import { useDB } from "@/lib/store";
import { useT } from "@/lib/i18n";

export interface FoundProduct {
  barcode: string;
  name: string;
  nameTh?: string;
  brand: string;
  size?: number;
  unit?: "ml" | "g" | "pcs";
  quantity?: string;
  imageUrl?: string;
  sourceUrl: string;
}

/** Search Open Food Facts by name or barcode and hand the chosen product back to the form. */
export function ProductFinder({ onPick }: { onPick: (p: FoundProduct) => void }) {
  const db = useDB();
  const t = useT();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [results, setResults] = useState<FoundProduct[] | null>(null);
  const [picked, setPicked] = useState<string>("");

  async function search() {
    const term = q.trim();
    if (term.length < 2) return;
    setBusy(true);
    setErr("");
    try {
      const isBarcode = /^\d{6,14}$/.test(term);
      const res = await fetch(`/api/lookup?${new URLSearchParams(isBarcode ? { barcode: term } : { q: term })}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? res.statusText);
      const list: FoundProduct[] = isBarcode ? (data.product ? [data.product] : []) : data.products;
      setResults(list);
      if (!list.length) setErr(isBarcode ? t("finder.noBarcode") : t("finder.noMatch"));
    } catch (e) {
      setResults(null);
      setErr(t("finder.failed", { error: (e as Error).message }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card space-y-3 border-indigo-200 p-5 dark:border-indigo-900">
      <div>
        <h2 className="font-semibold">{t("finder.title")}</h2>
        <p className="text-xs text-zinc-500">
          {t("finder.lead")}{" "}
          <a href="https://world.openfoodfacts.org" target="_blank" rel="noreferrer" className="underline">openfoodfacts.org</a>
        </p>
      </div>
      <div className="flex gap-2">
        <input
          className="input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              search();
            }
          }}
          placeholder={t("finder.ph")}
          aria-label={t("finder.aria")}
        />
        <button type="button" className="btn-primary shrink-0" onClick={search} disabled={busy || q.trim().length < 2}>
          {busy ? t("finder.searching") : t("finder.search")}
        </button>
      </div>
      {err && <p className="text-sm text-amber-600">{err}</p>}
      {results && results.length > 0 && (
        <ul className="max-h-96 divide-y divide-zinc-100 overflow-y-auto rounded-lg ring-1 ring-zinc-200 dark:divide-zinc-800 dark:ring-zinc-800">
          {results.map((p) => {
            const existing = db.items.find((i) => i.barcode === p.barcode);
            return (
              <li key={p.barcode} className={`flex items-center gap-3 p-2 ${picked === p.barcode ? "bg-indigo-50 dark:bg-indigo-950" : ""}`}>
                <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded bg-white ring-1 ring-zinc-200">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- Open Food Facts image host
                    <img src={p.imageUrl} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-xs text-zinc-400">{t("finder.noPhoto")}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <div className="truncate font-medium">{p.name}</div>
                  <div className="truncate text-xs text-zinc-500">
                    {[p.nameTh, p.brand, p.quantity, p.barcode].filter(Boolean).join(" · ")}
                  </div>
                </div>
                {existing ? (
                  <Link href={`/items/${existing.id}`} className="btn-ghost shrink-0 text-xs">{t("finder.already")}</Link>
                ) : (
                  <button
                    type="button"
                    className="btn-ghost shrink-0 text-xs"
                    onClick={() => {
                      setPicked(p.barcode);
                      onPick(p);
                    }}
                  >
                    {picked === p.barcode ? t("finder.filled") : t("finder.use")}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
