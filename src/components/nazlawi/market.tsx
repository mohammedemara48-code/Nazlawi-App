import { useEffect, useMemo, useRef, useState } from "react";
import { Phone, ShoppingBasket, Store, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { uploadMarketMedia } from "@/lib/nazlawi/blob";
import {
  acceptShopOrder,
  addProductComment,
  addShopOffer,
  addShopProduct,
  deleteShopProduct,
  ensureShop,
  getShopCatalog,
  listShopOrders,
  listShops,
  placeShopOrder,
  type CommentRow,
  type OfferRow,
  type OrderItemRow,
  type OrderRow,
  type ProductRow,
  type ShopRow,
} from "@/lib/nazlawi/market-fns";
import { useNazlawi } from "@/lib/nazlawi/store";
import { readAsDataUrl } from "./media";

export function MarketScreen() {
  const me = useNazlawi((s) => s.currentUser);
  const shopId = useNazlawi((s) => s.shopId);
  const setShopId = useNazlawi((s) => s.setShopId);
  const [shops, setShops] = useState<ShopRow[]>([]);
  const [error, setError] = useState("");

  async function reload() {
    try {
      const rows = await listShops();
      setShops(rows ?? []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل السوق");
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  async function openMyShop() {
    if (!me || (me.role !== "merchant" && me.role !== "admin")) return;
    try {
      const shop = await ensureShop({ data: { phone: me.phone, name: me.name } });
      if (shop?.id) {
        setShopId(shop.id);
        return;
      }
      setError("تعذر فتح المتجر");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر فتح المتجر");
    }
  }

  if (shopId) return <ShopPage shopId={shopId} onBack={() => setShopId(null)} />;

  return (
    <div className="flex flex-col gap-3">
      {me && (me.role === "merchant" || me.role === "admin") ? (
        <Button onClick={() => void openMyShop()}>متجري</Button>
      ) : null}
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
      {error ? <p className="text-center text-sm text-coral">{error}</p> : null}
      {!shops.length && !error ? <p className="text-center text-sm text-muted-foreground">السوق فاضي</p> : null}
    </div>
  );
}

function ShopPage({ shopId, onBack }: { shopId: string; onBack: () => void }) {
  const me = useNazlawi((s) => s.currentUser);
  const setToast = useNazlawi((s) => s.setToast);
  const [shop, setShop] = useState<ShopRow | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItemRow[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [pickup, setPickup] = useState("");
  const owner = Boolean(me && shop && me.phone === shop.merchant_phone);

  async function reload() {
    try {
      const cat = await getShopCatalog({ data: { shopId } });
      setShop(cat.shop);
      setProducts(cat.products ?? []);
      setOffers(cat.offers ?? []);
      setComments(cat.comments ?? []);
      if (me && cat.shop && me.phone === cat.shop.merchant_phone) {
        const pack = await listShopOrders({ data: { shopId, phone: me.phone } });
        setOrders(pack.orders ?? []);
        setOrderItems(pack.items ?? []);
      }
    } catch {
      /* keep last good catalog */
    }
  }

  useEffect(() => {
    void reload();
  }, [shopId, me?.phone]);

  const total = useMemo(() => {
    return products.reduce((sum, p) => sum + (cart[p.id] ?? 0) * Number(p.price), 0);
  }, [products, cart]);

  if (!shop) return null;

  return (
    <div className="flex flex-col gap-4">
      <button className="self-start text-sm font-bold text-primary" onClick={onBack}>
        السوق
      </button>
      {shop.cover_url ? (
        <img src={shop.cover_url} alt="" className="h-36 w-full rounded-2xl object-cover" />
      ) : null}
      <div>
        <h2 className="text-xl font-extrabold">{shop.title}</h2>
        <p className="text-sm text-muted-foreground">{shop.merchant_name}</p>
        <a href={`tel:${shop.merchant_phone}`} className="mt-2 inline-flex items-center gap-2 font-extrabold text-primary">
          <Phone className="size-4" />
          {shop.merchant_phone}
        </a>
      </div>

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

      {products.map((p) => (
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
            <Button
              size="sm"
              onClick={() => setCart((c) => ({ ...c, [p.id]: (c[p.id] ?? 0) + 1 }))}
            >
              +
            </Button>
            {owner ? (
              <Button
                size="sm"
                variant="outline"
                className="mr-auto"
                onClick={async () => {
                  await deleteShopProduct({ data: { productId: p.id, phone: me!.phone } });
                  setToast("تم الحذف");
                  void reload();
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
                void reload();
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

      {total > 0 && me ? (
        <Card className="space-y-3 p-4">
          <p className="font-extrabold">الحجز · {total} ج</p>
          <label className="text-sm">
            ميعاد الاستلام
            <Input
              type="datetime-local"
              className="mt-1"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              required
            />
          </label>
          <Button
            className="w-full"
            onClick={async () => {
              if (!pickup) {
                setToast("حدد ميعاد الاستلام");
                return;
              }
              const items = products
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
                  buyerPhone: me.phone,
                  pickupAt: pickup,
                  items,
                },
              });
              if (res.ok) {
                setCart({});
                setToast("الطلب وصل للتاجر");
              }
            }}
          >
            تأكيد الحجز
          </Button>
        </Card>
      ) : null}

      {owner ? <MerchantTools shop={shop} onChanged={() => void reload()} orders={orders} items={orderItems} /> : null}
    </div>
  );
}

function MerchantTools({
  shop,
  onChanged,
  orders,
  items,
}: {
  shop: ShopRow;
  onChanged: () => void;
  orders: OrderRow[];
  items: OrderItemRow[];
}) {
  const me = useNazlawi((s) => s.currentUser);
  const setToast = useNazlawi((s) => s.setToast);
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState("");
  if (!me) return null;

  return (
    <div className="flex flex-col gap-3">
      <Card className="space-y-3 p-4">
        <p className="font-extrabold">منتج جديد</p>
        <form
          className="space-y-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const res = await addShopProduct({
              data: {
                shopId: shop.id,
                phone: me.phone,
                title: String(fd.get("title") ?? ""),
                description: String(fd.get("desc") ?? ""),
                price: Number(fd.get("price") ?? 0),
                photoUrl: photo || undefined,
              },
            });
            if (!res.ok) {
              setToast(res.error ?? "تعذر النشر");
              return;
            }
            e.currentTarget.reset();
            setPhoto("");
            setToast("تم");
            onChanged();
          }}
        >
          <Input name="title" required placeholder="اسم المنتج" />
          <Input name="desc" placeholder="الوصف" />
          <Input name="price" inputMode="numeric" placeholder="السعر" />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const dataUrl = await readAsDataUrl(file);
              const up = await uploadMarketMedia({
                data: { filename: file.name, contentType: file.type, dataUrl },
              });
              if (up.ok) setPhoto(up.url);
              else setToast("التخزين مش جاهز");
            }}
          />
          <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
            صورة المنتج
          </Button>
          {photo ? <img src={photo} alt="" className="h-24 rounded-lg object-cover" /> : null}
          <Button type="submit" className="w-full">
            نشر المنتج
          </Button>
        </form>
      </Card>

      <Card className="space-y-3 p-4">
        <p className="font-extrabold">عرض</p>
        <form
          className="space-y-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            await addShopOffer({
              data: {
                shopId: shop.id,
                phone: me.phone,
                title: String(fd.get("title") ?? ""),
                detail: String(fd.get("detail") ?? ""),
              },
            });
            e.currentTarget.reset();
            setToast("تم");
            onChanged();
          }}
        >
          <Input name="title" required placeholder="عنوان العرض" />
          <Input name="detail" placeholder="التفاصيل" />
          <Button type="submit" className="w-full">
            نشر العرض
          </Button>
        </form>
      </Card>

      {orders.map((order) => (
        <Card key={order.id} className="space-y-2 p-4">
          <p className="font-extrabold">{order.buyer_name}</p>
          <a href={`tel:${order.buyer_phone}`} className="text-sm text-primary">
            {order.buyer_phone}
          </a>
          <p className="text-sm">الاستلام: {order.pickup_at.replace("T", " ")}</p>
          {items
            .filter((i) => i.order_id === order.id)
            .map((i) => (
              <p key={i.id} className="text-sm">
                {i.title} × {i.qty}
              </p>
            ))}
          {order.status === "pending" ? (
            <Button
              className="w-full"
              onClick={async () => {
                await acceptShopOrder({ data: { orderId: order.id, phone: me.phone } });
                setToast("تم قبول الطلب");
                onChanged();
              }}
            >
              قبول بعد الاستلام
            </Button>
          ) : (
            <p className="text-sm font-extrabold text-primary">مقفل</p>
          )}
        </Card>
      ))}
    </div>
  );
}
