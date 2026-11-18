"use client";

import { getLastError, refresh, useSyncStatus } from "@/lib/store";

const LOOK = {
  loading: { dot: "bg-zinc-400 animate-pulse", text: "Connecting…" },
  saving: { dot: "bg-amber-400 animate-pulse", text: "Saving…" },
  ready: { dot: "bg-emerald-500", text: "Live" },
  error: { dot: "bg-red-500", text: "Offline" },
} as const;

export function SyncBadge() {
  const status = useSyncStatus();
  const look = LOOK[status];
  return (
    <button
      type="button"
      onClick={() => refresh()}
      title={status === "error" ? `${getLastError()} — click to retry` : "Shared database · click to refresh"}
      className="mr-1 hidden items-center gap-1.5 rounded-full px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 sm:inline-flex dark:hover:bg-zinc-800"
    >
      <span className={`h-2 w-2 rounded-full ${look.dot}`} />
      {look.text}
    </button>
  );
}
