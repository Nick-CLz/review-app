"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { actions, useDB } from "@/lib/store";
import type { Unit } from "@/lib/types";
import { ProductFinder, type FoundProduct } from "@/components/ProductFinder";
import { ItemImage } from "@/components/ui";
import { SignInGate } from "@/components/auth";
import { useT } from "@/lib/i18n";

const EMOJIS = ["📦", "🥤", "💧", "☕", "🍵", "🥛", "🍜", "🥔", "🍫", "🍪", "🍞", "🥚", "🍗", "🍎", "🧴", "🪥", "🧻", "🧼", "💊", "🔋", "📱", "🎧", "👟"];

type Form = { name: string; nameTh: string; brand: string; category: string; size: string; unit: Unit; barcode: string; emoji: string; imageUrl: string };

/** Copy a found product's details into the form, keeping what Open Food Facts doesn't know. */
const withProduct = (p: FoundProduct) => (cur: Form): Form => ({
  ...cur,
  name: p.name,
  nameTh: p.nameTh ?? "",
  brand: p.brand,
  size: p.size ? String(p.size) : cur.size,
  unit: p.unit ?? cur.unit,
  barcode: p.barcode,
  imageUrl: p.imageUrl ?? "",
});

export default function AddPage() {
  const db = useDB();
  const router = useRouter();
  const t = useT();
  const scanned = useSearchParams().get("barcode")?.replace(/\D/g, "").slice(0, 14) ?? "";
  const categories = [...new Set(db.items.map((i) => i.category))].sort();

  const [f, setF] = useState<Form>({ name: "", nameTh: "", brand: "", category: "", size: "", unit: "ml", barcode: scanned, emoji: "📦", imageUrl: "" });
  const [scanStatus, setScanStatus] = useState<"loading" | "found" | "missing" | null>(scanned ? "loading" : null);
  const [attrs, setAttrs] = useState<{ k: string; v: string }[]>([{ k: "", v: "" }]);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [newStore, setNewStore] = useState({ name: "", color: "#2563eb" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // Arrived from the scanner: fill the form from Open Food Facts
  useEffect(() => {
    if (!scanned) return;
    let live = true;
    fetch(`/api/lookup?barcode=${scanned}`)
      .then((r) => (r.ok ? r.json() : { product: null }))
      .then((data: { product: FoundProduct | null }) => {
        if (!live) return;
        if (data.product) setF(withProduct(data.product));
        setScanStatus(data.product ? "found" : "missing");
      })
      .catch(() => live && setScanStatus("missing"));
    return () => {
      live = false;
    };
  }, [scanned]);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const size = parseFloat(f.size);
    if (!f.name.trim() || !f.category.trim() || !(size > 0)) return setErr(t("add.errRequired"));
    if (f.imageUrl.trim() && !f.imageUrl.trim().startsWith("https://")) return setErr(t("add.errPhoto"));
    setErr("");
    setBusy(true);
    const { id, saved } = actions.addItem(
      {
        name: f.name.trim(), nameTh: f.nameTh.trim() || undefined, brand: f.brand.trim() || "—", category: f.category.trim(),
        size, unit: f.unit, barcode: f.barcode.trim() || undefined, emoji: f.emoji, imageUrl: f.imageUrl.trim() || undefined,
        attributes: Object.fromEntries(attrs.filter((a) => a.k.trim() && a.v.trim()).map((a) => [a.k.trim(), a.v.trim()])),
      },
      Object.entries(prices).map(([storeId, v]) => ({ storeId, price: parseFloat(v) })).filter((p) => p.price > 0),
    );
    // Go to the new item only once it's really saved; if it's rejected, the form stays filled in
    // (the reason shows as a toast) so nothing has to be typed again.
    if (await saved) router.push(`/items/${id}`);
    else setBusy(false);
  }

  return (
    <SignInGate action="action.addItems">
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("add.title")}</h1>
        <p className="text-sm text-zinc-500">{t("add.lead")}</p>
      </div>

      {scanStatus && (
        <p className={`rounded-lg p-3 text-sm ${scanStatus === "found" ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"}`} aria-live="polite">
          {t(scanStatus === "loading" ? "add.scanLooking" : scanStatus === "found" ? "add.scanFound" : "add.scanMissing", { code: scanned })}
        </p>
      )}

      <ProductFinder
        onPick={(p) => {
          setF(withProduct(p));
          setErr("");
        }}
      />

      <section className="card space-y-4 p-5">
        {f.imageUrl && (
          <div className="flex items-center gap-3">
            <ItemImage item={{ name: f.name, imageUrl: f.imageUrl }} className="h-20 w-20" />
            <button type="button" className="text-xs text-zinc-500 underline" onClick={() => setF({ ...f, imageUrl: "" })}>{t("add.removePhoto")}</button>
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t("add.name")}><input className="input" value={f.name} onChange={set("name")} placeholder="e.g. Pepsi Max Can" /></Field>
          <Field label={t("add.nameTh")}><input className="input" value={f.nameTh} onChange={set("nameTh")} placeholder="เป๊ปซี่ แม็กซ์" /></Field>
          <Field label={t("add.brand")}><input className="input" value={f.brand} onChange={set("brand")} /></Field>
          <Field label={t("add.category")}>
            <input className="input" list="cats" value={f.category} onChange={set("category")} placeholder={t("add.catPh")} />
            <datalist id="cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
          </Field>
          <Field label={t("add.size")}>
            <div className="flex gap-2">
              <input className="input" type="number" step="any" min="0" value={f.size} onChange={set("size")} placeholder="325" />
              <select className="input w-24" value={f.unit} onChange={set("unit")} aria-label={t("add.unit")}>
                <option value="ml">ml</option><option value="g">g</option><option value="pcs">pcs</option>
              </select>
            </div>
          </Field>
          <Field label={t("add.barcode")}><input className="input" value={f.barcode} onChange={set("barcode")} inputMode="numeric" /></Field>
          <div className="sm:col-span-2">
            <Field label={t("add.photo")}><input className="input" type="url" value={f.imageUrl} onChange={set("imageUrl")} placeholder="https://…" /></Field>
          </div>
        </div>
        <Field label={t("add.icon")}>
          <div className="flex flex-wrap gap-1">
            {EMOJIS.map((e) => (
              <button type="button" key={e} onClick={() => setF({ ...f, emoji: e })} className={`h-9 w-9 rounded-lg text-xl ${f.emoji === e ? "bg-indigo-100 ring-2 ring-indigo-500 dark:bg-indigo-950" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}>{e}</button>
            ))}
          </div>
        </Field>
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="font-semibold">{t("add.specs")} <span className="text-sm font-normal text-zinc-500">{t("add.optional")}</span></h2>
        {attrs.map((a, i) => (
          <div key={i} className="flex gap-2">
            <input className="input" placeholder={t("add.specNamePh")} value={a.k} onChange={(e) => setAttrs(attrs.map((x, j) => (j === i ? { ...x, k: e.target.value } : x)))} aria-label={t("add.specName")} />
            <input className="input" placeholder={t("add.specValuePh")} value={a.v} onChange={(e) => setAttrs(attrs.map((x, j) => (j === i ? { ...x, v: e.target.value } : x)))} aria-label={t("add.specValue")} />
            <button type="button" className="btn-ghost" onClick={() => setAttrs(attrs.filter((_, j) => j !== i))} aria-label={t("add.removeSpec")}>✕</button>
          </div>
        ))}
        <button type="button" className="btn-ghost" onClick={() => setAttrs([...attrs, { k: "", v: "" }])}>{t("add.addSpec")}</button>
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="font-semibold">{t("add.prices")}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {db.stores.map((s) => (
            <Field key={s.id} label={s.name}>
              <input className="input" type="number" step="0.25" min="0" placeholder={t("add.notSold")} value={prices[s.id] ?? ""} onChange={(e) => setPrices({ ...prices, [s.id]: e.target.value })} style={{ borderLeft: `4px solid ${s.color}` }} />
            </Field>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <Field label={t("add.anotherStore")}>
            <input className="input" placeholder={t("add.storePh")} value={newStore.name} onChange={(e) => setNewStore({ ...newStore, name: e.target.value })} />
          </Field>
          <input type="color" className="h-10 w-12 rounded" value={newStore.color} onChange={(e) => setNewStore({ ...newStore, color: e.target.value })} aria-label={t("add.storeColor")} />
          <button type="button" className="btn-ghost" disabled={!newStore.name.trim()} onClick={() => { actions.addStore(newStore.name.trim(), newStore.color); setNewStore({ name: "", color: "#2563eb" }); }}>
            {t("add.addStore")}
          </button>
        </div>
      </section>

      {err && <p className="text-sm text-red-600">{err}</p>}
      <button className="btn-primary w-full py-3" disabled={busy}>{busy ? t("common.saving") : t("add.save")}</button>
    </form>
    </SignInGate>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}
