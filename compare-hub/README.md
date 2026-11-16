# เทียบก่อนซื้อ (compare-hub)

A web app for reviewing and comparing anything before you buy. The first vertical is
**ประกันชีวิตและประกันภัย** (life & general insurance).

```bash
npm install
npm run dev   # http://localhost:3200
```

## What's here

| Route | What it does |
|---|---|
| `/` | Categories (insurance live; credit cards / mobile plans marked "coming soon") and popular plans |
| `/c/[slug]` | Browse a category: search, filter by provider and budget, sort by premium / rating / coverage |
| `/p/[id]` | Plan detail: highlights, exclusions, full spec table, reviews (read + write) |
| `/compare` | Side-by-side table for up to 4 plans in one category, best value per row highlighted |
| `/buy/[id]` | "Interested in buying" form (lead for a licensed agent to call back) |

## Adding a new thing to compare

Everything is driven by data, so a new vertical needs no new UI:

1. Add a `Category` to `src/lib/categories.ts` with its `fields` (each field says
   its type and whether `higher` or `lower` is better — that drives the compare highlights).
2. Add `Product`s with matching `specs` keys to `src/lib/products.ts`.

## Not production-ready yet

- **All providers, plans and premiums are fictional sample data.** Replace them with real,
  licensed product data before going live.
- Reviews, the compare list and purchase leads are stored in the browser's `localStorage`
  only. Leads do not reach any insurer or broker. Before launch, add a database and send leads to a
  licensed broker or agent (in Thailand selling insurance needs an OIC licence).
