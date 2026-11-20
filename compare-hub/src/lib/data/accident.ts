import type { Product, ProductSource } from "../types";

/**
 * REAL personal-accident (PA) plans, figures copied from each insurer's own product page.
 * Same rules as ./travel.ts: `null` = not stated, `0` = page says not covered,
 * re-check and bump `checkedAt` whenever you touch an entry, no seed reviews.
 *
 * `deathBenefit` is the general-accident figure. Motorcycle and murder/assault cases
 * usually pay less; that goes in `highlights` / `dataNote`.
 */

const CHECKED = "2026-11-20";

const OCEAN: ProductSource = {
  url: "https://www.ocean.co.th/en/our-products/personal-accident/oceanlife-pa-d-sure",
  label: "ไทยสมุทรประกันชีวิต — PA D-Sure",
  checkedAt: CHECKED,
};

const CHUBB: ProductSource = {
  url: "https://www.chubb.com/th-en/personal/pa-ultra-pro.html",
  label: "Chubb — PA Ultra Pro",
  checkedAt: CHECKED,
};

const oceanNote =
  "เบี้ยสำหรับอายุ 5–60 ปี อาชีพชั้น 1–2 · สัญญา 5 ปี ชำระเบี้ย 5 ปี · ทุนเสียชีวิตจากอุบัติเหตุทั่วไปเพิ่มขึ้น 5% ทุกปี · ต้องตอบคำถามสุขภาพ";
const chubbNote =
  "เว็บไซต์ไม่แสดงเบี้ย ต้องขอใบเสนอราคา · อายุรับประกันขึ้นกับแผนและชั้นอาชีพ (ตัวเลขในตารางคือชั้นอาชีพ 1) · มีเงินชดเชยรายได้เป็นรายสัปดาห์ ไม่ใช่รายวัน";

function ocean(
  plan: number,
  premium: number,
  death: number,
  reduced: number,
  medical: number,
  daily: number,
): Product {
  return {
    id: `pa-ocean-d-sure-${plan}`,
    category: "accident",
    name: `PA D-Sure แผน ${plan}`,
    provider: "ไทยสมุทรประกันชีวิต",
    tagline: daily ? "มีเงินชดเชยรายวันเมื่อนอนโรงพยาบาล" : "แผนประหยัด เน้นทุนเสียชีวิตจากอุบัติเหตุ",
    highlights: [
      `ขับขี่/ซ้อนท้าย จยย. รับ ${reduced.toLocaleString("th-TH")} บาท`,
      `อุบัติเหตุสาธารณะ รับเพิ่มอีก ${death.toLocaleString("th-TH")} บาท`,
      `อุบัติเหตุในวันหยุดนักขัตฤกษ์ รับเพิ่ม ${(death * 2).toLocaleString("th-TH")} บาท`,
      ...(daily ? [`ห้อง ICU วันละ ${(daily * 2).toLocaleString("th-TH")} บาท (สูงสุด 7 วัน)`] : []),
    ],
    exclusions: ["ฆ่าตัวตาย/ทำร้ายตัวเอง", "แอลกอฮอล์ในเลือดตั้งแต่ 150 มก.%", "แนบสัญญาเพิ่มเติมไม่ได้"],
    specs: { premium, deathBenefit: death, medicalPerAccident: medical, dailyComp: daily, motorcycle: true, maxEntryAge: 60 },
    reviews: [],
    source: OCEAN,
    dataNote: oceanNote,
  };
}

function chubb(
  plan: number,
  death: number,
  motorcycle: number,
  medical: number,
  weekly: number,
  bones: number,
  maxAge: number,
): Product {
  return {
    id: `pa-chubb-ultra-pro-${plan}`,
    category: "accident",
    name: `PA Ultra Pro แผน ${plan}`,
    provider: "Chubb",
    tagline: `ค่ารักษา ${medical.toLocaleString("th-TH")} บาทต่ออุบัติเหตุ คุ้มครองทั่วโลก`,
    highlights: [
      `ขับขี่/ซ้อนท้าย จยย. รับ ${motorcycle.toLocaleString("th-TH")} บาท`,
      `กระดูกหัก ไฟไหม้ น้ำร้อนลวก ${bones.toLocaleString("th-TH")} บาท`,
      weekly ? `ชดเชยทุพพลภาพชั่วคราว สัปดาห์ละ ${weekly.toLocaleString("th-TH")} บาท (สูงสุด 52 สัปดาห์)` : "ไม่มีเงินชดเชยรายได้",
    ],
    exclusions: ["แอลกอฮอล์ในเลือดเกิน 150 มก.%", "แข่งรถ ดำน้ำลึก กระโดดร่ม บันจี้จัมป์", "ทะเลาะวิวาท/ก่ออาชญากรรม"],
    specs: { premium: null, deathBenefit: death, medicalPerAccident: medical, dailyComp: null, motorcycle: true, maxEntryAge: maxAge },
    reviews: [],
    source: CHUBB,
    dataNote: chubbNote,
  };
}

export const ACCIDENT_PRODUCTS: Product[] = [
  // Ocean Life PA D-Sure — premium per year, age 5–60
  ocean(1, 1000, 150000, 75000, 5000, 0),
  ocean(2, 1500, 200000, 100000, 5000, 1000),
  ocean(3, 2000, 400000, 200000, 10000, 0),
  ocean(4, 3000, 600000, 300000, 10000, 1500),
  // Chubb PA Ultra Pro — no published premium
  chubb(1, 300000, 300000, 35000, 0, 3000, 70),
  chubb(2, 400000, 400000, 45000, 0, 4000, 70),
  chubb(3, 600000, 500000, 60000, 500, 6000, 70),
  chubb(4, 1000000, 500000, 110000, 1000, 10000, 70),
  chubb(5, 3000000, 1000000, 150000, 3000, 30000, 60),
  chubb(6, 5000000, 1000000, 200000, 5000, 50000, 60),
];
