import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import {
  hasBlob,
  loadMarket,
  pageSlice,
  PRODUCT_PAGE,
  saveMarket,
  type CategoryRow,
  type CommentRow,
  type FeedRow,
  type OfferRow,
  type OrderItemRow,
  type OrderRow,
  type OrderStatus,
  type ProductRow,
  type ShopRow,
} from "./blob-catalog";

export type {
  CategoryRow,
  CommentRow,
  FeedRow,
  OfferRow,
  OrderItemRow,
  OrderRow,
  OrderStatus,
  ProductRow,
  ShopRow,
};
export { PRODUCT_PAGE };

const nid = () => crypto.randomUUID();

function ownerOf(shop: ShopRow | null | undefined, phone: string) {
  return Boolean(shop && shop.merchant_phone === phone);
}

async function writeOrderStatus(orderId: string, phone: string, status: OrderStatus) {
  if (hasBlob()) {
    const db = await loadMarket();
    const order = db.orders.find((o) => o.id === orderId);
    const shop = order ? db.shops.find((s) => s.id === order.shop_id) : null;
    if (!ownerOf(shop, phone)) return { ok: false as const };
    db.orders = db.orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    await saveMarket(db);
    return { ok: true as const };
  }
  const sql = await getSql();
  await sql`update shop_orders set status = ${status} where id = ${orderId} and shop_id in (select id from shops where merchant_phone = ${phone})`;
  return { ok: true as const };
}

export const listShops = createServerFn({ method: "POST" }).handler(async () => {
  if (hasBlob()) {
    const db = await loadMarket();
    return db.shops;
  }
  const sql = await getSql();
  return sql<ShopRow>`select id, merchant_phone, merchant_name, title, cover_url from shops order by created_at desc`;
});

export const listMarketFeed = createServerFn({ method: "POST" }).handler(async () => {
  if (hasBlob()) {
    const db = await loadMarket();
    return db.feed
      .slice()
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 40)
      .map((row) => ({
        ...row,
        shop: db.shops.find((s) => s.id === row.shop_id) ?? null,
      }));
  }
  return [];
});

export const ensureShop = createServerFn({ method: "POST" })
  .validator((d: { phone: string; name: string; userId?: string }) => d)
  .handler(async ({ data }) => {
    const phone = String(data.phone ?? "").slice(0, 80);
    const name = String(data.name ?? "").slice(0, 80);
    if (!phone || !name) return null;
    if (hasBlob()) {
      const db = await loadMarket();
      const existing = db.shops.find((s) => s.merchant_phone === phone);
      if (existing) return existing;
      const shop: ShopRow = {
        id: nid(),
        merchant_phone: phone,
        merchant_name: name,
        title: `متجر ${name}`,
        cover_url: null,
        promo_video_url: null,
        user_id: String(data.userId || phone),
      };
      db.shops.unshift(shop);
      await saveMarket(db);
      return shop;
    }
    const sql = await getSql();
    const existing = await sql<ShopRow>`select id, merchant_phone, merchant_name, title, cover_url from shops where merchant_phone = ${phone} limit 1`;
    if (existing[0]) return existing[0];
    const shop: ShopRow = {
      id: nid(),
      merchant_phone: phone,
      merchant_name: name,
      title: `متجر ${name}`,
      cover_url: null,
      promo_video_url: null,
      user_id: String(data.userId || phone),
    };
    await sql`insert into shops (id, merchant_phone, merchant_name, title) values (${shop.id}, ${shop.merchant_phone}, ${shop.merchant_name}, ${shop.title})`;
    return shop;
  });

export const getShopCatalog = createServerFn({ method: "POST" })
  .validator((d: { shopId: string; offset?: number; limit?: number }) => d)
  .handler(async ({ data }) => {
    const shopId = String(data.shopId ?? "");
    const offset = Number(data.offset ?? 0) || 0;
    const limit = Number(data.limit ?? PRODUCT_PAGE) || PRODUCT_PAGE;
    if (hasBlob()) {
      const db = await loadMarket();
      const shop = db.shops.find((s) => s.id === shopId) ?? null;
      const all = db.products.filter((p) => p.shop_id === shopId);
      const page = pageSlice(all, offset, limit);
      return {
        shop,
        products: page.rows,
        total: page.total,
        hasMore: page.hasMore,
        offers: db.offers.filter((o) => o.shop_id === shopId),
        comments: db.comments.filter((c) => all.some((p) => p.id === c.product_id)),
        categories: db.categories.filter((c) => c.shop_id === shopId),
        feed: db.feed.filter((f) => f.shop_id === shopId),
      };
    }
    const sql = await getSql();
    const shops = await sql<ShopRow>`select id, merchant_phone, merchant_name, title, cover_url from shops where id = ${shopId} limit 1`;
    const shop = shops[0] ?? null;
    const products = shop
      ? await sql.query<ProductRow>(
          "select id, shop_id, title, description, price, photo_url from shop_products where shop_id = $1 order by created_at desc limit $2 offset $3",
          [shopId, limit, offset],
        )
      : [];
    const offers = shop
      ? await sql.query<OfferRow>(
          "select id, shop_id, title, detail from shop_offers where shop_id = $1 order by created_at desc",
          [shopId],
        )
      : [];
    const comments = shop
      ? await sql.query<CommentRow>(
          "select id, product_id, author_name, text from shop_comments where product_id in (select id from shop_products where shop_id = $1) order by created_at",
          [shopId],
        )
      : [];
    return {
      shop,
      products,
      total: products.length,
      hasMore: products.length === limit,
      offers,
      comments,
      categories: [] as CategoryRow[],
      feed: [] as FeedRow[],
    };
  });

export const addShopProduct = createServerFn({ method: "POST" })
  .validator(
    (d: {
      shopId: string;
      phone: string;
      title: string;
      description: string;
      price: number;
      qty?: number;
      categoryId?: string;
      photoUrl?: string;
    }) => d,
  )
  .handler(async ({ data }) => {
    try {
      const title = String(data.title ?? "").slice(0, 80);
      if (!title) return { ok: false as const, error: "title" };
      const photo = data.photoUrl ? String(data.photoUrl).slice(0, 2000) : null;
      if (hasBlob()) {
        const db = await loadMarket();
        const shop = db.shops.find((s) => s.id === data.shopId);
        if (!shop) return { ok: false as const, error: "shop" };
        if (shop.merchant_phone !== String(data.phone)) return { ok: false as const, error: "phone" };
        const id = nid();
        db.products.unshift({
          id,
          shop_id: shop.id,
          category_id: data.categoryId ? String(data.categoryId) : null,
          title,
          description: String(data.description ?? "").slice(0, 240),
          price: String(Number(data.price) || 0),
          qty: Math.max(0, Number(data.qty) || 0),
          photo_url: photo,
          created_at: new Date().toISOString(),
        });
        await saveMarket(db);
        return { ok: true as const, id, count: db.products.filter((p) => p.shop_id === shop.id).length };
      }
      const sql = await getSql();
      const shops = await sql<{ id: string; merchant_phone: string }>`select id, merchant_phone from shops where id = ${String(data.shopId)} limit 1`;
      const shop = shops[0];
      if (!shop) return { ok: false as const, error: "shop" };
      if (shop.merchant_phone !== String(data.phone)) return { ok: false as const, error: "phone" };
      const id = nid();
      await sql.query(
        "insert into shop_products (id, shop_id, title, description, price, photo_url) values ($1,$2,$3,$4,$5,$6)",
        [id, shop.id, title, String(data.description ?? "").slice(0, 240), Number(data.price) || 0, photo],
      );
      return { ok: true as const, id, count: 1 };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "fail" };
    }
  });

export const deleteShopProduct = createServerFn({ method: "POST" })
  .validator((d: { productId: string; phone: string }) => d)
  .handler(async ({ data }) => {
    if (hasBlob()) {
      const db = await loadMarket();
      const product = db.products.find((p) => p.id === data.productId);
      const shop = product ? db.shops.find((s) => s.id === product.shop_id) : null;
      if (!ownerOf(shop, data.phone)) return { ok: false as const };
      db.products = db.products.filter((p) => p.id !== data.productId);
      db.comments = db.comments.filter((c) => c.product_id !== data.productId);
      await saveMarket(db);
      return { ok: true as const };
    }
    const sql = await getSql();
    await sql`delete from shop_products where id = ${data.productId} and shop_id in (select id from shops where merchant_phone = ${data.phone})`;
    return { ok: true as const };
  });

export const addShopCategory = createServerFn({ method: "POST" })
  .validator((d: { shopId: string; phone: string; title: string }) => d)
  .handler(async ({ data }) => {
    const title = String(data.title ?? "").trim().slice(0, 40);
    if (!title) return { ok: false as const };
    if (hasBlob()) {
      const db = await loadMarket();
      const shop = db.shops.find((s) => s.id === data.shopId);
      if (!ownerOf(shop, data.phone)) return { ok: false as const };
      db.categories.push({ id: nid(), shop_id: shop!.id, title });
      await saveMarket(db);
      return { ok: true as const };
    }
    return { ok: true as const };
  });

export const addShopOffer = createServerFn({ method: "POST" })
  .validator((d: { shopId: string; phone: string; title: string; detail: string }) => d)
  .handler(async ({ data }) => {
    if (hasBlob()) {
      const db = await loadMarket();
      const shop = db.shops.find((s) => s.id === data.shopId);
      if (!ownerOf(shop, data.phone)) return { ok: false as const };
      db.offers.unshift({
        id: nid(),
        shop_id: shop!.id,
        title: String(data.title ?? "").slice(0, 80),
        detail: String(data.detail ?? "").slice(0, 240),
      });
      await saveMarket(db);
      return { ok: true as const };
    }
    const sql = await getSql();
    const shops = await sql<{ id: string; merchant_phone: string }>`select id, merchant_phone from shops where id = ${data.shopId} limit 1`;
    const shop = shops[0];
    if (!shop || shop.merchant_phone !== data.phone) return { ok: false as const };
    await sql`insert into shop_offers (id, shop_id, title, detail) values (${nid()}, ${shop.id}, ${data.title.slice(0, 80)}, ${data.detail.slice(0, 240)})`;
    return { ok: true as const };
  });

export const setShopPromo = createServerFn({ method: "POST" })
  .validator((d: { shopId: string; phone: string; videoUrl: string }) => d)
  .handler(async ({ data }) => {
    if (hasBlob()) {
      const db = await loadMarket();
      const shop = db.shops.find((s) => s.id === data.shopId);
      if (!ownerOf(shop, data.phone)) return { ok: false as const };
      db.shops = db.shops.map((s) =>
        s.id === data.shopId ? { ...s, promo_video_url: String(data.videoUrl).slice(0, 2000) } : s,
      );
      await saveMarket(db);
      return { ok: true as const };
    }
    return { ok: true as const };
  });

export const addShopFeed = createServerFn({ method: "POST" })
  .validator((d: { shopId: string; phone: string; title: string; body: string; photoUrl?: string }) => d)
  .handler(async ({ data }) => {
    const title = String(data.title ?? "").trim().slice(0, 80);
    if (!title) return { ok: false as const };
    if (hasBlob()) {
      const db = await loadMarket();
      const shop = db.shops.find((s) => s.id === data.shopId);
      if (!ownerOf(shop, data.phone)) return { ok: false as const };
      db.feed.unshift({
        id: nid(),
        shop_id: shop!.id,
        title,
        body: String(data.body ?? "").slice(0, 240),
        photo_url: data.photoUrl ? String(data.photoUrl).slice(0, 2000) : null,
        created_at: new Date().toISOString(),
      });
      await saveMarket(db);
      return { ok: true as const };
    }
    return { ok: true as const };
  });

export const placeShopOrder = createServerFn({ method: "POST" })
  .validator(
    (d: {
      shopId: string;
      buyerName: string;
      buyerPhone: string;
      pickupAt: string;
      items: { productId: string; title: string; qty: number; price: number }[];
    }) => d,
  )
  .handler(async ({ data }) => {
    if (!data.items?.length) return { ok: false as const };
    const id = nid();
    if (hasBlob()) {
      const db = await loadMarket();
      db.orders.unshift({
        id,
        shop_id: data.shopId,
        buyer_name: String(data.buyerName).slice(0, 80),
        buyer_phone: String(data.buyerPhone).slice(0, 80),
        pickup_at: String(data.pickupAt).slice(0, 40),
        status: "pending",
      });
      for (const item of data.items) {
        db.items.push({
          id: nid(),
          order_id: id,
          product_id: item.productId,
          title: String(item.title).slice(0, 80),
          qty: Math.max(1, Number(item.qty) || 1),
          price: String(Number(item.price) || 0),
        });
        db.products = db.products.map((p) =>
          p.id === item.productId ? { ...p, qty: Math.max(0, p.qty - Math.max(1, Number(item.qty) || 1)) } : p,
        );
      }
      await saveMarket(db);
      return { ok: true as const, id };
    }
    const sql = await getSql();
    await sql`insert into shop_orders (id, shop_id, buyer_name, buyer_phone, pickup_at, status) values (${id}, ${data.shopId}, ${data.buyerName.slice(0, 80)}, ${data.buyerPhone.slice(0, 32)}, ${data.pickupAt.slice(0, 40)}, ${"pending"})`;
    for (const item of data.items) {
      await sql`insert into shop_order_items (id, order_id, product_id, title, qty, price) values (${nid()}, ${id}, ${item.productId}, ${item.title.slice(0, 80)}, ${Math.max(1, Number(item.qty) || 1)}, ${Number(item.price) || 0})`;
    }
    return { ok: true as const, id };
  });

export const listShopOrders = createServerFn({ method: "POST" })
  .validator((d: { shopId: string; phone: string }) => d)
  .handler(async ({ data }) => {
    if (hasBlob()) {
      const db = await loadMarket();
      const shop = db.shops.find((s) => s.id === data.shopId);
      if (!ownerOf(shop, data.phone)) return { orders: [] as OrderRow[], items: [] as OrderItemRow[] };
      const orders = db.orders.filter((o) => o.shop_id === shop!.id);
      const items = db.items.filter((i) => orders.some((o) => o.id === i.order_id));
      return { orders, items };
    }
    const sql = await getSql();
    const shops = await sql<{ id: string; merchant_phone: string }>`select id, merchant_phone from shops where id = ${data.shopId} limit 1`;
    const shop = shops[0];
    if (!shop || shop.merchant_phone !== data.phone) return { orders: [] as OrderRow[], items: [] as OrderItemRow[] };
    const orders = await sql<OrderRow>`select id, shop_id, buyer_name, buyer_phone, pickup_at, status from shop_orders where shop_id = ${shop.id} order by created_at desc`;
    const items = await sql<OrderItemRow>`select id, order_id, product_id, title, qty, price from shop_order_items where order_id in (select id from shop_orders where shop_id = ${shop.id})`;
    return { orders, items };
  });

export const setShopOrderStatus = createServerFn({ method: "POST" })
  .validator((d: { orderId: string; phone: string; status: OrderStatus }) => d)
  .handler(async ({ data }) => writeOrderStatus(data.orderId, data.phone, data.status));

export const acceptShopOrder = createServerFn({ method: "POST" })
  .validator((d: { orderId: string; phone: string }) => d)
  .handler(async ({ data }) => writeOrderStatus(data.orderId, data.phone, "completed"));

export const addProductComment = createServerFn({ method: "POST" })
  .validator((d: { productId: string; authorName: string; text: string }) => d)
  .handler(async ({ data }) => {
    const text = String(data.text ?? "").trim().slice(0, 240);
    if (!text) return { ok: false as const };
    if (hasBlob()) {
      const db = await loadMarket();
      db.comments.push({
        id: nid(),
        product_id: data.productId,
        author_name: String(data.authorName).slice(0, 80),
        text,
      });
      await saveMarket(db);
      return { ok: true as const };
    }
    const sql = await getSql();
    await sql`insert into shop_comments (id, product_id, author_name, text) values (${nid()}, ${data.productId}, ${data.authorName.slice(0, 80)}, ${text})`;
    return { ok: true as const };
  });
