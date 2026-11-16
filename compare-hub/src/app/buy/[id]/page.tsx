import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import PageSkeleton from "@/components/PageSkeleton";
import { notFound } from "next/navigation";
import { getCategory } from "@/lib/categories";
import { PRODUCTS, getProduct } from "@/lib/products";
import { formatSpec, money } from "@/lib/format";
import BuyForm from "@/components/BuyForm";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/buy/[id]">): Promise<Metadata> {
  const p = getProduct((await params).id);
  return { title: p ? `ซื้อ ${p.name}` : "ไม่พบแผน" };
}

export default function BuyPage({ params }: PageProps<"/buy/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <BuyContent params={params} />
    </Suspense>
  );
}

async function BuyContent({ params }: { params: PageProps<"/buy/[id]">["params"] }) {
  const { id } = await params;
  const p = getProduct(id);
  const c = p && getCategory(p.category);
  if (!p || !c) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href={`/p/${p.id}`} className="text-sm text-muted hover:text-fg">
        ← กลับไปที่รายละเอียดแผน
      </Link>
      <h1 className="mt-3 text-2xl font-bold">สนใจซื้อ {p.name}</h1>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_300px]">
        <BuyForm productId={p.id} productName={p.name} />

        <aside className="h-fit rounded-2xl border border-line bg-surface p-5 text-sm">
          <p className="text-xs text-muted">
            {c.icon} {c.name} · {p.provider}
          </p>
          <p className="mt-1 font-semibold">{p.name}</p>
          <p className="mt-2 text-2xl font-bold text-brand">
            {money(Number(p.specs[c.priceKey] ?? 0))}
            <span className="text-xs font-normal text-muted">{c.priceSuffix}</span>
          </p>
          <dl className="mt-4 space-y-2 border-t border-line pt-4">
            {c.fields
              .filter((f) => f.key !== c.priceKey)
              .slice(0, 5)
              .map((f) => (
                <div key={f.key} className="flex justify-between gap-3">
                  <dt className="text-muted">{f.label}</dt>
                  <dd className="text-right font-medium">{formatSpec(f, p.specs[f.key])}</dd>
                </div>
              ))}
          </dl>
          <p className="mt-4 text-[11px] text-muted">ยังไม่มีการเรียกเก็บเงินในขั้นตอนนี้ เบี้ยจริงจะยืนยันโดยตัวแทนก่อนชำระ</p>
        </aside>
      </div>
    </div>
  );
}
