"use client";

import { useMemo, useState } from "react";
import { avgRating, overallScore } from "@/lib/items";
import { money } from "@/lib/format";
import type { Category, Item } from "@/lib/types";
import ItemCard from "./ItemCard";

type SortKey = "score" | "priceAsc" | "priceDesc" | "energy" | "power" | "rating";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "score", label: "คะแนนรวมสูงสุด" },
  { value: "priceAsc", label: "ราคาต่ำ → สูง" },
  { value: "priceDesc", label: "ราคาสูง → ต่ำ" },
  { value: "energy", label: "ค่าพลังงานถูกสุด" },
  { value: "power", label: "แรงที่สุด" },
  { value: "rating", label: "รีวิวดีที่สุด" },
];

export default function ItemBrowser({
  category,
  items,
  initial = {},
}: {
  category: Category;
  items: Item[];
  initial?: Record<string, string>;
}) {
  const prices = items.map((i) => Number(i.specs[category.priceKey]));
  const maxPrice = Math.max(...prices);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(category.filters.map((f) => [f.key, initial[f.key] ? [initial[f.key]] : []])),
  );
  const [budget, setBudget] = useState(maxPrice);
  const [minSeats, setMinSeats] = useState(0);
  const [sort, setSort] = useState<SortKey>("score");

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = items.filter((i) => {
      if (needle && !`${i.brand} ${i.name} ${i.variant} ${i.tagline}`.toLowerCase().includes(needle)) return false;
      for (const f of category.filters) {
        const want = sel[f.key];
        if (want.length && !want.includes(String(i.specs[f.key]))) return false;
      }
      if (Number(i.specs[category.priceKey]) > budget) return false;
      if (Number(i.specs.seats ?? 0) < minSeats) return false;
      return true;
    });
    const p = (i: Item) => Number(i.specs[category.priceKey]);
    const by: Record<SortKey, (a: Item, b: Item) => number> = {
      score: (a, b) => overallScore(b) - overallScore(a),
      priceAsc: (a, b) => p(a) - p(b),
      priceDesc: (a, b) => p(b) - p(a),
      energy: (a, b) => Number(a.specs.energyCost) - Number(b.specs.energyCost),
      power: (a, b) => Number(b.specs.powerHp) - Number(a.specs.powerHp),
      rating: (a, b) => avgRating(b.reviews) - avgRating(a.reviews),
    };
    return [...list].sort(by[sort]);
  }, [items, q, sel, budget, minSeats, sort, category]);

  function toggle(key: string, value: string) {
    setSel((s) => ({
      ...s,
      [key]: s[key].includes(value) ? s[key].filter((v) => v !== value) : [...s[key], value],
    }));
  }

  const activeCount =
    Object.values(sel).reduce((n, v) => n + v.length, 0) + (budget < maxPrice ? 1 : 0) + (minSeats ? 1 : 0) + (q ? 1 : 0);

  function reset() {
    setQ("");
    setSel(Object.fromEntries(category.filters.map((f) => [f.key, []])));
    setBudget(maxPrice);
    setMinSeats(0);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
        <input
          className="input"
          placeholder="ค้นหายี่ห้อ รุ่น…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="ค้นหา"
        />
        {category.filters.map((f) => (
          <fieldset key={f.key}>
            <legend className="mb-2 text-sm font-bold">{f.label}</legend>
            <div className="flex flex-wrap gap-1.5">
              {f.options.map((o) => {
                const on = sel[f.key].includes(o.value);
                const count = items.filter((i) => i.specs[f.key] === o.value).length;
                return (
                  <button
                    key={o.value}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(f.key, o.value)}
                    className={`rounded-full border px-2.5 py-1 text-xs transition ${
                      on ? "border-brand bg-brand text-brand-fg" : "border-line bg-surface hover:border-brand"
                    }`}
                  >
                    {o.icon} {o.label} <span className="opacity-60">{count}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
        <div>
          <label htmlFor="budget" className="mb-1 flex justify-between text-sm font-bold">
            งบไม่เกิน <span className="font-semibold text-brand">{money(budget)}</span>
          </label>
          <input
            id="budget"
            type="range"
            min={500000}
            max={maxPrice}
            step={50000}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full accent-[var(--brand)]"
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-bold">ที่นั่งอย่างน้อย</p>
          <div className="flex gap-1.5">
            {[0, 5, 7].map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={minSeats === n}
                onClick={() => setMinSeats(n)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  minSeats === n ? "border-brand bg-brand text-brand-fg" : "border-line bg-surface hover:border-brand"
                }`}
              >
                {n === 0 ? "ทั้งหมด" : `${n}+`}
              </button>
            ))}
          </div>
        </div>
        {activeCount > 0 && (
          <button type="button" onClick={reset} className="text-sm text-brand hover:underline">
            ล้างตัวกรอง ({activeCount})
          </button>
        )}
      </aside>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted">
            พบ <b className="text-fg">{shown.length}</b> รุ่น
          </p>
          <label className="flex items-center gap-2 text-sm">
            เรียงตาม
            <select className="input w-auto py-1.5" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {shown.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map((i) => (
              <ItemCard key={i.id} item={i} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">
            ไม่พบรุ่นที่ตรงเงื่อนไข ลองขยายงบหรือลดตัวกรอง
          </div>
        )}
      </section>
    </div>
  );
}
