"use client";

import { useState } from "react";
import { avgRating } from "@/lib/items";
import { thaiDate } from "@/lib/format";
import { addReview, useUserReviews } from "@/lib/store";
import type { SeedReview } from "@/lib/types";
import Stars from "./Stars";

export default function Reviews({ itemId, seed }: { itemId: string; seed: SeedReview[] }) {
  const mine = useUserReviews().filter((r) => r.itemId === itemId);
  const all = [...mine, ...seed];
  const avg = avgRating(all);
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: all.filter((r) => r.rating === n).length }));

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    addReview({
      id: crypto.randomUUID(),
      itemId,
      author: author.trim() || "ผู้ใช้งาน",
      rating,
      title: title.trim(),
      body: body.trim(),
      date: new Date().toISOString().slice(0, 10),
    });
    setTitle("");
    setBody("");
    setOpen(false);
  }

  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">รีวิวจากผู้ใช้จริง</h2>
        <button type="button" className="btn-ghost" onClick={() => setOpen((o) => !o)}>
          {open ? "ยกเลิก" : "✍️ เขียนรีวิว"}
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[140px_1fr]">
        <div className="text-center">
          <p className="text-4xl font-bold">{avg ? avg.toFixed(1) : "–"}</p>
          <Stars value={avg} />
          <p className="text-xs text-muted">{all.length} รีวิว</p>
        </div>
        <ul className="space-y-1 text-xs">
          {dist.map(({ n, c }) => (
            <li key={n} className="grid grid-cols-[24px_1fr_20px] items-center gap-2">
              <span>{n}★</span>
              <span className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                <span className="block h-full bg-accent" style={{ width: `${all.length ? (c / all.length) * 100 : 0}%` }} />
              </span>
              <span className="text-right text-muted">{c}</span>
            </li>
          ))}
        </ul>
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
                aria-label={`${n} ดาว`}
                onClick={() => setRating(n)}
                className={`text-2xl ${n <= rating ? "text-accent" : "text-line"}`}
              >
                ★
              </button>
            ))}
          </div>
          <input className="input" placeholder="ชื่อที่แสดง (ไม่บังคับ)" value={author} onChange={(e) => setAuthor(e.target.value)} />
          <input className="input" placeholder="หัวข้อรีวิว *" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea
            className="input min-h-24"
            placeholder="เล่าประสบการณ์ใช้งาน อัตราสิ้นเปลืองจริง ความสบาย ศูนย์บริการ… *"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">
            โพสต์รีวิว
          </button>
          <p className="text-[11px] text-muted">รีวิวถูกเก็บในเบราว์เซอร์นี้เท่านั้น (เวอร์ชันทดลอง)</p>
        </form>
      )}

      <ul className="mt-5 divide-y divide-line">
        {all.map((r, i) => (
          <li key={"id" in r ? String(r.id) : `seed-${i}`} className="py-3">
            <div className="flex items-center justify-between gap-2">
              <Stars value={r.rating} className="text-sm" />
              <span className="text-xs text-muted">
                {r.author} · {thaiDate(r.date)}
              </span>
            </div>
            <p className="mt-1 font-semibold">{r.title}</p>
            <p className="text-sm text-muted">{r.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
