import { CATEGORIES } from "@/lib/categories";
import type { Item } from "@/lib/types";
import BikeArt from "./BikeArt";
import CarArt from "./CarArt";

/** Picks the right generated artwork for an item's category and type. */
export default function ItemArt({
  item,
  category = item?.category ?? "cars",
  type,
  hue,
  ev,
  className = "w-full text-fg",
}: {
  item?: Pick<Item, "category" | "hue" | "specs">;
  category?: string;
  type?: string;
  hue?: number;
  ev?: boolean;
  className?: string;
}) {
  const cat = CATEGORIES.find((c) => c.slug === category);
  const t = type ?? String(item?.specs[cat?.typeKey ?? "bodyType"] ?? "");
  const h = hue ?? item?.hue ?? 210;
  const e = ev ?? item?.specs.powertrain === "ev";
  return category === "motorcycles" ? (
    <BikeArt bikeType={t} hue={h} ev={e} className={className} />
  ) : (
    <CarArt bodyType={t} hue={h} ev={e} className={className} />
  );
}
