import { blobToken } from "./blob";

const PATH = "nazlawi/market-v2.json";

export type ShopRow = {
  id: string;
  merchant_phone: string;
  merchant_name: string;
  title: string;
  cover_url: string | null;
};

export type ProductRow = {
  id: string;
  shop_id: string;
  title: string;
  description: string;
  price: string;
  photo_url: string | null;
};

export type OfferRow = {
  id: string;
  shop_id: string;
  title: string;
  detail: string;
};

export type OrderRow = {
  id: string;
  shop_id: string;
  buyer_name: string;
  buyer_phone: string;
  pickup_at: string;
  status: string;
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
};

function empty(): MarketDB {
  return { shops: [], products: [], offers: [], orders: [], items: [], comments: [] };
}

export function hasBlob() {
  return Boolean(blobToken());
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
  const json = (await res.json()) as Partial<MarketDB>;
  return {
    shops: json.shops ?? [],
    products: json.products ?? [],
    offers: json.offers ?? [],
    orders: json.orders ?? [],
    items: json.items ?? [],
    comments: json.comments ?? [],
  };
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
