alter table shops add column if not exists user_id text;
alter table shops add column if not exists promo_video_url text;

create table if not exists shop_categories (
  id text primary key,
  shop_id text not null,
  title text not null,
  created_at timestamptz not null default now()
);
create index if not exists shop_categories_shop_id_idx on shop_categories (shop_id);

alter table shop_products add column if not exists category_id text;
alter table shop_products add column if not exists qty integer not null default 0;
create index if not exists shop_products_shop_created_idx on shop_products (shop_id, created_at desc);

create table if not exists shop_feed (
  id text primary key,
  shop_id text not null,
  title text not null,
  body text not null default '',
  photo_url text,
  created_at timestamptz not null default now()
);
create index if not exists shop_feed_shop_id_idx on shop_feed (shop_id);
create index if not exists shop_feed_created_idx on shop_feed (created_at desc);

create index if not exists shop_orders_shop_status_idx on shop_orders (shop_id, status);
create index if not exists shops_user_id_idx on shops (user_id);
