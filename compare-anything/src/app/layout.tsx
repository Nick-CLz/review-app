import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import CompareTray from "@/components/CompareTray";

const thai = Noto_Sans_Thai({
  variable: "--font-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: "เทียบหมด — รีวิวและเปรียบเทียบทุกอย่าง เริ่มที่รถยนต์และมอเตอร์ไซค์", template: "%s · เทียบหมด" },
  description: "รีวิวและเปรียบเทียบรถยนต์และมอเตอร์ไซค์ทุกรูปแบบ อีโคคาร์ SUV กระบะ EV ไฮบริด สกู๊ตเตอร์ บิ๊กไบค์ เทียบข้ามประเภทได้",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${thai.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm text-brand-fg">VS</span>
              เทียบหมด
            </Link>
            <nav className="hidden gap-4 text-sm text-muted sm:flex">
              <Link href="/c/cars" className="hover:text-fg">
                🚗 รถยนต์
              </Link>
              <Link href="/c/motorcycles" className="hover:text-fg">
                🏍️ มอเตอร์ไซค์
              </Link>
              <Link href="/finder" className="hover:text-fg">
                🧭 ช่วยเลือกรถ
              </Link>
            </nav>
            <Link href="/compare" className="ml-auto text-sm font-semibold text-brand">
              เปรียบเทียบ →
            </Link>
          </div>
        </header>

        <div className="border-b border-amber-300/50 bg-amber-50 px-4 py-1.5 text-center text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          เวอร์ชันทดลอง: ราคาและสเปกเป็นค่าประมาณเพื่อการสาธิต รีวิวตั้งต้นเป็นตัวอย่าง — ตรวจสอบกับผู้จำหน่ายก่อนตัดสินใจ
        </div>

        <main className="flex-1 pb-28">{children}</main>

        <footer className="border-t border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted">
            เทียบหมด — รีวิวและเปรียบเทียบทุกอย่างก่อนตัดสินใจ · ค่าพลังงานคำนวณจากอัตราสิ้นเปลืองที่ผู้ผลิตแจ้ง ใช้งานจริงอาจต่างออกไป
          </div>
        </footer>

        <CompareTray />
      </body>
    </html>
  );
}
