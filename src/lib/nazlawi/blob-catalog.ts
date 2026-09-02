import { blobToken } from "./blob";

const PATH = "nazlawi/market-v2.json";
export const PRODUCT_PAGE = 6;

export type ShopRow = {
  id: string;
  merchant_phone: string;
  merchant_name: string;
  title: string;
  cover_url: string | null;
  promo_video_url: string | null;
  user_id: string;
  avatar_url: string | null;
  store_phone: string;
  bio: string;
};

export type CategoryRow = {
  id: string;
  shop_id: string;
  title: string;
};

export type ProductRow = {
  id: string;
  shop_id: string;
  category_id: string | null;
  title: string;
  description: string;
  price: string;
  qty: number;
  photo_url: string | null;
  created_at: string;
};

export type OfferRow = {
  id: string;
  shop_id: string;
  title: string;
  detail: string;
  photos: string[];
};

export type FeedRow = {
  id: string;
  shop_id: string;
  title: string;
  body: string;
  photo_url: string | null;
  photos: string[];
  kind: "market" | "deal";
  created_at: string;
};

export type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "rejected";

export type OrderRow = {
  id: string;
  shop_id: string;
  buyer_name: string;
  buyer_phone: string;
  pickup_at: string;
  status: OrderStatus | string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  title: string;
  qty: number;
  price: string;
};

export type CommentRow = {
  id: string;
  product_id: string;
  author_name: string;
  text: string;
};

export type MarketDB = {
  shops: ShopRow[];
  products: ProductRow[];
  offers: OfferRow[];
  orders: OrderRow[];
  items: OrderItemRow[];
  comments: CommentRow[];
  categories: CategoryRow[];
  feed: FeedRow[];
};

function empty(): MarketDB {
  return {
    shops: [],
    products: [],
    offers: [],
    orders: [],
    items: [],
    comments: [],
    categories: [],
    feed: [],
  };
}

export function hasBlob() {
  return Boolean(blobToken());
}

function hydrate(json: Partial<MarketDB>): MarketDB {
  return {
    shops: (json.shops ?? []).map((s) => ({
      ...s,
      promo_video_url: s.promo_video_url ?? null,
      user_id: s.user_id || s.merchant_phone,
      avatar_url: s.avatar_url ?? null,
      store_phone: s.store_phone || (s.merchant_phone?.includes("@") ? "" : s.merchant_phone) || "",
      bio: s.bio ?? "",
    })),
    products: (json.products ?? []).map((p) => ({
      ...p,
      category_id: p.category_id ?? null,
      qty: Number(p.qty ?? 0),
      created_at: p.created_at || new Date().toISOString(),
    })),
    offers: (json.offers ?? []).map((o) => ({ ...o, photos: o.photos ?? [] })),
    orders: json.orders ?? [],
    items: json.items ?? [],
    comments: json.comments ?? [],
    categories: json.categories ?? [],
    feed: (json.feed ?? []).map((f) => ({
      ...f,
      photos: f.photos?.length ? f.photos : f.photo_url ? [f.photo_url] : [],
      kind: f.kind === "deal" ? "deal" : "market",
    })),
  };
}

export async function loadMarket(): Promise<MarketDB> {
  const token = blobToken();
  if (!token) return empty();
  const { list } = await import("@vercel/blob");
  const { blobs } = await list({ prefix: PATH, token });
  const file = blobs.find((b) => b.pathname === PATH) ?? blobs[0];
  if (!file) return empty();
  const res = await fetch(file.url, { cache: "no-store" });
  if (!res.ok) return empty();
  return hydrate((await res.json()) as Partial<MarketDB>);
}

export async function saveMarket(db: MarketDB) {
  const token = blobToken();
  if (!token) return;
  const { put } = await import("@vercel/blob");
  await put(PATH, JSON.stringify(db), {
    access: "public",
    token,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export function pageSlice<T>(rows: T[], offset = 0, limit = PRODUCT_PAGE) {
  const start = Math.max(0, offset);
  const end = start + Math.max(1, limit);
  return {
    rows: rows.slice(start, end),
    total: rows.length,
    hasMore: end < rows.length,
  };
}
