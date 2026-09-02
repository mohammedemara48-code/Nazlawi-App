import { useRef, useState } from "react";
import { ImagePlus, Plus, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  addShopCategory,
  addShopOffer,
  addShopProduct,
  setShopOrderStatus,
  setShopPromo,
  updateShopLook,
  type CategoryRow,
  type OrderItemRow,
  type OrderRow,
  type OrderStatus,
  type ProductRow,
  type ShopRow,
} from "@/lib/nazlawi/market-fns";
import { useNazlawi } from "@/lib/nazlawi/store";
import { uploadCompressedImage, uploadPromoVideo } from "./upload";

const STATUSES: { id: OrderStatus; label: string }[] = [
  { id: "pending", label: "جديد" },
  { id: "preparing", label: "تجهيز" },
  { id: "ready", label: "جاهز للاستلام" },
  { id: "completed", label: "مكتمل" },
  { id: "rejected", label: "مرفوض" },
];

export function MerchantDashboard({
  shop,
  categories,
  products,
  orders,
  items,
  onChanged,
}: {
  shop: ShopRow;
  categories: CategoryRow[];
  products: ProductRow[];
  orders: OrderRow[];
  items: OrderItemRow[];
  onChanged: () => void;
}) {
  const me = useNazlawi((s) => s.currentUser);
  const setToast = useNazlawi((s) => s.setToast);
  const [tab, setTab] = useState<"store" | "bookings">("store");
  const [openCat, setOpenCat] = useState<string>(categories[0]?.id ?? "");
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const iconRef = useRef<HTMLInputElement>(null);
  const productRef = useRef<HTMLInputElement>(null);
  const offerRef = useRef<HTMLInputElement>(null);
  const [icon, setIcon] = useState("");
  const [productPhoto, setProductPhoto] = useState("");
  const [offerPhoto, setOfferPhoto] = useState("");
  if (!me) return null;
  const key = me.email || me.phone;
  const pending = orders.filter((o) => o.status === "pending" || o.status === "preparing").length;

  async function pickImage(file: File | undefined, apply: (url: string) => Promise<void> | void) {
    if (!file) return;
    const up = await uploadCompressedImage(file);
    if (!up.ok) {
      setToast(up.error ?? "التخزين مش جاهز");
      return;
    }
    await apply(up.url);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 rounded-2xl bg-secondary p-1">
        <button
          className={`rounded-xl py-2 text-sm font-extrabold ${tab === "store" ? "bg-card shadow-sm" : ""}`}
          onClick={() => setTab("store")}
        >
          المتجر
        </button>
        <button
          className={`rounded-xl py-2 text-sm font-extrabold ${tab === "bookings" ? "bg-card shadow-sm" : ""}`}
          onClick={() => setTab("bookings")}
        >
          الحجوزات{pending ? ` (${pending})` : ""}
        </button>
      </div>

      {tab === "bookings" ? (
        <div className="flex flex-col gap-3">
          {orders.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">مفيش حجوزات</p>
          ) : null}
          {orders.map((order) => {
            const lines = items.filter((i) => i.order_id === order.id);
            const total = lines.reduce((sum, i) => sum + Number(i.price) * i.qty, 0);
            const badge =
              order.status === "completed" ? "مكتمل" : order.status === "rejected" ? "مرفوض" : order.status === "pending" ? "جديد" : "مؤكد";
            return (
            <Card key={order.id} className="space-y-2 p-4">
              <div className="flex items-center justify-between">
                <p className="font-extrabold">{order.buyer_name}</p>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-bold">{badge}</span>
              </div>
              <p className="text-sm font-bold">رقم الطلب #{order.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-sm" dir="ltr">
                {order.buyer_phone}
              </p>
              <p className="text-sm text-muted-foreground">الاستلام: {order.pickup_at.replace("T", " ")}</p>
              {lines.map((i) => (
                  <p key={i.id} className="text-sm">
                    {i.title} × {i.qty}
                  </p>
                ))}
              <p className="font-extrabold text-primary">الإجمالي {total} ج</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <Button
                    key={s.id}
                    size="sm"
                    variant={order.status === s.id ? "default" : "secondary"}
                    onClick={async () => {
                      await setShopOrderStatus({ data: { orderId: order.id, phone: key, status: s.id } });
                      onChanged();
                    }}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
            </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Card className="overflow-hidden p-0">
            <div className="relative">
              {shop.cover_url ? (
                <img src={shop.cover_url} alt="" className="h-36 w-full object-cover" />
              ) : (
                <div className="h-36 bg-sand" />
              )}
              <button
                className="absolute top-3 left-3 rounded-full bg-card/90 p-2"
                onClick={() => coverRef.current?.click()}
              >
                <ImagePlus className="size-4" />
              </button>
            </div>
            <div className="-mt-8 flex items-end gap-3 px-4 pb-4">
              <button onClick={() => avatarRef.current?.click()}>
                {shop.avatar_url ? (
                  <img src={shop.avatar_url} alt="" className="size-16 rounded-full border-4 border-card object-cover" />
                ) : (
                  <div className="flex size-16 items-center justify-center rounded-full border-4 border-card bg-secondary">
                    <ImagePlus className="size-5" />
                  </div>
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate font-extrabold">{shop.title}</p>
                <p className="text-sm text-primary" dir="ltr">
                  {shop.store_phone || "رقم المتجر"}
                </p>
              </div>
            </div>
            <input
              ref={coverRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                void pickImage(e.target.files?.[0], async (url) => {
                  await updateShopLook({ data: { shopId: shop.id, phone: key, coverUrl: url } });
                  onChanged();
                })
              }
            />
            <input
              ref={avatarRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                void pickImage(e.target.files?.[0], async (url) => {
                  await updateShopLook({ data: { shopId: shop.id, phone: key, avatarUrl: url } });
                  onChanged();
                })
              }
            />
            <form
              className="space-y-2 border-t border-border px-4 py-3"
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                await updateShopLook({
                  data: {
                    shopId: shop.id,
                    phone: key,
                    title: String(fd.get("title") ?? ""),
                    storePhone: String(fd.get("tel") ?? ""),
                    bio: String(fd.get("bio") ?? ""),
                  },
                });
                setToast("تم حفظ المتجر");
                onChanged();
              }}
            >
              <Input name="title" defaultValue={shop.title} placeholder="اسم المتجر" />
              <Input name="tel" defaultValue={shop.store_phone} placeholder="تليفون المتجر" dir="ltr" />
              <Input name="bio" defaultValue={shop.bio} placeholder="نبذة قصيرة" />
              <Button type="submit" className="w-full">
                حفظ بيانات المتجر
              </Button>
            </form>
          </Card>

          <Card className="space-y-3 p-4">
            <p className="flex items-center gap-2 font-extrabold">
              <Video className="size-4" /> فيديو ترويجي · 30 ثانية
            </p>
            <p className="text-sm text-muted-foreground">بيظهر في السوق أول ما يترفع على Blob</p>
            {shop.promo_video_url ? (
              <video src={shop.promo_video_url} className="h-40 w-full rounded-xl bg-ink object-cover" controls playsInline />
            ) : null}
            <input
              ref={videoRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const up = await uploadPromoVideo(file);
                if (!up.ok) {
                  setToast(up.error ?? "تعذر رفع الفيديو");
                  return;
                }
                await setShopPromo({ data: { shopId: shop.id, phone: key, videoUrl: up.url } });
                setToast("الفيديو ظهر في السوق");
                onChanged();
              }}
            />
            <Button type="button" variant="secondary" className="w-full" onClick={() => videoRef.current?.click()}>
              رفع فيديو للمتجر
            </Button>
          </Card>

          <Card className="space-y-3 p-4">
            <p className="font-extrabold">عرض جديد</p>
            <p className="text-sm text-muted-foreground">يظهر تلقائي في تبويب العروض</p>
            <form
              className="space-y-2"
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                await addShopOffer({
                  data: {
                    shopId: shop.id,
                    phone: key,
                    title: String(fd.get("title") ?? ""),
                    detail: String(fd.get("detail") ?? ""),
                    price: Number(fd.get("price") ?? 0),
                    photoUrl: offerPhoto || undefined,
                  },
                });
                e.currentTarget.reset();
                setOfferPhoto("");
                setToast("العرض ظهر في العروض");
                onChanged();
              }}
            >
              <Input name="title" required placeholder="اسم الصنف" />
              <Input name="detail" placeholder="تفاصيل العرض" />
              <Input name="price" inputMode="numeric" placeholder="السعر" />
              <input
                ref={offerRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void pickImage(e.target.files?.[0], (url) => setOfferPhoto(url))}
              />
              <Button type="button" variant="secondary" onClick={() => offerRef.current?.click()}>
                صورة العرض
              </Button>
              {offerPhoto ? <img src={offerPhoto} alt="" className="h-24 w-full rounded-lg object-cover" /> : null}
              <Button type="submit" className="w-full">
                نشر العرض
              </Button>
            </form>
          </Card>

          <Card className="space-y-3 p-4">
            <p className="font-extrabold">أقسام المتجر</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((c) => (
                <button
                  key={c.id}
                  className={`min-w-36 overflow-hidden rounded-2xl ${openCat === c.id ? "ring-2 ring-primary" : ""}`}
                  onClick={() => setOpenCat(c.id)}
                >
                  {c.icon_url ? (
                    <img src={c.icon_url} alt="" className="h-24 w-36 object-cover" />
                  ) : (
                    <div className="flex h-24 w-36 items-center justify-center bg-secondary text-sm">بدون صورة</div>
                  )}
                  <span className="block px-2 py-1 text-xs font-extrabold">{c.title}</span>
                </button>
              ))}
            </div>
            <form
              className="space-y-2"
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                await addShopCategory({
                  data: {
                    shopId: shop.id,
                    phone: key,
                    title: String(fd.get("cat") ?? ""),
                    iconUrl: icon || undefined,
                  },
                });
                e.currentTarget.reset();
                setIcon("");
                onChanged();
              }}
            >
              <Input name="cat" required placeholder="اسم القسم" />
              <input
                ref={iconRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void pickImage(e.target.files?.[0], (url) => setIcon(url))}
              />
              <Button type="button" variant="secondary" onClick={() => iconRef.current?.click()}>
                صورة رمزية للقسم
              </Button>
              {icon ? <img src={icon} alt="" className="size-16 rounded-xl object-cover" /> : null}
              <Button type="submit" className="w-full">
                <Plus className="ml-1 size-4" /> إضافة قسم
              </Button>
            </form>
          </Card>

          {openCat ? (
            <Card className="space-y-3 p-4">
              <p className="font-extrabold">منتجات {categories.find((c) => c.id === openCat)?.title}</p>
              {products
                .filter((p) => p.category_id === openCat)
                .map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    {p.photo_url ? (
                      <img src={p.photo_url} alt="" className="size-14 rounded-xl object-cover" />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold">{p.title}</p>
                      <p className="text-sm text-primary">{Number(p.price)} ج</p>
                    </div>
                  </div>
                ))}
              <form
                className="space-y-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const res = await addShopProduct({
                    data: {
                      shopId: shop.id,
                      phone: key,
                      title: String(fd.get("title") ?? ""),
                      description: String(fd.get("desc") ?? ""),
                      price: Number(fd.get("price") ?? 0),
                      qty: Number(fd.get("qty") ?? 0),
                      categoryId: openCat,
                      photoUrl: productPhoto || undefined,
                    },
                  });
                  if (!res.ok) {
                    setToast(res.error ?? "تعذر النشر");
                    return;
                  }
                  e.currentTarget.reset();
                  setProductPhoto("");
                  setToast("المنتج اتضاف للقسم");
                  onChanged();
                }}
              >
                <Input name="title" required placeholder="اسم المنتج" />
                <Input name="desc" placeholder="الوصف" />
                <div className="grid grid-cols-2 gap-2">
                  <Input name="price" inputMode="numeric" placeholder="السعر" />
                  <Input name="qty" inputMode="numeric" placeholder="الكمية" />
                </div>
                <input
                  ref={productRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => void pickImage(e.target.files?.[0], (url) => setProductPhoto(url))}
                />
                <Button type="button" variant="secondary" onClick={() => productRef.current?.click()}>
                  صورة المنتج
                </Button>
                {productPhoto ? <img src={productPhoto} alt="" className="h-24 w-full rounded-lg object-cover" /> : null}
                <Button type="submit" className="w-full">
                  إضافة المنتج للقسم
                </Button>
              </form>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
