import { blobToken } from "./blob";

const PATH = "nazlawi/market-v3.json";
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
  if (!token) return seedMarket();
  const { list } = await import("@vercel/blob");
  const { blobs } = await list({ prefix: PATH, token });
  const file = blobs.find((b) => b.pathname === PATH) ?? blobs[0];
  if (!file) {
    const seeded = seedMarket();
    await saveMarket(seeded);
    return seeded;
  }
  const res = await fetch(file.url, { cache: "no-store" });
  if (!res.ok) return seedMarket();
  const db = hydrate((await res.json()) as Partial<MarketDB>);
  if (db.shops.length === 0) {
    const seeded = seedMarket();
    await saveMarket(seeded);
    return seeded;
  }
  return db;
}

function seedMarket(): MarketDB {
  const now = new Date().toISOString();
  const img = ["/splash.jpg", "/login-bg.jpg", "/cover-nzlawi.jpg"];
  const shops: ShopRow[] = [
    {
      id: "shop-baqala",
      merchant_phone: "+966550000001",
      merchant_name: "أبو يوسف",
      title: "بقالة النزل",
      cover_url: img[0],
      promo_video_url: null,
      user_id: "shop-baqala",
      avatar_url: img[2],
      store_phone: "+966550000001",
      bio: "مواد غذائية وبيت العيش من قلب القرية",
    },
    {
      id: "shop-bakery",
      merchant_phone: "+966550000002",
      merchant_name: "العم حسن",
      title: "مخبز العم حسن",
      cover_url: img[1],
      promo_video_url: null,
      user_id: "shop-bakery",
      avatar_url: img[0],
      store_phone: "+966550000002",
      bio: "عيش فينو وطازج كل صباح",
    },
    {
      id: "shop-veg",
      merchant_phone: "+966550000003",
      merchant_name: "الحاجة فاطمة",
      title: "خضار الحاجة فاطمة",
      cover_url: img[2],
      promo_video_url: null,
      user_id: "shop-veg",
      avatar_url: img[1],
      store_phone: "+966550000003",
      bio: "خضار وفاكهة اليوم من الغيط",
    },
  ];
  return {
    shops,
    products: [
      { id: "p1", shop_id: "shop-baqala", category_id: "c1", title: "أرز مصري", description: "كيس 5 كيلو", price: "28", qty: 40, photo_url: img[0], created_at: now },
      { id: "p2", shop_id: "shop-baqala", category_id: "c1", title: "زيت عافية", description: "لتر ونص", price: "22", qty: 25, photo_url: img[2], created_at: now },
      { id: "p3", shop_id: "shop-bakery", category_id: "c2", title: "عيش فينو", description: "كيس 10 أرغفة", price: "8", qty: 60, photo_url: img[1], created_at: now },
      { id: "p4", shop_id: "shop-bakery", category_id: "c2", title: "فينو محشي", description: "بالجبنة", price: "12", qty: 20, photo_url: img[0], created_at: now },
      { id: "p5", shop_id: "shop-veg", category_id: "c3", title: "طماطم", description: "كيلو", price: "6", qty: 80, photo_url: img[2], created_at: now },
      { id: "p6", shop_id: "shop-veg", category_id: "c3", title: "خيار", description: "كيلو", price: "5", qty: 70, photo_url: img[1], created_at: now },
    ],
    offers: [
      { id: "o1", shop_id: "shop-baqala", title: "عرض المؤونة", detail: "أرز + زيت بـ 45", photos: img },
      { id: "o2", shop_id: "shop-bakery", title: "عيش الصباح", detail: "3 أكياس فينو بـ 20", photos: img },
    ],
    orders: [],
    items: [],
    comments: [],
    categories: [
      { id: "c1", shop_id: "shop-baqala", title: "مؤونة" },
      { id: "c2", shop_id: "shop-bakery", title: "مخبوزات" },
      { id: "c3", shop_id: "shop-veg", title: "خضار" },
    ],
    feed: [
      {
        id: "f1",
        shop_id: "shop-baqala",
        title: "بقالة النزل فتحت",
        body: "كل حاجة للبيت. ادخل المتجر واحجز الاستلام.",
        photo_url: img[0],
        photos: img,
        kind: "market",
        created_at: now,
      },
      {
        id: "f2",
        shop_id: "shop-bakery",
        title: "مخبز العم حسن",
        body: "العيش طالع سخن من الفرن.",
        photo_url: img[1],
        photos: [img[1], img[0], img[2]],
        kind: "market",
        created_at: now,
      },
      {
        id: "f3",
        shop_id: "shop-veg",
        title: "خضار اليوم",
        body: "من الغيط لباب البيت بعد الحجز.",
        photo_url: img[2],
        photos: [img[2], img[1], img[0]],
        kind: "market",
        created_at: now,
      },
      {
        id: "d1",
        shop_id: "shop-baqala",
        title: "عرض المؤونة",
        body: "أرز وزيت بسعر واحد. اضغط وادخل المتجر.",
        photo_url: img[0],
        photos: img,
        kind: "deal",
        created_at: now,
      },
      {
        id: "d2",
        shop_id: "shop-bakery",
        title: "عرض العيش",
        body: "3 أكياس فينو بسعر خاص للصباح.",
        photo_url: img[1],
        photos: [img[1], img[2], img[0]],
        kind: "deal",
        created_at: now,
      },
    ],
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

export function pageSlice<T>(rows: T[], offset = 0, limit = PRODUCT_PAGE) {
  const start = Math.max(0, offset);
  const end = start + Math.max(1, limit);
  return {
    rows: rows.slice(start, end),
    total: rows.length,
    hasMore: end < rows.length,
  };
}
