"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import type { FoundProduct } from "@/components/ProductFinder";
import { CompareToggle, ItemImage, ListButton, StoreBadge } from "@/components/ui";
import { sameBarcode } from "@/lib/barcode";
import { useT } from "@/lib/i18n";
import { baht, latestPrices } from "@/lib/stats";
import { useDB } from "@/lib/store";

type Lookup = { status: "loading" } | { status: "found"; product: FoundProduct } | { status: "missing" } | { status: "error" };

export default function ScanPage() {
  const db = useDB();
  const t = useT();
  const [code, setCode] = useState("");
  const [lookup, setLookup] = useState<Lookup | null>(null);

  const request = useRef(0); // only the newest lookup may update the screen

  async function handle(next: string) {
    const id = ++request.current;
    setCode(next);
    if (db.items.some((i) => sameBarcode(i.barcode, next))) return setLookup(null);
    setLookup({ status: "loading" });
    let result: Lookup;
    try {
      const res = await fetch(`/api/lookup?barcode=${encodeURIComponent(next)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      result = data.product ? { status: "found", product: data.product } : { status: "missing" };
    } catch {
      result = { status: "error" };
    }
    if (request.current === id) setLookup(result);
  }

  const existing = code ? db.items.find((i) => sameBarcode(i.barcode, code)) : undefined;
  const storeMap = new Map(db.stores.map((s) => [s.id, s]));
  const addHref = `/add?barcode=${encodeURIComponent(code)}`;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("scan.title")}</h1>
        <p className="text-sm text-zinc-500">{t("scan.lead")}</p>
      </div>

      {!code ? (
        <section className="card p-5">
          <BarcodeScanner onCode={handle} />
        </section>
      ) : (
        <section className="card space-y-4 p-5" aria-live="polite">
          <div className="text-xs font-medium text-zinc-500">{t("scan.result", { code })}</div>

          {existing ? (
            <>
              <div className="text-sm font-semibold text-emerald-600">✓ {t("scan.inShelfie")}</div>
              <div className="flex items-start gap-3">
                <ItemImage item={existing} className="h-20 w-20 text-4xl" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-zinc-500">{existing.brand}</div>
                  <div className="font-semibold">{existing.name}</div>
                  {existing.nameTh && <div className="text-sm text-zinc-500">{existing.nameTh}</div>}
                  <div className="mt-2 space-y-1">
                    {latestPrices(db, existing.id).map((p) => (
                      <div key={p.id} className="flex items-center gap-2 text-sm">
                        <StoreBadge store={storeMap.get(p.storeId)} />
                        <span className="tabular-nums">{baht(p.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/items/${existing.id}`} className="btn-primary">{t("scan.view")} →</Link>
                <ListButton itemId={existing.id} />
                <CompareToggle itemId={existing.id} />
              </div>
            </>
          ) : lookup?.status === "loading" ? (
            <p className="text-sm text-zinc-500">{t("scan.looking")}</p>
          ) : lookup?.status === "found" ? (
            <>
              <div className="text-sm font-semibold text-indigo-600">{t("scan.foundOff")}</div>
              <div className="flex items-start gap-3">
                <ItemImage item={{ name: lookup.product.name, imageUrl: lookup.product.imageUrl }} className="h-20 w-20 text-4xl" />
                <div className="min-w-0 flex-1 text-sm">
                  <div className="font-semibold">{lookup.product.name}</div>
                  <div className="text-zinc-500">{[lookup.product.nameTh, lookup.product.brand, lookup.product.quantity].filter(Boolean).join(" · ")}</div>
                </div>
              </div>
              <Link href={addHref} className="btn-primary">{t("scan.addIt")} →</Link>
            </>
          ) : (
            <>
              <p className="text-sm text-zinc-500">{lookup?.status === "error" ? t("scan.lookupFailed") : t("scan.notFound")}</p>
              <Link href={addHref} className="btn-primary">{t("scan.addByHand")} →</Link>
            </>
          )}

          <button
            type="button"
            className="btn-ghost w-full"
            onClick={() => {
              request.current++;
              setCode("");
              setLookup(null);
            }}
          >
            📷 {t("scan.again")}
          </button>
        </section>
      )}
    </div>
  );
}
