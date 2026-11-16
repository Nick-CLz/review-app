"use client";

import { useState } from "react";
import { getProduct } from "@/lib/products";
import { MAX_COMPARE, toggleCompare, useCompare } from "@/lib/store";

const categoryOf = (id: string) => getProduct(id)?.category;

export default function CompareButton({
  id,
  category,
  variant = "chip",
}: {
  id: string;
  category: string;
  variant?: "chip" | "button";
}) {
  const list = useCompare();
  const on = list.includes(id);
  const [msg, setMsg] = useState<string | null>(null);

  function onClick() {
    const res = toggleCompare(id, category, categoryOf);
    if (res === "full") setMsg(`เทียบได้สูงสุด ${MAX_COMPARE} รายการ`);
    else if (res === "replaced") setMsg("เริ่มรายการเทียบใหม่สำหรับหมวดนี้");
    else setMsg(null);
    if (res === "full" || res === "replaced") setTimeout(() => setMsg(null), 2500);
  }

  const cls =
    variant === "button"
      ? on
        ? "btn border border-brand bg-brand-soft text-fg"
        : "btn-ghost"
      : `inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
          on ? "border-brand bg-brand-soft text-fg" : "border-line text-muted hover:border-brand hover:text-fg"
        }`;

  return (
    <span className="relative inline-flex">
      <button type="button" onClick={onClick} aria-pressed={on} className={cls}>
        <span aria-hidden>{on ? "✓" : "+"}</span>
        {on ? "อยู่ในรายการเทียบ" : "เพิ่มเพื่อเทียบ"}
      </button>
      {msg && (
        <span className="absolute top-full left-0 z-10 mt-1 whitespace-nowrap rounded-md bg-fg px-2 py-1 text-xs text-bg">
          {msg}
        </span>
      )}
    </span>
  );
}
