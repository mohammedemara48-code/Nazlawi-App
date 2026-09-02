import { useRef, useState } from "react";
import { Camera, Phone, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  addShopCategory,
  addShopOffer,
  addShopProduct,
  setShopOrderStatus,
  updateShopLook,
  type CategoryRow,
  type OrderItemRow,
  type OrderRow,
  type OrderStatus,
  type ProductRow,
  type ShopRow,
} from "@/lib/nazlawi/market-fns";
import { useNazlawi } from "@/lib/nazlawi/store";
import { uploadCompressedImage } from "./upload";

const STATUSES: { id: OrderStatus; label: string }[] = [
  { id: "pending", label: "جديد" },
  { id: "preparing", label: "تجهيز" },
  { id: "ready", label: "جاهز" },
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
  const [panel, setPanel] = useState<"none" | "info" | "cat" | "product" | "offer">("none");
  const [openCat, setOpenCat] = useState(categories[0]?.id ?? "");
  const [icon, setIcon] = useState("");
  const [productPhoto, setProductPhoto] = useState("");
  const [offerPhoto, setOfferPhoto] = useState("");
  const coverRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const iconRef = useRef<HTMLInputElement>(null);
  const productRef = useRef<HTMLInputElement>(null);
  const offerRef = useRef<HTMLInputElement>(null);
  if (!me) return null;
  const key = me.email || me.phone;
  const pending = orders.filter((o) => o.status === "pending" || o.status === "preparing").length;
  const activeCat = openCat || categories[0]?.id || "";
  const catProducts = products.filter((p) => p.category_id === activeCat);

  async function pick(file: File | undefined, apply: (url: string) => void | Promise<void>) {
    if (!file) return;
    const up = await uploadCompressedImage(file);
    if (!up.ok) {
      setToast(up.error ?? "التخزين مش جاهز");
      return;
    }
    await apply(up.url);
  }

  return (
    <div className="-mx-4 -mt-4 pb-8">
      <div className="relative">
        <button className="block w-full" onClick={() => coverRef.current?.click()}>
          {shop.cover_url ? (
            <img src={shop.cover_url} alt="" className="h-56 w-full object-cover" />
          ) : (
            <div className="flex h-56 items-center justify-center bg-sand text-sm font-bold text-muted-foreground">
              اضغط لتغيير الغلاف
            </div>
          )}
        </button>
        <button
          className="absolute top-3 left-3 flex size-10 items-center justify-center rounded-full bg-card shadow"
          onClick={() => coverRef.current?.click()}
        >
          <Camera className="size-4" />
        </button>
        <div className="absolute inset-x-4 -bottom-14">
          <div className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-lg">
            <button onClick={() => avatarRef.current?.click()}>
              {shop.avatar_url ? (
                <img src={shop.avatar_url} alt="" className="size-16 rounded-2xl object-cover" />
              ) : (
                <div className="flex size-16 items-center justify-center rounded-2xl bg-sand">
                  <Camera className="size-5" />
                </div>
              )}
            </button>
            <button className="min-w-0 flex-1 text-right" onClick={() => setPanel(panel === "info" ? "none" : "info")}>
              <p className="truncate text-lg font-extrabold">{shop.title}</p>
              <p className="flex items-center gap-1 text-sm font-bold text-primary" dir="ltr">
                <Phone className="size-3.5" />
                {shop.store_phone || "أضف رقم المتجر"}
              </p>
              {shop.bio ? <p className="truncate text-xs text-muted-foreground">{shop.bio}</p> : null}
            </button>
          </div>
        </div>
      </div>

      <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => void pick(e.target.files?.[0], async (url) => { await updateShopLook({ data: { shopId: shop.id, phone: key, coverUrl: url } }); onChanged(); })} />
      <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={(e) => void pick(e.target.files?.[0], async (url) => { await updateShopLook({ data: { shopId: shop.id, phone: key, avatarUrl: url } }); onChanged(); })} />

      <div className="mt-20 px-4">
        <div className="mb-4 grid grid-cols-2 rounded-full bg-muted p-1">
          <button className={`rounded-full py-2 text-sm font-extrabold ${tab === "store" ? "bg-card shadow" : "text-muted-foreground"}`} onClick={() => setTab("store")}>
            المتجر
          </button>
          <button className={`rounded-full py-2 text-sm font-extrabold ${tab === "bookings" ? "bg-card shadow" : "text-muted-foreground"}`} onClick={() => setTab("bookings")}>
            الحجوزات{pending ? ` ${pending}` : ""}
          </button>
        </div>

        {tab === "bookings" ? (
          <div className="flex flex-col gap-3">
            {orders.length === 0 ? <p className="py-10 text-center text-sm text-muted-foreground">مفيش حجوزات</p> : null}
            {orders.map((order) => {
              const lines = items.filter((i) => i.order_id === order.id);
              const total = lines.reduce((sum, i) => sum + Number(i.price) * i.qty, 0);
              const badge = order.status === "completed" ? "مكتمل" : order.status === "rejected" ? "مرفوض" : order.status === "pending" ? "جديد" : "مؤكد";
              return (
                <Card key={order.id} className="space-y-2 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-extrabold">{order.buyer_name}</p>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-bold">{badge}</span>
                  </div>
                  <p className="text-sm">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm" dir="ltr">{order.buyer_phone}</p>
                  {lines.map((i) => (
                    <p key={i.id} className="text-sm">{i.title} × {i.qty}</p>
                  ))}
                  <p className="font-extrabold text-primary">الإجمالي {total} ج</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map((s) => (
                      <Button key={s.id} size="sm" variant={order.status === s.id ? "default" : "secondary"} onClick={async () => { await setShopOrderStatus({ data: { orderId: order.id, phone: key, status: s.id } }); onChanged(); }}>
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
            {panel === "info" ? (
              <form className="space-y-2 rounded-2xl bg-card p-3 shadow-sm" onSubmit={async (e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); await updateShopLook({ data: { shopId: shop.id, phone: key, title: String(fd.get("title") ?? ""), storePhone: String(fd.get("tel") ?? ""), bio: String(fd.get("bio") ?? "") } }); setPanel("none"); setToast("تم"); onChanged(); }}>
                <Input name="title" defaultValue={shop.title} placeholder="اسم المتجر" />
                <Input name="tel" defaultValue={shop.store_phone} placeholder="رقم المتجر" dir="ltr" />
                <Input name="bio" defaultValue={shop.bio} placeholder="نبذة" />
                <Button type="submit" className="w-full">حفظ</Button>
              </form>
            ) : null}

            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((c) => (
                <button key={c.id} className={`w-24 shrink-0 text-center ${activeCat === c.id ? "opacity-100" : "opacity-70"}`} onClick={() => setOpenCat(c.id)}>
                  {c.icon_url ? (
                    <img src={c.icon_url} alt="" className="mx-auto h-20 w-24 rounded-2xl object-cover" />
                  ) : (
                    <div className="mx-auto h-20 w-24 rounded-2xl bg-sand" />
                  )}
                  <span className={`mt-1 block text-xs font-extrabold ${activeCat === c.id ? "text-primary" : ""}`}>{c.title}</span>
                </button>
              ))}
              <button className="flex w-20 shrink-0 flex-col items-center justify-center rounded-2xl border border-dashed border-border" onClick={() => setPanel(panel === "cat" ? "none" : "cat")}>
                <Plus className="size-5" />
                <span className="text-xs font-bold">قسم</span>
              </button>
            </div>

            {panel === "cat" ? (
              <form className="space-y-2 rounded-2xl bg-card p-3" onSubmit={async (e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); await addShopCategory({ data: { shopId: shop.id, phone: key, title: String(fd.get("cat") ?? ""), iconUrl: icon || undefined } }); setIcon(""); setPanel("none"); e.currentTarget.reset(); onChanged(); }}>
                <Input name="cat" required placeholder="اسم القسم" />
                <input ref={iconRef} type="file" accept="image/*" className="hidden" onChange={(e) => void pick(e.target.files?.[0], setIcon)} />
                <Button type="button" variant="secondary" className="w-full" onClick={() => iconRef.current?.click()}>صورة القسم</Button>
                {icon ? <img src={icon} alt="" className="h-24 w-full rounded-xl object-cover" /> : null}
                <Button type="submit" className="w-full">إضافة القسم</Button>
              </form>
            ) : null}

            <div className="flex items-center justify-between">
              <p className="font-extrabold">{categories.find((c) => c.id === activeCat)?.title || "المنتجات"}</p>
              <button className="text-sm font-extrabold text-primary" onClick={() => setPanel(panel === "product" ? "none" : "product")}>+ منتج</button>
            </div>

            {panel === "product" ? (
              <form className="space-y-2 rounded-2xl bg-card p-3" onSubmit={async (e) => { e.preventDefault(); if (!activeCat) { setToast("أضف قسم أولاً"); return; } const fd = new FormData(e.currentTarget); const res = await addShopProduct({ data: { shopId: shop.id, phone: key, title: String(fd.get("title") ?? ""), description: String(fd.get("desc") ?? ""), price: Number(fd.get("price") ?? 0), qty: Number(fd.get("qty") ?? 0), categoryId: activeCat, photoUrl: productPhoto || undefined } }); if (!res.ok) { setToast("تعذر الإضافة"); return; } setProductPhoto(""); setPanel("none"); e.currentTarget.reset(); onChanged(); }}>
                <Input name="title" required placeholder="اسم المنتج" />
                <Input name="desc" placeholder="الوصف" />
                <div className="grid grid-cols-2 gap-2">
                  <Input name="price" inputMode="numeric" placeholder="السعر" />
                  <Input name="qty" inputMode="numeric" placeholder="الكمية" />
                </div>
                <input ref={productRef} type="file" accept="image/*" className="hidden" onChange={(e) => void pick(e.target.files?.[0], setProductPhoto)} />
                <Button type="button" variant="secondary" className="w-full" onClick={() => productRef.current?.click()}>صورة المنتج</Button>
                {productPhoto ? <img src={productPhoto} alt="" className="h-28 w-full rounded-xl object-cover" /> : null}
                <Button type="submit" className="w-full">إضافة المنتج</Button>
              </form>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              {catProducts.map((p) => (
                <div key={p.id} className="overflow-hidden rounded-2xl bg-card shadow-sm">
                  {p.photo_url ? <img src={p.photo_url} alt="" className="h-28 w-full object-cover" /> : <div className="h-28 bg-sand" />}
                  <div className="p-2">
                    <p className="truncate text-sm font-extrabold">{p.title}</p>
                    <p className="font-extrabold text-primary">{Number(p.price)} ج</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="text-sm font-extrabold text-primary" onClick={() => setPanel(panel === "offer" ? "none" : "offer")}>+ عرض يظهر في العروض</button>
            {panel === "offer" ? (
              <form className="space-y-2 rounded-2xl bg-card p-3" onSubmit={async (e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); const res = await addShopOffer({ data: { shopId: shop.id, phone: key, title: String(fd.get("title") ?? ""), detail: String(fd.get("detail") ?? ""), price: Number(fd.get("price") ?? 0), photoUrl: offerPhoto || undefined } }); if (!res.ok) { setToast("حد العرض اتنين"); return; } setOfferPhoto(""); setPanel("none"); e.currentTarget.reset(); setToast("ظهر في العروض"); onChanged(); }}>
                <Input name="title" required placeholder="اسم العرض" />
                <Input name="detail" placeholder="التفاصيل" />
                <Input name="price" inputMode="numeric" placeholder="السعر" />
                <input ref={offerRef} type="file" accept="image/*" className="hidden" onChange={(e) => void pick(e.target.files?.[0], setOfferPhoto)} />
                <Button type="button" variant="secondary" className="w-full" onClick={() => offerRef.current?.click()}>صورة العرض</Button>
                {offerPhoto ? <img src={offerPhoto} alt="" className="h-28 w-full rounded-xl object-cover" /> : null}
                <Button type="submit" className="w-full">نشر العرض</Button>
              </form>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
