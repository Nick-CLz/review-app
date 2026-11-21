import type { Product, ProductSource } from "../types";

/**
 * REAL travel-insurance plans, figures copied from each insurer's own product page.
 *
 * Rules for this file:
 * - Only put a number in when the insurer's page states it. Otherwise use `null`
 *   (shown as "ไม่ระบุ"). `0` means the page says the benefit is NOT covered.
 * - Most insurers only show premiums after a quote, so `premium` is usually null.
 *   When a page publishes a "starting from" price, use it and set `priceIsFrom`.
 * - Re-check against the source and bump `checkedAt` whenever you touch an entry.
 * - No seed reviews: real products only get reviews from real users.
 */

const CHECKED = "2026-11-17";

const VIRIYAH: ProductSource = {
  url: "https://vinsure.viriyah.co.th/insurance/online/v-travel-comprehensive",
  label: "วิริยะประกันภัย — V-Travel Comprehensive",
  checkedAt: CHECKED,
};

const MSIG: ProductSource = {
  url: "https://www.msig-thai.com/en/personal-insurance/travel-easy-plus",
  label: "MSIG Thailand — Travel Easy Plus",
  checkedAt: CHECKED,
};

const AXA: ProductSource = {
  url: "https://www.axa.co.th/th/personal/travel-insurance/outbound",
  label: "AXA ประกันภัย — Smart Traveller's Choice",
  checkedAt: CHECKED,
};

const THAIVIVAT: ProductSource = {
  url: "https://www.thaivivat.co.th/ecommerce/th/gtip.php",
  label: "ไทยวิวัฒน์ประกันภัย — ประกันภัยการเดินทางต่างประเทศ พลัส",
  checkedAt: CHECKED,
};

const viriyahNote = "ตัวเลขสำหรับผู้เอาประกันอายุ 1 เดือน–70 ปี · เว็บไซต์ระบุว่าใช้ยื่นวีซ่าเชงเก้นได้ แต่ไม่ได้ระบุว่าแผนใด · คืนเบี้ย 100% หากวีซ่าไม่ผ่าน";
const msigNote = "ตัวเลขสำหรับผู้เอาประกันอายุ 15–75 ปี · กระเป๋าสูญหาย/เสียหายจ่ายไม่เกิน 5,000 บาทต่อชิ้น มีความรับผิดส่วนแรก 1,000 บาทต่อครั้ง · เบี้ยแสดงเป็นรูปภาพบนเว็บไซต์ จึงยังไม่ได้นำมาใส่";

export const TRAVEL_PRODUCTS: Product[] = [
  // ── Viriyah V-Travel Comprehensive ──
  {
    id: "travel-viriyah-v-saver",
    category: "travel",
    name: "V-Travel V-Saver",
    provider: "วิริยะประกันภัย",
    tagline: "แผนเริ่มต้น เน้นค่ารักษาพยาบาลและอุบัติเหตุ",
    highlights: ["ค่ารักษาพยาบาลต่างประเทศ 1,500,000 บาท", "ค่ารักษาต่อเนื่องในไทย 150,000 บาท", "รับประกันถึงอายุ 85 ปี"],
    exclusions: ["ไม่คุ้มครองเที่ยวบินล่าช้า", "ไม่คุ้มครองกระเป๋าสูญหาย/เสียหาย"],
    specs: { premium: null, medicalLimit: 1500000, accidentDeath: 1500000, flightDelay: 0, baggage: 0, schengen: null, covid: null },
    reviews: [],
    source: VIRIYAH,
    dataNote: viriyahNote,
  },
  {
    id: "travel-viriyah-v-smart",
    category: "travel",
    name: "V-Travel V-Smart",
    provider: "วิริยะประกันภัย",
    tagline: "ค่ารักษา 2 ล้าน พร้อมเที่ยวบินล่าช้าและกระเป๋า",
    highlights: ["ค่ารักษาพยาบาลต่างประเทศ 2,000,000 บาท", "เที่ยวบินล่าช้าสูงสุด 5,000 บาท", "ค่ารักษาต่อเนื่องในไทย 200,000 บาท"],
    exclusions: ["ตรวจสอบข้อยกเว้นในกรมธรรม์ฉบับเต็ม"],
    specs: { premium: null, medicalLimit: 2000000, accidentDeath: 2000000, flightDelay: 5000, baggage: 10000, schengen: null, covid: null },
    reviews: [],
    source: VIRIYAH,
    dataNote: viriyahNote,
  },
  {
    id: "travel-viriyah-v-shield",
    category: "travel",
    name: "V-Travel V-Shield",
    provider: "วิริยะประกันภัย",
    tagline: "ค่ารักษา 3 ล้าน กระเป๋าสูงสุด 30,000",
    highlights: ["ค่ารักษาพยาบาลต่างประเทศ 3,000,000 บาท", "เที่ยวบินล่าช้าสูงสุด 20,000 บาท", "ค่ารักษาต่อเนื่องในไทย 300,000 บาท"],
    exclusions: ["ตรวจสอบข้อยกเว้นในกรมธรรม์ฉบับเต็ม"],
    specs: { premium: null, medicalLimit: 3000000, accidentDeath: 3000000, flightDelay: 20000, baggage: 30000, schengen: null, covid: null },
    reviews: [],
    source: VIRIYAH,
    dataNote: viriyahNote,
  },
  {
    id: "travel-viriyah-v-sure",
    category: "travel",
    name: "V-Travel V-Sure",
    provider: "วิริยะประกันภัย",
    tagline: "แผนสูงสุดของวิริยะ ค่ารักษา 5 ล้าน กระเป๋า 100,000",
    highlights: ["ค่ารักษาพยาบาลต่างประเทศ 5,000,000 บาท", "เที่ยวบินล่าช้าสูงสุด 40,000 บาท", "กระเป๋าสูญหาย/เสียหาย 100,000 บาท"],
    exclusions: ["ตรวจสอบข้อยกเว้นในกรมธรรม์ฉบับเต็ม"],
    specs: { premium: null, medicalLimit: 5000000, accidentDeath: 5000000, flightDelay: 40000, baggage: 100000, schengen: null, covid: null },
    reviews: [],
    source: VIRIYAH,
    dataNote: viriyahNote,
  },

  // ── MSIG Travel Easy Plus ──
  {
    id: "travel-msig-easy-visa-plus",
    category: "travel",
    name: "Travel Easy Plus — Easy Visa Plus",
    provider: "MSIG ประกันภัย",
    tagline: "แผนสำหรับยื่นวีซ่า ค่ารักษา 2 ล้าน",
    highlights: ["ค่ารักษาพยาบาลต่างประเทศ 2,000,000 บาท (รวมโควิด-19)", "เที่ยวบินล่าช้าสูงสุด 10,000 บาท", "ซื้อความคุ้มครองเสริม Visa / Sport / Pet Care ได้"],
    exclusions: ["กระเป๋าจ่ายไม่เกิน 5,000 บาท/ชิ้น", "ส่วนแรกกระเป๋า 1,000 บาท/ครั้ง"],
    specs: { premium: null, medicalLimit: 2000000, accidentDeath: 2000000, flightDelay: 10000, baggage: 15000, schengen: null, covid: true },
    reviews: [],
    source: MSIG,
    dataNote: msigNote,
  },
  {
    id: "travel-msig-easy-3",
    category: "travel",
    name: "Travel Easy Plus — Easy 3",
    provider: "MSIG ประกันภัย",
    tagline: "ค่ารักษา 2 ล้าน อุบัติเหตุ 3 ล้าน",
    highlights: ["อุบัติเหตุเสียชีวิต/ทุพพลภาพ 3,000,000 บาท", "เที่ยวบินล่าช้าสูงสุด 15,000 บาท", "คุ้มครองโควิด-19"],
    exclusions: ["กระเป๋าจ่ายไม่เกิน 5,000 บาท/ชิ้น", "ส่วนแรกกระเป๋า 1,000 บาท/ครั้ง"],
    specs: { premium: null, medicalLimit: 2000000, accidentDeath: 3000000, flightDelay: 15000, baggage: 30000, schengen: null, covid: true },
    reviews: [],
    source: MSIG,
    dataNote: msigNote,
  },
  {
    id: "travel-msig-easy-2",
    category: "travel",
    name: "Travel Easy Plus — Easy 2",
    provider: "MSIG ประกันภัย",
    tagline: "ค่ารักษา 3 ล้าน อุบัติเหตุ 4 ล้าน",
    highlights: ["ค่ารักษาพยาบาลต่างประเทศ 3,000,000 บาท", "เที่ยวบินล่าช้าสูงสุด 25,000 บาท", "กระเป๋าสูญหาย/เสียหาย 40,000 บาท"],
    exclusions: ["กระเป๋าจ่ายไม่เกิน 5,000 บาท/ชิ้น", "ส่วนแรกกระเป๋า 1,000 บาท/ครั้ง"],
    specs: { premium: null, medicalLimit: 3000000, accidentDeath: 4000000, flightDelay: 25000, baggage: 40000, schengen: null, covid: true },
    reviews: [],
    source: MSIG,
    dataNote: msigNote,
  },
  {
    id: "travel-msig-easy-1",
    category: "travel",
    name: "Travel Easy Plus — Easy 1",
    provider: "MSIG ประกันภัย",
    tagline: "แผนสูงสุดของ MSIG ค่ารักษาและอุบัติเหตุ 5 ล้าน",
    highlights: ["ค่ารักษาพยาบาลต่างประเทศ 5,000,000 บาท", "เที่ยวบินล่าช้าสูงสุด 35,000 บาท", "กระเป๋าสูญหาย/เสียหาย 60,000 บาท"],
    exclusions: ["กระเป๋าจ่ายไม่เกิน 5,000 บาท/ชิ้น", "ส่วนแรกกระเป๋า 1,000 บาท/ครั้ง"],
    specs: { premium: null, medicalLimit: 5000000, accidentDeath: 5000000, flightDelay: 35000, baggage: 60000, schengen: null, covid: true },
    reviews: [],
    source: MSIG,
    dataNote: msigNote,
  },

  // ── Products whose pages publish only headline figures ──
  {
    id: "travel-axa-smart-traveller",
    category: "travel",
    name: "Smart Traveller's Choice",
    provider: "AXA ประกันภัย",
    tagline: "เลือกได้ 3 ระดับ Basic / Advance / Max ทั้งรายเที่ยวและรายปี",
    highlights: ["ค่ารักษาพยาบาลสูงสุด 5,000,000 บาท ทุกช่วงอายุ", "ทุกแผนใช้ยื่นวีซ่าเชงเก้นได้ (แผนเชงเก้นเริ่ม 165 บาท)", "เที่ยวบินล่าช้าจ่ายทุก 6 ชั่วโมง"],
    exclusions: ["วงเงินของแต่ละแผนไม่ได้แสดงบนเว็บไซต์ — ดูตารางกรมธรรม์"],
    specs: { premium: 135, medicalLimit: 5000000, accidentDeath: null, flightDelay: null, baggage: null, schengen: true, covid: null },
    reviews: [],
    source: AXA,
    priceIsFrom: true,
    dataNote: "ตัวเลขเป็นวงเงิน “สูงสุด” ของผลิตภัณฑ์ ไม่ใช่ของแผนใดแผนหนึ่ง · กระเป๋าจ่ายไม่เกิน 10,000 บาทต่อชิ้นหรือต่อคู่ · เบี้ย 135 บาทเป็นราคาเริ่มต้นที่เว็บไซต์ประกาศ",
  },
  {
    id: "travel-thaivivat-plus",
    category: "travel",
    name: "ประกันภัยการเดินทางต่างประเทศ พลัส",
    provider: "ไทยวิวัฒน์ประกันภัย",
    tagline: "คุ้มครองกีฬาเสี่ยง เช่น ดำน้ำ เจ็ตสกี บันจี้จัมป์ รับถึงอายุ 85 ปี",
    highlights: ["ค่ารักษาพยาบาลสูงสุด 5,000,000 บาท", "เที่ยวบินล่าช้าสูงสุด 25,000 บาท + เข้าเลานจ์เมื่อล่าช้าเกิน 90 นาที", "ค่ารักษาฟันฉุกเฉินสูงสุด 16,000 บาท"],
    exclusions: ["ไม่คุ้มครองกีฬาเสี่ยงหากเป็นการแข่งขัน", "อายุ 76–85 ปี ซื้อได้เฉพาะแผนเบสิก"],
    specs: { premium: null, medicalLimit: 5000000, accidentDeath: null, flightDelay: 25000, baggage: null, schengen: null, covid: null },
    reviews: [],
    source: THAIVIVAT,
    dataNote: "ตัวเลขเป็นวงเงิน “สูงสุด” ของผลิตภัณฑ์ ไม่ใช่ของแผนใดแผนหนึ่ง",
  },
];

/**
 * REAL sample premiums from Viriyah's own online calculator (same URL as VIRIYAH.url),
 * single trip from Thailand, 1 traveller, departing 1 Dec 2026, before any promo code.
 * Read on 2026-11-21. Only the destinations and trip lengths below were looked up:
 * do NOT interpolate other lengths. The calculator returned identical prices for
 * "Schengen" and "Worldwide".
 */
export const TRIP_PRICES_CHECKED = "2026-11-21";
export const TRIP_DAYS = [4, 7, 10, 14, 30] as const;
export const TRIP_DESTINATIONS = [
  { key: "japan", label: "ญี่ปุ่น" },
  { key: "schengen", label: "ยุโรป (เชงเก้น)" },
  { key: "worldwide", label: "ทั่วโลก" },
] as const;

type Dest = (typeof TRIP_DESTINATIONS)[number]["key"];
const far = {
  "travel-viriyah-v-saver": [254, 308, 364, 468, 784],
  "travel-viriyah-v-smart": [476, 547, 675, 829, 1346],
  "travel-viriyah-v-shield": [721, 822, 966, 1153, 1572],
  "travel-viriyah-v-sure": [1360, 1510, 1883, 2349, 3555],
};

/** productId → premiums in baht, in the same order as TRIP_DAYS. */
export const TRIP_PRICES: Record<Dest, Record<string, number[]>> = {
  japan: {
    "travel-viriyah-v-saver": [166, 230, 278, 369, 654],
    "travel-viriyah-v-smart": [343, 453, 559, 699, 1132],
    "travel-viriyah-v-shield": [544, 695, 833, 1040, 1505],
    "travel-viriyah-v-sure": [900, 1212, 1479, 1854, 2839],
  },
  schengen: far,
  worldwide: far,
};
