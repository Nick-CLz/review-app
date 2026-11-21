import { itemsIn, scores } from "./items";
import type { Item } from "./types";

export type Use = "city" | "family" | "work" | "fun";
export type Priority = "economy" | "performance" | "practical" | "safety" | "value";

export interface FinderAnswers {
  budget: number; // max price, Infinity = any
  seats: number; // minimum seats
  dailyKm: number;
  homeCharging: boolean;
  use: Use;
  priorities: Priority[];
}

export interface Match {
  item: Item;
  /** 0–100, relative to the best match. */
  percent: number;
  reasons: string[];
  warnings: string[];
}

const PRIORITY_LABEL: Record<Priority, string> = {
  economy: "ประหยัด",
  performance: "สมรรถนะ",
  practical: "ใช้งานจริง",
  safety: "ความปลอดภัย",
  value: "ราคาเข้าถึงง่าย",
};

export function findCars(a: FinderAnswers): Match[] {
  const weights: Record<Priority, number> = { economy: 1, performance: 1, practical: 1, safety: 1, value: 1 };
  for (const p of a.priorities) weights[p] = 3;
  if (a.dailyKm >= 80) weights.economy += 2;
  else if (a.dailyKm >= 40) weights.economy += 1;
  if (a.use === "family") weights.practical += 1.5;
  if (a.use === "fun") weights.performance += 2;

  const candidates = itemsIn("cars").filter(
    (i) => Number(i.specs.price) <= a.budget * 1.05 && Number(i.specs.seats) >= a.seats,
  );

  const scored = candidates.map((item) => {
    const s = scores(item);
    const sp = item.specs;
    const totalW = Object.values(weights).reduce((x, y) => x + y, 0);
    let score = (Object.keys(weights) as Priority[]).reduce((sum, k) => sum + s[k] * weights[k], 0) / totalW;
    const reasons: string[] = [];
    const warnings: string[] = [];

    for (const p of a.priorities) if (s[p] >= 7) reasons.push(`${PRIORITY_LABEL[p]}เด่น (${s[p].toFixed(1)}/10)`);

    const pt = sp.powertrain;
    if (pt === "ev" || pt === "phev") {
      if (a.homeCharging) {
        score += pt === "ev" ? 0.6 : 0.4;
        reasons.push("ชาร์จที่บ้านได้ ค่าพลังงานต่ำมาก");
      } else {
        // Without home charging an EV loses its main advantage; heavier penalty for long daily distances.
        score -= pt === "ev" ? (a.dailyKm >= 80 ? 3 : 2.5) : 1.2;
        warnings.push(pt === "ev" ? "ไม่มีที่ชาร์จบ้าน ต้องพึ่งสถานีชาร์จสาธารณะ" : "ไม่ชาร์จไฟจะเสียข้อดีของปลั๊กอินไฮบริด");
      }
    }
    if (a.dailyKm >= 80 && Number(sp.energyCost) <= 1.5) reasons.push(`วิ่งเยอะก็จ่ายแค่ ${Number(sp.energyCost).toFixed(2)} บาท/กม.`);

    const body = String(sp.bodyType);
    if (a.use === "city") {
      if (Number(sp.lengthMm) <= 4500) {
        score += 0.6;
        reasons.push("ตัวรถกะทัดรัด ขับและจอดในเมืองง่าย");
      } else if (Number(sp.lengthMm) >= 5000) {
        score -= 0.8;
        warnings.push("ตัวรถยาวเกิน 5 เมตร จอดในเมืองลำบาก");
      }
    }
    if (a.use === "work") {
      if (body === "pickup" || body === "ppv") {
        score += 1.5;
        reasons.push(body === "pickup" ? "มีกระบะท้าย บรรทุกของได้" : "โครงสร้างแข็งแรง ลุยได้");
      }
      if (Number(sp.clearanceMm) >= 200) {
        score += 0.5;
        reasons.push(`ใต้ท้องสูง ${sp.clearanceMm} มม.`);
      } else if (Number(sp.clearanceMm) < 150) {
        score -= 0.8;
        warnings.push("ใต้ท้องเตี้ย ไม่เหมาะกับทางขรุขระ");
      }
    }
    if (a.use === "family" && Number(sp.seats) >= 7) reasons.push("7 ที่นั่ง พาครอบครัวได้ครบ");
    if (a.use === "fun" && Number(sp.accel) <= 7.5) reasons.push(`0–100 ใน ${sp.accel} วินาที`);

    if (Number(sp.price) > a.budget) warnings.push("ราคาเกินงบเล็กน้อย");

    return { item, score, reasons: [...new Set(reasons)].slice(0, 4), warnings };
  });

  scored.sort((x, y) => y.score - x.score);
  const top = scored[0]?.score ?? 1;
  return scored.map((m) => ({
    item: m.item,
    percent: Math.max(1, Math.round((m.score / top) * 100)),
    reasons: m.reasons,
    warnings: m.warnings,
  }));
}
