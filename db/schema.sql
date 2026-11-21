CREATE TABLE IF NOT EXISTS stores (
  id    text PRIMARY KEY,
  name  text NOT NULL,
  color text NOT NULL DEFAULT '#2563eb'
);

CREATE TABLE IF NOT EXISTS items (
  id         text PRIMARY KEY,
  name       text NOT NULL,
  name_th    text,
  brand      text NOT NULL DEFAULT '',
  category   text NOT NULL,
  size       numeric NOT NULL CHECK (size > 0),
  unit       text NOT NULL CHECK (unit IN ('ml', 'g', 'pcs')),
  barcode    text,
  emoji      text,
  image_url  text,
  attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at date NOT NULL DEFAULT current_date
);
CREATE INDEX IF NOT EXISTS items_barcode_idx ON items (barcode);

CREATE TABLE IF NOT EXISTS prices (
  id       text PRIMARY KEY,
  item_id  text NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  store_id text NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  price    numeric NOT NULL CHECK (price > 0),
  promo    text,
  date     date NOT NULL DEFAULT current_date
);
CREATE INDEX IF NOT EXISTS prices_item_idx ON prices (item_id);

CREATE TABLE IF NOT EXISTS reviews (
  id       text PRIMARY KEY,
  item_id  text NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  rating   int  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title    text NOT NULL,
  body     text NOT NULL DEFAULT '',
  author   text NOT NULL DEFAULT '',
  store_id text REFERENCES stores(id) ON DELETE SET NULL,
  date     date NOT NULL DEFAULT current_date
);
CREATE INDEX IF NOT EXISTS reviews_item_idx ON reviews (item_id);

-- Ownership (added with login). NULL = sample data, which only admins can delete.
ALTER TABLE stores  ADD COLUMN IF NOT EXISTS user_id text;
ALTER TABLE items   ADD COLUMN IF NOT EXISTS user_id text;
ALTER TABLE prices  ADD COLUMN IF NOT EXISTS user_id text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_id text;
-- One review per person per item (posting again edits it)
CREATE UNIQUE INDEX IF NOT EXISTS reviews_one_per_user ON reviews (item_id, user_id) WHERE user_id IS NOT NULL;
