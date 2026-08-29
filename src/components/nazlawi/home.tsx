import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Gamepad2,
  LayoutGrid,
  Percent,
  Search,
  ShoppingBasket,
  Store,
  Truck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listMarketFeed, listShops, type ShopRow } from "@/lib/nazlawi/market-fns";
import { useNazlawi } from "@/lib/nazlawi/store";
import type { ScreenId } from "@/lib/nazlawi/types";

const BANNERS = [
  { src: "/splash.jpg", title: "سوق النزل", caption: "منتجات القرية بين إيديك" },
  { src: "/login-bg.jpg", title: "عروض الأسبوع", caption: "اطلب واستلم من المحل" },
  { src: "/cover-nzlawi.jpg", title: "NZLAWI", caption: "تجار النزل في مكان واحد" },
];

const QUICK: { title: string; screen: ScreenId; icon: typeof Percent }[] = [
  { title: "العروض", screen: "offers", icon: Percent },
  { title: "السوق", screen: "market", icon: Store },
  { title: "قريتي", screen: "timeline", icon: Users },
  { title: "خدني معاك", screen: "carpool", icon: Truck },
  { title: "المسابقات", screen: "offers", icon: Gamepad2 },
  { title: "الأدلة", screen: "services", icon: LayoutGrid },
];

const CATS: { title: string; screen: ScreenId }[] = [
  { title: "سوق النزل", screen: "market" },
  { title: "قريتي", screen: "timeline" },
  { title: "خدني معاك", screen: "carpool" },
  { title: "توصيل", screen: "delivery" },
  { title: "مواقف ونقل", screen: "transport" },
  { title: "دليل الخدمات", screen: "services" },
];

export function HomeScreen() {
  const setScreen = useNazlawi((s) => s.setScreen);
  const setShopId = useNazlawi((s) => s.setShopId);
  const [slide, setSlide] = useState(0);
  const [query, setQuery] = useState("");
  const [shops, setShops] = useState<ShopRow[]>([]);
  const [feed, setFeed] = useState<
    { id: string; title: string; body: string; photo_url: string | null; shop: ShopRow | null }[]
  >([]);
  const camRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = window.setInterval(() => setSlide((s) => (s + 1) % BANNERS.length), 4200);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    void listShops()
      .then((rows) => setShops(rows ?? []))
      .catch(() => undefined);
    void listMarketFeed()
      .then((rows) => setFeed(rows ?? []))
      .catch(() => undefined);
  }, []);

  const banner = BANNERS[slide];
  const filtered = query.trim()
    ? shops.filter((s) => `${s.title} ${s.merchant_name}`.includes(query.trim()))
    : shops;

  return (
    <div className="flex flex-col gap-4">
      <form
        className="relative"
        onSubmit={(e) => {
          e.preventDefault();
          setScreen("market");
        }}
      >
        <Search className="pointer-events-none absolute top-3.5 right-3 size-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 rounded-2xl border-0 bg-card pr-11 pl-12 shadow-sm"
          placeholder="ابحث في نزلاوي"
        />
        <button
          type="button"
          className="absolute top-1.5 left-1.5 flex size-9 items-center justify-center rounded-xl text-primary"
          aria-label="بحث بالكاميرا"
          onClick={() => camRef.current?.click()}
        >
          <Camera className="size-5" />
        </button>
        <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" />
      </form>

      <div className="relative overflow-hidden rounded-3xl">
        <img src={banner.src} alt="" className="h-44 w-full object-cover" />
        <div className="absolute inset-0 bg-ink/45" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-primary-foreground">
          <p className="text-xl font-extrabold">{banner.title}</p>
          <p className="text-sm text-primary-foreground/85">{banner.caption}</p>
        </div>
        <div className="absolute bottom-3 left-4 flex gap-1">
          {BANNERS.map((_, i) => (
            <button
              key={i}
              aria-label={`إعلان ${i + 1}`}
              className={`h-1.5 rounded-full ${i === slide ? "w-5 bg-primary-foreground" : "w-1.5 bg-primary-foreground/40"}`}
              onClick={() => setSlide(i)}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          className="overflow-hidden rounded-2xl bg-card text-right shadow-sm"
          onClick={() => setScreen("offers")}
        >
          <img src="/cover-nzlawi.jpg" alt="" className="h-20 w-full object-cover" />
          <p className="px-3 py-2 text-sm font-extrabold">عروض التجار</p>
        </button>
        <button
          className="overflow-hidden rounded-2xl bg-card text-right shadow-sm"
          onClick={() => setScreen("market")}
        >
          <img src="/login-bg.jpg" alt="" className="h-20 w-full object-cover" />
          <p className="px-3 py-2 text-sm font-extrabold">محلات النزل</p>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {QUICK.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              className="flex flex-col items-center gap-2 rounded-2xl bg-card px-2 py-4 shadow-sm"
              onClick={() => setScreen(item.screen)}
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                <Icon className="size-5" />
              </span>
              <span className="text-xs font-bold">{item.title}</span>
            </button>
          );
        })}
      </div>

      {feed.length ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-extrabold">من السوق</p>
          {feed.slice(0, 6).map((post) => (
            <button
              key={post.id}
              className="overflow-hidden rounded-2xl bg-card text-right shadow-sm"
              onClick={() => post.shop?.id && setShopId(post.shop.id)}
            >
              {post.photo_url ? <img src={post.photo_url} alt="" className="h-28 w-full object-cover" /> : null}
              <div className="px-3 py-3">
                <p className="font-extrabold">{post.title}</p>
                <p className="text-xs text-primary">{post.shop?.title}</p>
              </div>
            </button>
          ))}
        </div>
      ) : null}

      {filtered.length ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-extrabold">المتاجر</p>
          {filtered.map((shop) => (
            <button
              key={shop.id}
              className="flex items-center gap-3 rounded-2xl bg-card p-3 text-right shadow-sm"
              onClick={() => setShopId(shop.id)}
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-sand text-primary">
                <Store className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-extrabold">{shop.title}</p>
                <p className="text-xs text-muted-foreground">{shop.merchant_name}</p>
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function CategoriesScreen() {
  const setScreen = useNazlawi((s) => s.setScreen);
  return (
    <div className="grid grid-cols-2 gap-3">
      {CATS.map((c) => (
        <button
          key={c.title}
          className="rounded-2xl bg-card px-4 py-6 text-right font-extrabold shadow-sm"
          onClick={() => setScreen(c.screen)}
        >
          {c.title}
        </button>
      ))}
    </div>
  );
}

export function OffersScreen() {
  const setScreen = useNazlawi((s) => s.setScreen);
  const setShopId = useNazlawi((s) => s.setShopId);
  const [shops, setShops] = useState<ShopRow[]>([]);
  useEffect(() => {
    void listShops().then((rows) => setShops(rows ?? [])).catch(() => undefined);
  }, []);
  return (
    <div className="flex flex-col gap-3">
      <Card className="overflow-hidden p-0">
        <img src="/splash.jpg" alt="" className="h-36 w-full object-cover" />
        <div className="p-4">
          <p className="font-extrabold">عروض النزل</p>
          <p className="text-sm text-muted-foreground">ادخل المتجر وشوف السعر واحجز</p>
        </div>
      </Card>
      {shops.map((shop) => (
        <button
          key={shop.id}
          className="rounded-2xl bg-card p-4 text-right shadow-sm"
          onClick={() => setShopId(shop.id)}
        >
          <p className="font-extrabold">{shop.title}</p>
          <p className="text-sm text-muted-foreground">{shop.merchant_name}</p>
        </button>
      ))}
      <Button variant="secondary" onClick={() => setScreen("market")}>
        كل المتاجر
      </Button>
    </div>
  );
}

export function CartScreen() {
  const cart = useNazlawi((s) => s.cart);
  const setCartQty = useNazlawi((s) => s.setCartQty);
  const setShopId = useNazlawi((s) => s.setShopId);
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  return (
    <div className="flex flex-col gap-3">
      {cart.map((item) => (
        <Card key={item.productId} className="flex items-center gap-3 p-3">
          {item.photo ? (
            <img src={item.photo} alt="" className="size-16 rounded-lg object-cover" />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-lg bg-sand text-primary">
              <ShoppingBasket className="size-5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-extrabold">{item.title}</p>
            <p className="text-sm text-primary">{item.price} ج</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setCartQty(item.productId, item.qty - 1)}>
              −
            </Button>
            <span className="w-5 text-center font-extrabold">{item.qty}</span>
            <Button size="sm" onClick={() => setCartQty(item.productId, item.qty + 1)}>
              +
            </Button>
          </div>
        </Card>
      ))}
      {cart.length ? (
        <Button className="w-full" onClick={() => setShopId(cart[0].shopId)}>
          إتمام الحجز · {total} ج
        </Button>
      ) : (
        <p className="py-10 text-center text-sm text-muted-foreground">العربة فاضية</p>
      )}
    </div>
  );
}
