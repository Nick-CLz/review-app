import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import PageSkeleton from "@/components/PageSkeleton";
import { notFound } from "next/navigation";
import { LIVE_CATEGORIES, getCategory } from "@/lib/categories";
import { productsIn } from "@/lib/products";
import TripPrices from "@/components/TripPrices";
import ProductBrowser from "@/components/ProductBrowser";

export function generateStaticParams() {
  return LIVE_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/c/[slug]">): Promise<Metadata> {
  const c = getCategory((await params).slug);
  return { title: c ? `เปรียบเทียบ${c.name}` : "ไม่พบหมวด" };
}

export default function CategoryPage({ params }: PageProps<"/c/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CategoryContent params={params} />
    </Suspense>
  );
}

async function CategoryContent({ params }: { params: PageProps<"/c/[slug]">["params"] }) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category || category.comingSoon) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="text-xs text-muted">
        <Link href="/" className="hover:text-fg">
          หน้าแรก
        </Link>{" "}
        / {category.name}
      </nav>
      <div className="mt-3 mb-6 flex items-start gap-3">
        <span className="text-4xl">{category.icon}</span>
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">เปรียบเทียบ{category.name}</h1>
          <p className="mt-1 max-w-2xl text-muted">{category.description}</p>
        </div>
      </div>
      {slug === "travel" && <TripPrices />}
      <ProductBrowser category={category} products={productsIn(slug)} />
    </div>
  );
}
