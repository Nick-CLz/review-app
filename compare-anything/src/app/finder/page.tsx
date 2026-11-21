import type { Metadata } from "next";
import Finder from "@/components/Finder";

export const metadata: Metadata = { title: "ช่วยเลือกรถ" };

export default function FinderPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Finder />
    </div>
  );
}
