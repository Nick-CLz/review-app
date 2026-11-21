# เทียบหมด (compare-anything)

Review and compare anything — starting with **cars of every type** (eco, sedan, SUV, PPV, pickup, MPV, sports × petrol, diesel, hybrid, plug-in hybrid, EV) and **motorcycles** (family, scooter, maxi-scooter, sport, classic × petrol, EV). Items of different types are comparable within a category.

```bash
npm install
npm run dev   # http://localhost:3300
```

## Features
- Browse with filters (body type, powertrain, budget, seats), search, and sorting
- Spec-based scores (economy, performance, practicality, safety, price) relative to every car
- Side-by-side compare of up to 4 items across types, winners highlighted, "differences only", shareable `/compare?ids=a,b`
- Car finder quiz (`/finder`): budget, seats, daily km, home charging, use and priorities → ranked matches with reasons
- Radar chart of the five scores and a cost-over-time chart with payback estimates on the compare page
- Cost-of-ownership calculator (price + fuel/electricity + servicing) with editable energy prices
- User reviews (stored in the browser for now)

## Adding a new category
1. Define a `Category` in `src/lib/categories.ts`: spec `fields`, `filters`, `typeKey` (drives artwork and grouping), `scoreDims` (which specs feed each 1–10 score), `verdicts`, `cardStats`, and optionally `maintenancePerYear` to enable the running-cost calculator.
2. Add its items (e.g. `src/lib/motorcycles.ts`) and register them in `ITEMS` in `src/lib/items.ts`.
3. Add artwork in `src/components/ItemArt.tsx` (or reuse an existing one).

The compare list holds one category at a time. Car and motorcycle data in `src/lib/cars.ts` and `src/lib/motorcycles.ts` are approximate demo values.
