import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { CompareBar } from "@/components/CompareBar";
import "./globals.css";

const font = Noto_Sans_Thai({ variable: "--font-thai", subsets: ["thai", "latin"] });

export const metadata: Metadata = {
  title: "Shelfie — review & compare anything",
  description: "Review and compare products and prices across stores, starting with Big C and 7-Eleven.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${font.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/85 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/85">
          <nav className="mx-auto flex max-w-6xl items-center gap-1 px-4 py-3 text-sm">
            <Link href="/" className="mr-auto flex items-center gap-2 text-lg font-bold tracking-tight">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">S</span>
              Shelfie
            </Link>
            <NavLink href="/">Browse</NavLink>
            <NavLink href="/compare">Compare</NavLink>
            <NavLink href="/add">+ Add item</NavLink>
            <NavLink href="/data">Data</NavLink>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-28">
          <Suspense fallback={<div className="p-10 text-center text-zinc-500">Loading…</div>}>{children}</Suspense>
        </main>
        <Suspense>
          <CompareBar />
        </Suspense>
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="rounded-md px-3 py-1.5 font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white">
      {children}
    </Link>
  );
}
