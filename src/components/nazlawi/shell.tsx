import { useState, type ReactNode } from "react";
import {
  Bell,
  Bike,
  Car,
  ClipboardList,
  Heart,
  ImageIcon,
  LogOut,
  Menu,
  MessageCircle,
  Mic,
  Plus,
  Search,
  Send,
  Shield,
  ShoppingBasket,
  Store,
  Truck,
  UserRound,
  Users,
  Video,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LeafMark } from "./mark";
import { BroadcastPushCard, InstallAndNotifyCard } from "./install-push";
import { enableVillagePush } from "@/lib/nazlawi/push-client";
import { useNazlawi } from "@/lib/nazlawi/store";
import type { ScreenId } from "@/lib/nazlawi/types";

const NAV: { id: ScreenId; title: string; admin?: boolean }[] = [
  { id: "profile", title: "حسابي" },
  { id: "timeline", title: "قريتي" },
  { id: "market", title: "سوق النزل" },
  { id: "delivery", title: "توصيل نزلاوي" },
  { id: "transport", title: "مواقف ونقل" },
  { id: "carpool", title: "خدني معاك" },
  { id: "services", title: "دليل الخدمات" },
  { id: "chat", title: "محادثة خاصة" },
  { id: "admin", title: "لوحة الإدارة", admin: true },
];

const ICONS: Record<ScreenId, typeof UserRound> = {
  profile: UserRound,
  timeline: ClipboardList,
  market: Store,
  delivery: Bike,
  transport: Car,
  carpool: Users,
  services: Heart,
  chat: MessageCircle,
  admin: Shield,
};

export function Shell() {
  const screen = useNazlawi((s) => s.screen);
  const setScreen = useNazlawi((s) => s.setScreen);
  const logout = useNazlawi((s) => s.logout);
  const setToast = useNazlawi((s) => s.setToast);
  const user = useNazlawi((s) => s.currentUser);
  const isAdmin = user?.role === "admin";
  const [open, setOpen] = useState(false);
  const [compose, setCompose] = useState<"post" | "product" | "carpool" | null>(null);
  const title = NAV.find((n) => n.id === screen)?.title ?? "نزلاوي";

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-bg">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-card/95 px-3 py-3 backdrop-blur">
        <Button variant="ghost" size="icon" aria-label="القائمة" onClick={() => setOpen(true)}>
          <Menu className="size-5" />
        </Button>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate font-extrabold">{title}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="إشعارات"
          onClick={() => {
            void enableVillagePush().then((result) =>
              setToast(result === "ok" ? "تم" : result),
            );
          }}
        >
          <Bell className="size-5" />
        </Button>
      </header>

      <main className="flex-1 px-4 pb-24 pt-4">
        {screen === "profile" && <ProfileScreen />}
        {screen === "timeline" && <TimelineScreen />}
        {screen === "market" && <MarketScreen />}
        {screen === "delivery" && <DeliveryScreen />}
        {screen === "transport" && <TransportScreen />}
        {screen === "carpool" && <CarpoolScreen />}
        {screen === "services" && <ServicesScreen />}
        {screen === "chat" && <ChatScreen />}
        {screen === "admin" && isAdmin && <AdminScreen />}
      </main>

      {(screen === "timeline" || screen === "market" || screen === "carpool") && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center">
          <Button
            className="pointer-events-auto shadow-lg"
            onClick={() =>
              setCompose(
                screen === "timeline" ? "post" : screen === "market" ? "product" : "carpool",
              )
            }
          >
            <Plus className="size-4" />
            {screen === "timeline" ? "منشور" : screen === "market" ? "منتج" : "مشوار"}
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
          <aside className="absolute inset-y-0 right-0 flex w-[min(22rem,88vw)] flex-col bg-card shadow-xl transition-transform duration-(--motion-fast)">
            <div className="bg-emerald-dark px-5 py-6 text-primary-foreground">
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary-foreground/15">
                <LeafMark />
              </div>
              <p className="text-xl font-extrabold">نزلاوي</p>
              {user?.name ? <p className="text-sm text-primary-foreground/80">{user.name}</p> : null}
            </div>
            <nav className="flex-1 overflow-y-auto p-2">
              {NAV.filter((n) => !n.admin || isAdmin).map((item) => {
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
                    <span className="min-w-0">
                      <span className="block font-bold">{item.title}</span>
                    </span>
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

      {compose && (
        <ComposeSheet kind={compose} onClose={() => setCompose(null)} />
      )}
    </div>
  );
}

function ComposeSheet({
  kind,
  onClose,
}: {
  kind: "post" | "product" | "carpool";
  onClose: () => void;
}) {
  const addPost = useNazlawi((s) => s.addPost);
  const addProduct = useNazlawi((s) => s.addProduct);
  const addCarpool = useNazlawi((s) => s.addCarpool);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-3 sm:items-center">
      <Card className="w-full max-w-md p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-extrabold">
            {kind === "post" ? "منشور" : kind === "product" ? "منتج" : "خدني معاك"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="إغلاق">
            <X className="size-4" />
          </Button>
        </div>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            if (kind === "post") addPost(String(fd.get("caption") ?? ""), "text");
            if (kind === "product")
              addProduct(
                String(fd.get("title") ?? ""),
                String(fd.get("desc") ?? ""),
                Number(fd.get("price") ?? 0),
              );
            if (kind === "carpool")
              addCarpool(
                String(fd.get("from") ?? "النزل"),
                String(fd.get("to") ?? ""),
                Number(fd.get("seats") ?? 1),
                String(fd.get("note") ?? ""),
              );
            onClose();
          }}
        >
          {kind === "post" && (
            <Input name="caption" placeholder="اكتب…" />
          )}
          {kind === "product" && (
            <>
              <Input name="title" required placeholder="اسم المنتج" />
              <Input name="desc" placeholder="الوصف" />
              <Input name="price" inputMode="numeric" placeholder="السعر بالجنيه" />
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
          <Button type="submit">حفظ</Button>
        </form>
      </Card>
    </div>
  );
}

function ProfileScreen() {
  const user = useNazlawi((s) => s.currentUser);
  const logout = useNazlawi((s) => s.logout);
  const roleAr: Record<string, string> = {
    admin: "مدير القرية",
    merchant: "تاجر",
    driver: "سائق",
    technician: "فني",
    doctor: "طبيب",
    resident: "نزلاوي",
  };
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex size-20 items-center justify-center rounded-full bg-secondary text-primary">
        <UserRound className="size-10" />
      </div>
      <h2 className="text-xl font-extrabold">{user?.name}</h2>
      <Card className="mt-4 w-full divide-y divide-border">
        <Row label="رقم الموبايل" value={user?.phone} />
        <Row label="الحساب" value={roleAr[user?.role ?? "resident"]} />
      </Card>
      <InstallAndNotifyCard />
      <Button variant="outline" className="mt-4 w-full" onClick={logout}>
        تسجيل الخروج
      </Button>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="px-4 py-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function TimelineScreen() {
  const posts = useNazlawi((s) => s.posts);
  const likePost = useNazlawi((s) => s.likePost);
  return (
    <div className="flex flex-col gap-3">
      {posts.map((post) => (
        <Card key={post.id} className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-secondary font-extrabold text-secondary-foreground">
              {post.authorName.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-extrabold">{post.authorName}</p>
              <p className="text-xs text-muted-foreground">
                {post.type === "photo"
                  ? "صورة"
                  : post.type === "video"
                    ? "فيديو قصير"
                    : post.type === "voice"
                      ? "رسالة صوتية"
                      : "منشور"}
              </p>
            </div>
          </div>
          {post.caption ? <p className="mt-3 leading-7">{post.caption}</p> : null}
          {post.type === "photo" && (
            <MediaFrame>
              <ImageIcon className="size-8 text-primary" />
              <span>صورة من القرية</span>
            </MediaFrame>
          )}
          {post.type === "video" && (
            <MediaFrame dark>
              <Video className="size-8" />
              <span>فيديو قصير · {post.durationSec}ث</span>
            </MediaFrame>
          )}
          {post.type === "voice" && <VoiceBar seconds={post.durationSec} />}
          <button
            className="mt-3 flex items-center gap-2 text-sm text-coral"
            onClick={() => likePost(post.id)}
          >
            <Heart className="size-4" /> {post.likes}
          </button>
        </Card>
      ))}
    </div>
  );
}

function MediaFrame({
  children,
  dark,
}: {
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className={`mt-3 flex h-40 flex-col items-center justify-center gap-2 rounded-lg ${
        dark ? "bg-ink text-primary-foreground" : "bg-sand text-muted-foreground"
      }`}
    >
      {children}
    </div>
  );
}

function VoiceBar({ seconds }: { seconds: number }) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return (
    <div className="mt-3 flex items-center gap-3 rounded-full bg-secondary px-3 py-2">
      <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Mic className="size-4" />
      </span>
      <span className="h-5 flex-1 rounded-full bg-primary/20" />
      <span className="text-xs font-bold text-secondary-foreground">
        {m}:{s}
      </span>
    </div>
  );
}

function MarketScreen() {
  const products = useNazlawi((s) => s.products);
  const reserveProduct = useNazlawi((s) => s.reserveProduct);
  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute top-3 right-3 size-4 text-muted-foreground" />
        <Input className="pr-9" placeholder="ابحث في سوق النزل…" />
      </div>
      {products.map((p) => (
        <Card key={p.id} className="flex items-center gap-3 p-3">
          <div className="flex size-16 items-center justify-center rounded-lg bg-sand text-primary">
            <ShoppingBasket className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold">{p.title}</p>
            <p className="text-xs text-muted-foreground">{p.merchantName}</p>
            <p className="text-sm">{p.description}</p>
            <p className="font-extrabold text-primary">
              {p.price} ج · {p.unit}
            </p>
          </div>
          <Button size="sm" onClick={() => reserveProduct(p.title)}>
            حجز
          </Button>
        </Card>
      ))}
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
      {agents.map((a) => (
        <Card key={a.id} className="flex items-center gap-3 p-4">
          <Bike className="size-5 text-primary" />
          <div className="flex-1">
            <p className="font-bold">{a.name}</p>
            <p className="text-sm text-muted-foreground">
              {a.vehicle} · تقييم {a.rating}
            </p>
          </div>
          <span className={`text-xs font-bold ${a.status === "available" ? "text-primary" : "text-muted-foreground"}`}>
            {a.status === "available" ? "متاح" : a.status === "busy" ? "مشغول" : "غير متصل"}
          </span>
        </Card>
      ))}
    </div>
  );
}

function TransportScreen() {
  const rides = useNazlawi((s) => s.rides);
  const icons = { toktok: Bike, taxi: Car, truck: Truck };
  const labels = { toktok: "توك توك", taxi: "تاكسي", truck: "نقل" };
  return (
    <div className="flex flex-col gap-3">
      {rides.map((r) => {
        const Icon = icons[r.type];
        return (
          <Card key={r.id} className="flex items-center gap-3 p-4">
            <Icon className="size-5 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="font-extrabold">
                {r.from} ← {r.to}
              </p>
              <p className="text-sm text-muted-foreground">
                {r.driverName} · {labels[r.type]}
              </p>
            </div>
            <div className="text-left">
              <p className="font-extrabold text-primary">{r.price} ج</p>
              <Button size="sm" className="mt-1">
                احجز
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function CarpoolScreen() {
  const carpools = useNazlawi((s) => s.carpools);
  return (
    <div className="flex flex-col gap-3">
      {carpools.map((c) => (
        <Card key={c.id} className="p-4">
          <p className="font-extrabold">
            {c.from} ← {c.to}
          </p>
          <p className="text-sm text-muted-foreground">
            {c.authorName} · {c.seats} مقاعد
          </p>
          {c.note ? <p className="mt-1 text-sm">{c.note}</p> : null}
        </Card>
      ))}
    </div>
  );
}

function ServicesScreen() {
  const services = useNazlawi((s) => s.services);
  return (
    <div className="flex flex-col gap-3">
      <Input placeholder="سباك، كهربائي، دكتور…" />
      {services.map((s) => (
        <Card key={s.id} className="p-4">
          <p className="font-extrabold">{s.name}</p>
          <p className="text-sm text-muted-foreground">
            {s.specialty} · {s.neighborhood}
          </p>
          <p className="mt-1 text-sm text-coral">تقييم {s.rating}</p>
        </Card>
      ))}
    </div>
  );
}

function ChatScreen() {
  const messages = useNazlawi((s) => s.messages);
  const me = useNazlawi((s) => s.currentUser);
  const sendMessage = useNazlawi((s) => s.sendMessage);
  return (
    <div className="flex min-h-[60dvh] flex-col">
      <div className="flex flex-1 flex-col gap-2">
        {messages.map((m) => {
          const mine = m.senderId === me?.id;
          return (
            <div
              key={m.id}
              className={`max-w-[80%] rounded-xl border border-border px-3 py-2 ${
                mine ? "self-start bg-secondary" : "self-end bg-card"
              }`}
            >
              <p className="text-[11px] font-bold text-primary">{m.senderName}</p>
              {m.audioDuration > 0 && !m.text ? (
                <VoiceBar seconds={m.audioDuration} />
              ) : (
                <p>{m.text}</p>
              )}
            </div>
          );
        })}
      </div>
      <form
        className="mt-4 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          sendMessage(String(fd.get("text") ?? ""));
          e.currentTarget.reset();
        }}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="رسالة صوتية"
          onClick={() => sendMessage(undefined, true)}
        >
          <Mic className="size-5 text-primary" />
        </Button>
        <Input name="text" placeholder="رسالة" />
        <Button type="submit" size="icon" aria-label="إرسال">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}

function AdminScreen() {
  const users = useNazlawi((s) => s.users);
  const approveUser = useNazlawi((s) => s.approveUser);
  const setSubscribed = useNazlawi((s) => s.setSubscribed);
  const pending = users.filter((u) => !u.approved);
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        <Stat label="أعضاء" value={users.length} />
        <Stat label="بانتظار" value={pending.length} />
        <Stat label="مشتركين" value={users.filter((u) => u.subscribed).length} />
      </div>
      <BroadcastPushCard />
      <h3 className="mt-2 font-extrabold">طلبات الانضمام</h3>
      {pending.length === 0 ? (
        <Card className="p-4 text-sm text-muted-foreground">لا توجد طلبات معلّقة</Card>
      ) : (
        pending.map((u) => (
          <Card key={u.id} className="flex items-center gap-2 p-3">
            <div className="flex-1">
              <p className="font-bold">{u.name}</p>
              <p className="text-xs text-muted-foreground">
                {u.phone} · {u.neighborhood}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => approveUser(u.id, false)}>
              رفض
            </Button>
            <Button size="sm" onClick={() => approveUser(u.id, true)}>
              موافقة
            </Button>
          </Card>
        ))
      )}
      <h3 className="mt-2 font-extrabold">الاشتراكات</h3>
      {users.map((u) => (
        <Card key={u.id} className="flex items-center justify-between p-3">
          <div>
            <p className="font-bold">{u.name}</p>
            <p className="text-xs text-muted-foreground">{u.phone}</p>
          </div>
          <button
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              u.subscribed ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
            }`}
            onClick={() => setSubscribed(u.id, !u.subscribed)}
          >
            {u.subscribed ? "مشترك" : "غير مشترك"}
          </button>
        </Card>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-3 text-center">
      <p className="text-xl font-extrabold text-primary">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}
