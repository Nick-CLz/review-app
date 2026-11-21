import { CATEGORIES, optionLabel } from "./categories";
import type { SpecField, SpecValue } from "./types";

const thb = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 });

export function money(n: number) {
  return `฿${thb.format(Math.round(n))}`;
}

/** Short form for big prices: 1.35 ล้าน */
export function moneyShort(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2).replace(/\.?0+$/, "")} ล้าน`;
  return money(n);
}

export function formatSpec(f: SpecField, v: SpecValue | undefined): string {
  if (v === null || v === undefined || v === "") return "—";
  switch (f.type) {
    case "money":
      return money(Number(v));
    case "bool":
      return v ? "มี" : "ไม่มี";
    case "stars":
      return `${"★".repeat(Number(v))}${"☆".repeat(5 - Number(v))}`;
    case "number": {
      const n = Number(v);
      const s = n.toLocaleString("th-TH", {
        minimumFractionDigits: f.digits ?? 0,
        maximumFractionDigits: f.digits ?? 0,
      });
      return f.unit ? `${s} ${f.unit}` : s;
    }
    default:
      {
        // Values that are filter options (body type, powertrain…) get their icon + Thai label.
        const cat = CATEGORIES.find((c) => c.filters.some((x) => x.key === f.key && x.options.some((o) => o.value === v)));
        return cat ? optionLabel(cat, f.key, v) : String(v);
      }
  }
}

/** Indexes of the best value(s) in a row; empty when there is no clear winner. */
export function winnerIndex(f: SpecField, values: (SpecValue | undefined)[]): number[] {
  if (!f.better) return [];
  const nums = values.map((v) => (typeof v === "number" ? v : typeof v === "boolean" ? (v ? 1 : 0) : null));
  const present = nums.filter((n): n is number => n !== null);
  if (present.length < 2) return [];
  const best = f.better === "higher" ? Math.max(...present) : Math.min(...present);
  if (present.every((n) => n === best)) return [];
  return nums.flatMap((n, i) => (n === best ? [i] : []));
}

export function thaiDate(iso: string) {
  return new Date(iso).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
}
