import type { SpecField, SpecValue, Product } from "./types";

const thb = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 });

export function money(n: number) {
  return `฿${thb.format(n)}`;
}

export function formatSpec(field: SpecField, value: SpecValue | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const suffix = field.suffix ?? "";
  switch (field.type) {
    case "bool":
      return value ? "✓ มี" : "✕ ไม่มี";
    case "money":
      if (value === 0 && field.better === "higher") return "ไม่คุ้มครอง";
      if (value === 0 && field.better === "lower") return "ไม่มี";
      return `${money(Number(value))}${suffix}`;
    case "years":
      return `${value} ปี`;
    case "days":
      return value === 0 ? "ไม่มี" : `${value} วัน`;
    case "percent":
      return value === 0 ? "ไม่มีเงินคืน" : `${value}%`;
    case "number":
      return `${thb.format(Number(value))}${suffix}`;
    default:
      return String(value);
  }
}

/** For each field with a `better` direction, return the product ids holding the best value. */
export function winners(fields: SpecField[], products: Product[]) {
  const out: Record<string, Set<string>> = {};
  if (products.length < 2) return out;
  for (const f of fields) {
    if (!f.better) continue;
    const vals = products.map((p) => {
      const v = p.specs[f.key];
      return typeof v === "boolean" ? Number(v) : typeof v === "number" ? v : NaN;
    });
    const valid = vals.filter((v) => !Number.isNaN(v));
    if (valid.length < 2) continue;
    const best = f.better === "higher" ? Math.max(...valid) : Math.min(...valid);
    if (valid.every((v) => v === best)) continue; // a tie across the board isn't a win
    out[f.key] = new Set(products.filter((_, i) => vals[i] === best).map((p) => p.id));
  }
  return out;
}
