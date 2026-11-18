import type { Category } from "./types";

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

export const CARS: Category = {
  slug: "cars",
  name: "รถยนต์",
  nameEn: "Cars",
  icon: "🚗",
  description: "อีโคคาร์ ซีดาน SUV PPV กระบะ MPV สปอร์ต — เบนซิน ดีเซล ไฮบริด ปลั๊กอิน และ EV เทียบข้ามประเภทได้ทั้งหมด",
  priceKey: "price",
  filters: [
    { key: "bodyType", label: "ประเภทตัวถัง", options: BODY_TYPES },
    { key: "powertrain", label: "ขุมพลัง", options: POWERTRAINS },
  ],
  fields: [
    { group: "ราคาและค่าใช้จ่าย", key: "price", label: "ราคา", type: "money", better: "lower" },
    {
      group: "ราคาและค่าใช้จ่าย",
      key: "energyCost",
      label: "ค่าพลังงานต่อกิโลเมตร",
      type: "number",
      unit: "บาท/กม.",
      better: "lower",
      digits: 2,
      hint: "คิดจากอัตราสิ้นเปลืองที่ผู้ผลิตแจ้งและราคาน้ำมัน/ไฟเริ่มต้น",
    },
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

/** Verticals planned next — same engine, new data. */
export const COMING_SOON: Pick<Category, "slug" | "name" | "nameEn" | "icon" | "description">[] = [
  { slug: "motorcycles", name: "มอเตอร์ไซค์", nameEn: "Motorcycles", icon: "🏍️", description: "สกู๊ตเตอร์ บิ๊กไบค์ และมอเตอร์ไซค์ไฟฟ้า" },
  { slug: "phones", name: "สมาร์ตโฟน", nameEn: "Phones", icon: "📱", description: "สเปก กล้อง แบตเตอรี่ ราคา" },
  { slug: "laptops", name: "โน้ตบุ๊ก", nameEn: "Laptops", icon: "💻", description: "ทำงาน เล่นเกม สายครีเอทีฟ" },
  { slug: "appliances", name: "เครื่องใช้ไฟฟ้า", nameEn: "Appliances", icon: "❄️", description: "แอร์ ตู้เย็น เครื่องซักผ้า" },
];

export const CATEGORIES: Category[] = [CARS];

export function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function optionLabel(category: Category, filterKey: string, value: unknown) {
  const f = category.filters.find((x) => x.key === filterKey);
  const o = f?.options.find((x) => x.value === value);
  return o ? `${o.icon ?? ""} ${o.label}`.trim() : String(value ?? "—");
}
