import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  addShopCategory,
  addShopFeed,
  addShopOffer,
  addShopProduct,
  setShopOrderStatus,
  setShopPromo,
  type CategoryRow,
  type OrderItemRow,
  type OrderRow,
  type OrderStatus,
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
  orders,
  items,
  onChanged,
}: {
  shop: ShopRow;
  categories: CategoryRow[];
  orders: OrderRow[];
  items: OrderItemRow[];
  onChanged: () => void;
}) {
  const me = useNazlawi((s) => s.currentUser);
  const setToast = useNazlawi((s) => s.setToast);
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const feedRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState("");
  const [feedPhoto, setFeedPhoto] = useState("");
  if (!me) return null;
  const key = me.email || me.phone;

  return (
    <div className="flex flex-col gap-3">
      <Card className="space-y-3 p-4">
        <p className="font-extrabold">فيديو المتجر · 30 ثانية</p>
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
            setToast("تم");
            onChanged();
          }}
        />
        <Button type="button" variant="secondary" className="w-full" onClick={() => videoRef.current?.click()}>
          رفع فيديو ترويجي
        </Button>
      </Card>

      <Card className="space-y-3 p-4">
        <p className="font-extrabold">منشور السوق</p>
        <p className="text-sm text-muted-foreground">يظهر مباشرة في تبويب السوق ويربط بمتجرك</p>
        <form
          className="space-y-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const res = await addShopFeed({
              data: {
                shopId: shop.id,
                phone: key,
                title: String(fd.get("title") ?? ""),
                body: String(fd.get("body") ?? ""),
                photoUrl: feedPhoto || undefined,
              },
            });
            if (!res.ok) {
              setToast("تعذر النشر");
              return;
            }
            e.currentTarget.reset();
            setFeedPhoto("");
            setToast("ظهر في السوق");
            onChanged();
          }}
        >
          <Input name="title" required placeholder="عنوان المنشور" />
          <Input name="body" placeholder="التفاصيل" />
          <input
            ref={feedRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const up = await uploadCompressedImage(file);
              if (up.ok) setFeedPhoto(up.url);
              else setToast(up.error ?? "التخزين مش جاهز");
            }}
          />
          <Button type="button" variant="secondary" onClick={() => feedRef.current?.click()}>
            صورة المنشور
          </Button>
          {feedPhoto ? <img src={feedPhoto} alt="" className="h-24 rounded-lg object-cover" /> : null}
          <Button type="submit" className="w-full">
            نشر في السوق
          </Button>
        </form>
      </Card>

      <Card className="space-y-3 p-4">
        <p className="font-extrabold">أقسام المتجر</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <span key={c.id} className="rounded-full bg-secondary px-3 py-1 text-sm font-bold">
              {c.title}
            </span>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            await addShopCategory({
              data: { shopId: shop.id, phone: key, title: String(fd.get("cat") ?? "") },
            });
            e.currentTarget.reset();
            onChanged();
          }}
        >
          <Input name="cat" placeholder="قسم جديد" />
          <Button type="submit">إضافة</Button>
        </form>
      </Card>

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
                phone: key,
                title: String(fd.get("title") ?? ""),
                description: String(fd.get("desc") ?? ""),
                price: Number(fd.get("price") ?? 0),
                qty: Number(fd.get("qty") ?? 0),
                categoryId: String(fd.get("category") ?? "") || undefined,
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
          <Input name="qty" inputMode="numeric" placeholder="الكمية المتاحة" />
          {categories.length ? (
            <select name="category" className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm">
              <option value="">بدون قسم</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          ) : null}
          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const up = await uploadCompressedImage(file);
              if (up.ok) setPhoto(up.url);
              else setToast(up.error ?? "التخزين مش جاهز");
            }}
          />
          <Button type="button" variant="secondary" onClick={() => photoRef.current?.click()}>
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
                phone: key,
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
          <p className="text-sm">{order.buyer_phone}</p>
          <p className="text-sm">الاستلام: {order.pickup_at.replace("T", " ")}</p>
          {items
            .filter((i) => i.order_id === order.id)
            .map((i) => (
              <p key={i.id} className="text-sm">
                {i.title} × {i.qty}
              </p>
            ))}
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
      ))}
    </div>
  );
}
