import Link from "next/link";
import type { Category, Product } from "@/lib/types";
import { formatSpec } from "@/lib/format";
import { BuyAction, DataBadge, Price } from "./ProductBits";
import CompareButton from "./CompareButton";
import RatingBadge from "./RatingBadge";

export default function ProductCard({ product: p, category: c }: { product: Product; category: Category }) {
  // Show the 3 most important non-price specs on the card.
  const keySpecs = c.fields.filter((f) => f.key !== c.priceKey).slice(0, 3);

  return (
    <article className="flex flex-col rounded-2xl border border-line bg-surface p-5 transition hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted">{p.provider}</p>
          <h3 className="mt-0.5 font-semibold leading-snug">
            <Link href={`/p/${p.id}`} className="hover:text-brand">
              {p.name}
            </Link>
          </h3>
        </div>
        {p.badge && (
          <span className="shrink-0 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-fg">{p.badge}</span>
        )}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <DataBadge product={p} />
        <RatingBadge productId={p.id} seed={p.reviews} />
      </div>
      <p className="mt-2 text-sm text-muted">{p.tagline}</p>

      <dl className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-surface-2 p-3 text-center">
        {keySpecs.map((f) => (
          <div key={f.key}>
            <dt className="text-[11px] leading-tight text-muted">{f.label}</dt>
            <dd className="mt-1 text-sm font-semibold">{formatSpec(f, p.specs[f.key])}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto flex items-end justify-between gap-2 pt-4">
        <div>
          <p className="text-[11px] text-muted">เบี้ยประกัน</p>
          <Price product={p} category={c} />
        </div>
        <CompareButton id={p.id} category={p.category} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link href={`/p/${p.id}`} className="btn-ghost">
          ดูรายละเอียด
        </Link>
        <BuyAction product={p} />
      </div>
    </article>
  );
}
