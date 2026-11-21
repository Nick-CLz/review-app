"use client";

import { useState } from "react";
import { DEFAULT_ENERGY, energyCostPerKm, type EnergyPrices } from "@/lib/energy";
import { money, moneyShort } from "@/lib/format";
import { categoryOf, fullName } from "@/lib/items";
import { SERIES } from "@/lib/palette";
import type { Item } from "@/lib/types";

function costOf(item: Item, km: number, years: number, e: EnergyPrices) {
  const s = item.specs;
  const cat = categoryOf(item);
  const pt = String(s.powertrain);
  const perKm = energyCostPerKm({ powertrain: pt, kmPerL: s.kmPerL as number | null, kmPerKwh: s.kmPerKwh as number | null }, e);
  const price = Number(s[cat.priceKey]);
  const energy = perKm * km * years;
  const maint = (cat.maintenancePerYear?.[pt] ?? 0) * years;
  return { price, energy, maint, total: price + energy + maint, perKm };
}

function Num({
  label,
  value,
  onChange,
  step = 1,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
  suffix?: string;
}) {
  return (
    <label className="block text-xs text-muted">
      {label}
      <span className="mt-1 flex items-center gap-1">
        <input
          type="number"
          className="input py-1.5"
          value={value}
          step={step}
          min={0}
          onChange={(ev) => onChange(Math.max(0, Number(ev.target.value)))}
        />
        {suffix && <span className="shrink-0">{suffix}</span>}
      </span>
    </label>
  );
}

function yearsToCatchUp(a: Row, b: Row) {
  // a costs more up front but less per year than b → when does a's total drop below b's?
  const extra = a.price - b.price;
  const saving = b.yearly - a.yearly;
  if (extra <= 0 || saving <= 0) return null;
  return extra / saving;
}

interface Row {
  item: Item;
  price: number;
  yearly: number;
}

function CostOverTime({ rows, years }: { rows: Row[]; years: number }) {
  const W = 560;
  const H = 240;
  const pad = { l: 56, r: 12, t: 12, b: 28 };
  const span = Math.max(years, 1);
  const maxY = Math.max(...rows.map((r) => r.price + r.yearly * span));
  // Start the axis just under the cheapest purchase price so the lines don't bunch up at the top.
  const minY = Math.floor((Math.min(...rows.map((r) => r.price)) * 0.85) / 100_000) * 100_000;
  const x = (t: number) => pad.l + (t / span) * (W - pad.l - pad.r);
  const y = (v: number) => H - pad.b - ((v - minY) / (maxY - minY)) * (H - pad.t - pad.b);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => minY + f * (maxY - minY));

  // Payback notes: each pricier car vs each cheaper-to-buy car it eventually beats within the period.
  const notes: string[] = [];
  for (const a of rows)
    for (const b of rows) {
      const t = yearsToCatchUp(a, b);
      if (t !== null && t <= span) notes.push(`${fullName(a.item)} คืนทุนเทียบกับ ${fullName(b.item)} ในราว ${t.toFixed(1)} ปี`);
    }

  return (
    <div className="mt-6">
      <p className="text-sm font-bold">ค่าใช้จ่ายสะสมตามปี</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full max-w-3xl" role="img" aria-label="กราฟค่าใช้จ่ายสะสมของแต่ละรุ่นตามจำนวนปี">
        {ticks.map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="var(--line)" />
            <text x={pad.l - 6} y={y(v)} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="var(--muted)">
              {(v / 1_000_000).toFixed(2)}M
            </text>
          </g>
        ))}
        {Array.from({ length: span + 1 }, (_, t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" fontSize="10" fill="var(--muted)">
            {t === 0 ? "ซื้อ" : `ปี ${t}`}
          </text>
        ))}
        {rows.map((r, idx) => (
          <g key={r.item.id}>
            <line x1={x(0)} y1={y(r.price)} x2={x(span)} y2={y(r.price + r.yearly * span)} stroke={SERIES[idx]} strokeWidth="2.5" />
            <circle cx={x(span)} cy={y(r.price + r.yearly * span)} r="3.5" fill={SERIES[idx]} />
          </g>
        ))}
      </svg>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {rows.map((r, idx) => (
          <span key={r.item.id} className="flex items-center gap-1.5">
            <i className="h-0.5 w-4 rounded" style={{ background: SERIES[idx] }} />
            {fullName(r.item)}
          </span>
        ))}
      </div>
      {notes.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm">
          {notes.map((n) => (
            <li key={n}>💡 {n}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function CostCalculator({ items }: { items: Item[] }) {
  // Motorcycles typically cover fewer kilometres a year than cars.
  const [km, setKm] = useState(items[0]?.category === "motorcycles" ? 10000 : 20000);
  const [years, setYears] = useState(5);
  const [e, setE] = useState(DEFAULT_ENERGY);
  const rows = items.map((i) => ({ item: i, ...costOf(i, km, years, e) }));
  const max = Math.max(...rows.map((r) => r.total), 1);
  const cheapest = Math.min(...rows.map((r) => r.total));
  const showPhev = items.some((i) => i.specs.powertrain === "phev");
  const showDiesel = items.some((i) => i.specs.powertrain === "diesel");

  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <h2 className="text-lg font-bold">💰 ค่าใช้จ่ายรวมตลอดการใช้งาน</h2>
      <p className="text-xs text-muted">ราคารถ + ค่าน้ำมัน/ค่าไฟ + ค่าบำรุงรักษาโดยประมาณ (ยังไม่รวมประกัน ภาษี และค่าเสื่อมราคา)</p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Num label="วิ่งต่อปี" value={km} step={1000} onChange={setKm} suffix="กม." />
        <Num label="ใช้งาน" value={years} onChange={setYears} suffix="ปี" />
        <Num label="เบนซิน" value={e.gasoline} step={0.5} onChange={(n) => setE({ ...e, gasoline: n })} suffix="฿/ล." />
        {showDiesel && <Num label="ดีเซล" value={e.diesel} step={0.5} onChange={(n) => setE({ ...e, diesel: n })} suffix="฿/ล." />}
        <Num label="ค่าไฟ" value={e.electricity} step={0.1} onChange={(n) => setE({ ...e, electricity: n })} suffix="฿/kWh" />
        {showPhev && (
          <Num
            label="PHEV ใช้ไฟ"
            value={Math.round(e.phevEvShare * 100)}
            step={5}
            onChange={(n) => setE({ ...e, phevEvShare: Math.min(100, n) / 100 })}
            suffix="%"
          />
        )}
      </div>

      <ul className="mt-5 space-y-4">
        {rows.map((r) => (
          <li key={r.item.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
              <span className="font-semibold">
                {fullName(r.item)}
                {rows.length > 1 && r.total === cheapest && (
                  <span className="ml-2 rounded-full bg-win px-2 py-0.5 text-[11px] text-win-fg">ถูกที่สุด</span>
                )}
              </span>
              <span className="font-bold">{money(r.total)}</span>
            </div>
            <div className="mt-1 flex h-3 overflow-hidden rounded-full bg-surface-2" style={{ width: `${(r.total / max) * 100}%` }}>
              <span className="bg-brand" style={{ width: `${(r.price / r.total) * 100}%` }} title="ราคารถ" />
              <span className="bg-accent" style={{ width: `${(r.energy / r.total) * 100}%` }} title="ค่าพลังงาน" />
              <span className="bg-muted" style={{ width: `${(r.maint / r.total) * 100}%` }} title="ค่าบำรุงรักษา" />
            </div>
            <p className="mt-1 text-[11px] text-muted">
              รถ {moneyShort(r.price)} · พลังงาน {money(r.energy)} ({r.perKm.toFixed(2)} ฿/กม. ≈ {money((r.perKm * km) / 12)}/เดือน) ·
              บำรุงรักษา {money(r.maint)}
            </p>
          </li>
        ))}
      </ul>
      {rows.length > 1 && (
        <CostOverTime rows={rows.map((r) => ({ item: r.item, price: r.price, yearly: (r.energy + r.maint) / Math.max(years, 1) }))} years={years} />
      )}
      <div className="mt-4 flex gap-4 text-[11px] text-muted">
        <span className="flex items-center gap-1"><i className="h-2 w-3 rounded bg-brand" />ราคารถ</span>
        <span className="flex items-center gap-1"><i className="h-2 w-3 rounded bg-accent" />ค่าพลังงาน</span>
        <span className="flex items-center gap-1"><i className="h-2 w-3 rounded bg-muted" />บำรุงรักษา</span>
      </div>
    </section>
  );
}
