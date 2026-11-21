"use client";

import { useState } from "react";
import Link from "next/link";
import { TRIP_DAYS, TRIP_DESTINATIONS, TRIP_PRICES, TRIP_PRICES_CHECKED } from "@/lib/data/travel";
import { formatSpec, money } from "@/lib/format";
import { getCategory } from "@/lib/categories";
import { getProduct } from "@/lib/products";
import CompareButton from "./CompareButton";

const checked = new Date(`${TRIP_PRICES_CHECKED}T00:00:00`).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });

/** Look up real, pre-fetched premiums by destination and trip length. No interpolation. */
export default function TripPrices() {
  const [dest, setDest] = useState<(typeof TRIP_DESTINATIONS)[number]["key"]>("japan");
  const [dayIx, setDayIx] = useState(1);
  const medical = getCategory("travel")!.fields.find((f) => f.key === "medicalLimit")!;
  const rows = Object.entries(TRIP_PRICES[dest])
    .map(([id, prices]) => ({ plan: getProduct(id)!, price: prices[dayIx] }))
    .sort((a, b) => a.price - b.price);

  return (
    <section className="mb-5 rounded-2xl border border-line bg-surface p-4">
      <h2 className="text-sm font-semibold">✈️ ดูเบี้ยจริงตามทริปของคุณ</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-muted">
          ปลายทาง
          <select className="input mt-1" value={dest} onChange={(e) => setDest(e.target.value as typeof dest)}>
            {TRIP_DESTINATIONS.map((d) => (
              <option key={d.key} value={d.key}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-muted">
          ระยะเวลาเดินทาง
          <select className="input mt-1" value={dayIx} onChange={(e) => setDayIx(Number(e.target.value))}>
            {TRIP_DAYS.map((d, i) => (
              <option key={d} value={i}>
                {d} วัน
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="mt-3 divide-y divide-line">
        {rows.map(({ plan, price }) => (
          <li key={plan.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2.5">
            <div className="min-w-0">
              <Link href={`/p/${plan.id}`} className="font-semibold hover:text-brand">
                {plan.name}
              </Link>
              <p className="text-xs text-muted">
                {plan.provider} · ค่ารักษา {formatSpec(medical, plan.specs.medicalLimit)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-brand">
                {money(price)}
                <span className="text-xs font-normal text-muted">/ทริป</span>
              </span>
              <CompareButton id={plan.id} category="travel" />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted">
        เบี้ยจากเครื่องคำนวณบนเว็บวิริยะประกันภัย สำหรับผู้เดินทาง 1 คน ออกเดินทาง 1 ธ.ค. 2569 ยังไม่รวมโค้ดส่วนลด ตรวจสอบเมื่อ {checked} ·
        เบี้ยจริงอาจต่างตามวันเดินทางและอายุ · บริษัทอื่นยังไม่เปิดเผยเบี้ยรายทริป ต้องขอใบเสนอราคาที่เว็บบริษัท
      </p>
    </section>
  );
}
