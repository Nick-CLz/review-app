import type { Metadata } from "next";
import { Suspense } from "react";
import CompareView from "@/components/CompareView";
import PageSkeleton from "@/components/PageSkeleton";

export const metadata: Metadata = { title: "เปรียบเทียบ" };

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* CompareView reads ?ids= (shared links), so it renders below a Suspense boundary. */}
      <Suspense fallback={<PageSkeleton />}>
        <CompareView />
      </Suspense>
    </div>
  );
}
