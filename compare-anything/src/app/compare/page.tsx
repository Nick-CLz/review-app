import type { Metadata } from "next";
import CompareView from "@/components/CompareView";

export const metadata: Metadata = { title: "เปรียบเทียบ" };

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <CompareView />
    </div>
  );
}
