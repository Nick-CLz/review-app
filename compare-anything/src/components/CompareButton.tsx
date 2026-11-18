"use client";

import { useState } from "react";
import { MAX_COMPARE, toggleCompare, useCompare } from "@/lib/store";

export default function CompareButton({ id, variant = "chip" }: { id: string; variant?: "chip" | "button" }) {
  const list = useCompare();
  const on = list.includes(id);
  const [msg, setMsg] = useState("");

  function click(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const res = toggleCompare(id);
    if (res === "full") {
      setMsg(`เทียบได้สูงสุด ${MAX_COMPARE} คัน`);
      setTimeout(() => setMsg(""), 2200);
    }
  }

  const cls =
    variant === "button"
      ? on
        ? "btn-primary w-full"
        : "btn-ghost w-full"
      : `rounded-full border px-3 py-1 text-xs font-semibold transition ${
          on ? "border-brand bg-brand text-brand-fg" : "border-line bg-surface hover:border-brand hover:text-brand"
        }`;

  return (
    <span className="relative inline-flex">
      <button type="button" onClick={click} aria-pressed={on} className={cls}>
        {on ? "✓ อยู่ในรายการเทียบ" : "+ เทียบ"}
      </button>
      {msg && (
        <span role="status" className="absolute right-0 top-full z-10 mt-1 whitespace-nowrap rounded bg-fg px-2 py-1 text-[11px] text-bg">
          {msg}
        </span>
      )}
    </span>
  );
}
