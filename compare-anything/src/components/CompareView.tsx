"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BODY_TYPES, CARS } from "@/lib/categories";
import { formatSpec, money, winnerIndex } from "@/lib/format";
import { CAR_SCORE_DIMS, carScores, fullName, getItem, itemsIn, overallScore } from "@/lib/items";
import { clearCompare, MAX_COMPARE, setCompare, toggleCompare, useCompare } from "@/lib/store";
import type { Item } from "@/lib/types";
import CarArt from "./CarArt";
import CostCalculator from "./CostCalculator";
import RatingBadge from "./RatingBadge";
import ScoreRadar from "./ScoreRadar";

function AddPicker({ exclude, onPick }: { exclude: string[]; onPick: (id: string) => void }) {
  const all = itemsIn("cars").filter((i) => !exclude.includes(i.id));
  return (
    <select
      className="input"
      value=""
      onChange={(e) => e.target.value && onPick(e.target.value)}
      aria-label="เพิ่มรถเพื่อเทียบ"
    >
      <option value="">+ เพิ่มรถเข้าเทียบ…</option>
      {BODY_TYPES.map((b) => {
        const group = all.filter((i) => i.specs.bodyType === b.value);
        if (!group.length) return null;
        return (
          <optgroup key={b.value} label={`${b.icon} ${b.label}`}>
            {group.map((i) => (
              <option key={i.id} value={i.id}>
                {fullName(i)} {i.variant} — {money(Number(i.specs.price))}
              </option>
            ))}
          </optgroup>
        );
      })}
    </select>
  );
}

function verdicts(items: Item[]) {
  // Every car sharing the best value wins — ties are named together, not resolved by list order.
  const pick = (f: (i: Item) => number, dir: "max" | "min") => {
    const vals = items.map(f);
    const best = dir === "max" ? Math.max(...vals) : Math.min(...vals);
    return items.filter((_, idx) => vals[idx] === best);
  };
  return [
    { label: "🏆 คะแนนรวมดีสุด", winners: pick(overallScore, "max") },
    { label: "💸 ราคาถูกสุด", winners: pick((i) => Number(i.specs.price), "min") },
    { label: "⛽ ค่าพลังงานถูกสุด", winners: pick((i) => Number(i.specs.energyCost), "min") },
    { label: "🚀 แรงสุด", winners: pick((i) => Number(i.specs.powerHp), "max") },
    { label: "🧳 ใช้งานจริงดีสุด", winners: pick((i) => carScores(i).practical, "max") },
    { label: "🛡️ ปลอดภัยสุด", winners: pick((i) => carScores(i).safety, "max") },
  ];
}

export default function CompareView() {
  const ids = useCompare();
  const [diffOnly, setDiffOnly] = useState(false);
  const [copied, setCopied] = useState(false);

  // Shared links: /compare?ids=a,b,c seeds the list once.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("ids");
    if (p) {
      setCompare(p.split(",").filter((id) => getItem(id)));
      window.history.replaceState(null, "", "/compare");
    }
  }, []);

  const items = useMemo(() => ids.map(getItem).filter((x): x is Item => x !== undefined), [ids]);
  const cols = `minmax(140px,180px) repeat(${items.length}, minmax(160px,1fr))`;

  function share() {
    const url = `${window.location.origin}/compare?ids=${items.map((i) => i.id).join(",")}`;
    navigator.clipboard?.writeText(url).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => window.prompt("คัดลอกลิงก์นี้", url),
    );
  }

  if (items.length < 2) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-line bg-surface p-8 text-center">
        <p className="text-4xl">⚖️</p>
        <h1 className="mt-2 text-xl font-bold">เลือกรถอย่างน้อย 2 คันเพื่อเปรียบเทียบ</h1>
        <p className="mt-1 text-sm text-muted">เทียบข้ามประเภทได้ เช่น EV กับไฮบริด หรือกระบะกับ SUV</p>
        {items.length === 1 && <p className="mt-3 text-sm">เลือกแล้ว: {fullName(items[0])}</p>}
        <div className="mt-4">
          <AddPicker exclude={ids} onPick={(id) => toggleCompare(id)} />
        </div>
        <Link href="/c/cars" className="mt-4 inline-block text-sm text-brand hover:underline">
          หรือเลือกจากหน้ารวมรถยนต์ →
        </Link>
      </div>
    );
  }

  const groups = [...new Set(CARS.fields.map((f) => f.group))];
  const v = verdicts(items);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">เปรียบเทียบ {items.length} รุ่น</h1>
          <p className="text-sm text-muted">ช่องสีเขียว = ดีที่สุดในแถวนั้น</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="btn-ghost cursor-pointer">
            <input type="checkbox" checked={diffOnly} onChange={(e) => setDiffOnly(e.target.checked)} className="accent-[var(--brand)]" />
            แสดงเฉพาะที่ต่างกัน
          </label>
          <button type="button" className="btn-ghost" onClick={share}>
            {copied ? "✓ คัดลอกลิงก์แล้ว" : "🔗 แชร์ผลเทียบ"}
          </button>
          <button type="button" className="btn-ghost" onClick={clearCompare}>
            ล้างทั้งหมด
          </button>
        </div>
      </div>

      <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {v.map((x) => (
          <div key={x.label} className="flex items-start justify-between gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm">
            <span className="shrink-0 text-muted">{x.label}</span>
            <span className="text-right font-semibold">
              {x.winners.length === items.length ? (
                <span className="text-muted">เท่ากันทุกคัน</span>
              ) : (
                <>
                  {x.winners.map((w) => fullName(w)).join(", ")}
                  {x.winners.length > 1 && <span className="ml-1 text-xs font-normal text-muted">(เสมอ)</span>}
                </>
              )}
            </span>
          </div>
        ))}
      </section>

      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <div className="min-w-fit">
          {/* Header */}
          <div className="grid border-b border-line" style={{ gridTemplateColumns: cols }}>
            <div className="p-3">
              {items.length < MAX_COMPARE && <AddPicker exclude={ids} onPick={(id) => toggleCompare(id)} />}
            </div>
            {items.map((i) => (
              <div key={i.id} className="relative border-l border-line p-3">
                <button
                  type="button"
                  onClick={() => toggleCompare(i.id)}
                  aria-label={`เอา ${fullName(i)} ออก`}
                  className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-surface-2 text-sm hover:bg-line"
                >
                  ×
                </button>
                <CarArt bodyType={String(i.specs.bodyType)} hue={i.hue} ev={i.specs.powertrain === "ev"} className="w-full text-fg" />
                <Link href={`/i/${i.id}`} className="mt-1 block font-bold leading-tight hover:text-brand">
                  {fullName(i)}
                </Link>
                <p className="text-xs text-muted">{i.variant}</p>
                <p className="mt-1 font-bold text-brand">{money(Number(i.specs.price))}</p>
                <RatingBadge itemId={i.id} seed={i.reviews} />
              </div>
            ))}
          </div>

          {/* Scores */}
          <div className="bg-surface-2 px-3 py-2 text-sm font-bold">คะแนนจากสเปก (1–10)</div>
          {[{ key: "overall", label: "คะแนนรวม" }, ...CAR_SCORE_DIMS].map((d) => {
            const vals = items.map((i) => (d.key === "overall" ? overallScore(i) : carScores(i)[d.key]));
            const best = Math.max(...vals);
            return (
              <div key={d.key} className="grid border-t border-line text-sm" style={{ gridTemplateColumns: cols }}>
                <div className="p-3 text-muted">{d.label}</div>
                {vals.map((val, idx) => (
                  <div key={items[idx].id} className={`border-l border-line p-3 ${val === best ? "bg-win text-win-fg" : ""}`}>
                    <div className="flex items-center gap-2">
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                        <span className="block h-full rounded-full bg-brand" style={{ width: `${val * 10}%` }} />
                      </span>
                      <b className="tabular-nums">{val.toFixed(1)}</b>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}

          {/* Specs */}
          {groups.map((g) => {
            const fields = CARS.fields.filter((f) => {
              if (f.group !== g) return false;
              if (!diffOnly) return true;
              const vals = items.map((i) => formatSpec(f, i.specs[f.key]));
              return new Set(vals).size > 1;
            });
            if (!fields.length) return null;
            return (
              <div key={g}>
                <div className="border-t border-line bg-surface-2 px-3 py-2 text-sm font-bold">{g}</div>
                {fields.map((f) => {
                  const vals = items.map((i) => i.specs[f.key]);
                  const wins = winnerIndex(f, vals);
                  return (
                    <div key={f.key} className="grid border-t border-line text-sm" style={{ gridTemplateColumns: cols }}>
                      <div className="p-3 text-muted">
                        {f.label}
                        {f.hint && <span className="block text-[10px] leading-tight">{f.hint}</span>}
                      </div>
                      {vals.map((val, idx) => (
                        <div
                          key={items[idx].id}
                          className={`border-l border-line p-3 ${wins.includes(idx) ? "bg-win font-semibold text-win-fg" : ""}`}
                        >
                          {formatSpec(f, val)}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Pros / cons */}
          <div className="border-t border-line bg-surface-2 px-3 py-2 text-sm font-bold">จุดเด่น / ข้อควรรู้</div>
          <div className="grid border-t border-line text-sm" style={{ gridTemplateColumns: cols }}>
            <div className="p-3 text-muted">จุดเด่น</div>
            {items.map((i) => (
              <ul key={i.id} className="space-y-1 border-l border-line p-3">
                {i.pros.map((p) => (
                  <li key={p}>
                    <span className="text-brand">✓</span> {p}
                  </li>
                ))}
              </ul>
            ))}
          </div>
          <div className="grid border-t border-line text-sm" style={{ gridTemplateColumns: cols }}>
            <div className="p-3 text-muted">ข้อควรรู้</div>
            {items.map((i) => (
              <ul key={i.id} className="space-y-1 border-l border-line p-3">
                {i.cons.map((p) => (
                  <li key={p}>
                    <span className="text-red-500">!</span> {p}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>

      <ScoreRadar items={items} />
      <CostCalculator items={items} />
    </div>
  );
}
