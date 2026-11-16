"use client";

import { useMemo, useState } from "react";
import type { Category, Product } from "@/lib/types";
import { avgRating } from "@/lib/products";
import ProductCard from "./ProductCard";

type Sort = "price-asc" | "price-desc" | "rating" | "coverage";

export default function ProductBrowser({ category, products }: { category: Category; products: Product[] }) {
  const [q, setQ] = useState("");
  const [provider, setProvider] = useState("all");
  const [sort, setSort] = useState<Sort>("price-asc");
  const [maxPrice, setMaxPrice] = useState("");

  const providers = useMemo(() => [...new Set(products.map((p) => p.provider))], [products]);
  // "Coverage" sorts by the first money field where higher is better.
  const coverageKey = category.fields.find((f) => f.type === "money" && f.better === "higher")?.key;
  const price = (p: Product) => Number(p.specs[category.priceKey] ?? 0);

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
      if (sort === "price-asc") return price(a) - price(b);
      if (sort === "price-desc") return price(b) - price(a);
      if (sort === "rating") return avgRating(b.reviews) - avgRating(a.reviews);
      return Number(b.specs[coverageKey ?? ""] ?? 0) - Number(a.specs[coverageKey ?? ""] ?? 0);
    });

  return (
    <div>
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
            <ProductCard key={p.id} product={p} category={category} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">ไม่พบแผนที่ตรงกับเงื่อนไข ลองปรับตัวกรอง</p>
      )}
    </div>
  );
}
