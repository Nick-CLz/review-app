"use client";

import { Show, SignInButton, UserButton, useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getViewer } from "@/app/actions";
import { setViewerId } from "@/lib/store";
import { useT, type TKey } from "@/lib/i18n";

// Admin status is decided on the server (ADMIN_USER_IDS); remembered per user for this tab.
const adminCache = new Map<string, boolean>();

export function useViewer() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const [, rerender] = useState(0);

  useEffect(() => {
    if (!userId || adminCache.has(userId)) return;
    getViewer()
      .then((v) => {
        adminCache.set(userId, v.isAdmin);
        rerender((n) => n + 1);
      })
      .catch(() => {});
  }, [userId]);

  const isAdmin = !!userId && adminCache.get(userId) === true;
  const name = user ? [user.firstName, user.lastName ? `${user.lastName[0]}.` : ""].filter(Boolean).join(" ") || user.username || "Shelfie user" : "";

  return {
    isLoaded,
    userId: userId ?? undefined,
    isAdmin,
    name,
    /** Owner of the row, or an admin. Sample rows (no owner) are admin-only. */
    canDelete: (row: { userId?: string }) => !!userId && (isAdmin || row.userId === userId),
  };
}

/** Keeps the data store aware of who is signed in (for optimistic updates). */
export function ViewerSync() {
  const { userId } = useAuth();
  useEffect(() => setViewerId(userId ?? undefined), [userId]);
  return null;
}

export function AuthButtons() {
  const t = useT();
  return (
    <>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className="btn-primary ml-1 px-3 py-1.5">{t("nav.signIn")}</button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <div className="ml-2 flex items-center">
          <UserButton />
        </div>
      </Show>
    </>
  );
}

/** Shows children to signed-in users, and a sign-in prompt to everyone else. */
export function SignInGate({ children, action }: { children: React.ReactNode; action: TKey }) {
  const { isLoaded, isSignedIn } = useAuth();
  const t = useT();
  if (!isLoaded) return <div className="text-sm text-zinc-500">{t("common.loading")}</div>;
  if (isSignedIn) return <>{children}</>;
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 p-4 text-center text-sm dark:border-zinc-700">
      <p className="mb-2 text-zinc-500">{t("gate.signInTo", { action: t(action) })}</p>
      <SignInButton mode="modal">
        <button type="button" className="btn-primary">{t("nav.signIn")}</button>
      </SignInButton>
    </div>
  );
}
