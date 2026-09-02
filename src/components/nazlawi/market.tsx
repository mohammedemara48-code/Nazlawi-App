import { useEffect, useMemo, useState } from "react";
import { Phone, ShoppingBasket, Store, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  addProductComment,
  deleteShopProduct,
  ensureShop,
  getShopCatalog,
  listMarketFeed,
  listShopOrders,
  listShops,
  placeShopOrder,
  PRODUCT_PAGE,
  type CategoryRow,
  type CommentRow,
  type FeedRow,
  type OfferRow,
  type OrderItemRow,
  type OrderRow,
  type ProductRow,
  type ShopRow,
} from "@/lib/nazlawi/market-fns";
import { useNazlawi } from "@/lib/nazlawi/store";
import { MerchantDashboard } from "./merchant";

function accountKey(email?: string, phone?: string) {
  return email || phone || "";
}

function publicPhone(shop: { store_phone?: string; merchant_phone: string }) {
  if (shop.store_phone) return shop.store_phone;
  return shop.merchant_phone.includes("@") ? "" : shop.merchant_phone;
}

function ImageSlider({ photos }: { photos: string[] }) {
  const [i, setI] = useState(0);
  const shots = photos.filter(Boolean).slice(0, 3);
  if (!shots.length) return null;
  return (
    <div className="relative">
      <img src={shots[i]} alt="" className="h-44 w-full object-cover" />
      {shots.length > 1 ? (
        <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1">
          {shots.map((_, n) => (
            <button
              key={n}
              className={`h-1.5 rounded-full ${n === i ? "w-5 bg-white" : "w-1.5 bg-white/50"}`}
              onClick={(e) => {
                e.stopPropagation();
                setI(n);
              }}
            />
          ))}
        </div>
      ) : null}
      {shots.length > 1 ? (
        <button
          className="absolute inset-y-0 left-0 w-1/3"
          aria-label="التالي"
          onClick={(e) => {
            e.stopPropagation();
            setI((n) => (n + 1) % shots.length);
          }}
        />
      ) : null}
    </div>
  );
}

export function MarketScreen() {
  const me = useNazlawi((s) => s.currentUser);
  const shopId = useNazlawi((s) => s.shopId);
  const setShopId = useNazlawi((s) => s.setShopId);
  const setErrorToast = useNazlawi((s) => s.setToast);
  const followMerchant = useNazlawi((s) => s.followMerchant);
  const follows = useNazlawi((s) => s.follows);
  const [shops, setShops] = useState<ShopRow[]>([]);
  const [feed, setFeed] = useState<Awaited<ReturnType<typeof listMarketFeed>>>([]);

  async function reloadMarket() {
    try {
      const [shopRows, feedRows] = await Promise.all([listShops(), listMarketFeed()]);
      setShops(shopRows ?? []);
      setFeed(feedRows ?? []);
    } catch (err) {
      setErrorToast(err instanceof Error ? err.message : "تعذر تحميل السوق");
    }
  }

  useEffect(() => {
    void reloadMarket();
  }, []);

  async function openMyShop() {
    if (!me || (me.role !== "merchant" && me.role !== "admin")) return;
    try {
      const shop = await ensureShop({
        data: { phone: accountKey(me.email, me.phone), name: me.name, userId: me.id },
      });
      if (shop?.id) {
        setShopId(shop.id);
        return;
      }
      setErrorToast("تعذر فتح المتجر");
    } catch (err) {
      setErrorToast(err instanceof Error ? err.message : "تعذر فتح المتجر");
    }
  }

  useEffect(() => {
    if (!shopId && me && (me.role === "merchant" || me.role === "admin")) {
      void openMyShop();
    }
  }, [shopId, me?.id]);

  if (me && (me.role === "merchant" || me.role === "admin") && !shopId) {
    return <p className="py-10 text-center text-sm text-muted-foreground">جاري فتح متجرك</p>;
  }

  if (shopId) return <ShopPage shopId={shopId} onBack={() => setShopId(null)} />;

  return (
    <div className="flex flex-col gap-3">
      {feed.map((post) => {
        const key = post.shop?.user_id || post.shop?.merchant_phone || "";
        const following = Boolean(me && key && follows.some((f) => f.followerId === me.id && f.merchantKey === key));
        const photos = post.photos?.length ? post.photos : post.photo_url ? [post.photo_url] : [];
        return (
          <div key={post.id} className="overflow-hidden rounded-2xl bg-card text-right shadow-sm">
            <div className="flex items-center justify-between px-4 pt-3">
              <button className="font-extrabold" onClick={() => post.shop?.id && setShopId(post.shop.id)}>
                {post.shop?.title ?? "المتجر"}
              </button>
              {me && key ? (
                <Button
                  size="sm"
                  variant={following ? "secondary" : "default"}
                  onClick={() => followMerchant(key)}
                >
                  {following ? "متابعة" : "اهتمام بالمتجر"}
                </Button>
              ) : null}
            </div>
            <button className="w-full text-right" onClick={() => post.shop?.id && setShopId(post.shop.id)}>
              {post.video_url ? (
                <video src={post.video_url} className="h-44 w-full object-cover" muted playsInline controls />
              ) : (
                <ImageSlider photos={photos} />
              )}
              <div className="p-4">
                <p className="font-extrabold">{post.title}</p>
                <p className="text-sm text-muted-foreground">{post.body || post.shop?.bio}</p>
              </div>
            </button>
          </div>
        );
      })}

      {shops.map((shop) => (
        <button
          key={shop.id}
          className="overflow-hidden rounded-2xl bg-card text-right shadow-sm"
          onClick={() => setShopId(shop.id)}
        >
          {shop.cover_url ? (
            <img src={shop.cover_url} alt="" className="h-28 w-full object-cover" />
          ) : (
            <div className="flex h-20 items-center justify-center bg-sand text-primary">
              <Store className="size-8" />
            </div>
          )}
          <div className="p-4">
            <p className="font-extrabold">{shop.title}</p>
            <p className="text-sm text-muted-foreground">{shop.merchant_name}</p>
          </div>
        </button>
      ))}
      {shops.length === 0 && feed.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">السوق فاضي</p>
      ) : null}
    </div>
  );
}

function ShopPage({ shopId, onBack }: { shopId: string; onBack: () => void }) {
  const me = useNazlawi((s) => s.currentUser);
  const setToast = useNazlawi((s) => s.setToast);
  const addToCart = useNazlawi((s) => s.addToCart);
  const followMerchant = useNazlawi((s) => s.followMerchant);
  const follows = useNazlawi((s) => s.follows);
  const cartRefFor = useNazlawi((s) => s.cartRefFor);
  const sendShopCart = useNazlawi((s) => s.sendShopCart);
  const [shop, setShop] = useState<ShopRow | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [feed, setFeed] = useState<FeedRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItemRow[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [pickup, setPickup] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [filter, setFilter] = useState("");
  const key = accountKey(me?.email, me?.phone);
  const owner = Boolean(me && shop && (me.email === shop.merchant_phone || me.phone === shop.merchant_phone));
  const manage = owner;
  const shopFollowKey = shop?.user_id || shop?.merchant_phone || "";
  const following = Boolean(
    me && shopFollowKey && follows.some((f) => f.followerId === me.id && f.merchantKey === shopFollowKey),
  );

  async function reload(nextOffset = 0) {
    try {
      const cat = await getShopCatalog({ data: { shopId, offset: nextOffset, limit: PRODUCT_PAGE } });
      setShop(cat.shop);
      setProducts(nextOffset ? (prev) => [...prev, ...(cat.products ?? [])] : (cat.products ?? []));
      setOffers(cat.offers ?? []);
      setComments(cat.comments ?? []);
      setCategories(cat.categories ?? []);
      setFeed(cat.feed ?? []);
      setHasMore(Boolean(cat.hasMore));
      setOffset(nextOffset);
      if (me && cat.shop && (me.email === cat.shop.merchant_phone || me.phone === cat.shop.merchant_phone)) {
        const pack = await listShopOrders({ data: { shopId, phone: key } });
        setOrders(pack.orders ?? []);
        setOrderItems(pack.items ?? []);
      }
    } catch {
      /* keep last good catalog */
    }
  }

  useEffect(() => {
    void reload(0);
  }, [shopId, me?.email]);

  const total = useMemo(() => {
    return products.reduce((sum, p) => sum + (cart[p.id] ?? 0) * Number(p.price), 0);
  }, [products, cart]);

  const visible = filter ? products.filter((p) => p.category_id === filter) : products;

  if (!shop) return null;

  return (
    <div className="flex flex-col gap-4">
      {owner ? null : (
        <button className="self-start text-sm font-bold text-primary" onClick={onBack}>
          السوق
        </button>
      )}
      {shop.cover_url ? (
        <img src={shop.cover_url} alt="" className="h-36 w-full rounded-2xl object-cover" />
      ) : shop.promo_video_url ? (
        <video src={shop.promo_video_url} className="h-52 w-full rounded-3xl bg-ink object-cover" controls playsInline />
      ) : null}
      <div className="-mt-10 flex items-end gap-3 px-1">
        {shop.avatar_url ? (
          <img src={shop.avatar_url} alt="" className="size-20 rounded-full border-4 border-bg object-cover" />
        ) : (
          <div className="flex size-20 items-center justify-center rounded-full border-4 border-bg bg-sand text-primary">
            <Store className="size-7" />
          </div>
        )}
        <div className="pb-1">
          <h2 className="text-xl font-extrabold">{shop.title}</h2>
          <p className="text-sm text-muted-foreground">{shop.merchant_name}</p>
        </div>
      </div>
      <div>
        {publicPhone(shop) ? (
          <a href={`tel:${publicPhone(shop)}`} className="inline-flex items-center gap-2 font-extrabold text-primary">
            <Phone className="size-4" />
            {publicPhone(shop)}
          </a>
        ) : null}
        {shop.bio ? <p className="mt-2 text-sm text-muted-foreground">{shop.bio}</p> : null}
        {!owner && me ? (
          <Button className="mt-3" variant={following ? "secondary" : "default"} onClick={() => followMerchant(shopFollowKey)}>
            {following ? "إلغاء المتابعة" : "متابعة التاجر"}
          </Button>
        ) : null}
      </div>

      {feed.length ? (
        <div className="flex flex-col gap-2">
          {feed.map((post) => (
            <Card key={post.id} className="overflow-hidden p-0">
              {post.photo_url ? <img src={post.photo_url} alt="" className="h-28 w-full object-cover" /> : null}
              <div className="p-3">
                <p className="font-extrabold">{post.title}</p>
                {post.body ? <p className="text-sm text-muted-foreground">{post.body}</p> : null}
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {offers.length ? (
        <div className="flex flex-col gap-2">
          {offers.map((o) => (
            <Card key={o.id} className="bg-secondary p-3">
              <p className="font-extrabold">{o.title}</p>
              {o.detail ? <p className="text-sm">{o.detail}</p> : null}
            </Card>
          ))}
        </div>
      ) : null}

      {categories.length ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Button size="sm" variant={filter ? "secondary" : "default"} onClick={() => setFilter("")}>
            الكل
          </Button>
          {categories.map((c) => (
            <Button
              key={c.id}
              size="sm"
              variant={filter === c.id ? "default" : "secondary"}
              onClick={() => setFilter(c.id)}
            >
              {c.title}
            </Button>
          ))}
        </div>
      ) : null}

      {visible.map((p) => (
        <Card key={p.id} className="p-3">
          <div className="flex gap-3">
            {p.photo_url ? (
              <img src={p.photo_url} alt="" className="size-20 rounded-lg object-cover" />
            ) : (
              <div className="flex size-20 items-center justify-center rounded-lg bg-sand text-primary">
                <ShoppingBasket className="size-6" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-extrabold">{p.title}</p>
              <p className="text-sm text-muted-foreground">{p.description}</p>
              <p className="font-extrabold text-primary">{Number(p.price)} ج</p>
              <p className="text-xs text-muted-foreground">المتوفر {p.qty ?? 0}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setCart((c) => ({ ...c, [p.id]: Math.max(0, (c[p.id] ?? 0) - 1) }))}
            >
              −
            </Button>
            <span className="w-6 text-center font-extrabold">{cart[p.id] ?? 0}</span>
            <Button size="sm" onClick={() => setCart((c) => ({ ...c, [p.id]: (c[p.id] ?? 0) + 1 }))}>
              +
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                addToCart({
                  productId: p.id,
                  shopId: shop.id,
                  title: p.title,
                  price: Number(p.price),
                  photo: p.photo_url ?? undefined,
                })
              }
            >
              العربة
            </Button>
            {manage ? (
              <Button
                size="sm"
                variant="outline"
                className="mr-auto"
                onClick={async () => {
                  await deleteShopProduct({ data: { productId: p.id, phone: key } });
                  setToast("تم الحذف");
                  void reload(0);
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            ) : null}
          </div>
          <div className="mt-3 space-y-1">
            {comments
              .filter((c) => c.product_id === p.id)
              .map((c) => (
                <p key={c.id} className="text-sm">
                  <span className="font-extrabold">{c.author_name}</span> {c.text}
                </p>
              ))}
            <form
              className="flex gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                await addProductComment({
                  data: {
                    productId: p.id,
                    authorName: me?.name ?? "نزلاوي",
                    text: String(fd.get("c") ?? ""),
                  },
                });
                e.currentTarget.reset();
                void reload(offset);
              }}
            >
              <Input name="c" placeholder="تعليق" className="h-9" />
              <Button type="submit" size="sm">
                نشر
              </Button>
            </form>
          </div>
        </Card>
      ))}

      {hasMore ? (
        <Button variant="secondary" onClick={() => void reload(offset + PRODUCT_PAGE)}>
          المزيد
        </Button>
      ) : null}

      {total > 0 && me ? (
        <Card className="space-y-3 p-4">
          <p className="font-extrabold">الحجز · {total} ج</p>
          <label className="text-sm">
            ميعاد الاستلام
            <Input type="datetime-local" className="mt-1" value={pickup} onChange={(e) => setPickup(e.target.value)} />
          </label>
          <Button
            className="w-full"
            onClick={async () => {
              if (!pickup) {
                setToast("حدد ميعاد الاستلام");
                return;
              }
              const picked = products
                .filter((p) => (cart[p.id] ?? 0) > 0)
                .map((p) => ({
                  productId: p.id,
                  title: p.title,
                  qty: cart[p.id],
                  price: Number(p.price),
                }));
              const res = await placeShopOrder({
                data: {
                  shopId: shop.id,
                  buyerName: me.name,
                  buyerPhone: accountKey(me.email, me.phone),
                  pickupAt: pickup,
                  items: picked,
                },
              });
              if (res.ok) {
                const ref = cartRefFor(shop.id);
                const lines = picked.map((p) => `${p.title} × ${p.qty}`).join("\n");
                sendShopCart(
                  shop.user_id || shop.id,
                  `حجز سلة ${ref}\nالاسم: ${me.name}\nالجوال: ${me.phone || publicPhone(shop)}\n${lines}\nالاستلام: ${pickup}`,
                );
                setCart({});
                setToast(`الطلب ${ref} وصل للتاجر`);
              }
            }}
          >
            تأكيد الحجز
          </Button>
        </Card>
      ) : null}

      {manage ? (
        <MerchantDashboard
          shop={shop}
          categories={categories}
          products={products}
          orders={orders}
          items={orderItems}
          onChanged={() => {
            void reload(0);
          }}
        />
      ) : null}
    </div>
  );
}
