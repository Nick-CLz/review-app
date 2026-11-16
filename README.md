# Shelfie — review & compare anything

Next.js app for reviewing products and comparing prices across stores. It starts with 20 everyday SKUs at **Big C** and **7-Eleven**.

```bash
npm install
npm run dev   # http://localhost:3000
```

## Features
- **Browse**: search (English, Thai, brand, barcode), filter by category and store, sort by rating, price, unit price or the gap between stores.
- **Item page**: latest price at each store, the cheaper store and how much you save, price per 100 ml / 100 g / piece, a price log with promos and dates, and star reviews with a rating breakdown.
- **Compare**: up to 4 items side by side. The best value in each row is highlighted, with a quick verdict (best value, best rated, which store wins).
- **Add anything**: free-form category, custom specs (key/value), extra stores (Lotus's, Tops, Makro…).
- **Data**: export and import as JSON, or reset to the sample data.

## Notes
- The data is stored in the browser (`localStorage`); there is no backend yet.
- Seed prices in `src/lib/seed.ts` are **sample values only**, not live store prices.

## Layout
- `src/lib/types.ts`: data model (Store, Item, Price, Review)
- `src/lib/store.ts`: client store and actions
- `src/lib/stats.ts`: unit price, best price, ratings
- `src/app/*`: pages (`/`, `/items/[id]`, `/compare`, `/add`, `/data`)
