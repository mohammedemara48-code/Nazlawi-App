create table if not exists shops (
  id text primary key,
  merchant_phone text not null unique,
  merchant_name text not null,
  title text not null,
  cover_url text,
  created_at timestamptz not null default now()
);

create table if not exists shop_products (
  id text primary key,
  shop_id text not null,
  title text not null,
  description text not null default '',
  price numeric not null default 0,
  photo_url text,
  created_at timestamptz not null default now()
);
create index if not exists shop_products_shop_id_idx on shop_products (shop_id);

create table if not exists shop_offers (
  id text primary key,
  shop_id text not null,
  title text not null,
  detail text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists shop_offers_shop_id_idx on shop_offers (shop_id);

create table if not exists shop_orders (
  id text primary key,
  shop_id text not null,
  buyer_name text not null,
  buyer_phone text not null,
  pickup_at text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
create index if not exists shop_orders_shop_id_idx on shop_orders (shop_id);

create table if not exists shop_order_items (
  id text primary key,
  order_id text not null,
  product_id text not null,
  title text not null,
  qty integer not null default 1,
  price numeric not null default 0
);
create index if not exists shop_order_items_order_id_idx on shop_order_items (order_id);

create table if not exists shop_comments (
  id text primary key,
  product_id text not null,
  author_name text not null,
  text text not null,
  created_at timestamptz not null default now()
);
create index if not exists shop_comments_product_id_idx on shop_comments (product_id);
