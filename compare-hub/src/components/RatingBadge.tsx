"use client";

import { avgRating } from "@/lib/products";
import { useUserReviews } from "@/lib/store";
import type { SeedReview } from "@/lib/types";
import Stars from "./Stars";

/** Rating combining the seed reviews with reviews this browser has added. */
export function useAllReviews(productId: string, seed: SeedReview[]) {
  const mine = useUserReviews().filter((r) => r.productId === productId);
  return [...mine, ...seed];
}

export default function RatingBadge({ productId, seed }: { productId: string; seed: SeedReview[] }) {
  const all = useAllReviews(productId, seed);
  const avg = avgRating(all);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <Stars value={avg} />
      <span className="font-semibold text-fg">{avg ? avg.toFixed(1) : "–"}</span>({all.length} รีวิว)
    </span>
  );
}
