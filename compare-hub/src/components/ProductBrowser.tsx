"use client";

import { useMemo, useState } from "react";
import type { Category, Product } from "@/lib/types";
import { avgRating, priceOf } from "@/lib/products";
import { priorityFields, recommend } from "@/lib/recommend";
import ProductCard from "./ProductCard";

type Sort = "match" | "price-asc" | "price-desc" | "rating" | "coverage";

export default function ProductBrowser({ category, products }: { category: Category; products: Product[] }) {
  const [q, setQ] = useState("");
  const [provider, setProvider] = useState("all");
  const [sort, setSort] = useState<Sort>("price-asc");
  const [maxPrice, setMaxPrice] = useState("");
  const [wants, setWants] = useState<string[]>([]);

  const choices = priorityFields(category);
  // Scored against the whole category, so a plan's score doesn't shift as you filter.
  const picks = useMemo(() => new Map(recommend(category, products, wants).map((x) => [x.product.id, x])), [category, products, wants]);
  const score = (p: Product) => picks.get(p.id)?.score ?? 0;

  function toggleWant(key: string) {
    const next = wants.includes(key) ? wants.filter((k) => k !== key) : [...wants, key];
    setWants(next);
    // Picking a priority switches to "best match"; clearing them all goes back to cheapest.
    if (next.length && sort !== "match") setSort("match");
    if (!next.length && sort === "match") setSort("price-asc");
  }

  const providers = useMemo(() => [...new Set(products.map((p) => p.provider))], [products]);
  // "Coverage" sorts by the first money field where higher is better.
  const coverageKey = category.fields.find((f) => f.type === "money" && f.better === "higher")?.key;
  // Quote-only plans (no published price) sort after priced ones.
  const price = (p: Product) => priceOf(p, category.priceKey) ?? Infinity;

  const term = q.trim().toLowerCase();
  const limit = Number(maxPrice) || Infinity;
  const shown = products
    .filter(
      (p) =>
        (provider === "all" || p.provider === provider) &&
        price(p) <= limit &&
        (!term || `${p.name} ${p.provider} ${p.tagline} ${p.highlights.join(" ")}`.toLowerCase().includes(term)),
    )
    .sort((a, b) => {
      if (sort === "match") return score(b) - score(a) || price(a) - price(b);
      if (sort === "price-asc") return price(a) - price(b);
      if (sort === "price-desc") return (priceOf(b, category.priceKey) ?? -1) - (priceOf(a, category.priceKey) ?? -1);
      if (sort === "rating") return avgRating(b.reviews) - avgRating(a.reviews);
      return Number(b.specs[coverageKey ?? ""] ?? 0) - Number(a.specs[coverageKey ?? ""] ?? 0);
    });

  // Rank among the plans currently shown, so "อันดับ 1" is always visible.
  const rankOf = new Map(sort === "match" && wants.length ? shown.slice(0, 3).map((p, i) => [p.id, i + 1]) : []);

  return (
    <div>
      <fieldset className="mb-3 rounded-2xl border border-line bg-surface p-4">
        <legend className="px-1 text-sm font-semibold">🎯 ช่วยเลือก: อะไรสำคัญกับคุณ?</legend>
        <div className="flex flex-wrap gap-2">
          {choices.map((f) => {
            const on = wants.includes(f.key);
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={on}
                onClick={() => toggleWant(f.key)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  on ? "border-brand bg-brand-soft text-fg" : "border-line text-muted hover:border-brand hover:text-fg"
                }`}
              >
                {on ? "✓ " : ""}
                {f.better === "lower" ? `${f.label}ต่ำ` : f.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted">
          {wants.length
            ? "จัดอันดับจากตัวเลขที่บริษัทเปิดเผย เทียบกับแผนอื่นในหมวดนี้ · ไม่ใช่คำแนะนำส่วนบุคคล โปรดอ่านเงื่อนไขกรมธรรม์ก่อนซื้อ"
            : "เลือกได้หลายข้อ แล้วเราจะจัดอันดับแผนที่ตรงที่สุดให้"}
        </p>
      </fieldset>

      <div className="mb-5 grid gap-3 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs text-muted">
          ค้นหา
          <input className="input mt-1" placeholder="ชื่อแผน, บริษัท, จุดเด่น…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <label className="text-xs text-muted">
          บริษัท
          <select className="input mt-1" value={provider} onChange={(e) => setProvider(e.target.value)}>
            <option value="all">ทั้งหมด</option>
            {providers.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label className="text-xs text-muted">
          งบสูงสุด (บาท{category.priceSuffix})
          <input
            className="input mt-1"
            inputMode="numeric"
            placeholder="ไม่จำกัด"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ""))}
          />
        </label>
        <label className="text-xs text-muted">
          เรียงตาม
          <select className="input mt-1" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            {wants.length > 0 && <option value="match">ตรงใจที่สุด</option>}
            <option value="price-asc">เบี้ยถูกที่สุด</option>
            <option value="price-desc">เบี้ยสูงที่สุด</option>
            <option value="rating">คะแนนรีวิว</option>
            {coverageKey && <option value="coverage">ความคุ้มครองสูงสุด</option>}
          </select>
        </label>
      </div>

      <p className="mb-3 text-sm text-muted">พบ {shown.length} แผน · กด “เพิ่มเพื่อเทียบ” ได้สูงสุด 4 แผน</p>

      {shown.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <ProductCard key={p.id} product={p} category={category} pick={wants.length ? picks.get(p.id) : undefined} rank={rankOf.get(p.id)} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">ไม่พบแผนที่ตรงกับเงื่อนไข ลองปรับตัวกรอง</p>
      )}
    </div>
  );
}
