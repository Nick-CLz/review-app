import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ItemBrowser from "@/components/ItemBrowser";
import PageSkeleton from "@/components/PageSkeleton";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { itemsIn } from "@/lib/items";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/c/[slug]">): Promise<Metadata> {
  const c = getCategory((await params).slug);
  return { title: c ? `รีวิวและเปรียบเทียบ${c.name}` : "ไม่พบหมวด" };
}

export default function CategoryPage(props: PageProps<"/c/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CategoryContent {...props} />
    </Suspense>
  );
}

async function CategoryContent({ params, searchParams }: PageProps<"/c/[slug]">) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();
  const sp = await searchParams;
  const initial: Record<string, string> = {};
  for (const f of category.filters) {
    const v = sp[f.key];
    if (typeof v === "string" && f.options.some((o) => o.value === v)) initial[f.key] = v;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="text-xs text-muted">
        <Link href="/" className="hover:text-fg">
          หน้าแรก
        </Link>{" "}
        / {category.name}
      </nav>
      <div className="mb-6 mt-3 flex items-start gap-3">
        <span className="text-4xl">{category.icon}</span>
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">รีวิวและเปรียบเทียบ{category.name}</h1>
          <p className="mt-1 max-w-2xl text-muted">{category.description}</p>
        </div>
      </div>
      <ItemBrowser key={JSON.stringify(initial)} category={category} items={itemsIn(slug)} initial={initial} />
    </div>
  );
}
