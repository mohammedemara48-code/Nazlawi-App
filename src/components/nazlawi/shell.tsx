import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Bike,
  Car,
  ClipboardList,
  Heart,
  Home,
  LayoutGrid,
  LogOut,
  Menu,
  MessageCircle,
  Percent,
  Plus,
  Shield,
  ShoppingCart,
  Store,
  Truck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { canEnter, canPublish, useNazlawi } from "@/lib/nazlawi/store";
import type { ScreenId } from "@/lib/nazlawi/types";
import { LeafMark } from "./mark";
import { CartScreen, CategoriesScreen, HomeScreen, OffersScreen } from "./home";
import { MarketScreen } from "./market";
import { readAsDataUrl } from "./media";
import {
  ChatScreen,
  CommentBox,
  PeopleScreen,
  ProfileScreen,
  TimelineScreen,
} from "./social";
import { enableVillagePush } from "@/lib/nazlawi/push-client";

const NAV: { id: ScreenId; title: string }[] = [
  { id: "home", title: "الرئيسية" },
  { id: "categories", title: "الفئات" },
  { id: "offers", title: "العروض" },
  { id: "market", title: "سوق النزل" },
  { id: "timeline", title: "قريتي" },
  { id: "carpool", title: "خدني معاك" },
  { id: "delivery", title: "توصيل نزلاوي" },
  { id: "transport", title: "مواقف ونقل" },
  { id: "services", title: "دليل الخدمات" },
  { id: "people", title: "المشتركين" },
  { id: "chat", title: "محادثة" },
  { id: "profile", title: "الحساب" },
  { id: "cart", title: "العربة" },
  { id: "admin", title: "لوحة الإدارة" },
];

const ICONS: Record<ScreenId, typeof UserRound> = {
  home: Home,
  categories: LayoutGrid,
  offers: Percent,
  cart: ShoppingCart,
  profile: UserRound,
  timeline: ClipboardList,
  people: Users,
  market: Store,
  delivery: Bike,
  transport: Car,
  carpool: Users,
  services: Heart,
  chat: MessageCircle,
  admin: Shield,
};

const CONSUMER_TAB: { id: ScreenId; title: string }[] = [
  { id: "home", title: "الرئيسية" },
  { id: "categories", title: "الفئات" },
  { id: "offers", title: "عروض" },
  { id: "profile", title: "الحساب" },
  { id: "cart", title: "العربة" },
];

const MERCHANT_TAB: { id: ScreenId; title: string }[] = [
  { id: "market", title: "متجري" },
  { id: "timeline", title: "قريتي" },
  { id: "offers", title: "عروض" },
  { id: "profile", title: "الحساب" },
  { id: "people", title: "المشتركين" },
];

type ComposeKind = "post" | "product" | "carpool" | "ride" | "service";

export function Shell() {
  const screen = useNazlawi((s) => s.screen);
  const setScreen = useNazlawi((s) => s.setScreen);
  const logout = useNazlawi((s) => s.logout);
  const setToast = useNazlawi((s) => s.setToast);
  const user = useNazlawi((s) => s.currentUser);
  const role = user?.role ?? "resident";
  const cartCount = useNazlawi((s) => s.cart.reduce((n, i) => n + i.qty, 0));
  const [open, setOpen] = useState(false);
  const [compose, setCompose] = useState<ComposeKind | null>(null);
  const items = NAV.filter((n) => canEnter(role, n.id));
  const tabs = role === "merchant" ? MERCHANT_TAB : CONSUMER_TAB;
  const title = items.find((n) => n.id === screen)?.title ?? "نزلاوي";
  const showFab =
    canPublish(role, screen) &&
    screen !== "market" &&
    screen !== "home" &&
    screen !== "cart" &&
    screen !== "categories" &&
    screen !== "offers";

  useEffect(() => {
    if (user && !canEnter(role, screen)) setScreen(role === "merchant" ? "market" : "home");
    if (user && role === "merchant" && (screen === "home" || screen === "cart" || screen === "categories")) {
      setScreen("market");
    }
  }, [user, role, screen, setScreen]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-bg">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-card/95 px-3 py-3 backdrop-blur">
        <Button variant="ghost" size="icon" aria-label="القائمة" onClick={() => setOpen(true)}>
          <Menu className="size-5" />
        </Button>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate font-extrabold">{role === "merchant" ? "متجري" : title}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="إشعارات"
          onClick={() => {
            void enableVillagePush().then((result) => setToast(result === "ok" ? "تم" : result));
          }}
        >
          <Bell className="size-5" />
        </Button>
      </header>

      <main className="flex-1 px-4 pb-28 pt-4">
        {screen === "home" && <HomeScreen />}
        {screen === "categories" && <CategoriesScreen />}
        {screen === "offers" && <OffersScreen />}
        {screen === "cart" && <CartScreen />}
        {screen === "profile" && <ProfileScreen />}
        {screen === "timeline" && <TimelineScreen />}
        {screen === "people" && <PeopleScreen />}
        {screen === "market" && <MarketScreen />}
        {screen === "delivery" && <DeliveryScreen />}
        {screen === "transport" && <TransportScreen />}
        {screen === "carpool" && <CarpoolScreen />}
        {screen === "services" && <ServicesScreen />}
        {screen === "chat" && <ChatScreen />}
        {screen === "admin" && role === "admin" && <AdminScreen />}
      </main>

      {showFab && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-20 flex justify-center">
          <Button
            className="pointer-events-auto shadow-lg"
            onClick={() =>
              setCompose(
                screen === "timeline"
                  ? "post"
                  : screen === "transport"
                    ? "ride"
                    : screen === "services"
                      ? "service"
                      : "carpool",
              )
            }
          >
            <Plus className="size-4" />
            نشر
          </Button>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-40">
          <button
            className="absolute inset-0 bg-ink/40"
            aria-label="إغلاق القائمة"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 right-0 flex w-[min(22rem,88vw)] flex-col bg-card shadow-xl">
            <div className="bg-emerald-dark px-5 py-6 text-primary-foreground">
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary-foreground/15">
                <LeafMark />
              </div>
              <p className="text-xl font-extrabold">نزلاوي</p>
              {user?.name ? <p className="text-sm text-primary-foreground/80">{user.name}</p> : null}
            </div>
            <nav className="flex-1 overflow-y-auto p-2">
              {items.map((item) => {
                const Icon = ICONS[item.id];
                const active = screen === item.id;
                return (
                  <button
                    key={item.id}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right ${
                      active ? "bg-secondary text-secondary-foreground" : "hover:bg-muted"
                    }`}
                    onClick={() => {
                      setScreen(item.id);
                      setOpen(false);
                    }}
                  >
                    <Icon className="size-5 shrink-0" />
                    <span className="font-bold">{item.title}</span>
                  </button>
                );
              })}
            </nav>
            <button
              className="flex items-center gap-3 border-t border-border px-5 py-4 text-coral"
              onClick={logout}
            >
              <LogOut className="size-5" />
              تسجيل الخروج
            </button>
          </aside>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-lg items-end justify-between border-t border-border bg-card/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
        {tabs.map((tab) => {
          const Icon = ICONS[tab.id];
          const active = screen === tab.id;
          const featured = tab.id === (role === "merchant" ? "market" : "offers");
          return (
            <button
              key={tab.id}
              className={`relative flex flex-1 flex-col items-center gap-1 ${
                featured ? "-translate-y-3" : ""
              }`}
              onClick={() => setScreen(tab.id)}
            >
              <span
                className={`flex items-center justify-center ${
                  featured
                    ? "size-14 rounded-full bg-primary text-primary-foreground shadow-lg"
                    : `size-8 ${active ? "text-primary" : "text-muted-foreground"}`
                }`}
              >
                <Icon className={featured ? "size-6" : "size-5"} />
              </span>
              <span className={`text-[11px] font-bold ${active ? "text-primary" : "text-muted-foreground"}`}>
                {tab.title}
              </span>
              {tab.id === "cart" && cartCount > 0 ? (
                <span className="absolute top-0 left-1/2 flex h-4 min-w-4 -translate-x-6 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-primary-foreground">
                  {cartCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {compose && <ComposeSheet kind={compose} onClose={() => setCompose(null)} />}
    </div>
  );
}

function ComposeSheet({ kind, onClose }: { kind: ComposeKind; onClose: () => void }) {
  const addPost = useNazlawi((s) => s.addPost);
  const addProduct = useNazlawi((s) => s.addProduct);
  const addCarpool = useNazlawi((s) => s.addCarpool);
  const addRide = useNazlawi((s) => s.addRide);
  const addService = useNazlawi((s) => s.addService);
  const fileRef = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<{ url: string; type: "photo" | "video" } | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-3 sm:items-center">
      <Card className="w-full max-w-md p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-extrabold">نشر</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="إغلاق">
            <X className="size-4" />
          </Button>
        </div>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            if (kind === "post")
              addPost(
                String(fd.get("caption") ?? ""),
                media?.type ?? "text",
                media?.url,
              );
            if (kind === "product")
              addProduct(
                String(fd.get("title") ?? ""),
                String(fd.get("desc") ?? ""),
                Number(fd.get("price") ?? 0),
                media?.url,
              );
            if (kind === "carpool")
              addCarpool(
                String(fd.get("from") ?? "النزل"),
                String(fd.get("to") ?? ""),
                Number(fd.get("seats") ?? 1),
                String(fd.get("note") ?? ""),
                media?.url,
              );
            if (kind === "ride")
              addRide(
                (String(fd.get("type") ?? "toktok") as "toktok" | "taxi" | "truck"),
                String(fd.get("from") ?? "النزل"),
                String(fd.get("to") ?? ""),
                Number(fd.get("price") ?? 0),
              );
            if (kind === "service")
              addService(String(fd.get("specialty") ?? ""), String(fd.get("hood") ?? "النزل"));
            onClose();
          }}
        >
          {kind === "post" && <Input name="caption" placeholder="اكتب…" />}
          {kind === "product" && (
            <>
              <Input name="title" required placeholder="اسم المنتج" />
              <Input name="desc" placeholder="الوصف" />
              <Input name="price" inputMode="numeric" placeholder="السعر" />
            </>
          )}
          {kind === "carpool" && (
            <>
              <Input name="from" defaultValue="النزل" placeholder="من" />
              <Input name="to" required placeholder="إلى" />
              <Input name="seats" defaultValue="2" inputMode="numeric" placeholder="مقاعد" />
              <Input name="note" placeholder="ملاحظة" />
            </>
          )}
          {kind === "ride" && (
            <>
              <select
                name="type"
                className="h-11 rounded-lg border border-border bg-muted px-3 text-sm"
                defaultValue="toktok"
              >
                <option value="toktok">توك توك</option>
                <option value="taxi">تاكسي</option>
                <option value="truck">نقل</option>
              </select>
              <Input name="from" defaultValue="النزل" placeholder="من" />
              <Input name="to" required placeholder="إلى" />
              <Input name="price" inputMode="numeric" placeholder="السعر" />
            </>
          )}
          {kind === "service" && (
            <>
              <Input name="specialty" required placeholder="التخصص" />
              <Input name="hood" defaultValue="النزل" placeholder="المنطقة" />
            </>
          )}
          {(kind === "post" || kind === "product" || kind === "carpool") && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await readAsDataUrl(file);
                  setMedia({ url, type: file.type.startsWith("video") ? "video" : "photo" });
                }}
              />
              <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
                صورة / فيديو
              </Button>
              {media?.type === "photo" ? (
                <img src={media.url} alt="" className="max-h-40 rounded-lg object-cover" />
              ) : null}
              {media?.type === "video" ? (
                <video src={media.url} className="max-h-40 rounded-lg" controls />
              ) : null}
            </>
          )}
          <Button type="submit">حفظ</Button>
        </form>
      </Card>
    </div>
  );
}

function DeliveryScreen() {
  const agents = useNazlawi((s) => s.agents);
  const me = useNazlawi((s) => s.currentUser);
  const setMyDelivery = useNazlawi((s) => s.setMyDelivery);
  const mine = agents.find((a) => a.id === me?.id);
  const on = mine?.status === "available";
  return (
    <div className="flex flex-col gap-3">
      {me && canPublish(me.role, "delivery") ? (
        <Card className="flex items-center justify-between bg-secondary p-4">
          <p className="font-extrabold">أنا متاح للتوصيل</p>
          <button
            className={`h-7 w-12 rounded-full ${on ? "bg-primary" : "bg-border"}`}
            onClick={() => setMyDelivery(on ? "offline" : "available")}
            aria-label="تبديل حالة التوصيل"
          >
            <span
              className={`block size-5 rounded-full bg-card transition-transform ${
                on ? "-translate-x-6" : "-translate-x-1"
              }`}
            />
          </button>
        </Card>
      ) : null}
      {agents.map((a) => (
        <Card key={a.id} className="p-4">
          <p className="font-extrabold">{a.name}</p>
          <p className="text-sm text-muted-foreground">
            {a.vehicle} · {a.status === "available" ? "متاح" : a.status === "busy" ? "مشغول" : "مغلق"}
          </p>
        </Card>
      ))}
    </div>
  );
}

function TransportScreen() {
  const rides = useNazlawi((s) => s.rides);
  return (
    <div className="flex flex-col gap-3">
      {rides.map((r) => (
        <Card key={r.id} className="p-4">
          <div className="flex items-center gap-2">
            {r.type === "truck" ? <Truck className="size-5" /> : <Car className="size-5" />}
            <p className="font-extrabold">{r.driverName}</p>
          </div>
          <p className="mt-1 text-sm">
            {r.from} → {r.to}
          </p>
          <p className="font-extrabold text-primary">{r.price} ج</p>
        </Card>
      ))}
    </div>
  );
}

function CarpoolScreen() {
  const carpools = useNazlawi((s) => s.carpools);
  const commentCarpool = useNazlawi((s) => s.commentCarpool);
  const openMember = useNazlawi((s) => s.openMember);
  return (
    <div className="flex flex-col gap-3">
      {carpools.map((c) => (
        <Card key={c.id} className="p-4">
          <button className="font-extrabold" onClick={() => openMember(c.authorId)}>
            {c.authorName}
          </button>
          <p className="mt-1">
            {c.from} → {c.to} · {c.seats} مقاعد
          </p>
          {c.note ? <p className="text-sm text-muted-foreground">{c.note}</p> : null}
          {c.photo ? <img src={c.photo} alt="" className="mt-2 w-full rounded-lg object-cover" /> : null}
          <CommentBox items={c.comments} onSend={(t) => commentCarpool(c.id, t)} />
        </Card>
      ))}
    </div>
  );
}

function ServicesScreen() {
  const services = useNazlawi((s) => s.services);
  return (
    <div className="flex flex-col gap-3">
      {services.map((s) => (
        <Card key={s.id} className="p-4">
          <p className="font-extrabold">{s.name}</p>
          <p className="text-sm">{s.specialty}</p>
          <p className="text-xs text-muted-foreground">{s.neighborhood}</p>
        </Card>
      ))}
    </div>
  );
}

function AdminScreen() {
  const users = useNazlawi((s) => s.users);
  const addMember = useNazlawi((s) => s.addMember);
  const banUser = useNazlawi((s) => s.banUser);
  const openMember = useNazlawi((s) => s.openMember);
  return (
    <div className="flex flex-col gap-3">
      <Card className="p-4">
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            addMember(
              String(fd.get("name") ?? ""),
              String(fd.get("phone") ?? ""),
              String(fd.get("role") ?? "resident") as "resident" | "merchant" | "admin",
            );
            e.currentTarget.reset();
          }}
        >
          <Input name="name" required placeholder="الاسم" />
          <Input name="phone" required placeholder="الإيميل" />
          <select name="role" className="h-11 rounded-lg border border-border bg-muted px-3 text-sm" defaultValue="resident">
            <option value="resident">نزلاوي</option>
            <option value="merchant">تاجر</option>
          </select>
          <Button type="submit">إضافة مشترك</Button>
        </form>
      </Card>
      {users.map((u) => (
        <Card key={u.id} className="flex items-center gap-3 p-3">
          <button className="min-w-0 flex-1 text-right" onClick={() => openMember(u.id)}>
            <p className="font-extrabold">{u.name}</p>
            <p className="text-xs text-muted-foreground">
              {u.email} · {u.banned ? "محظور" : u.role}
            </p>
          </button>
          <Button size="sm" variant="outline" onClick={() => banUser(u.id, !u.banned)}>
            {u.banned ? "فك" : "حظر"}
          </Button>
        </Card>
      ))}
    </div>
  );
}
