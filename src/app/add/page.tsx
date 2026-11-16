"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { actions, useDB } from "@/lib/store";
import type { Unit } from "@/lib/types";

const EMOJIS = ["📦", "🥤", "💧", "☕", "🍵", "🥛", "🍜", "🥔", "🍫", "🍪", "🍞", "🥚", "🍗", "🍎", "🧴", "🪥", "🧻", "🧼", "💊", "🔋", "📱", "🎧", "👟"];

export default function AddPage() {
  const db = useDB();
  const router = useRouter();
  const categories = [...new Set(db.items.map((i) => i.category))].sort();

  const [f, setF] = useState({ name: "", nameTh: "", brand: "", category: "", size: "", unit: "ml" as Unit, barcode: "", emoji: "📦" });
  const [attrs, setAttrs] = useState<{ k: string; v: string }[]>([{ k: "", v: "" }]);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [newStore, setNewStore] = useState({ name: "", color: "#2563eb" });
  const [err, setErr] = useState("");

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const size = parseFloat(f.size);
    if (!f.name.trim() || !f.category.trim() || !(size > 0)) return setErr("Name, category and a positive size are required.");
    const id = actions.addItem(
      {
        name: f.name.trim(), nameTh: f.nameTh.trim() || undefined, brand: f.brand.trim() || "—", category: f.category.trim(),
        size, unit: f.unit, barcode: f.barcode.trim() || undefined, emoji: f.emoji,
        attributes: Object.fromEntries(attrs.filter((a) => a.k.trim() && a.v.trim()).map((a) => [a.k.trim(), a.v.trim()])),
      },
      Object.entries(prices).map(([storeId, v]) => ({ storeId, price: parseFloat(v) })).filter((p) => p.price > 0),
    );
    router.push(`/items/${id}`);
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add an item</h1>
        <p className="text-sm text-zinc-500">Anything works — a snack, a phone, a shampoo. Add custom specs to compare on.</p>
      </div>

      <section className="card space-y-4 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name *"><input className="input" value={f.name} onChange={set("name")} placeholder="e.g. Pepsi Max Can" /></Field>
          <Field label="Thai name"><input className="input" value={f.nameTh} onChange={set("nameTh")} placeholder="เป๊ปซี่ แม็กซ์" /></Field>
          <Field label="Brand"><input className="input" value={f.brand} onChange={set("brand")} /></Field>
          <Field label="Category *">
            <input className="input" list="cats" value={f.category} onChange={set("category")} placeholder="Pick or type a new one" />
            <datalist id="cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
          </Field>
          <Field label="Size *">
            <div className="flex gap-2">
              <input className="input" type="number" step="any" min="0" value={f.size} onChange={set("size")} placeholder="325" />
              <select className="input w-24" value={f.unit} onChange={set("unit")} aria-label="Unit">
                <option value="ml">ml</option><option value="g">g</option><option value="pcs">pcs</option>
              </select>
            </div>
          </Field>
          <Field label="Barcode"><input className="input" value={f.barcode} onChange={set("barcode")} inputMode="numeric" /></Field>
        </div>
        <Field label="Icon">
          <div className="flex flex-wrap gap-1">
            {EMOJIS.map((e) => (
              <button type="button" key={e} onClick={() => setF({ ...f, emoji: e })} className={`h-9 w-9 rounded-lg text-xl ${f.emoji === e ? "bg-indigo-100 ring-2 ring-indigo-500 dark:bg-indigo-950" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}>{e}</button>
            ))}
          </div>
        </Field>
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="font-semibold">Specs to compare <span className="text-sm font-normal text-zinc-500">(optional)</span></h2>
        {attrs.map((a, i) => (
          <div key={i} className="flex gap-2">
            <input className="input" placeholder="e.g. Sugar" value={a.k} onChange={(e) => setAttrs(attrs.map((x, j) => (j === i ? { ...x, k: e.target.value } : x)))} aria-label="Spec name" />
            <input className="input" placeholder="e.g. Zero" value={a.v} onChange={(e) => setAttrs(attrs.map((x, j) => (j === i ? { ...x, v: e.target.value } : x)))} aria-label="Spec value" />
            <button type="button" className="btn-ghost" onClick={() => setAttrs(attrs.filter((_, j) => j !== i))} aria-label="Remove spec">✕</button>
          </div>
        ))}
        <button type="button" className="btn-ghost" onClick={() => setAttrs([...attrs, { k: "", v: "" }])}>+ Add spec</button>
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="font-semibold">Prices (THB)</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {db.stores.map((s) => (
            <Field key={s.id} label={s.name}>
              <input className="input" type="number" step="0.25" min="0" placeholder="Not sold / unknown" value={prices[s.id] ?? ""} onChange={(e) => setPrices({ ...prices, [s.id]: e.target.value })} style={{ borderLeft: `4px solid ${s.color}` }} />
            </Field>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <Field label="Add another store">
            <input className="input" placeholder="e.g. Lotus's, Tops, Makro" value={newStore.name} onChange={(e) => setNewStore({ ...newStore, name: e.target.value })} />
          </Field>
          <input type="color" className="h-10 w-12 rounded" value={newStore.color} onChange={(e) => setNewStore({ ...newStore, color: e.target.value })} aria-label="Store color" />
          <button type="button" className="btn-ghost" disabled={!newStore.name.trim()} onClick={() => { actions.addStore(newStore.name.trim(), newStore.color); setNewStore({ name: "", color: "#2563eb" }); }}>
            + Add store
          </button>
        </div>
      </section>

      {err && <p className="text-sm text-red-600">{err}</p>}
      <button className="btn-primary w-full py-3">Save item</button>
    </form>
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
