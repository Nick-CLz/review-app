"use client";

import { useState } from "react";
import { actions, useDB } from "@/lib/store";

export default function DataPage() {
  const db = useDB();
  const [msg, setMsg] = useState("");

  function exportJSON() {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `shelfie-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function importJSON(file: File) {
    try {
      actions.importJSON(await file.text());
      setMsg("Imported ✓");
    } catch (e) {
      setMsg(`Import failed: ${(e as Error).message}`);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Your data</h1>
      <p className="text-sm text-zinc-500">
        Everything is saved in this browser only. Export a backup to move it to another device or share with friends.
      </p>
      <div className="card grid gap-3 p-5 sm:grid-cols-3">
        <button className="btn-primary" onClick={exportJSON}>Export JSON</button>
        <label className="btn-ghost cursor-pointer">
          Import JSON
          <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importJSON(e.target.files[0])} />
        </label>
        <button
          className="btn-ghost text-red-600"
          onClick={() => confirm("Replace all your data with the sample Big C / 7-Eleven data?") && (actions.reset(), setMsg("Reset to sample data ✓"))}
        >
          Reset to sample
        </button>
      </div>
      {msg && <p className="text-sm">{msg}</p>}
      <div className="card p-5 text-sm">
        <h2 className="mb-2 font-semibold">Stores</h2>
        <ul className="space-y-1">
          {db.stores.map((s) => (
            <li key={s.id} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ background: s.color }} /> {s.name}
              <span className="text-zinc-500">· {db.prices.filter((p) => p.storeId === s.id).length} prices</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
