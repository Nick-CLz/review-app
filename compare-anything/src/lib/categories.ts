import type { Category, FilterDef, ScoreDim, VerdictDef } from "./types";

// ── Cars ──────────────────────────────────────────────────

export const BODY_TYPES = [
  { value: "eco", label: "อีโคคาร์ / แฮทช์แบ็ก", icon: "🚗" },
  { value: "sedan", label: "ซีดาน", icon: "🚘" },
  { value: "suv", label: "SUV / ครอสโอเวอร์", icon: "🚙" },
  { value: "ppv", label: "PPV 7 ที่นั่ง", icon: "🛻" },
  { value: "pickup", label: "กระบะ", icon: "🛻" },
  { value: "mpv", label: "MPV / รถครอบครัว", icon: "🚐" },
  { value: "sport", label: "สปอร์ต", icon: "🏎️" },
];

export const POWERTRAINS = [
  { value: "gas", label: "เบนซิน", icon: "⛽" },
  { value: "diesel", label: "ดีเซล", icon: "🛢️" },
  { value: "hev", label: "ไฮบริด (HEV)", icon: "🔋" },
  { value: "phev", label: "ปลั๊กอินไฮบริด (PHEV)", icon: "🔌" },
  { value: "ev", label: "ไฟฟ้า 100% (EV)", icon: "⚡" },
];

const VERDICT_SHARED: VerdictDef[] = [
  { label: "💸 ราคาถูกสุด", key: "price", source: "spec", better: "lower" },
  { label: "⛽ ค่าพลังงานถูกสุด", key: "energyCost", source: "spec", better: "lower" },
  { label: "🚀 แรงสุด", key: "powerHp", source: "spec", better: "higher" },
];

const COST_FIELD = {
  group: "ราคาและค่าใช้จ่าย",
  key: "energyCost",
  label: "ค่าพลังงานต่อกิโลเมตร",
  type: "number",
  unit: "บาท/กม.",
  better: "lower",
  digits: 2,
  hint: "คิดจากอัตราสิ้นเปลืองที่ผู้ผลิตแจ้งและราคาน้ำมัน/ไฟเริ่มต้น",
} as const;

export const CARS: Category = {
  slug: "cars",
  name: "รถยนต์",
  nameEn: "Cars",
  icon: "🚗",
  noun: "รถ",
  description: "อีโคคาร์ ซีดาน SUV PPV กระบะ MPV สปอร์ต — เบนซิน ดีเซล ไฮบริด ปลั๊กอิน และ EV เทียบข้ามประเภทได้ทั้งหมด",
  priceKey: "price",
  typeKey: "bodyType",
  minBudget: 500000,
  budgetStep: 50000,
  filters: [
    { key: "bodyType", label: "ประเภทตัวถัง", options: BODY_TYPES },
    { key: "powertrain", label: "ขุมพลัง", options: POWERTRAINS },
  ],
  cardStats: [
    { key: "energyCost", label: "ค่าพลังงาน" },
    { key: "powerHp", label: "กำลัง" },
    { key: "seats", label: "ที่นั่ง" },
  ],
  maintenancePerYear: { gas: 9000, diesel: 11000, hev: 8000, phev: 7000, ev: 3500 },
  scoreDims: [
    { key: "economy", label: "ประหยัด", parts: [{ key: "energyCost", better: "lower" }] },
    {
      key: "performance",
      label: "สมรรถนะ",
      parts: [
        { key: "powerHp", better: "higher", log: true },
        { key: "accel", better: "lower" },
      ],
    },
    {
      key: "practical",
      label: "ใช้งานจริง",
      parts: [
        { key: "seats", better: "higher" },
        { key: "trunkL", better: "higher" },
        { key: "clearanceMm", better: "higher" },
      ],
    },
    {
      key: "safety",
      label: "ความปลอดภัย",
      parts: [
        { key: "airbags", better: "higher" },
        { key: "ncap", better: "higher" },
        { key: "adas", better: "higher" },
      ],
    },
    { key: "value", label: "ราคาเข้าถึงง่าย", parts: [{ key: "price", better: "lower", log: true }] },
  ],
  verdicts: [
    ...VERDICT_SHARED,
    { label: "🧳 ใช้งานจริงดีสุด", key: "practical", source: "score", better: "higher" },
    { label: "🛡️ ปลอดภัยสุด", key: "safety", source: "score", better: "higher" },
  ],
  fields: [
    { group: "ราคาและค่าใช้จ่าย", key: "price", label: "ราคา", type: "money", better: "lower" },
    COST_FIELD,
    { group: "ราคาและค่าใช้จ่าย", key: "warrantyYears", label: "รับประกันตัวรถ", type: "number", unit: "ปี", better: "higher" },

    { group: "ขุมพลังและสมรรถนะ", key: "powertrain", label: "ขุมพลัง", type: "text" },
    { group: "ขุมพลังและสมรรถนะ", key: "powerHp", label: "กำลังสูงสุด", type: "number", unit: "แรงม้า", better: "higher" },
    { group: "ขุมพลังและสมรรถนะ", key: "torqueNm", label: "แรงบิดสูงสุด", type: "number", unit: "นิวตันเมตร", better: "higher" },
    { group: "ขุมพลังและสมรรถนะ", key: "accel", label: "0–100 กม./ชม.", type: "number", unit: "วินาที", better: "lower", digits: 1 },
    { group: "ขุมพลังและสมรรถนะ", key: "topSpeed", label: "ความเร็วสูงสุด", type: "number", unit: "กม./ชม.", better: "higher" },

    { group: "พลังงานและระยะทาง", key: "efficiency", label: "อัตราสิ้นเปลือง", type: "text" },
    { group: "พลังงานและระยะทาง", key: "evRangeKm", label: "วิ่งไฟฟ้าล้วนได้", type: "number", unit: "กม.", better: "higher" },
    { group: "พลังงานและระยะทาง", key: "rangeKm", label: "ระยะทางต่อถัง/ชาร์จเต็ม", type: "number", unit: "กม.", better: "higher" },

    { group: "ขนาดและการใช้งาน", key: "bodyType", label: "ตัวถัง", type: "text" },
    { group: "ขนาดและการใช้งาน", key: "seats", label: "จำนวนที่นั่ง", type: "number", unit: "ที่นั่ง", better: "higher" },
    { group: "ขนาดและการใช้งาน", key: "lengthMm", label: "ความยาว", type: "number", unit: "มม." },
    { group: "ขนาดและการใช้งาน", key: "clearanceMm", label: "ความสูงใต้ท้องรถ", type: "number", unit: "มม.", better: "higher" },
    { group: "ขนาดและการใช้งาน", key: "trunkL", label: "พื้นที่เก็บสัมภาระ", type: "number", unit: "ลิตร", better: "higher", hint: "กระบะไม่นับกระบะท้าย" },

    { group: "ความปลอดภัย", key: "airbags", label: "ถุงลมนิรภัย", type: "number", unit: "ใบ", better: "higher" },
    { group: "ความปลอดภัย", key: "adas", label: "ระบบช่วยขับขี่ (ADAS)", type: "bool", better: "higher" },
    { group: "ความปลอดภัย", key: "ncap", label: "ผลทดสอบการชน NCAP", type: "stars", better: "higher" },
  ],
};

// ── Motorcycles ───────────────────────────────────────────

export const BIKE_TYPES = [
  { value: "moped", label: "ครอบครัว / เกียร์ออโต้เล็ก", icon: "🛵" },
  { value: "scooter", label: "สกู๊ตเตอร์", icon: "🛵" },
  { value: "maxi", label: "บิ๊กสกู๊ตเตอร์", icon: "🛵" },
  { value: "sport", label: "สปอร์ต", icon: "🏍️" },
  { value: "classic", label: "คลาสสิก / ครุยเซอร์", icon: "🏍️" },
];

const BIKE_POWERTRAINS: FilterDef["options"] = [
  { value: "gas", label: "เบนซิน", icon: "⛽" },
  { value: "ev", label: "ไฟฟ้า (EV)", icon: "⚡" },
];

const BIKE_SCORES: ScoreDim[] = [
  { key: "economy", label: "ประหยัด", parts: [{ key: "energyCost", better: "lower" }] },
  {
    key: "performance",
    label: "สมรรถนะ",
    parts: [
      { key: "powerHp", better: "higher", log: true },
      { key: "topSpeed", better: "higher" },
    ],
  },
  {
    key: "practical",
    label: "ใช้งานง่าย",
    parts: [
      { key: "storageL", better: "higher" },
      { key: "seatHeightMm", better: "lower" },
      { key: "weightKg", better: "lower", log: true },
    ],
  },
  {
    key: "safety",
    label: "ความปลอดภัย",
    parts: [
      { key: "abs", better: "higher" },
      { key: "tcs", better: "higher" },
    ],
  },
  { key: "value", label: "ราคาเข้าถึงง่าย", parts: [{ key: "price", better: "lower", log: true }] },
];

export const MOTORCYCLES: Category = {
  slug: "motorcycles",
  name: "มอเตอร์ไซค์",
  nameEn: "Motorcycles",
  icon: "🏍️",
  noun: "มอเตอร์ไซค์",
  description: "รถครอบครัว สกู๊ตเตอร์ บิ๊กสกู๊ตเตอร์ สปอร์ต คลาสสิก และมอเตอร์ไซค์ไฟฟ้า",
  priceKey: "price",
  typeKey: "bikeType",
  minBudget: 30000,
  budgetStep: 10000,
  filters: [
    { key: "bikeType", label: "ประเภท", options: BIKE_TYPES },
    { key: "powertrain", label: "ขุมพลัง", options: BIKE_POWERTRAINS },
  ],
  cardStats: [
    { key: "energyCost", label: "ค่าพลังงาน" },
    { key: "powerHp", label: "กำลัง" },
    { key: "storageL", label: "ใต้เบาะ" },
  ],
  maintenancePerYear: { gas: 2500, ev: 800 },
  scoreDims: BIKE_SCORES,
  verdicts: [
    ...VERDICT_SHARED,
    { label: "🪶 เบาสุด", key: "weightKg", source: "spec", better: "lower" },
    { label: "🧳 ใต้เบาะใหญ่สุด", key: "storageL", source: "spec", better: "higher" },
  ],
  fields: [
    { group: "ราคาและค่าใช้จ่าย", key: "price", label: "ราคา", type: "money", better: "lower" },
    COST_FIELD,
    { group: "ราคาและค่าใช้จ่าย", key: "warrantyYears", label: "รับประกัน", type: "number", unit: "ปี", better: "higher" },

    { group: "เครื่องยนต์และสมรรถนะ", key: "powertrain", label: "ขุมพลัง", type: "text" },
    { group: "เครื่องยนต์และสมรรถนะ", key: "cc", label: "ความจุกระบอกสูบ", type: "number", unit: "ซีซี" },
    { group: "เครื่องยนต์และสมรรถนะ", key: "powerHp", label: "กำลังสูงสุด", type: "number", unit: "แรงม้า", better: "higher", digits: 1 },
    { group: "เครื่องยนต์และสมรรถนะ", key: "torqueNm", label: "แรงบิดสูงสุด", type: "number", unit: "นิวตันเมตร", better: "higher", digits: 1 },
    { group: "เครื่องยนต์และสมรรถนะ", key: "topSpeed", label: "ความเร็วสูงสุด (ประมาณ)", type: "number", unit: "กม./ชม.", better: "higher" },

    { group: "พลังงานและระยะทาง", key: "efficiency", label: "อัตราสิ้นเปลือง", type: "text" },
    { group: "พลังงานและระยะทาง", key: "rangeKm", label: "ระยะทางต่อถัง/ชาร์จเต็ม", type: "number", unit: "กม.", better: "higher" },

    { group: "ขนาดและการใช้งาน", key: "bikeType", label: "ประเภท", type: "text" },
    { group: "ขนาดและการใช้งาน", key: "weightKg", label: "น้ำหนักรถ", type: "number", unit: "กก.", better: "lower" },
    { group: "ขนาดและการใช้งาน", key: "seatHeightMm", label: "ความสูงเบาะ", type: "number", unit: "มม.", better: "lower", hint: "ยิ่งต่ำยิ่งเท้าถึงพื้นง่าย" },
    { group: "ขนาดและการใช้งาน", key: "storageL", label: "ช่องเก็บของใต้เบาะ", type: "number", unit: "ลิตร", better: "higher" },

    { group: "ความปลอดภัย", key: "abs", label: "เบรก ABS", type: "bool", better: "higher" },
    { group: "ความปลอดภัย", key: "tcs", label: "ระบบป้องกันล้อหมุนฟรี", type: "bool", better: "higher" },
  ],
};

/** Verticals planned next — same engine, new data. */
export const COMING_SOON: Pick<Category, "slug" | "name" | "nameEn" | "icon" | "description">[] = [
  { slug: "phones", name: "สมาร์ตโฟน", nameEn: "Phones", icon: "📱", description: "สเปก กล้อง แบตเตอรี่ ราคา" },
  { slug: "laptops", name: "โน้ตบุ๊ก", nameEn: "Laptops", icon: "💻", description: "ทำงาน เล่นเกม สายครีเอทีฟ" },
  { slug: "appliances", name: "เครื่องใช้ไฟฟ้า", nameEn: "Appliances", icon: "❄️", description: "แอร์ ตู้เย็น เครื่องซักผ้า" },
];

export const CATEGORIES: Category[] = [CARS, MOTORCYCLES];

export function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function optionLabel(category: Category, filterKey: string, value: unknown) {
  const f = category.filters.find((x) => x.key === filterKey);
  const o = f?.options.find((x) => x.value === value);
  return o ? `${o.icon ?? ""} ${o.label}`.trim() : String(value ?? "—");
}
