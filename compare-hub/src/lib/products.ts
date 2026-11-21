import type { Product, SeedReview } from "./types";
import { TRAVEL_PRODUCTS } from "./data/travel";
import { ACCIDENT_PRODUCTS } from "./data/accident";

/**
 * SAMPLE DATA (all categories except travel) — provider names, plans and prices are fictional and exist only to
 * demonstrate the comparison UI. Replace with real, licensed product data
 * (e.g. from insurers' published brochures / OIC filings) before going live.
 */

const r = (author: string, rating: number, title: string, body: string, date: string): SeedReview => ({
  author,
  rating,
  title,
  body,
  date,
});

export const PRODUCTS: Product[] = [
  // ───────────── ประกันชีวิต ─────────────
  {
    id: "life-sabai-wholelife-99",
    category: "life",
    name: "สบายใจ ตลอดชีพ 99/20",
    provider: "สบายไลฟ์",
    tagline: "คุ้มครองถึงอายุ 99 จ่ายเบี้ยแค่ 20 ปี",
    badge: "ยอดนิยม",
    highlights: ["คุ้มครองยาวถึงอายุ 99 ปี", "เงินคืน 1% ทุกปีตั้งแต่ปีที่ 6", "ลดหย่อนภาษีได้สูงสุด 100,000 บาท"],
    exclusions: ["ฆ่าตัวตายภายใน 1 ปี", "ปกปิดข้อเท็จจริงด้านสุขภาพ"],
    specs: { planType: "ตลอดชีพ", premium: 24500, sumAssured: 1000000, coverageYears: 69, payYears: 20, returnRate: 112, taxDeductible: true, maxEntryAge: 65 },
    reviews: [
      r("คุณต้น", 5, "เบี้ยไม่แรง คุ้มครองยาว", "ทำให้พ่อแม่ไว้เป็นมรดก ตัวแทนอธิบายละเอียดดี", "2026-08-12"),
      r("Ploy", 4, "เหมาะกับคนเริ่มทำงาน", "ใช้ลดหย่อนภาษีได้เต็ม แต่เงินคืนน้อยไปหน่อย", "2026-06-03"),
    ],
  },
  {
    id: "life-mekong-saving-15",
    category: "life",
    name: "แม่โขง ออมทรัพย์ 15/8",
    provider: "แม่โขงประกันชีวิต",
    tagline: "ออมสั้น จ่าย 8 ปี รับเงินคืนครบสัญญา",
    badge: "ผลตอบแทนสูง",
    highlights: ["ผลตอบแทนรวมโดยประมาณ 118%", "เงินคืนทุก 2 ปี 2%", "ไม่ต้องตรวจสุขภาพ"],
    exclusions: ["ฆ่าตัวตายภายใน 1 ปี", "สงคราม จลาจล"],
    specs: { planType: "สะสมทรัพย์", premium: 98000, sumAssured: 800000, coverageYears: 15, payYears: 8, returnRate: 118, taxDeductible: true, maxEntryAge: 60 },
    reviews: [r("อ้อม", 4, "เก็บเงินแบบบังคับตัวเอง", "ดีกว่าฝากประจำ ถ้าถือจนครบสัญญา", "2026-09-20")],
  },
  {
    id: "life-chao-term-20",
    category: "life",
    name: "เจ้าพระยา เทอม 20",
    provider: "เจ้าพระยาประกันภัย",
    tagline: "ทุนสูง เบี้ยต่ำ ปกป้องภาระครอบครัว",
    badge: "เบี้ยถูกสุด",
    highlights: ["ทุนประกันสูงถึง 3 ล้านบาท", "เบี้ยต่ำที่สุดในกลุ่ม", "เหมาะกับคนมีภาระหนี้บ้าน"],
    exclusions: ["ไม่มีเงินคืน", "ฆ่าตัวตายภายใน 1 ปี"],
    specs: { planType: "ชั่วระยะเวลา", premium: 8900, sumAssured: 3000000, coverageYears: 20, payYears: 20, returnRate: 0, taxDeductible: true, maxEntryAge: 55 },
    reviews: [
      r("Nat", 5, "คุ้มมากสำหรับคนกู้บ้าน", "ทุน 3 ล้าน จ่ายปีละไม่ถึงหมื่น", "2026-10-01"),
      r("แพร", 3, "ไม่มีเงินคืนเลย", "เข้าใจว่าเป็นแบบนี้ แต่ต้องรู้ไว้ก่อนซื้อ", "2026-04-18"),
    ],
  },
  {
    id: "life-lanna-pension-60",
    category: "life",
    name: "ล้านนา บำนาญ 60",
    provider: "ล้านนาโพรเทค",
    tagline: "รับบำนาญรายปีตั้งแต่อายุ 60 ถึง 85",
    highlights: ["รับบำนาญปีละ 15% ของทุน", "ลดหย่อนภาษีกลุ่มบำนาญได้อีก 200,000", "วางแผนเกษียณ"],
    exclusions: ["เวนคืนก่อนกำหนดได้มูลค่าต่ำ"],
    specs: { planType: "บำนาญ", premium: 60000, sumAssured: 500000, coverageYears: 25, payYears: 25, returnRate: 125, taxDeductible: true, maxEntryAge: 50 },
    reviews: [r("ลุงชัย", 4, "อุ่นใจหลังเกษียณ", "ลดหย่อนภาษีได้เยอะ เหมาะกับคนรายได้สูง", "2026-07-07")],
  },

  // ───────────── ประกันสุขภาพ ─────────────
  {
    id: "health-siam-shield-plus",
    category: "health",
    name: "สยามชิลด์ เฮลท์ พลัส",
    provider: "สยามชิลด์",
    tagline: "เหมาจ่าย 5 ล้าน/ปี ห้องเดี่ยว 6,000",
    badge: "คุ้มครองสูงสุด",
    highlights: ["วงเงิน 5 ล้านบาทต่อปี", "รักษาโรงพยาบาลเอกชนชั้นนำ", "Fax claim ทั่วประเทศ"],
    exclusions: ["โรคที่เป็นมาก่อนทำประกัน", "ศัลยกรรมเสริมความงาม"],
    specs: { premium: 32800, annualLimit: 5000000, roomPerDay: 6000, opdLimit: 30000, deductible: 0, waitingDays: 30, maxRenewAge: 99, cashless: true },
    reviews: [
      r("เมย์", 5, "เคลมง่ายมาก", "นอน รพ. 3 คืน ไม่ต้องสำรองจ่ายเลย", "2026-09-02"),
      r("Ben", 4, "แพงแต่คุ้ม", "เบี้ยสูงหน่อยแต่วงเงินหายห่วง", "2026-05-14"),
    ],
  },
  {
    id: "health-andaman-smart",
    category: "health",
    name: "อันดามัน สมาร์ทแคร์",
    provider: "อันดามันประกันภัย",
    tagline: "แผนกลาง ๆ เบี้ยเบา มี OPD",
    highlights: ["วงเงิน 1 ล้านบาท/ปี", "มี OPD 15,000 บาท", "ต่ออายุถึง 80 ปี"],
    exclusions: ["โรคเรื้อรังที่เป็นมาก่อน", "การรักษาที่ไม่จำเป็นทางการแพทย์"],
    specs: { premium: 18900, annualLimit: 1000000, roomPerDay: 3500, opdLimit: 15000, deductible: 0, waitingDays: 30, maxRenewAge: 80, cashless: true },
    reviews: [r("ก้อย", 4, "มี OPD ดีมาก", "ไปหาหมอบ่อย คุ้มเบี้ย", "2026-08-30")],
  },
  {
    id: "health-mekong-deductible",
    category: "health",
    name: "แม่โขง เฮลท์ D20",
    provider: "แม่โขงประกันชีวิต",
    tagline: "มี Deductible 20,000 เบี้ยถูกลงเกือบครึ่ง",
    badge: "เบี้ยถูกสุด",
    highlights: ["เหมาะกับคนมีสวัสดิการบริษัทอยู่แล้ว", "วงเงิน 3 ล้านบาท/ปี", "เบี้ยประหยัด"],
    exclusions: ["ไม่มี OPD", "ส่วนแรก 20,000 บาทต่อปีจ่ายเอง"],
    specs: { premium: 9800, annualLimit: 3000000, roomPerDay: 4000, opdLimit: 0, deductible: 20000, waitingDays: 30, maxRenewAge: 90, cashless: true },
    reviews: [r("Tee", 5, "เสริมประกันกลุ่มได้ดี", "ใช้ประกันบริษัทจ่ายส่วนแรก ที่เหลือแผนนี้รับ", "2026-10-11")],
  },
  {
    id: "health-sabai-basic",
    category: "health",
    name: "สบายใจ เฮลท์ เบสิก",
    provider: "สบายไลฟ์",
    tagline: "แผนเริ่มต้น สำหรับคนอยากมีประกันสุขภาพตัวแรก",
    highlights: ["เบี้ยต่ำ", "สมัครออนไลน์ได้", "ค่าห้อง 2,500/วัน"],
    exclusions: ["ไม่มี OPD", "ต้องสำรองจ่ายบางโรงพยาบาล"],
    specs: { premium: 7200, annualLimit: 300000, roomPerDay: 2500, opdLimit: 0, deductible: 0, waitingDays: 120, maxRenewAge: 70, cashless: false },
    reviews: [r("น้ำ", 3, "พอใช้", "วงเงินน้อยไปถ้าเป็นโรคใหญ่", "2026-03-22")],
  },

  // ───────────── ประกันรถยนต์ ─────────────
  {
    id: "car-chao-class1-garage",
    category: "car",
    name: "เจ้าพระยา ชั้น 1 ซ่อมอู่",
    provider: "เจ้าพระยาประกันภัย",
    tagline: "ชั้น 1 ราคาประหยัด ซ่อมอู่ในเครือกว่า 800 แห่ง",
    badge: "ยอดนิยม",
    highlights: ["อู่ในเครือทั่วประเทศ", "รถยก/รถสไลด์ฟรี", "คุ้มครองน้ำท่วม"],
    exclusions: ["ผู้ขับขี่ไม่มีใบขับขี่", "เมาแล้วขับ"],
    specs: { carClass: "ชั้น 1", premium: 15900, sumInsured: 550000, repairAt: "อู่", deductible: 0, thirdPartyProperty: 1000000, floodCover: true, roadside: true },
    reviews: [r("พี่เอก", 4, "เคลมไว", "ชนท้ายเล็กน้อย เจ้าหน้าที่มาถึงใน 30 นาที", "2026-09-15")],
  },
  {
    id: "car-siam-class1-dealer",
    category: "car",
    name: "สยามชิลด์ ชั้น 1 ซ่อมศูนย์",
    provider: "สยามชิลด์",
    tagline: "ซ่อมห้าง อะไหล่แท้ สำหรับรถอายุไม่เกิน 5 ปี",
    badge: "คุ้มครองสูงสุด",
    highlights: ["ซ่อมศูนย์บริการ", "อะไหล่แท้", "รถใช้ระหว่างซ่อม 5 วัน"],
    exclusions: ["รถอายุเกิน 5 ปี", "ใช้รถรับจ้างสาธารณะ"],
    specs: { carClass: "ชั้น 1", premium: 21500, sumInsured: 600000, repairAt: "ศูนย์", deductible: 0, thirdPartyProperty: 2500000, floodCover: true, roadside: true },
    reviews: [
      r("June", 5, "ซ่อมศูนย์สบายใจ", "งานซ่อมเนี๊ยบ ได้รถคืนตรงเวลา", "2026-07-19"),
      r("ต่อ", 4, "เบี้ยสูงหน่อย", "แต่ได้ซ่อมห้างก็โอเค", "2026-02-11"),
    ],
  },
  {
    id: "car-andaman-2plus",
    category: "car",
    name: "อันดามัน 2+ เซฟเวอร์",
    provider: "อันดามันประกันภัย",
    tagline: "ชนกับยานพาหนะ คุ้มครองรถเรา เบี้ยครึ่งเดียวของชั้น 1",
    badge: "เบี้ยถูกสุด",
    highlights: ["คุ้มครองรถหาย ไฟไหม้", "ชนกับคู่กรณีที่เป็นยานพาหนะ", "เหมาะกับรถอายุ 5 ปีขึ้นไป"],
    exclusions: ["ชนแบบไม่มีคู่กรณี", "น้ำท่วม"],
    specs: { carClass: "ชั้น 2+", premium: 7900, sumInsured: 300000, repairAt: "อู่", deductible: 2000, thirdPartyProperty: 1000000, floodCover: false, roadside: true },
    reviews: [r("Golf", 4, "คุ้มสำหรับรถเก่า", "ราคาดี จ่ายส่วนแรกนิดหน่อย", "2026-06-25")],
  },
  {
    id: "car-lanna-3plus",
    category: "car",
    name: "ล้านนา 3+ อีซี่",
    provider: "ล้านนาโพรเทค",
    tagline: "ประกันชั้น 3+ ราคาเบา สำหรับรถใช้งานในเมือง",
    highlights: ["เบี้ยต่ำ", "คุ้มครองรถเราเมื่อชนกับยานพาหนะ", "ผ่อน 0% 6 เดือน"],
    exclusions: ["รถหาย", "ไฟไหม้", "น้ำท่วม"],
    specs: { carClass: "ชั้น 3+", premium: 5900, sumInsured: 100000, repairAt: "อู่", deductible: 2000, thirdPartyProperty: 600000, floodCover: false, roadside: false },
    reviews: [r("มิ้นท์", 3, "ทุนน้อย", "ราคาดีแต่ทุน 1 แสน ไม่พอถ้าชนหนัก", "2026-01-30")],
  },

  // ───────────── ประกันการเดินทาง: real data, see ./data/travel.ts ─────────────
  ...TRAVEL_PRODUCTS,

  // ───────────── ประกันอุบัติเหตุ: real data, see ./data/accident.ts ─────────────
  ...ACCIDENT_PRODUCTS,

  // ───────────── บ้าน/อัคคีภัย ─────────────
  {
    id: "home-siam-homeplus",
    category: "home",
    name: "สยามชิลด์ โฮมพลัส",
    provider: "สยามชิลด์",
    tagline: "ครบทั้งไฟไหม้ น้ำท่วม โจรกรรม",
    badge: "คุ้มครองสูงสุด",
    highlights: ["ภัยธรรมชาติสูงสุด 300,000", "ทรัพย์สินภายใน 500,000", "ค่าที่พักชั่วคราว"],
    exclusions: ["ความเสียหายจากการเสื่อมสภาพ"],
    specs: { premium: 3900, sumInsured: 2000000, contents: 500000, naturalDisaster: 300000, theft: true, temporaryStay: 2000 },
    reviews: [r("พี่หนึ่ง", 5, "น้ำท่วมปีที่แล้วเคลมได้", "ประเมินไว จ่ายภายใน 3 สัปดาห์", "2026-01-12")],
  },
  {
    id: "home-mekong-condo",
    category: "home",
    name: "แม่โขง คอนโดแคร์",
    provider: "แม่โขงประกันชีวิต",
    tagline: "ออกแบบมาสำหรับคอนโด เบี้ยเบา",
    badge: "เบี้ยถูกสุด",
    highlights: ["คุ้มครองน้ำรั่วซึมจากห้องข้างเคียง", "ความรับผิดต่อบุคคลภายนอก", "เบี้ยต่ำ"],
    exclusions: ["ภัยธรรมชาติจำกัดวงเงิน"],
    specs: { premium: 1200, sumInsured: 2000000, contents: 200000, naturalDisaster: 20000, theft: true, temporaryStay: 1000 },
    reviews: [r("Bow", 4, "เหมาะกับคอนโด", "ห้องบนน้ำรั่ว เคลมได้", "2026-07-27")],
  },
  {
    id: "home-sabai-fire",
    category: "home",
    name: "สบายใจ อัคคีภัย เบสิก",
    provider: "สบายไลฟ์",
    tagline: "ประกันอัคคีภัยภาคบังคับสำหรับบ้านที่ผ่อนธนาคาร",
    highlights: ["ตรงตามเงื่อนไขธนาคาร", "คุ้มครองไฟไหม้ ฟ้าผ่า ระเบิด"],
    exclusions: ["ไม่คุ้มครองโจรกรรม", "ไม่คุ้มครองทรัพย์สินภายใน"],
    specs: { premium: 900, sumInsured: 2000000, contents: 0, naturalDisaster: 20000, theft: false, temporaryStay: 0 },
    reviews: [r("ต้นข้าว", 3, "พื้นฐานพอ", "ถ้าอยากได้ครบต้องซื้อแผนอื่นเพิ่ม", "2026-02-02")],
  },
];

export function getProduct(id: string) {
  return PRODUCTS.find((p) => p.id === id);
}

export function productsIn(category: string) {
  return PRODUCTS.filter((p) => p.category === category);
}

/** Headline price, or null when the insurer only quotes on request. */
export function priceOf(p: Product, priceKey: string): number | null {
  const v = p.specs[priceKey];
  return typeof v === "number" ? v : null;
}

export function avgRating(reviews: { rating: number }[]) {
  if (!reviews.length) return 0;
  return reviews.reduce((s, x) => s + x.rating, 0) / reviews.length;
}
