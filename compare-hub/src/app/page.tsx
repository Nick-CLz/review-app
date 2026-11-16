import Link from "next/link";
import { CATEGORIES, GROUPS, getCategory } from "@/lib/categories";
import { PRODUCTS, productsIn } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  const popular = PRODUCTS.filter((p) => p.badge === "ยอดนิยม");
  const groups = Object.entries(GROUPS);

  return (
    <>
      <section className="border-b border-line bg-gradient-to-b from-brand-soft/60 to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <p className="text-sm font-semibold text-brand">รีวิว · เปรียบเทียบ · ซื้อ</p>
          <h1 className="mt-2 max-w-2xl text-3xl leading-tight font-bold md:text-5xl">
            เทียบให้ชัด ก่อนจ่ายเงินซื้อ
          </h1>
          <p className="mt-4 max-w-xl text-muted md:text-lg">
            วางแผนประกันข้างกันแบบช่องต่อช่อง ดูว่าแผนไหนคุ้มที่สุดในแต่ละหัวข้อ อ่านรีวิวจากผู้ใช้จริง แล้วส่งเรื่องให้ตัวแทนติดต่อกลับได้ในที่เดียว
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/c/life" className="btn-primary px-5 py-3 text-base">
              เริ่มเทียบประกันชีวิต
            </Link>
            <Link href="/c/health" className="btn-ghost px-5 py-3 text-base">
              ประกันสุขภาพ
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        {groups.map(([key, g]) => {
          const cats = CATEGORIES.filter((c) => c.group === key);
          return (
            <section key={key} className="mt-12">
              <h2 className="text-xl font-bold">{g.name}</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {cats.map((c) =>
                  c.comingSoon ? (
                    <div key={c.slug} className="rounded-2xl border border-dashed border-line p-5 opacity-60">
                      <div className="text-2xl">{c.icon}</div>
                      <p className="mt-2 font-semibold">
                        {c.name} <span className="ml-1 rounded bg-surface-2 px-1.5 py-0.5 text-[11px]">เร็ว ๆ นี้</span>
                      </p>
                      <p className="mt-1 text-sm text-muted">{c.description}</p>
                    </div>
                  ) : (
                    <Link
                      key={c.slug}
                      href={`/c/${c.slug}`}
                      className="group rounded-2xl border border-line bg-surface p-5 transition hover:border-brand hover:shadow-md"
                    >
                      <div className="text-2xl">{c.icon}</div>
                      <p className="mt-2 font-semibold group-hover:text-brand">{c.name}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-muted">{c.description}</p>
                      <p className="mt-3 text-xs font-semibold text-brand">{productsIn(c.slug).length} แผนให้เทียบ →</p>
                    </Link>
                  ),
                )}
              </div>
            </section>
          );
        })}

        <section className="mt-14">
          <h2 className="text-xl font-bold">แผนยอดนิยม</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((p) => (
              <ProductCard key={p.id} product={p} category={getCategory(p.category)!} />
            ))}
          </div>
        </section>

        <section className="mt-14 grid gap-4 md:grid-cols-3">
          {[
            ["1", "เลือกหมวดและกรอง", "กรองตามบริษัท งบประมาณ และเรียงตามเบี้ยหรือความคุ้มครอง"],
            ["2", "เทียบข้างกัน", "เลือกได้สูงสุด 4 แผน ระบบไฮไลต์ค่าที่ดีที่สุดในแต่ละหัวข้อให้"],
            ["3", "ส่งเรื่องซื้อ", "กรอกข้อมูลสั้น ๆ ตัวแทนที่ได้รับใบอนุญาตจะติดต่อกลับเพื่อออกกรมธรรม์"],
          ].map(([n, t, d]) => (
            <div key={n} className="rounded-2xl bg-surface p-5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-sm font-bold text-brand-fg">{n}</span>
              <p className="mt-3 font-semibold">{t}</p>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
