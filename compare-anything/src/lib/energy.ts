/** Fuel/electricity cost helpers shared by every vehicle category. */

export interface EnergyPrices {
  gasoline: number; // บาท/ลิตร
  diesel: number; // บาท/ลิตร
  electricity: number; // บาท/kWh (ชาร์จบ้าน)
  /** Share of PHEV kilometres driven on electricity (0–1). */
  phevEvShare: number;
}

export const DEFAULT_ENERGY: EnergyPrices = { gasoline: 35, diesel: 32, electricity: 4.5, phevEvShare: 0.5 };

export interface EnergySpec {
  powertrain: string;
  kmPerL?: number | null;
  kmPerKwh?: number | null;
}

export function energyCostPerKm(c: EnergySpec, e: EnergyPrices = DEFAULT_ENERGY): number {
  const fuel = c.powertrain === "diesel" ? e.diesel : e.gasoline;
  const perKmFuel = c.kmPerL ? fuel / c.kmPerL : 0;
  const perKmElec = c.kmPerKwh ? e.electricity / c.kmPerKwh : 0;
  if (c.powertrain === "ev") return perKmElec;
  if (c.powertrain === "phev") return e.phevEvShare * perKmElec + (1 - e.phevEvShare) * perKmFuel;
  return perKmFuel;
}

export function efficiencyText(c: EnergySpec) {
  const parts: string[] = [];
  if (c.kmPerL) parts.push(`${c.kmPerL} กม./ลิตร`);
  if (c.kmPerKwh) parts.push(`${c.kmPerKwh} กม./kWh`);
  return parts.join(" · ");
}

export const round2 = (n: number) => Math.round(n * 100) / 100;
