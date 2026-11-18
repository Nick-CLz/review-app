"use client";

import { useState } from "react";
import { DEFAULT_ENERGY, energyCostPerKm, MAINTENANCE_PER_YEAR, type Powertrain } from "@/lib/cars";
import { money, moneyShort } from "@/lib/format";
import { fullName } from "@/lib/items";
import type { Item } from "@/lib/types";

function costOf(item: Item, km: number, years: number, e: typeof DEFAULT_ENERGY) {
  const s = item.specs;
  const pt = s.powertrain as Powertrain;
  const perKm = energyCostPerKm(
    { powertrain: pt, kmPerL: (s.kmPerL as number) ?? undefined, kmPerKwh: (s.kmPerKwh as number) ?? undefined },
    e,
  );
  const price = Number(s.price);
  const energy = perKm * km * years;
  const maint = MAINTENANCE_PER_YEAR[pt] * years;
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

export default function CostCalculator({ items }: { items: Item[] }) {
  const [km, setKm] = useState(20000);
  const [years, setYears] = useState(5);
  const [e, setE] = useState(DEFAULT_ENERGY);
  const rows = items.map((i) => ({ item: i, ...costOf(i, km, years, e) }));
  const max = Math.max(...rows.map((r) => r.total), 1);
  const cheapest = Math.min(...rows.map((r) => r.total));
  const showPhev = items.some((i) => i.specs.powertrain === "phev");

  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <h2 className="text-lg font-bold">💰 ค่าใช้จ่ายรวมตลอดการใช้งาน</h2>
      <p className="text-xs text-muted">ราคารถ + ค่าน้ำมัน/ค่าไฟ + ค่าบำรุงรักษาโดยประมาณ (ยังไม่รวมประกัน ภาษี และค่าเสื่อมราคา)</p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Num label="วิ่งต่อปี" value={km} step={1000} onChange={setKm} suffix="กม." />
        <Num label="ใช้งาน" value={years} onChange={setYears} suffix="ปี" />
        <Num label="เบนซิน" value={e.gasoline} step={0.5} onChange={(n) => setE({ ...e, gasoline: n })} suffix="฿/ล." />
        <Num label="ดีเซล" value={e.diesel} step={0.5} onChange={(n) => setE({ ...e, diesel: n })} suffix="฿/ล." />
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
      <div className="mt-4 flex gap-4 text-[11px] text-muted">
        <span className="flex items-center gap-1"><i className="h-2 w-3 rounded bg-brand" />ราคารถ</span>
        <span className="flex items-center gap-1"><i className="h-2 w-3 rounded bg-accent" />ค่าพลังงาน</span>
        <span className="flex items-center gap-1"><i className="h-2 w-3 rounded bg-muted" />บำรุงรักษา</span>
      </div>
    </section>
  );
}
