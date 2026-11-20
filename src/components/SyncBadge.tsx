"use client";

import { getLastError, refresh, useSyncStatus } from "@/lib/store";
import { useT } from "@/lib/i18n";

const LOOK = {
  loading: { dot: "bg-zinc-400 animate-pulse", text: "sync.loading" },
  saving: { dot: "bg-amber-400 animate-pulse", text: "sync.saving" },
  ready: { dot: "bg-emerald-500", text: "sync.ready" },
  error: { dot: "bg-red-500", text: "sync.error" },
} as const;

export function SyncBadge() {
  const status = useSyncStatus();
  const look = LOOK[status];
  const t = useT();
  return (
    <button
      type="button"
      onClick={() => refresh()}
      title={status === "error" ? t("sync.titleError", { error: getLastError() }) : t("sync.title")}
      className="mr-1 hidden items-center gap-1.5 rounded-full px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 sm:inline-flex dark:hover:bg-zinc-800"
    >
      <span className={`h-2 w-2 rounded-full ${look.dot}`} />
      {t(look.text)}
    </button>
  );
}
