import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CarArt from "@/components/CarArt";
import CompareButton from "@/components/CompareButton";
import CostCalculator from "@/components/CostCalculator";
import PageSkeleton from "@/components/PageSkeleton";
import RatingBadge from "@/components/RatingBadge";
import Reviews from "@/components/Reviews";
import ScoreBars from "@/components/ScoreBars";
import { getCategory, optionLabel } from "@/lib/categories";
import { formatSpec, money } from "@/lib/format";
import { fullName, getItem, ITEMS, itemsIn, overallScore } from "@/lib/items";

export function generateStaticParams() {
  return ITEMS.map((i) => ({ id: i.id }));
}

export async function generateMetadata({ params }: PageProps<"/i/[id]">): Promise<Metadata> {
  const i = getItem((await params).id);
  return { title: i ? `รีวิว ${fullName(i)} ${i.variant}` : "ไม่พบรุ่นนี้" };
}

export default function ItemPage({ params }: PageProps<"/i/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ItemContent params={params} />
    </Suspense>
  );
}

async function ItemContent({ params }: { params: PageProps<"/i/[id]">["params"] }) {
  const { id } = await params;
  const item = getItem(id);
  const c = item && getCategory(item.category);
  if (!item || !c) notFound();

  const s = item.specs;
  const groups = [...new Set(c.fields.map((f) => f.group))];
  const price = Number(s[c.priceKey]);
  // Rivals: same body type first, then anything within ±25% of the price (cross-type).
  const rivals = itemsIn(c.slug)
    .filter((x) => x.id !== item.id)
    .map((x) => ({
      x,
      same: x.specs.bodyType === s.bodyType,
      near: Math.abs(Number(x.specs.price) - price) / price <= 0.25,
    }))
    .filter((r) => r.same || r.near)
    .sort((a, b) => Number(b.same) - Number(a.same) || Number(b.near) - Number(a.near))
    .slice(0, 6)
    .map((r) => r.x);

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
        / {fullName(item)}
      </nav>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          <header className="grid items-center gap-4 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-[1fr_1.1fr]">
            <div>
              <p className="flex flex-wrap gap-1 text-xs">
                <span className="rounded-full bg-surface-2 px-2 py-0.5">{optionLabel(c, "bodyType", s.bodyType)}</span>
                <span className="rounded-full bg-brand-soft px-2 py-0.5">{optionLabel(c, "powertrain", s.powertrain)}</span>
              </p>
              <h1 className="mt-2 text-2xl font-bold md:text-3xl">{fullName(item)}</h1>
              <p className="text-muted">{item.variant}</p>
              <div className="mt-2">
                <RatingBadge itemId={item.id} seed={item.reviews} />
              </div>
              <p className="mt-3 text-sm">{item.tagline}</p>
            </div>
            <div className="rounded-xl bg-surface-2 p-3">
              <CarArt bodyType={String(s.bodyType)} hue={item.hue} ev={s.powertrain === "ev"} className="w-full text-fg" />
            </div>
          </header>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="font-bold">จุดเด่น</h2>
              <ul className="mt-2 space-y-1.5 text-sm">
                {item.pros.map((h) => (
                  <li key={h} className="flex gap-2">
                    <span className="text-brand">✓</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="font-bold">ข้อควรรู้</h2>
              <ul className="mt-2 space-y-1.5 text-sm">
                {item.cons.map((h) => (
                  <li key={h} className="flex gap-2">
                    <span className="text-red-500">!</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-line bg-surface">
            <h2 className="border-b border-line px-5 py-3 font-bold">สเปกโดยละเอียด</h2>
            {groups.map((g) => (
              <div key={g}>
                <p className="bg-surface-2 px-5 py-1.5 text-xs font-bold text-muted">{g}</p>
                <table className="w-full text-sm">
                  <tbody>
                    {c.fields
                      .filter((f) => f.group === g)
                      .map((f) => (
                        <tr key={f.key} className="border-t border-line">
                          <th className="w-1/2 px-5 py-2.5 text-left font-normal text-muted">
                            {f.label}
                            {f.hint && <span className="block text-[11px]">{f.hint}</span>}
                          </th>
                          <td className="px-5 py-2.5 font-semibold">{formatSpec(f, s[f.key])}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ))}
          </section>

          <CostCalculator items={[item]} />
          <Reviews itemId={item.id} seed={item.reviews} />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <p className="text-xs text-muted">ราคาเริ่มต้น (โดยประมาณ)</p>
            <p className="text-3xl font-bold text-brand">{money(price)}</p>
            <p className="mt-1 text-sm text-muted">
              ค่าพลังงาน <b className="text-fg">{Number(s.energyCost).toFixed(2)} บาท/กม.</b>
            </p>
            <div className="mt-4">
              <CompareButton id={item.id} variant="button" />
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-5">
            <div className="mb-3 flex items-baseline justify-between">
              <p className="font-bold">คะแนนจากสเปก</p>
              <p className="text-2xl font-bold text-brand">{overallScore(item).toFixed(1)}</p>
            </div>
            <ScoreBars item={item} />
            <p className="mt-3 text-[11px] text-muted">เทียบกับรถทุกคันในระบบ (1 = ต่ำสุด, 10 = สูงสุด)</p>
          </div>
          {rivals.length > 0 && (
            <div className="rounded-2xl border border-line bg-surface p-5">
              <p className="font-bold">คู่แข่งที่น่าเทียบ</p>
              <ul className="mt-2 space-y-2 text-sm">
                {rivals.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-2">
                    <Link href={`/i/${a.id}`} className="min-w-0 truncate hover:text-brand">
                      {fullName(a)}
                    </Link>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-xs text-muted">{money(Number(a.specs.price))}</span>
                      <Link
                        href={`/compare?ids=${item.id},${a.id}`}
                        className="rounded-full border border-line px-2 py-0.5 text-[11px] hover:border-brand hover:text-brand"
                      >
                        VS
                      </Link>
                    </span>
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
