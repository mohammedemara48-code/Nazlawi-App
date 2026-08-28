import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CarpoolPost,
  ChatMessage,
  DeliveryAgent,
  DeliveryStatus,
  Product,
  RideOffer,
  ScreenId,
  ServicePro,
  TimelinePost,
  UserRole,
  VillageUser,
} from "./types";

const nid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const seedUsers: VillageUser[] = [
  {
    id: "u1",
    name: "أحمد عبدالسلام",
    phone: "+201000000001",
    role: "admin",
    approved: true,
    subscribed: true,
    neighborhood: "النزل",
    createdAt: "2026-01-10T10:00:00.000Z",
  },
  {
    id: "u2",
    name: "أم يوسف",
    phone: "+201000000002",
    role: "merchant",
    approved: true,
    subscribed: true,
    neighborhood: "النزل",
    createdAt: "2026-02-04T10:00:00.000Z",
  },
  {
    id: "u3",
    name: "حودة التوك توك",
    phone: "+201000000003",
    role: "driver",
    approved: true,
    subscribed: true,
    neighborhood: "النزل",
    createdAt: "2026-03-12T10:00:00.000Z",
  },
];

const seedPosts: TimelinePost[] = [
  {
    id: "p1",
    authorId: "u2",
    authorName: "أم يوسف",
    type: "photo",
    caption: "عشا اليوم من فرن البيت — عيش بلدي طازة",
    durationSec: 0,
    likes: 24,
    createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
  {
    id: "p2",
    authorId: "u3",
    authorName: "حودة التوك توك",
    type: "voice",
    caption: "مواعيد النقل بكرة الصبح",
    durationSec: 18,
    likes: 7,
    createdAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
  },
  {
    id: "p3",
    authorId: "u1",
    authorName: "أحمد عبدالسلام",
    type: "video",
    caption: "مشهد الغروب على ترعة النزل",
    durationSec: 22,
    likes: 61,
    createdAt: new Date(Date.now() - 86400_000).toISOString(),
  },
];

const seedProducts: Product[] = [
  {
    id: "pr1",
    merchantId: "u2",
    merchantName: "بقالة أم يوسف",
    title: "جبنة قريش بلدي",
    description: "طازة من الصباح، بالكيلو",
    price: 55,
    unit: "كجم",
  },
  {
    id: "pr2",
    merchantId: "u2",
    merchantName: "بقالة أم يوسف",
    title: "عسل نحل النزل",
    description: "من مناحل أهل القرية",
    price: 180,
    unit: "برطمان",
  },
  {
    id: "pr3",
    merchantId: "m3",
    merchantName: "خضار الحاج سيد",
    title: "طماطم بلدي",
    description: "قطف اليوم",
    price: 12,
    unit: "كجم",
  },
];

const seedAgents: DeliveryAgent[] = [
  {
    id: "d1",
    name: "محمود الدليفري",
    phone: "+201111111111",
    status: "available",
    vehicle: "موتوسيكل",
    rating: 4.9,
  },
  {
    id: "d2",
    name: "كريم",
    phone: "+201111111112",
    status: "busy",
    vehicle: "عجلة",
    rating: 4.6,
  },
];

const seedRides: RideOffer[] = [
  {
    id: "r1",
    type: "toktok",
    driverName: "حودة",
    phone: "+201000000003",
    from: "جامع النزل",
    to: "المحطة",
    price: 15,
  },
  {
    id: "r2",
    type: "taxi",
    driverName: "عم صلاح",
    phone: "+201000000033",
    from: "النزل",
    to: "المركز",
    price: 80,
  },
  {
    id: "r3",
    type: "truck",
    driverName: "أبو علي",
    phone: "+201000000044",
    from: "المخزن",
    to: "السوق",
    price: 150,
  },
];

const seedCarpools: CarpoolPost[] = [
  {
    id: "c1",
    authorName: "ياسر",
    from: "النزل",
    to: "القاهرة — رمسيس",
    seats: 2,
    note: "رايح بدري، مكانين فاضيين",
  },
  {
    id: "c2",
    authorName: "منى",
    from: "المحطة",
    to: "المركز",
    seats: 1,
    note: "مواعيد مدرسة",
  },
];

const seedServices: ServicePro[] = [
  {
    id: "s1",
    name: "الحاج فتحي",
    specialty: "سباك",
    phone: "+201222222221",
    neighborhood: "الحارة الكبيرة",
    rating: 4.8,
  },
  {
    id: "s2",
    name: "د. سعاد",
    specialty: "طبيبة أطفال",
    phone: "+201222222222",
    neighborhood: "عيادة السوق",
    rating: 4.9,
  },
  {
    id: "s3",
    name: "عم رجب",
    specialty: "كهربائي",
    phone: "+201222222223",
    neighborhood: "نزلة البحر",
    rating: 4.7,
  },
  {
    id: "s4",
    name: "أسطى جمال",
    specialty: "نجار",
    phone: "+201222222224",
    neighborhood: "ورشة الجامع",
    rating: 4.6,
  },
];

const seedMessages: ChatMessage[] = [
  {
    id: "m1",
    senderId: "u2",
    senderName: "أم يوسف",
    text: "العسل لسه موجود؟",
    audioDuration: 0,
    createdAt: new Date(Date.now() - 12 * 60_000).toISOString(),
  },
  {
    id: "m2",
    senderId: "u1",
    senderName: "أحمد عبدالسلام",
    text: "أيوه، هبعته مع محمود",
    audioDuration: 0,
    createdAt: new Date(Date.now() - 10 * 60_000).toISOString(),
  },
  {
    id: "m3",
    senderId: "u2",
    senderName: "أم يوسف",
    audioDuration: 9,
    createdAt: new Date(Date.now() - 8 * 60_000).toISOString(),
  },
];

function normalizePhone(raw: string) {
  let p = raw.replace(/[\s-]/g, "");
  if (p.startsWith("00")) p = `+${p.slice(2)}`;
  if (p.startsWith("01") && p.length === 11) p = `+2${p}`;
  if (p.startsWith("1") && p.length === 10) p = `+20${p}`;
  if (!p.startsWith("+")) p = `+20${p}`;
  return p;
}

type AccountRole = Extract<UserRole, "resident" | "merchant">;

type NazlawiState = {
  hydrated: boolean;
  users: VillageUser[];
  posts: TimelinePost[];
  products: Product[];
  agents: DeliveryAgent[];
  rides: RideOffer[];
  carpools: CarpoolPost[];
  services: ServicePro[];
  messages: ChatMessage[];
  currentUser: VillageUser | null;
  screen: ScreenId;
  toast: string | null;
  setHydrated: () => void;
  setScreen: (s: ScreenId) => void;
  login: (name: string, phone: string, role: AccountRole) => void;
  logout: () => void;
  approveUser: (id: string, approved: boolean) => void;
  setSubscribed: (id: string, value: boolean) => void;
  addPost: (caption: string, type: TimelinePost["type"]) => void;
  likePost: (id: string) => void;
  addProduct: (title: string, description: string, price: number) => void;
  reserveProduct: (title: string) => void;
  setMyDelivery: (status: DeliveryStatus) => void;
  addCarpool: (from: string, to: string, seats: number, note: string) => void;
  sendMessage: (text?: string, voice?: boolean) => void;
  clearToast: () => void;
  setToast: (msg: string | null) => void;
};

export const useNazlawi = create<NazlawiState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      users: seedUsers,
      posts: seedPosts,
      products: seedProducts,
      agents: seedAgents,
      rides: seedRides,
      carpools: seedCarpools,
      services: seedServices,
      messages: seedMessages,
      currentUser: null,
      screen: "timeline",
      toast: null,
      setHydrated: () => set({ hydrated: true }),
      setScreen: (screen) => set({ screen }),
      login: (name, phone, role) => {
        const nazlawiName = name.trim();
        const normalized = normalizePhone(phone);
        if (!nazlawiName || !normalized) return;
        const existing = get().users.find(
          (u) => u.phone.replace(/\D/g, "") === normalized.replace(/\D/g, ""),
        );
        const isAdmin = normalized.endsWith("0001") || existing?.role === "admin";
        const nextRole: UserRole = isAdmin ? "admin" : role;
        const user: VillageUser = existing
          ? {
              ...existing,
              name: nazlawiName || existing.name,
              role: isAdmin ? "admin" : role,
              approved: true,
            }
          : {
              id: nid(),
              name: nazlawiName,
              phone: normalized,
              role: nextRole,
              approved: true,
              subscribed: nextRole === "admin" || role === "merchant",
              neighborhood: "النزل",
              createdAt: new Date().toISOString(),
            };
        set((s) => ({
          currentUser: user,
          users: existing
            ? s.users.map((u) => (u.id === user.id ? user : u))
            : [...s.users, user],
          screen: nextRole === "merchant" ? "market" : "timeline",
        }));
      },
      logout: () => set({ currentUser: null, screen: "timeline" }),
      approveUser: (id, approved) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? { ...u, approved } : u)),
          currentUser:
            s.currentUser?.id === id
              ? { ...s.currentUser, approved }
              : s.currentUser,
        })),
      setSubscribed: (id, value) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? { ...u, subscribed: value } : u)),
          currentUser:
            s.currentUser?.id === id
              ? { ...s.currentUser, subscribed: value }
              : s.currentUser,
        })),
      addPost: (caption, type) => {
        const me = get().currentUser;
        if (!me) return;
        const post: TimelinePost = {
          id: nid(),
          authorId: me.id,
          authorName: me.name,
          type,
          caption: caption.trim() || undefined,
          durationSec: type === "voice" ? 8 : type === "video" ? 12 : 0,
          likes: 0,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ posts: [post, ...s.posts], toast: "تم" }));
      },
      likePost: (id) =>
        set((s) => ({
          posts: s.posts.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)),
        })),
      addProduct: (title, description, price) => {
        const me = get().currentUser;
        if (!me) return;
        const product: Product = {
          id: nid(),
          merchantId: me.id,
          merchantName: me.name,
          title: title.trim(),
          description: description.trim(),
          price: Number.isFinite(price) ? price : 0,
          unit: "قطعة",
        };
        set((s) => ({ products: [product, ...s.products], toast: "تم" }));
      },
      reserveProduct: (title) => set({ toast: `تم حجز «${title}»` }),
      setMyDelivery: (status) => {
        const me = get().currentUser;
        if (!me) return;
        set((s) => {
          const exists = s.agents.some((a) => a.id === me.id);
          const agents = exists
            ? s.agents.map((a) => (a.id === me.id ? { ...a, status } : a))
            : [
                {
                  id: me.id,
                  name: me.name,
                  phone: me.phone,
                  status,
                  vehicle: "موتوسيكل",
                  rating: 5,
                },
                ...s.agents,
              ];
          return { agents };
        });
      },
      addCarpool: (from, to, seats, note) => {
        const me = get().currentUser;
        if (!me) return;
        const item: CarpoolPost = {
          id: nid(),
          authorName: me.name,
          from: from.trim() || "النزل",
          to: to.trim(),
          seats: seats || 1,
          note: note.trim(),
        };
        set((s) => ({ carpools: [item, ...s.carpools], toast: "تم" }));
      },
      sendMessage: (text, voice) => {
        const me = get().currentUser;
        if (!me) return;
        if (!voice && !text?.trim()) return;
        const msg: ChatMessage = {
          id: nid(),
          senderId: me.id,
          senderName: me.name,
          text: voice ? undefined : text?.trim(),
          audioDuration: voice ? 6 : 0,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ messages: [...s.messages, msg] }));
      },
      clearToast: () => set({ toast: null }),
      setToast: (msg) => set({ toast: msg }),
    }),
    {
      name: "nazlawi-v2",
      skipHydration: true,
      partialize: (s) => ({
        users: s.users,
        posts: s.posts,
        products: s.products,
        agents: s.agents,
        rides: s.rides,
        carpools: s.carpools,
        services: s.services,
        messages: s.messages,
        currentUser: s.currentUser,
        screen: s.screen,
      }),
    },
  ),
);
