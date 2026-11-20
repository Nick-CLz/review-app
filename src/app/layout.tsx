import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import { Suspense } from "react";
import { ViewerSync } from "@/components/auth";
import { CompareBar } from "@/components/CompareBar";
import { Nav } from "@/components/Nav";
import "./globals.css";

const font = Noto_Sans_Thai({ variable: "--font-thai", subsets: ["thai", "latin"] });

export const metadata: Metadata = {
  title: "Shelfie — review & compare anything",
  description: "Review and compare products and prices across stores, starting with Big C and 7-Eleven.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${font.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        {/* Inside <body> so it works with cacheComponents (Clerk Core 3) */}
        <ClerkProvider>
          <ViewerSync />
          <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/85 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/85">
            <Suspense>
              <Nav />
            </Suspense>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-28">
            <Suspense fallback={<div className="p-10 text-center text-zinc-500">Loading…</div>}>{children}</Suspense>
          </main>
          <Suspense>
            <CompareBar />
          </Suspense>
        </ClerkProvider>
      </body>
    </html>
  );
}

