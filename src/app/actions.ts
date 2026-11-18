"use server";

// Server Functions are public POST endpoints, so every input is validated here and every
// write checks the Clerk session. Reads stay public (src/app/api/db/route.ts).
// - Adding anything requires a signed-in user; the row records who added it.
// - Deleting is allowed for the person who added the row, or an admin (ADMIN_USER_IDS).
// - Sample rows have no owner, so only admins can delete them.

import { auth, currentUser } from "@clerk/nextjs/server";
import { getSql } from "@/lib/db";
import type { Item, Price, Review, Store } from "@/lib/types";


class AuthError extends Error {}

async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new AuthError("Sign in to make changes");
  return userId;
}

function isAdmin(userId: string | null) {
  if (!userId) return false;
  return (process.env.ADMIN_USER_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean).includes(userId);
}

/** Public display name: first name + last initial, or username. Never the email. */
async function displayName() {
  const u = await currentUser();
  if (!u) return "Shelfie user";
  const name = [u.firstName, u.lastName ? `${u.lastName[0]}.` : ""].filter(Boolean).join(" ");
  return (name || u.username || "Shelfie user").slice(0, 60);
}

/** Delete a row only if the caller owns it or is an admin. */
async function deleteOwned(table: "items" | "prices" | "reviews", rowId: string) {
  const userId = await requireUser();
  const sql = getSql();
  const admin = isAdmin(userId);
  // Table names can't be parameters, so each table gets its own fixed query.
  const rows = (await (table === "items"
    ? sql`DELETE FROM items WHERE id = ${rowId} AND (user_id = ${userId} OR ${admin}) RETURNING id`
    : table === "prices"
      ? sql`DELETE FROM prices WHERE id = ${rowId} AND (user_id = ${userId} OR ${admin}) RETURNING id`
      : sql`DELETE FROM reviews WHERE id = ${rowId} AND (user_id = ${userId} OR ${admin}) RETURNING id`)) as unknown[];
  if (!rows.length) throw new AuthError("You can only delete things you added");
}

/** Who is signed in, for showing edit/delete controls. Safe to expose. */
export async function getViewer() {
  const { userId } = await auth();
  return { userId: userId ?? null, isAdmin: isAdmin(userId ?? null) };
}

const ID = /^[a-z0-9-]{1,64}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const UNITS = new Set(["ml", "g", "pcs"]);

function text(v: unknown, max: number, field: string, required = false): string | null {
  if (v == null || v === "") {
    if (required) throw new Error(`${field} is required`);
    return null;
  }
  if (typeof v !== "string") throw new Error(`${field} must be text`);
  const s = v.trim();
  if (required && !s) throw new Error(`${field} is required`);
  if (s.length > max) throw new Error(`${field} is too long`);
  return s || null;
}
function id(v: unknown, field = "id") {
  if (typeof v !== "string" || !ID.test(v)) throw new Error(`Invalid ${field}`);
  return v;
}
function num(v: unknown, field: string, min: number, max: number) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < min || n > max) throw new Error(`Invalid ${field}`);
  return n;
}
function date(v: unknown) {
  if (typeof v !== "string" || !DATE.test(v) || Number.isNaN(Date.parse(v))) throw new Error("Invalid date");
  return v;
}
function imageUrl(v: unknown) {
  const s = text(v, 500, "Image URL");
  if (!s) return null;
  const u = new URL(s);
  if (u.protocol !== "https:") throw new Error("Image URL must be https");
  return u.toString();
}
function attrs(v: unknown) {
  if (v == null) return {};
  if (typeof v !== "object" || Array.isArray(v)) throw new Error("Invalid specs");
  const out: Record<string, string> = {};
  const entries = Object.entries(v as Record<string, unknown>);
  if (entries.length > 30) throw new Error("Too many specs");
  for (const [k, val] of entries) out[text(k, 60, "Spec name", true)!] = text(val, 200, "Spec value", true)!;
  return out;
}

export async function addItemAction(item: Omit<Item, "createdAt" | "userId">, prices: Pick<Price, "id" | "storeId" | "price" | "date">[]) {
  const userId = await requireUser();
  const sql = getSql();
  const itemId = id(item.id);
  if (!UNITS.has(item.unit)) throw new Error("Invalid unit");
  if (!Array.isArray(prices) || prices.length > 20) throw new Error("Invalid prices");
  const priceRows = prices.map((p) => ({ id: id(p.id), storeId: id(p.storeId, "store"), price: num(p.price, "price", 0.01, 1_000_000), date: date(p.date) }));
  await sql.transaction([
    sql`INSERT INTO items (id, user_id, name, name_th, brand, category, size, unit, barcode, emoji, image_url, attributes)
        VALUES (${itemId}, ${userId}, ${text(item.name, 160, "Name", true)}, ${text(item.nameTh, 160, "Thai name")}, ${text(item.brand, 80, "Brand") ?? ""},
                ${text(item.category, 60, "Category", true)}, ${num(item.size, "size", 0.001, 1_000_000)}, ${item.unit},
                ${text(item.barcode, 32, "Barcode")}, ${text(item.emoji, 16, "Icon")}, ${imageUrl(item.imageUrl)}, ${JSON.stringify(attrs(item.attributes))})`,
    ...priceRows.map((p) => sql`INSERT INTO prices (id, user_id, item_id, store_id, price, date) VALUES (${p.id}, ${userId}, ${itemId}, ${p.storeId}, ${p.price}, ${p.date})`),
  ]);
}

export async function deleteItemAction(itemId: string) {
  await deleteOwned("items", id(itemId));
}

export async function addPriceAction(p: Omit<Price, "userId">) {
  const userId = await requireUser();
  await getSql()`INSERT INTO prices (id, user_id, item_id, store_id, price, promo, date)
    VALUES (${id(p.id)}, ${userId}, ${id(p.itemId, "item")}, ${id(p.storeId, "store")}, ${num(p.price, "price", 0.01, 1_000_000)}, ${text(p.promo, 120, "Promo")}, ${date(p.date)})`;
}

export async function deletePriceAction(priceId: string) {
  await deleteOwned("prices", id(priceId));
}

/** One review per person per item: posting again replaces your earlier review. */
export async function addReviewAction(r: Omit<Review, "author" | "userId">) {
  const userId = await requireUser();
  const author = await displayName();
  await getSql()`INSERT INTO reviews (id, user_id, item_id, rating, title, body, author, store_id, date)
    VALUES (${id(r.id)}, ${userId}, ${id(r.itemId, "item")}, ${num(r.rating, "rating", 1, 5) | 0}, ${text(r.title, 120, "Title", true)},
            ${text(r.body, 4000, "Review") ?? ""}, ${author}, ${r.storeId ? id(r.storeId, "store") : null}, ${date(r.date)})
    ON CONFLICT (item_id, user_id) WHERE user_id IS NOT NULL DO UPDATE SET
      rating = EXCLUDED.rating, title = EXCLUDED.title, body = EXCLUDED.body, author = EXCLUDED.author,
      store_id = EXCLUDED.store_id, date = EXCLUDED.date`;
}

export async function deleteReviewAction(reviewId: string) {
  await deleteOwned("reviews", id(reviewId));
}

export async function addStoreAction(s: Omit<Store, "userId">) {
  const userId = await requireUser();
  if (!/^#[0-9a-f]{6}$/i.test(s.color)) throw new Error("Invalid color");
  await getSql()`INSERT INTO stores (id, user_id, name, color) VALUES (${id(s.id)}, ${userId}, ${text(s.name, 60, "Store name", true)}, ${s.color})`;
}
