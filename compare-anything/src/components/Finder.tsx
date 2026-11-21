"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { findCars, type FinderAnswers, type Priority, type Use } from "@/lib/finder";
import { money } from "@/lib/format";
import { setCompare } from "@/lib/store";
import ItemCard from "./ItemCard";

const BUDGETS = [
  { value: 700000, label: "ไม่เกิน 7 แสน" },
  { value: 1000000, label: "ไม่เกิน 1 ล้าน" },
  { value: 1500000, label: "ไม่เกิน 1.5 ล้าน" },
  { value: 2000000, label: "ไม่เกิน 2 ล้าน" },
  { value: Infinity, label: "ไม่จำกัดงบ" },
];
const SEATS = [
  { value: 2, label: "1–2 คน" },
  { value: 5, label: "3–5 คน" },
  { value: 7, label: "6–7 คน" },
];
const KMS = [
  { value: 20, label: "ไม่เกิน 30 กม." },
  { value: 50, label: "30–80 กม." },
  { value: 100, label: "มากกว่า 80 กม." },
];
const USES: { value: Use; label: string; icon: string }[] = [
  { value: "city", label: "ขับในเมือง", icon: "🏙️" },
  { value: "family", label: "รถครอบครัว", icon: "👨‍👩‍👧" },
  { value: "work", label: "ลุย / บรรทุกของ", icon: "🛠️" },
  { value: "fun", label: "ขับสนุก", icon: "🏁" },
];
const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "economy", label: "ประหยัดน้ำมัน/ไฟ" },
  { value: "performance", label: "แรง อัตราเร่งดี" },
  { value: "practical", label: "กว้าง ใช้งานคุ้ม" },
  { value: "safety", label: "ปลอดภัยสูง" },
  { value: "value", label: "ราคาถูก" },
];

function Choice<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; icon?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-xl border px-3 py-2 text-sm transition ${
            value === o.value ? "border-brand bg-brand text-brand-fg" : "border-line bg-surface hover:border-brand"
          }`}
        >
          {o.icon && <span className="mr-1">{o.icon}</span>}
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Question({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-2xl border border-line bg-surface p-4">
      <legend className="sr-only">{title}</legend>
      <p className="mb-3 font-bold">
        <span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-full bg-brand-soft text-xs">{n}</span>
        {title}
      </p>
      {children}
    </fieldset>
  );
}

export default function Finder() {
  const router = useRouter();
  const [a, setA] = useState<FinderAnswers>({
    budget: 1500000,
    seats: 5,
    dailyKm: 50,
    homeCharging: true,
    use: "family",
    priorities: ["economy"],
  });
  const matches = useMemo(() => findCars(a), [a]);
  const top = matches.slice(0, 6);

  function togglePriority(p: Priority) {
    setA((s) => ({
      ...s,
      priorities: s.priorities.includes(p) ? s.priorities.filter((x) => x !== p) : [...s.priorities, p].slice(-2),
    }));
  }

  function compareTop() {
    setCompare(top.slice(0, 3).map((m) => m.item.id));
    router.push("/compare");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <div className="space-y-3 lg:sticky lg:top-20 lg:self-start">
        <div>
          <h1 className="text-2xl font-bold">🧭 ช่วยเลือกรถที่ใช่</h1>
          <p className="text-sm text-muted">ตอบ 6 ข้อ ผลลัพธ์อัปเดตทันที</p>
        </div>
        <Question n={1} title="งบประมาณ">
          <Choice options={BUDGETS} value={a.budget} onChange={(budget) => setA((s) => ({ ...s, budget }))} />
        </Question>
        <Question n={2} title="นั่งกันกี่คนเป็นประจำ">
          <Choice options={SEATS} value={a.seats} onChange={(seats) => setA((s) => ({ ...s, seats }))} />
        </Question>
        <Question n={3} title="ขับวันละประมาณ">
          <Choice options={KMS} value={a.dailyKm} onChange={(dailyKm) => setA((s) => ({ ...s, dailyKm }))} />
        </Question>
        <Question n={4} title="ชาร์จไฟที่บ้าน/ที่ทำงานได้ไหม">
          <Choice
            options={[
              { value: "yes", label: "ได้", icon: "🔌" },
              { value: "no", label: "ไม่ได้", icon: "🚫" },
            ]}
            value={a.homeCharging ? "yes" : "no"}
            onChange={(v) => setA((s) => ({ ...s, homeCharging: v === "yes" }))}
          />
        </Question>
        <Question n={5} title="ใช้งานหลักแบบไหน">
          <Choice options={USES} value={a.use} onChange={(use) => setA((s) => ({ ...s, use }))} />
        </Question>
        <Question n={6} title="ให้ความสำคัญอะไรที่สุด (เลือกได้ 2)">
          <div className="flex flex-wrap gap-2">
            {PRIORITIES.map((p) => {
              const on = a.priorities.includes(p.value);
              return (
                <button
                  key={p.value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => togglePriority(p.value)}
                  className={`rounded-xl border px-3 py-2 text-sm transition ${
                    on ? "border-brand bg-brand text-brand-fg" : "border-line bg-surface hover:border-brand"
                  }`}
                >
                  {on && "✓ "}
                  {p.label}
                </button>
              );
            })}
          </div>
        </Question>
      </div>

      <section aria-live="polite">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            ตรงเงื่อนไข <b className="text-fg">{matches.length}</b> รุ่น
            {a.budget !== Infinity && <> · งบ {money(a.budget)}</>}
          </p>
          {top.length >= 2 && (
            <button type="button" className="btn-primary" onClick={compareTop}>
              ⚖️ เทียบ {Math.min(3, top.length)} อันดับแรก
            </button>
          )}
        </div>

        {top.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">
            ไม่มีรุ่นที่ตรงเงื่อนไข ลองเพิ่มงบหรือลดจำนวนที่นั่ง
          </div>
        ) : (
          <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {top.map((m, idx) => (
              <li key={m.item.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold">อันดับ {idx + 1}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${idx === 0 ? "bg-win text-win-fg" : "bg-surface-2"}`}>
                    ตรงใจ {m.percent}%
                  </span>
                </div>
                <ItemCard item={m.item} />
                <ul className="space-y-0.5 text-xs">
                  {m.reasons.map((r) => (
                    <li key={r}>
                      <span className="text-brand">✓</span> {r}
                    </li>
                  ))}
                  {m.warnings.map((w) => (
                    <li key={w} className="text-muted">
                      <span className="text-red-500">!</span> {w}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
