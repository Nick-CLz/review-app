import Link from "next/link";
import type { Category, Product } from "@/lib/types";
import { money } from "@/lib/format";
import { priceOf } from "@/lib/products";

const thaiDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });

/** Headline premium. Handles "starting from" prices and quote-only plans. */
export function Price({ product: p, category: c, size = "text-xl" }: { product: Product; category: Category; size?: string }) {
  const price = priceOf(p, c.priceKey);
  if (price === null) {
    return <p className="text-sm font-semibold text-muted">ขอใบเสนอราคาจากบริษัท</p>;
  }
  return (
    <p className={`${size} font-bold text-brand`}>
      {p.priceIsFrom && <span className="mr-1 text-xs font-normal text-muted">เริ่มต้น</span>}
      {money(price)}
      <span className="text-xs font-normal text-muted">{c.priceSuffix}</span>
    </p>
  );
}

/**
 * Real products link out to the insurer's own page (we are not a licensed broker yet).
 * Sample products keep the demo lead form.
 */
export function BuyAction({ product: p, className = "btn-primary" }: { product: Product; className?: string }) {
  if (p.source) {
    return (
      <a href={p.source.url} target="_blank" rel="noopener noreferrer" className={className}>
        ดูเบี้ย/ซื้อที่เว็บบริษัท ↗
      </a>
    );
  }
  return (
    <Link href={`/buy/${p.id}`} className={className}>
      สนใจซื้อ
    </Link>
  );
}

/** "Real data" vs "sample" marker. */
export function DataBadge({ product: p, withLink = false }: { product: Product; withLink?: boolean }) {
  if (!p.source) {
    return <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[11px] text-muted">ข้อมูลตัวอย่าง</span>;
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-1 text-[11px] text-muted">
      <span className="rounded bg-brand-soft px-1.5 py-0.5 font-semibold text-fg">✓ ข้อมูลจริง</span>
      ตรวจสอบเมื่อ {thaiDate(p.source.checkedAt)}
      {withLink && (
        <>
          {" · "}
          <a href={p.source.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-fg">
            {p.source.label}
          </a>
        </>
      )}
    </span>
  );
}
