"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LIVE_CATEGORIES, getCategory } from "@/lib/categories";
import { getProduct } from "@/lib/products";
import { formatSpec, winners } from "@/lib/format";
import type { Product } from "@/lib/types";
import { BuyAction, DataBadge, Price } from "./ProductBits";
import { MAX_COMPARE, clearCompare, removeFromCompare, setCompare, useCompare } from "@/lib/store";
import RatingBadge from "./RatingBadge";

/** Parse `?ids=a,b,c`: known products only, one category (the first's), no repeats, at most 4. */
function parseShared(raw: string | null): Product[] {
  const out: Product[] = [];
  for (const id of new Set((raw ?? "").split(",").map((s) => s.trim()).filter(Boolean))) {
    const p = getProduct(id);
    if (p && (!out.length || p.category === out[0].category) && out.length < MAX_COMPARE) out.push(p);
  }
  return out;
}

export default function CompareView() {
  const router = useRouter();
  const params = useSearchParams();
  const mine = useCompare();
  const shared = parseShared(params.get("ids"));
  const [onlyDiff, setOnlyDiff] = useState(false);
  const [copied, setCopied] = useState(false);

  const items = shared.length ? shared : mine.map(getProduct).filter((p) => p !== undefined);
  // A link someone sent you, different from the list saved in this browser.
  const viewingShared = shared.length > 0 && shared.map((p) => p.id).join() !== mine.join();

  /** Editing a shared view makes it this browser's list and drops the link from the URL. */
  function edit(change: () => void) {
    if (params.has("ids")) setCompare(items.map((p) => p.id));
    change();
    if (params.has("ids")) router.replace("/compare");
  }

  async function copyLink() {
    const url = `${window.location.origin}/compare?ids=${items.map((p) => p.id).join(",")}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("คัดลอกลิงก์นี้", url);
    }
  }

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
  const shownValue = (f: (typeof c.fields)[number], p: Product) => formatSpec(f, p.specs[f.key]);
  const rows = onlyDiff ? c.fields.filter((f) => new Set(items.map((p) => shownValue(f, p))).size > 1) : c.fields;

  // Only name a leader when one plan is clearly ahead; a tie isn't a win.
  const best = Math.max(0, ...items.map((p) => winCount(p.id)));
  const leaders = items.filter((p) => winCount(p.id) === best);
  const top = best > 0 && leaders.length === 1 ? leaders[0] : undefined;
  // Fields the verdict couldn't fully judge because some plan doesn't state a figure.
  const unknown = c.fields.filter((f) => f.better && items.some((p) => p.specs[f.key] === null || p.specs[f.key] === undefined));
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">
            {c.icon} {c.name}
          </p>
          <h1 className="text-2xl font-bold">เปรียบเทียบ {items.length} แผน</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-ghost" onClick={copyLink}>
            {copied ? "คัดลอกลิงก์แล้ว ✓" : "🔗 แชร์ผลเทียบ"}
          </button>
          {!viewingShared && items.length < MAX_COMPARE && (
            <Link href={`/c/${c.slug}`} className="btn-ghost">
              + เพิ่มแผน
            </Link>
          )}
          {!viewingShared && (
            <button type="button" className="btn-ghost" onClick={() => edit(clearCompare)}>
              ล้างทั้งหมด
            </button>
          )}
        </div>
      </div>

      {viewingShared && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm">
          <span>📨 คุณกำลังดูผลเทียบที่มีคนแชร์มา</span>
          <button type="button" className="btn-primary" onClick={() => edit(() => {})}>
            ใช้รายการนี้เป็นของฉัน
          </button>
        </div>
      )}

      {items.length > 1 && (
        <label className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={onlyDiff} onChange={(e) => setOnlyDiff(e.target.checked)} className="accent-brand" />
          แสดงเฉพาะหัวข้อที่ต่างกัน
          {onlyDiff && <span className="text-muted">(ซ่อน {c.fields.length - rows.length} หัวข้อที่เหมือนกัน)</span>}
        </label>
      )}

      {items.length > 1 && (top || best > 0) && (
        <div className="mt-4 rounded-xl bg-win px-4 py-3 text-sm text-win-fg">
          {top ? (
            <p>
              🏆 <b>{top.name}</b> ดีที่สุดใน {best} จาก {Object.keys(win).length} หัวข้อที่วัดได้ — แต่แผนที่ “ใช่” ขึ้นกับความต้องการของคุณ
            </p>
          ) : (
            <p>
              ⚖︎ สูสี: {leaders.map((p) => p.name).join(" และ ")} ดีที่สุดเท่ากันที่ {best} หัวข้อ
            </p>
          )}
          {unknown.length > 0 && (
            <p className="mt-1 text-xs opacity-80">
              ยังเทียบไม่ครบ: บางแผนไม่ระบุ{unknown.map((f) => f.label).join(", ")} จึงไม่ได้นับหัวข้อนั้นให้แผนดังกล่าว
            </p>
          )}
        </div>
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
                      hidden={viewingShared}
                      onClick={() => edit(() => removeFromCompare(p.id))}
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
            {rows.map((f) => (
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
            {items.some((p) => p.dataNote) && (
              <tr className="border-b border-line align-top">
                <th className="sticky left-0 bg-surface px-4 py-3 text-left font-normal text-muted">เงื่อนไขของตัวเลข</th>
                {items.map((p) => (
                  <td key={p.id} className="px-4 py-3 text-xs text-muted">
                    {p.dataNote ?? "—"}
                  </td>
                ))}
              </tr>
            )}
            {items.some((p) => p.source) && (
              <tr className="border-b border-line align-top">
                <th className="sticky left-0 bg-surface px-4 py-3 text-left font-normal text-muted">แหล่งข้อมูล</th>
                {items.map((p) => (
                  <td key={p.id} className="px-4 py-3 text-xs">
                    {p.source ? (
                      <a href={p.source.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-brand">
                        {p.source.label} ↗
                      </a>
                    ) : (
                      <span className="text-muted">ข้อมูลตัวอย่าง</span>
                    )}
                  </td>
                ))}
              </tr>
            )}
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
