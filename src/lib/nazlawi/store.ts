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
      users: [],
      posts: [],
      products: [],
      agents: [],
      rides: [],
      carpools: [],
      services: [],
      messages: [],
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
      name: "nazlawi-v3",
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
