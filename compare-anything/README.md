# เทียบหมด (compare-anything)

Review and compare anything — starting with **cars of every type** (eco, sedan, SUV, PPV, pickup, MPV, sports × petrol, diesel, hybrid, plug-in hybrid, EV), all comparable against each other.

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
Add a `Category` (fields + filters) in `src/lib/categories.ts` and its items in `src/lib/items.ts`. Car data lives in `src/lib/cars.ts`; prices/specs are approximate demo values.
