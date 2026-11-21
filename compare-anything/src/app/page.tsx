import Link from "next/link";
import ItemArt from "@/components/ItemArt";
import ItemCard from "@/components/ItemCard";
import { CATEGORIES, COMING_SOON } from "@/lib/categories";
import { fullName, getItem, ITEMS, itemsIn, overallScore } from "@/lib/items";

const MATCHUPS = [
  { title: "EV vs ไฮบริด vs เบนซิน", sub: "SUV งบล้านต้น ๆ ขุมพลังไหนคุ้มสุด", ids: ["byd-atto3", "toyota-corolla-cross-hev", "mazda-cx5"] },
  { title: "ศึก 7 ที่นั่ง", sub: "PPV ดีเซล ปลั๊กอิน หรือ MPV ไฮบริด", ids: ["toyota-fortuner-legender", "ford-everest", "mitsubishi-outlander-phev", "mitsubishi-xpander-hev"] },
  { title: "กระบะ 4 ประตู", sub: "งานหนักหรือใช้งานครอบครัว", ids: ["toyota-hilux-revo", "isuzu-dmax-hilander", "ford-ranger-wildtrak"] },
  { title: "ซีดานสปอร์ต: ไฟฟ้า vs ไฮบริด", sub: "แรง ประหยัด หรือได้ทั้งคู่", ids: ["byd-seal", "tesla-model-3", "honda-civic-ehev"] },
  { title: "รถคันแรกงบไม่เกินล้าน", sub: "อีโคคาร์ เบนซิน ไฮบริด EV", ids: ["toyota-yaris-ativ", "honda-city-hatch-ehev", "byd-dolphin", "mg4-electric"] },
  { title: "กระบะ vs SUV ไฟฟ้า", sub: "เทียบข้ามประเภทแบบสุดขั้ว", ids: ["toyota-hilux-revo", "byd-atto3"] },
  { title: "ศึกบิ๊กสกู๊ตเตอร์ 160", sub: "PCX, NMAX หรือ ADV คันไหนคุ้ม", ids: ["honda-pcx160", "yamaha-nmax155", "honda-adv160"] },
  { title: "มอเตอร์ไซค์คันแรก", sub: "เกียร์ออโต้เล็ก สกู๊ตเตอร์ หรือไฟฟ้า", ids: ["honda-wave110i", "honda-scoopy", "honda-em1e"] },
  { title: "สปอร์ต vs ครุยเซอร์ 400–500", sub: "บิ๊กไบค์คันแรกสายไหนดี", ids: ["kawasaki-ninja400", "honda-rebel500", "royal-enfield-classic350"] },
];

const HERO = [
  { category: "cars", type: "suv", hue: 210, ev: true },
  { category: "cars", type: "pickup", hue: 25 },
  { category: "motorcycles", type: "maxi", hue: 350 },
  { category: "cars", type: "mpv", hue: 160 },
];

export default function Home() {
  const top = [...ITEMS].sort((a, b) => overallScore(b) - overallScore(a)).slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="grid items-center gap-8 py-10 md:grid-cols-[1.2fr_1fr] md:py-14">
        <div>
          <p className="text-sm font-semibold text-brand">รีวิว · เปรียบเทียบ · ตัดสินใจ</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight md:text-5xl">
            เทียบได้ทุกอย่าง
            <br />
            เริ่มที่<span className="text-brand">รถทุกรูปแบบ</span>
          </h1>
          <p className="mt-4 max-w-lg text-muted">
            รถยนต์และมอเตอร์ไซค์ — EV กับไฮบริด กระบะกับ SUV สกู๊ตเตอร์กับบิ๊กไบค์ เทียบสเปก ค่าน้ำมัน/ค่าไฟต่อกิโล ค่าใช้จ่ายรวม และรีวิวผู้ใช้
            ได้ในหน้าเดียว
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {CATEGORIES.map((c, i) => (
              <Link key={c.slug} href={`/c/${c.slug}`} className={`${i === 0 ? "btn-primary" : "btn-ghost"} px-5 py-3 text-base`}>
                {c.icon} {c.name} {itemsIn(c.slug).length} รุ่น
              </Link>
            ))}
            <Link href="/finder" className="btn-ghost px-5 py-3 text-base">
              🧭 ช่วยเลือกรถ
            </Link>
          </div>
        </div>
        <div className="relative grid grid-cols-2 gap-3">
          {HERO.map((h) => (
            <div key={h.type} className="rounded-2xl border border-line bg-surface p-3">
              <ItemArt category={h.category} type={h.type} hue={h.hue} ev={h.ev} />
            </div>
          ))}
        </div>
      </section>

      {CATEGORIES.map((cat) => {
        const items = itemsIn(cat.slug);
        const types = cat.filters.find((f) => f.key === cat.typeKey)?.options ?? [];
        const powertrains = cat.filters.find((f) => f.key === "powertrain")?.options ?? [];
        return (
          <section key={cat.slug} className="mt-10">
            <div className="flex items-end justify-between gap-2">
              <h2 className="text-xl font-bold">
                {cat.icon} {cat.name}: เลือกตามประเภท
              </h2>
              <Link href={`/c/${cat.slug}`} className="shrink-0 text-sm text-brand hover:underline">
                ดูทั้งหมด →
              </Link>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {types.map((b, i) => (
                <Link
                  key={b.value}
                  href={`/c/${cat.slug}?${cat.typeKey}=${b.value}`}
                  className="rounded-2xl border border-line bg-surface p-3 text-center transition hover:border-brand"
                >
                  <ItemArt category={cat.slug} type={b.value} hue={(i * 47 + 200) % 360} className="mx-auto w-full max-w-32 text-fg" />
                  <p className="mt-1 text-sm font-semibold">{b.label}</p>
                  <p className="text-xs text-muted">{items.filter((x) => x.specs[cat.typeKey] === b.value).length} รุ่น</p>
                </Link>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {powertrains.map((p) => (
                <Link
                  key={p.value}
                  href={`/c/${cat.slug}?powertrain=${p.value}`}
                  className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm hover:border-brand"
                >
                  {p.icon} {p.label}
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      <section className="mt-12">
        <h2 className="text-xl font-bold">คู่เทียบยอดนิยม</h2>
        <p className="text-sm text-muted">กดเพื่อเปิดหน้าเปรียบเทียบทันที</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MATCHUPS.map((m) => (
            <Link
              key={m.title}
              href={`/compare?ids=${m.ids.join(",")}`}
              className="rounded-2xl border border-line bg-surface p-4 transition hover:border-brand hover:shadow-md"
            >
              <p className="font-bold">{m.title}</p>
              <p className="text-xs text-muted">{m.sub}</p>
              <ul className="mt-3 space-y-1 text-sm">
                {m.ids.map((id) => {
                  const it = getItem(id);
                  return it ? (
                    <li key={id} className="flex items-center gap-2">
                      <span className="w-14 shrink-0">
                        <ItemArt item={it} />
                      </span>
                      {fullName(it)}
                    </li>
                  ) : null;
                })}
              </ul>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold">คะแนนรวมสูงสุดจากสเปก</h2>
        <p className="text-sm text-muted">คะแนนเทียบภายในหมวดเดียวกัน</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {top.map((i) => (
            <ItemCard key={i.id} item={i} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold">หมวดทั้งหมด</h2>
        <p className="text-sm text-muted">ใช้ระบบเปรียบเทียบเดียวกัน แค่เพิ่มข้อมูลหมวดใหม่</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/c/${c.slug}`} className="rounded-2xl border-2 border-brand bg-surface p-4">
              <p className="text-2xl">{c.icon}</p>
              <p className="mt-1 font-bold">{c.name}</p>
              <p className="text-xs text-brand">เปิดแล้ว · {itemsIn(c.slug).length} รุ่น</p>
            </Link>
          ))}
          {COMING_SOON.map((c) => (
            <div key={c.slug} className="rounded-2xl border border-dashed border-line p-4 opacity-70">
              <p className="text-2xl">{c.icon}</p>
              <p className="mt-1 font-bold">{c.name}</p>
              <p className="text-xs text-muted">เร็ว ๆ นี้ · {c.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
