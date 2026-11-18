"use client";

import Link from "next/link";
import { LIVE_CATEGORIES, getCategory } from "@/lib/categories";
import { getProduct } from "@/lib/products";
import { formatSpec, winners } from "@/lib/format";
import { BuyAction, DataBadge, Price } from "./ProductBits";
import { clearCompare, removeFromCompare, useCompare } from "@/lib/store";
import RatingBadge from "./RatingBadge";

export default function CompareView() {
  const ids = useCompare();
  const items = ids.map(getProduct).filter((p) => p !== undefined);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line p-10 text-center">
        <p className="text-4xl">⚖︎</p>
        <h1 className="mt-2 text-xl font-bold">ยังไม่มีแผนในรายการเทียบ</h1>
        <p className="mt-1 text-muted">เลือกหมวด แล้วกด “เพิ่มเพื่อเทียบ” อย่างน้อย 2 แผน</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {LIVE_CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/c/${c.slug}`} className="btn-ghost">
              {c.icon} {c.name}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const c = getCategory(items[0].category)!;
  const win = winners(c.fields, items);
  const winCount = (id: string) => Object.values(win).filter((s) => s.has(id)).length;
  const top = items.length > 1 ? [...items].sort((a, b) => winCount(b.id) - winCount(a.id))[0] : undefined;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">
            {c.icon} {c.name}
          </p>
          <h1 className="text-2xl font-bold">เปรียบเทียบ {items.length} แผน</h1>
        </div>
        <div className="flex gap-2">
          {items.length < 4 && (
            <Link href={`/c/${c.slug}`} className="btn-ghost">
              + เพิ่มแผน
            </Link>
          )}
          <button type="button" className="btn-ghost" onClick={clearCompare}>
            ล้างทั้งหมด
          </button>
        </div>
      </div>

      {top && winCount(top.id) > 0 && (
        <p className="mt-4 rounded-xl bg-win px-4 py-3 text-sm text-win-fg">
          🏆 <b>{top.name}</b> ดีที่สุดใน {winCount(top.id)} จาก {Object.keys(win).length} หัวข้อที่วัดได้ — แต่แผนที่ “ใช่” ขึ้นกับความต้องการของคุณ
        </p>
      )}

      <div className="mt-5 overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[640px] table-fixed text-sm">
          <colgroup>
            <col className="w-44" />
            {items.map((p) => (
              <col key={p.id} />
            ))}
          </colgroup>
          <thead>
            <tr className="border-b border-line align-top">
              <th className="sticky left-0 bg-surface p-4 text-left text-xs font-normal text-muted">แผนประกัน</th>
              {items.map((p) => (
                <th key={p.id} className="p-4 text-left font-normal">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs text-muted">{p.provider}</p>
                    <button
                      type="button"
                      onClick={() => removeFromCompare(p.id)}
                      className="text-muted hover:text-fg"
                      aria-label={`นำ ${p.name} ออก`}
                    >
                      ×
                    </button>
                  </div>
                  <Link href={`/p/${p.id}`} className="block font-semibold hover:text-brand">
                    {p.name}
                  </Link>
                  <div className="mt-1">
                    <RatingBadge productId={p.id} seed={p.reviews} />
                  </div>
                  <div className="mt-1">
                    <DataBadge product={p} />
                  </div>
                  <div className="mt-2">
                    <Price product={p} category={c} size="text-lg" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {c.fields.map((f) => (
              <tr key={f.key} className="border-b border-line">
                <th className="sticky left-0 bg-surface px-4 py-3 text-left font-normal text-muted">
                  {f.label}
                  {f.better && (
                    <span className="block text-[11px]">{f.better === "higher" ? "ยิ่งมากยิ่งดี" : "ยิ่งน้อยยิ่งดี"}</span>
                  )}
                </th>
                {items.map((p) => {
                  const isWin = win[f.key]?.has(p.id);
                  return (
                    <td key={p.id} className={`px-4 py-3 font-semibold ${isWin ? "bg-win text-win-fg" : ""}`}>
                      {formatSpec(f, p.specs[f.key])}
                      {isWin && <span className="ml-1 text-xs">★</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="border-b border-line align-top">
              <th className="sticky left-0 bg-surface px-4 py-3 text-left font-normal text-muted">จุดเด่น</th>
              {items.map((p) => (
                <td key={p.id} className="px-4 py-3">
                  <ul className="space-y-1 text-xs">
                    {p.highlights.map((h) => (
                      <li key={h}>✓ {h}</li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>
            <tr className="border-b border-line align-top">
              <th className="sticky left-0 bg-surface px-4 py-3 text-left font-normal text-muted">ข้อยกเว้น</th>
              {items.map((p) => (
                <td key={p.id} className="px-4 py-3">
                  <ul className="space-y-1 text-xs text-muted">
                    {p.exclusions.map((h) => (
                      <li key={h}>! {h}</li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>
            <tr>
              <th className="sticky left-0 bg-surface p-4" />
              {items.map((p) => (
                <td key={p.id} className="p-4">
                  <BuyAction product={p} className="btn-primary w-full" />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted">★ = ค่าที่ดีที่สุดในหัวข้อนั้นเมื่อเทียบกับแผนที่เลือก</p>
    </div>
  );
}
