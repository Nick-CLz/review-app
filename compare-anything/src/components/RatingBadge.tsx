"use client";

import { avgRating } from "@/lib/items";
import { useUserReviews } from "@/lib/store";
import type { SeedReview } from "@/lib/types";
import Stars from "./Stars";

export default function RatingBadge({ itemId, seed }: { itemId: string; seed: SeedReview[] }) {
  const mine = useUserReviews().filter((r) => r.itemId === itemId);
  const all = [...mine, ...seed];
  const avg = avgRating(all);
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <Stars value={avg} />
      <span className="font-semibold">{avg ? avg.toFixed(1) : "–"}</span>
      <span className="text-muted">({all.length} รีวิว)</span>
    </span>
  );
}
