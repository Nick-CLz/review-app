"use client";

// Shows why a save failed, in the reader's language, without blocking the page.
// The store has already undone the change by the time this appears.

import { useEffect } from "react";
import { dismissNotice, useNotice } from "@/lib/store";
import { useT } from "@/lib/i18n";

const SHOW_MS = 8000;

export function Toaster() {
  const notice = useNotice();
  const t = useT();

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(dismissNotice, SHOW_MS);
    return () => clearTimeout(timer);
  }, [notice]);

  if (!notice) return null;
  // "invalid" names the field that was wrong, so the server's own text is the useful one.
  const reason = notice.code === "invalid" ? notice.message : t(`err.${notice.code}`);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-50 flex justify-center px-4">
      <div role="alert" className="pointer-events-auto flex max-w-md items-start gap-3 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm shadow-lg dark:border-red-900 dark:bg-zinc-900">
        <span aria-hidden className="mt-0.5 text-red-600">⚠</span>
        <p className="flex-1">
          <span className="font-medium">{reason}</span> <span className="text-zinc-500">{t("err.undone")}</span>
        </p>
        <button type="button" onClick={dismissNotice} aria-label={t("err.dismiss")} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">✕</button>
      </div>
    </div>
  );
}
