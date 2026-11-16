"use client";

import { useState } from "react";
import { avgRating } from "@/lib/products";
import { addReview } from "@/lib/store";
import type { SeedReview } from "@/lib/types";
import { useAllReviews } from "./RatingBadge";
import Stars from "./Stars";

export default function Reviews({ productId, seed }: { productId: string; seed: SeedReview[] }) {
  const all = useAllReviews(productId, seed);
  const avg = avgRating(all);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [form, setForm] = useState({ author: "", title: "", body: "" });

  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, count: all.filter((r) => r.rating === n).length }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    addReview({
      id: crypto.randomUUID(),
      productId,
      rating,
      author: form.author.trim() || "ผู้ใช้ไม่ระบุชื่อ",
      title: form.title.trim(),
      body: form.body.trim(),
      date: new Date().toLocaleDateString("sv-SE"), // local YYYY-MM-DD (toISOString would be UTC)
    });
    setForm({ author: "", title: "", body: "" });
    setRating(5);
    setOpen(false);
  }

  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">รีวิวจากผู้ใช้</h2>
        <button type="button" className="btn-ghost" onClick={() => setOpen((o) => !o)}>
          {open ? "ยกเลิก" : "✍️ เขียนรีวิว"}
        </button>
      </div>

      <div className="mt-4 grid gap-6 sm:grid-cols-[160px_1fr]">
        <div className="text-center">
          <p className="text-4xl font-bold">{avg ? avg.toFixed(1) : "–"}</p>
          <Stars value={avg} size="text-lg" />
          <p className="text-xs text-muted">{all.length} รีวิว</p>
        </div>
        <div className="space-y-1">
          {dist.map(({ n, count }) => (
            <div key={n} className="flex items-center gap-2 text-xs">
              <span className="w-6 text-muted">{n}★</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full bg-accent" style={{ width: `${all.length ? (count / all.length) * 100 : 0}%` }} />
              </div>
              <span className="w-4 text-right text-muted">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {open && (
        <form onSubmit={submit} className="mt-5 space-y-3 rounded-xl bg-surface-2 p-4">
          <div className="flex items-center gap-1" role="radiogroup" aria-label="ให้คะแนน">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                onClick={() => setRating(n)}
                className={`text-2xl ${n <= rating ? "text-accent" : "text-line"}`}
              >
                ★
              </button>
            ))}
          </div>
          <input className="input" placeholder="ชื่อที่แสดง (ไม่บังคับ)" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
          <input required className="input" placeholder="หัวข้อรีวิว" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea
            required
            rows={3}
            className="input"
            placeholder="ประสบการณ์การเคลม การบริการ ความคุ้มค่า…"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />
          <button className="btn-primary">ส่งรีวิว</button>
        </form>
      )}

      <ul className="mt-5 divide-y divide-line">
        {all.map((r, i) => (
          <li key={i} className="py-4">
            <div className="flex items-center justify-between gap-2">
              <Stars value={r.rating} />
              <span className="text-xs text-muted">{r.date}</span>
            </div>
            <p className="mt-1 font-semibold">{r.title}</p>
            <p className="mt-1 text-sm text-muted">{r.body}</p>
            <p className="mt-1 text-xs text-muted">— {r.author}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
