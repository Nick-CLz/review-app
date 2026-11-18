# Shelfie — review & compare anything

Next.js app for reviewing products and comparing prices across stores. It starts with 20 everyday SKUs at **Big C** and **7-Eleven**.

```bash
npm install
vercel env pull .env.local --yes   # DATABASE_URL for the Neon database
npm run db:setup                   # create tables + load sample data (safe to re-run)
npm run dev                        # http://localhost:3000
```

## Features
- **Browse**: search (English, Thai, brand, barcode), filter by category and store, sort by rating, price, unit price or the gap between stores.
- **Item page**: latest price at each store, the cheaper store and how much you save, price per 100 ml / 100 g / piece, a price log with promos and dates, and star reviews with a rating breakdown.
- **Compare**: up to 4 items side by side. The best value in each row is highlighted, with a quick verdict (best value, best rated, which store wins).
- **Add anything**: free-form category, custom specs (key/value), extra stores (Lotus's, Tops, Makro…).
- **Real products**: on the Add page, search [Open Food Facts](https://world.openfoodfacts.org) by name (English or Thai) or barcode to fill in the name, brand, size, barcode and front photo. 8 of the 20 sample items have real barcodes and photos, each checked by eye.
- **Data**: download a JSON backup.

## Notes
- Items, prices, reviews and stores are kept in a shared **Neon Postgres** database (Vercel project `shelfie`, resource `shelfie-db`). Each browser polls for changes every 20 s and when the tab regains focus.
- The compare list is personal and stays in the browser's `localStorage`.
- **Login (Clerk)**: anyone can browse, but adding items, prices, reviews or stores requires signing in (Google or email). Every write is checked on the server in `src/app/actions.ts`.
  - Each person gets one review per item; posting again updates it. The author name comes from the account (first name + last initial), never the email.
  - People can delete only what they added. Sample data has no owner, so only admins can delete it.
  - Admins: add Clerk user IDs (e.g. `user_abc…`), comma-separated, to the `ADMIN_USER_IDS` environment variable (in `.env.local` and on Vercel).
- Seed prices in `src/lib/seed.ts` are **sample values only**, not live store prices.

- Open Food Facts is crowd-sourced (data ODbL, photos CC BY-SA): it can be wrong. For example, one MAMA barcode has the Yum Yum brand as its Thai name. Photos are credited on each item page.
- Prices are never pulled from Big C or 7-Eleven sites: they have no public API, and their photos and data belong to them. Prices come from what users see on the shelf.

## Layout
- `src/lib/types.ts`: data model (Store, Item, Price, Review)
- `db/schema.sql`, `scripts/setup-db.mts`: tables and seeding
- `src/lib/db.ts`, `src/app/api/db/route.ts`: server reads
- `src/app/actions.ts`: validated server writes
- `src/lib/off.ts`, `src/app/api/lookup/route.ts`: Open Food Facts search and barcode lookup
- `src/proxy.ts`, `src/components/auth.tsx`: Clerk session, sign-in buttons, `useViewer()`
- `src/lib/store.ts`: client store (optimistic updates and sync)
- `src/lib/stats.ts`: unit price, best price, ratings
- `src/app/*`: pages (`/`, `/items/[id]`, `/compare`, `/add`, `/data`)
