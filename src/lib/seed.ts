import type { DB, Item, Price, Review, Unit } from "./types";

// NOTE: Seed prices are illustrative sample values (THB), not live store data.
// Users are expected to update them with what they actually see on the shelf.

const SEED_DATE = "2026-11-01";

type Row = [
  id: string,
  emoji: string,
  name: string,
  nameTh: string,
  brand: string,
  category: string,
  size: number,
  unit: Unit,
  bigc: number | null,
  sevenEleven: number | null,
  attributes?: Record<string, string>,
];

const rows: Row[] = [
  ["coke-325", "🥤", "Coca-Cola Original Can", "โค้ก กระป๋อง", "Coca-Cola", "Drinks", 325, "ml", 14.5, 17, { Sugar: "Regular", Pack: "Can" }],
  ["coke-zero-325", "🥤", "Coca-Cola Zero Sugar Can", "โค้ก ซีโร่ กระป๋อง", "Coca-Cola", "Drinks", 325, "ml", 14.5, 17, { Sugar: "Zero", Pack: "Can" }],
  ["est-cola-445", "🥤", "est Cola Bottle", "เอส โคล่า ขวด", "est", "Drinks", 445, "ml", 12, 15, { Sugar: "Regular", Pack: "PET bottle" }],
  ["singha-water-600", "💧", "Singha Drinking Water", "น้ำดื่มสิงห์", "Singha", "Drinks", 600, "ml", 6.5, 7, { Pack: "PET bottle" }],
  ["oishi-green-500", "🍵", "Oishi Green Tea Original", "โออิชิ กรีนที ต้นตำรับ", "Oishi", "Drinks", 500, "ml", 18, 20, { Sugar: "Regular" }],
  ["m150-150", "⚡", "M-150 Energy Drink", "เอ็ม-150", "Osotspa", "Drinks", 150, "ml", 10, 10, { Caffeine: "50 mg" }],
  ["cvitt-140", "🍋", "C-vitt Lemon", "ซี-วิท เลมอน", "Hatari", "Drinks", 140, "ml", 15, 17, { "Vitamin C": "1000 mg" }],
  ["birdy-180", "☕", "Birdy Robusta Canned Coffee", "เบอร์ดี้ โรบัสต้า", "Birdy", "Coffee & Tea", 180, "ml", 13, 15, { Roast: "Robusta" }],
  ["nescafe-180", "☕", "Nescafé Espresso Roast Can", "เนสกาแฟ เอสเปรสโซ โรสต์", "Nescafé", "Coffee & Tea", 180, "ml", 13, 15, { Roast: "Espresso" }],
  ["dutchmill-180", "🥛", "Dutch Mill Drinking Yoghurt Mixed Fruit", "ดัชมิลล์ โยเกิร์ตพร้อมดื่ม", "Dutch Mill", "Dairy", 180, "ml", 11, 12, { Type: "UHT yoghurt" }],
  ["meiji-pink-450", "🥛", "Meiji Pasteurized Milk Plain", "เมจิ นมพาสเจอร์ไรส์ จืด", "Meiji", "Dairy", 450, "ml", 26, 28, { Storage: "Chilled" }],
  ["lactasoy-300", "🫘", "Lactasoy Soy Milk Original", "แลคตาซอย", "Lactasoy", "Dairy", 300, "ml", 11, 12, { Type: "Soy" }],
  ["mama-tomyum-55", "🍜", "MAMA Instant Noodles Tom Yum Shrimp", "มาม่า ต้มยำกุ้ง", "MAMA", "Instant Food", 55, "g", 6.5, 7, { Flavor: "Tom Yum Kung" }],
  ["wai-wai-60", "🍜", "Wai Wai Instant Noodles Minced Pork", "ไวไว หมูสับ", "Wai Wai", "Instant Food", 60, "g", 6, 7, { Flavor: "Minced pork" }],
  ["lays-classic-48", "🥔", "Lay's Classic Original", "เลย์ คลาสสิค", "Lay's", "Snacks", 48, "g", 18, 20, { Flavor: "Original" }],
  ["taokaenoi-32", "🌿", "Tao Kae Noi Crispy Seaweed Original", "เถ้าแก่น้อย สาหร่ายทอด", "Tao Kae Noi", "Snacks", 32, "g", 27, 30, { Flavor: "Original" }],
  ["pocky-choc-43", "🍫", "Pocky Chocolate", "ป๊อกกี้ ช็อกโกแลต", "Glico", "Snacks", 43, "g", 18, 20, { Flavor: "Chocolate" }],
  ["colgate-150", "🪥", "Colgate Great Regular Flavor Toothpaste", "คอลเกต ยาสีฟัน", "Colgate", "Personal Care", 150, "g", 49, 59, { Fluoride: "Yes" }],
  ["tissue-pocket", "🧻", "Scott Pocket Tissue (pack of 6)", "สก๊อตต์ ทิชชู่พกพา", "Scott", "Household", 6, "pcs", 25, 29, {}],
  ["egg-10", "🥚", "Fresh Chicken Eggs No.2 (10 pcs)", "ไข่ไก่ เบอร์ 2", "CP", "Fresh", 10, "pcs", 45, 52, { Grade: "No. 2" }],
];

// Real barcodes + front photos from Open Food Facts (ODbL / CC BY-SA), each checked by eye.
// Items without a confident match keep their emoji.
const OFF_IMG = "https://images.openfoodfacts.org/images/products";
const real: Record<string, { barcode: string; imageUrl: string }> = {
  "coke-325": { barcode: "8851959132012", imageUrl: `${OFF_IMG}/885/195/913/2012/front_en.36.400.jpg` },
  "coke-zero-325": { barcode: "8851959132074", imageUrl: `${OFF_IMG}/885/195/913/2074/front_en.7.400.jpg` },
  "oishi-green-500": { barcode: "8854698005050", imageUrl: `${OFF_IMG}/885/469/800/5050/front_en.72.400.jpg` },
  "m150-150": { barcode: "8851123240758", imageUrl: `${OFF_IMG}/885/112/324/0758/front_th.7.400.jpg` },
  "lactasoy-300": { barcode: "8850267112129", imageUrl: `${OFF_IMG}/885/026/711/2129/front_en.25.400.jpg` },
  "mama-tomyum-55": { barcode: "8850987101021", imageUrl: `${OFF_IMG}/885/098/710/1021/front_en.25.400.jpg` },
  "birdy-180": { barcode: "8850250000365", imageUrl: `${OFF_IMG}/885/025/000/0365/front_en.23.400.jpg` },
  "dutchmill-180": { barcode: "8851717040030", imageUrl: `${OFF_IMG}/885/171/704/0030/front_th.27.400.jpg` },
};

const reviewsSeed: Omit<Review, "id">[] = [
  { itemId: "coke-325", rating: 5, title: "Classic", body: "Always cold at 7-Eleven, cheaper per can at Big C if you buy a 6-pack.", author: "Ploy", storeId: "7eleven", date: "2026-10-12" },
  { itemId: "coke-zero-325", rating: 4, title: "Good zero option", body: "Tastes close to the original. Prefer the can over the bottle.", author: "Ton", date: "2026-10-20" },
  { itemId: "est-cola-445", rating: 3, title: "Sweeter than Coke", body: "Bigger bottle for less money, but quite sweet.", author: "Bank", storeId: "bigc", date: "2026-09-30" },
  { itemId: "mama-tomyum-55", rating: 5, title: "The benchmark", body: "Add an egg and it's perfect. Hard to beat for the price.", author: "Mint", date: "2026-10-02" },
  { itemId: "mama-tomyum-55", rating: 4, title: "Reliable", body: "Spicier than Wai Wai. Big C sells the 10-pack cheaper.", author: "Jay", storeId: "bigc", date: "2026-10-28" },
  { itemId: "wai-wai-60", rating: 4, title: "Milder and slightly bigger", body: "60 g vs 55 g, good when you're hungrier.", author: "Fon", date: "2026-10-08" },
  { itemId: "lays-classic-48", rating: 4, title: "Crunchy", body: "Bag is mostly air but the chips are good.", author: "Ploy", date: "2026-10-15" },
  { itemId: "taokaenoi-32", rating: 5, title: "Best seaweed snack", body: "Crispy and salty, great with beer.", author: "Tee", date: "2026-10-18" },
  { itemId: "birdy-180", rating: 4, title: "Strong", body: "Good kick for the morning.", author: "Nok", date: "2026-10-05" },
  { itemId: "nescafe-180", rating: 3, title: "Too sweet", body: "Sweeter than Birdy, less coffee taste.", author: "Nok", date: "2026-10-05" },
  { itemId: "oishi-green-500", rating: 4, title: "Refreshing", body: "Watch for 2-for promos at 7-Eleven.", author: "Arm", storeId: "7eleven", date: "2026-11-03" },
  { itemId: "meiji-pink-450", rating: 5, title: "Creamy", body: "Fresh milk that actually tastes fresh.", author: "June", date: "2026-11-05" },
];

export function buildSeed(): DB {
  const items: Item[] = rows.map(
    ([id, emoji, name, nameTh, brand, category, size, unit, , , attributes]) => ({
      id, emoji, name, nameTh, brand, category, size, unit,
      attributes: attributes ?? {},
      ...real[id],
      createdAt: SEED_DATE,
    }),
  );

  const prices: Price[] = [];
  for (const [id, , , , , , , , bigc, seven] of rows) {
    if (bigc != null) prices.push({ id: `p-${id}-bigc`, itemId: id, storeId: "bigc", price: bigc, date: SEED_DATE });
    if (seven != null) prices.push({ id: `p-${id}-7eleven`, itemId: id, storeId: "7eleven", price: seven, date: SEED_DATE });
  }

  return {
    version: 1,
    stores: [
      { id: "bigc", name: "Big C", color: "#16a34a" },
      { id: "7eleven", name: "7-Eleven", color: "#ea580c" },
    ],
    items,
    prices,
    reviews: reviewsSeed.map((r, i) => ({ ...r, id: `r-seed-${i}` })),
    compare: [],
    list: [],
  };
}
