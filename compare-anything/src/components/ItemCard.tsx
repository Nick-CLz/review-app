import Link from "next/link";
import { optionLabel, CARS } from "@/lib/categories";
import { money } from "@/lib/format";
import { fullName, overallScore } from "@/lib/items";
import type { Item } from "@/lib/types";
import CarArt from "./CarArt";
import CompareButton from "./CompareButton";
import RatingBadge from "./RatingBadge";

export default function ItemCard({ item }: { item: Item }) {
  const s = item.specs;
  return (
    <article className="group relative flex flex-col rounded-2xl border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:border-brand hover:shadow-lg">
      <div className="relative rounded-xl bg-surface-2 px-2 pt-2">
        <CarArt bodyType={String(s.bodyType)} hue={item.hue} ev={s.powertrain === "ev"} className="w-full text-fg" />
        <span className="absolute right-2 top-2 rounded-full bg-surface px-2 py-0.5 text-xs font-bold text-brand shadow-sm">
          {overallScore(item).toFixed(1)}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1 text-[11px]">
        <span className="rounded-full bg-surface-2 px-2 py-0.5">{optionLabel(CARS, "bodyType", s.bodyType)}</span>
        <span className="rounded-full bg-brand-soft px-2 py-0.5">{optionLabel(CARS, "powertrain", s.powertrain)}</span>
      </div>
      <h3 className="mt-2 font-bold leading-tight group-hover:text-brand">
        <Link href={`/i/${item.id}`} className="after:absolute after:inset-0 after:rounded-2xl">
          {fullName(item)}
        </Link>
      </h3>
      <p className="text-xs text-muted">{item.variant}</p>
      <div className="mt-1">
        <RatingBadge itemId={item.id} seed={item.reviews} />
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg bg-surface-2 p-1.5">
          <dt className="text-muted">ค่าพลังงาน</dt>
          <dd className="font-semibold">{Number(s.energyCost).toFixed(2)}฿/กม.</dd>
        </div>
        <div className="rounded-lg bg-surface-2 p-1.5">
          <dt className="text-muted">กำลัง</dt>
          <dd className="font-semibold">{String(s.powerHp)} แรงม้า</dd>
        </div>
        <div className="rounded-lg bg-surface-2 p-1.5">
          <dt className="text-muted">ที่นั่ง</dt>
          <dd className="font-semibold">{String(s.seats)}</dd>
        </div>
      </dl>
      <div className="mt-auto flex items-end justify-between gap-2 pt-4">
        <p className="text-lg font-bold text-brand">{money(Number(s.price))}</p>
        <span className="relative z-10">
          <CompareButton id={item.id} />
        </span>
      </div>
    </article>
  );
}
