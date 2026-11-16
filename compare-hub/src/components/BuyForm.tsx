"use client";

import Link from "next/link";
import { useState } from "react";
import { addLead } from "@/lib/store";

export default function BuyForm({ productId, productName }: { productId: string; productName: string }) {
  const [ref, setRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const phone = String(fd.get("phone") ?? "").replace(/\D/g, "");
    if (!/^0\d{8,9}$/.test(phone)) {
      setError("กรุณากรอกเบอร์โทรศัพท์ 9–10 หลัก ขึ้นต้นด้วย 0");
      return;
    }
    const id = crypto.randomUUID();
    addLead({
      id,
      productId,
      name: String(fd.get("name") ?? "").trim(),
      phone,
      email: String(fd.get("email") ?? "").trim(),
      birthDate: String(fd.get("birthDate") ?? ""),
      note: String(fd.get("note") ?? "").trim(),
      createdAt: new Date().toISOString(),
    });
    setRef(id.slice(0, 8).toUpperCase());
  }

  if (ref) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center">
        <p className="text-5xl">✅</p>
        <h2 className="mt-3 text-xl font-bold">ส่งความสนใจเรียบร้อย</h2>
        <p className="mt-2 text-muted">
          เลขอ้างอิง <b className="text-fg">{ref}</b> สำหรับแผน “{productName}”
        </p>
        <p className="mt-1 text-sm text-muted">ตัวแทนที่ได้รับใบอนุญาตจะติดต่อกลับเพื่อเสนอเบี้ยจริงและออกกรมธรรม์</p>
        <p className="mt-4 rounded-lg bg-surface-2 p-3 text-xs text-muted">
          เวอร์ชันทดลอง: ข้อมูลถูกบันทึกไว้ในเบราว์เซอร์นี้เท่านั้น ยังไม่ได้ส่งไปยังบริษัทประกันหรือตัวแทนจริง
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Link href="/" className="btn-ghost">
            กลับหน้าแรก
          </Link>
          <Link href="/compare" className="btn-primary">
            ดูรายการเทียบ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-line bg-surface p-6">
      <h2 className="text-lg font-bold">ข้อมูลผู้สนใจทำประกัน</h2>
      <label className="block text-sm">
        ชื่อ–นามสกุล
        <input name="name" required autoComplete="name" className="input mt-1" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          เบอร์โทรศัพท์
          <input name="phone" required inputMode="tel" autoComplete="tel" placeholder="08x-xxx-xxxx" className="input mt-1" />
        </label>
        <label className="block text-sm">
          วันเกิด
          <input name="birthDate" type="date" required className="input mt-1" />
        </label>
      </div>
      <label className="block text-sm">
        อีเมล (ไม่บังคับ)
        <input name="email" type="email" autoComplete="email" className="input mt-1" />
      </label>
      <label className="block text-sm">
        เวลาที่สะดวกให้ติดต่อ / คำถามเพิ่มเติม
        <textarea name="note" rows={3} className="input mt-1" />
      </label>
      <label className="flex items-start gap-2 text-xs text-muted">
        <input type="checkbox" required className="mt-0.5" />
        ข้าพเจ้ายินยอมให้เก็บและใช้ข้อมูลส่วนบุคคลข้างต้นเพื่อการติดต่อเสนอผลิตภัณฑ์ประกันภัยนี้ ตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="btn-primary w-full py-3 text-base">ส่งเรื่องให้ตัวแทนติดต่อกลับ</button>
    </form>
  );
}
