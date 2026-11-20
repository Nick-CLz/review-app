import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import CompareTray from "@/components/CompareTray";
import { LIVE_CATEGORIES } from "@/lib/categories";

const thai = Noto_Sans_Thai({
  variable: "--font-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: "เทียบก่อนซื้อ — รีวิวและเปรียบเทียบประกัน", template: "%s · เทียบก่อนซื้อ" },
  description: "รีวิวและเปรียบเทียบทุกอย่างก่อนตัดสินใจซื้อ เริ่มต้นที่ประกันชีวิตและประกันภัย",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${thai.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-brand-fg">⚖︎</span>
              เทียบก่อนซื้อ
            </Link>
            <nav className="hidden gap-4 text-sm text-muted md:flex">
              {LIVE_CATEGORIES.map((c) => (
                <Link key={c.slug} href={`/c/${c.slug}`} className="hover:text-fg">
                  {c.name}
                </Link>
              ))}
            </nav>
            <Link href="/compare" className="ml-auto text-sm font-semibold text-brand">
              เปรียบเทียบ →
            </Link>
          </div>
        </header>

        <div className="border-b border-amber-300/50 bg-amber-50 px-4 py-1.5 text-center text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          เวอร์ชันทดลอง: หมวดประกันการเดินทางและประกันอุบัติเหตุใช้ข้อมูลจริงจากเว็บไซต์บริษัท หมวดอื่นยังเป็นข้อมูลตัวอย่าง ไม่ใช่ข้อเสนอขายจริง
        </div>

        <main className="flex-1 pb-28">{children}</main>

        <footer className="border-t border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted">
            ประกันภัยเป็นผลิตภัณฑ์ที่มีความเสี่ยง ผู้ซื้อควรทำความเข้าใจรายละเอียดความคุ้มครองและเงื่อนไขก่อนตัดสินใจทำประกันภัยทุกครั้ง
          </div>
        </footer>

        <CompareTray />
      </body>
    </html>
  );
}
