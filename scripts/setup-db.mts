// Creates the tables and loads the sample Big C / 7-Eleven data.
// Safe to re-run: existing rows are kept; sample items only get a missing barcode/photo filled in.
// Usage: npm run db:setup
import { readFileSync } from "node:fs";
import { Pool } from "@neondatabase/serverless";
import { buildSeed } from "../src/lib/seed.ts";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set — run `vercel env pull .env.local --yes` first");

const pool = new Pool({ connectionString: url });
const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");
await pool.query(schema);

const seed = buildSeed();
for (const s of seed.stores) {
  await pool.query("INSERT INTO stores (id, name, color) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING", [s.id, s.name, s.color]);
}
for (const i of seed.items) {
  await pool.query(
    `INSERT INTO items (id, name, name_th, brand, category, size, unit, barcode, emoji, image_url, attributes, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     ON CONFLICT (id) DO UPDATE SET -- fill gaps only; never overwrite what users changed
       barcode   = COALESCE(items.barcode, EXCLUDED.barcode),
       image_url = COALESCE(items.image_url, EXCLUDED.image_url)`,
    [i.id, i.name, i.nameTh ?? null, i.brand, i.category, i.size, i.unit, i.barcode ?? null, i.emoji ?? null, i.imageUrl ?? null, JSON.stringify(i.attributes), i.createdAt],
  );
}
for (const p of seed.prices) {
  await pool.query("INSERT INTO prices (id, item_id, store_id, price, promo, date) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING", [p.id, p.itemId, p.storeId, p.price, p.promo ?? null, p.date]);
}
for (const r of seed.reviews) {
  await pool.query(
    "INSERT INTO reviews (id, item_id, rating, title, body, author, store_id, date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING",
    [r.id, r.itemId, r.rating, r.title, r.body, r.author, r.storeId ?? null, r.date],
  );
}

const { rows } = await pool.query(
  "SELECT (SELECT count(*) FROM stores) s, (SELECT count(*) FROM items) i, (SELECT count(*) FROM prices) p, (SELECT count(*) FROM reviews) r",
);
console.log(`Database ready: ${rows[0].s} stores, ${rows[0].i} items, ${rows[0].p} prices, ${rows[0].r} reviews`);
await pool.end();
