import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import PageSkeleton from "@/components/PageSkeleton";
import { notFound } from "next/navigation";
import { getCategory } from "@/lib/categories";
import { PRODUCTS, getProduct, productsIn } from "@/lib/products";
import { formatSpec, money } from "@/lib/format";
import CompareButton from "@/components/CompareButton";
import RatingBadge from "@/components/RatingBadge";
import Reviews from "@/components/Reviews";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/p/[id]">): Promise<Metadata> {
  const p = getProduct((await params).id);
  return { title: p ? `${p.name} — ${p.provider}` : "ไม่พบแผน" };
}

export default function ProductPage({ params }: PageProps<"/p/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }: { params: PageProps<"/p/[id]">["params"] }) {
  const { id } = await params;
  const p = getProduct(id);
  const c = p && getCategory(p.category);
  if (!p || !c) notFound();

  const price = Number(p.specs[c.priceKey] ?? 0);
  const alternatives = productsIn(c.slug).filter((x) => x.id !== p.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="text-xs text-muted">
        <Link href="/" className="hover:text-fg">
          หน้าแรก
        </Link>{" "}
        /{" "}
        <Link href={`/c/${c.slug}`} className="hover:text-fg">
          {c.name}
        </Link>{" "}
        / {p.name}
      </nav>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <header>
            <p className="text-sm text-muted">
              {c.icon} {c.name} · {p.provider}
            </p>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl">{p.name}</h1>
            <div className="mt-2">
              <RatingBadge productId={p.id} seed={p.reviews} />
            </div>
            <p className="mt-3 text-muted">{p.tagline}</p>
          </header>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="font-bold">จุดเด่น</h2>
              <ul className="mt-2 space-y-1.5 text-sm">
                {p.highlights.map((h) => (
                  <li key={h} className="flex gap-2">
                    <span className="text-brand">✓</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="font-bold">ข้อยกเว้น / ข้อควรรู้</h2>
              <ul className="mt-2 space-y-1.5 text-sm">
                {p.exclusions.map((h) => (
                  <li key={h} className="flex gap-2">
                    <span className="text-red-500">!</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-line bg-surface">
            <h2 className="border-b border-line px-5 py-3 font-bold">รายละเอียดความคุ้มครอง</h2>
            <table className="w-full text-sm">
              <tbody>
                {c.fields.map((f) => (
                  <tr key={f.key} className="border-b border-line last:border-0">
                    <th className="w-1/2 px-5 py-2.5 text-left font-normal text-muted">
                      {f.label}
                      {f.hint && <span className="block text-[11px]">{f.hint}</span>}
                    </th>
                    <td className="px-5 py-2.5 font-semibold">{formatSpec(f, p.specs[f.key])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <Reviews productId={p.id} seed={p.reviews} />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <p className="text-xs text-muted">เบี้ยประกันเริ่มต้น</p>
            <p className="text-3xl font-bold text-brand">
              {money(price)}
              <span className="text-sm font-normal text-muted">{c.priceSuffix}</span>
            </p>
            <Link href={`/buy/${p.id}`} className="btn-primary mt-4 w-full py-3 text-base">
              สนใจซื้อแผนนี้
            </Link>
            <div className="mt-2 flex justify-center">
              <CompareButton id={p.id} category={p.category} variant="button" />
            </div>
            <p className="mt-3 text-[11px] text-muted">เบี้ยจริงขึ้นกับอายุ เพศ อาชีพ และสุขภาพของผู้เอาประกัน</p>
          </div>

          {alternatives.length > 0 && (
            <div className="rounded-2xl border border-line bg-surface p-5">
              <p className="font-bold">แผนอื่นในหมวดเดียวกัน</p>
              <ul className="mt-2 space-y-2 text-sm">
                {alternatives.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-2">
                    <Link href={`/p/${a.id}`} className="hover:text-brand">
                      {a.name}
                    </Link>
                    <span className="shrink-0 text-xs text-muted">{money(Number(a.specs[c.priceKey] ?? 0))}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
