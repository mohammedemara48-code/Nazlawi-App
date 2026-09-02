import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CarpoolPost,
  CartItem,
  ChatMessage,
  Comment,
  DeliveryAgent,
  DeliveryStatus,
  Follow,
  FriendLink,
  PostReport,
  Product,
  RideOffer,
  ScreenId,
  ServicePro,
  TimelinePost,
  UserRole,
  VillageUser,
} from "./types";

export const ADMIN_NAME = "Mohamed Mahmoud Emara";
export const ADMIN_EMAIL = "mohammedemara48@gmail.com";

const nid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function digits(raw: string) {
  return raw.replace(/\D/g, "");
}

export function normalizePhone(raw: string) {
  let d = digits(raw);
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("966")) return `+${d}`;
  if (d.startsWith("05") && d.length === 10) return `+966${d.slice(1)}`;
  if (d.startsWith("5") && d.length === 9) return `+966${d}`;
  if (d.startsWith("20")) return `+${d}`;
  if (d.startsWith("01") && d.length === 11) return `+2${d}`;
  if (d.startsWith("1") && d.length === 10) return `+20${d}`;
  return d ? `+${d}` : "";
}

export function normalizeEmail(raw: string) {
  return raw.trim().toLowerCase();
}

export function isAdminEmail(email: string) {
  return normalizeEmail(email) === ADMIN_EMAIL;
}

export function canEnter(role: UserRole, screen: ScreenId) {
  if (screen === "admin") return role === "admin";
  return true;
}

export function canPublish(role: UserRole, screen: ScreenId) {
  if (screen === "timeline" || screen === "carpool") return true;
  if (role !== "admin" && role !== "merchant") return false;
  return (
    screen === "market" ||
    screen === "delivery" ||
    screen === "transport" ||
    screen === "services"
  );
}

function threadOf(a: string, b: string) {
  return [a, b].sort().join(":");
}

function comment(me: VillageUser, text: string): Comment {
  return {
    id: nid(),
    authorId: me.id,
    authorName: me.name,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };
}

type AccountRole = Extract<UserRole, "resident" | "merchant">;

type NazlawiState = {
  users: VillageUser[];
  posts: TimelinePost[];
  products: Product[];
  agents: DeliveryAgent[];
  rides: RideOffer[];
  carpools: CarpoolPost[];
  services: ServicePro[];
  friends: FriendLink[];
  follows: Follow[];
  reports: PostReport[];
  messages: ChatMessage[];
  cart: CartItem[];
  cartRefs: Record<string, string>;
  currentUser: VillageUser | null;
  screen: ScreenId;
  memberId: string | null;
  chatWith: string | null;
  shopId: string | null;
  shopMode: "store" | "browse";
  toast: string | null;
  setScreen: (s: ScreenId) => void;
  openMember: (id: string) => void;
  openChat: (id: string) => void;
  setShopId: (id: string | null) => void;
  setShopMode: (mode: "store" | "browse") => void;
  login: (email: string, password: string, role: AccountRole) => void;
  loginFromAuth: (p: { email?: string; phone?: string; name?: string; uid?: string; role: AccountRole }) => void;
  logout: () => void;
  addToCart: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  updateMe: (patch: Partial<VillageUser>) => void;
  banUser: (id: string, banned: boolean) => void;
  addMember: (name: string, phone: string, role: UserRole) => void;
  addPost: (caption: string, type: TimelinePost["type"], mediaUrl?: string) => void;
  editPost: (id: string, caption: string) => void;
  deletePost: (id: string) => void;
  reportPost: (id: string) => void;
  likePost: (id: string) => void;
  commentPost: (id: string, text: string) => void;
  addProduct: (title: string, description: string, price: number, photo?: string) => void;
  reserveProduct: (title: string) => void;
  commentProduct: (id: string, text: string) => void;
  setMyDelivery: (status: DeliveryStatus) => void;
  addRide: (type: RideOffer["type"], from: string, to: string, price: number) => void;
  addCarpool: (from: string, to: string, seats: number, note: string, photo?: string) => void;
  commentCarpool: (id: string, text: string) => void;
  addService: (specialty: string, neighborhood: string) => void;
  requestFriend: (toId: string) => void;
  answerFriend: (id: string, accept: boolean) => void;
  followMerchant: (merchantKey: string) => void;
  sendMessage: (text: string) => void;
  sendShopCart: (merchantUserId: string, text: string) => void;
  cartRefFor: (shopId: string) => string;
  clearToast: () => void;
  setToast: (msg: string | null) => void;
};

export const useNazlawi = create<NazlawiState>()(
  persist(
    (set, get) => ({
      users: [],
      posts: [],
      products: [],
      agents: [],
      rides: [],
      carpools: [],
      services: [],
      friends: [],
      follows: [],
      reports: [],
      messages: [],
      cart: [],
      cartRefs: {},
      currentUser: null,
      screen: "home",
      memberId: null,
      chatWith: null,
      shopId: null,
      shopMode: "browse",
      toast: null,
      setScreen: (screen) => set({ screen, memberId: null, shopId: null }),
      openMember: (id) => set({ screen: "people", memberId: id }),
      openChat: (id) => set({ screen: "chat", chatWith: id, memberId: null }),
      setShopId: (shopId) => set({ shopId, screen: "market" }),
      setShopMode: (shopMode) => set({ shopMode }),
      login: (email, password, role) => {
        const pass = password.trim();
        const mail = normalizeEmail(email);
        if (!mail.includes("@") || pass.length < 4) {
          set({ toast: "أدخل الإيميل وكلمة السر" });
          return;
        }
        const admin = isAdminEmail(mail);
        const nazlawiName = admin ? ADMIN_NAME : mail.split("@")[0];
        const existing = get().users.find((u) => normalizeEmail(u.email) === mail);
        if (existing?.banned) {
          set({ toast: "الحساب محظور" });
          return;
        }
        if (existing) {
          if (existing.password && existing.password !== pass) {
            set({ toast: "كلمة السر غلط" });
            return;
          }
          const user: VillageUser = {
            ...existing,
            email: mail,
            password: existing.password || pass,
            role: admin ? "admin" : existing.role,
          };
          set((s) => ({
            currentUser: user,
            users: s.users.map((u) => (u.id === user.id ? user : u)),
            screen: user.role === "merchant" ? "market" : "home",
            shopMode: user.role === "merchant" ? "store" : "browse",
            toast: null,
          }));
          return;
        }
        const nextRole: UserRole = admin ? "admin" : role;
        const user: VillageUser = {
          id: nid(),
          name: nazlawiName,
          email: mail,
          phone: "",
          password: pass,
          role: nextRole,
          approved: true,
          banned: false,
          neighborhood: "النزل",
          showPhone: false,
          showDetails: true,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          currentUser: user,
          users: [...s.users, user],
          screen: nextRole === "merchant" ? "market" : "home",
          shopMode: nextRole === "merchant" ? "store" : "browse",
          toast: null,
        }));
      },
      loginFromAuth: ({ email, phone, name, uid, role }) => {
        const mail = normalizeEmail(email || (phone ? `${digits(phone)}@phone.nazlawi` : ""));
        const tel = phone ? normalizePhone(phone) || phone : "";
        if (!mail && !tel) {
          set({ toast: "تعذر التسجيل" });
          return;
        }
        const admin = isAdminEmail(mail);
        const existing = get().users.find(
          (u) =>
            (uid && u.uid === uid) ||
            (mail && normalizeEmail(u.email) === mail) ||
            (tel && digits(u.phone) && digits(u.phone) === digits(tel)),
        );
        if (existing?.banned) {
          set({ toast: "الحساب محظور" });
          return;
        }
        const nazlawiName = admin ? ADMIN_NAME : (name || existing?.name || mail.split("@")[0] || "نزلاوي");
        if (existing) {
          const user: VillageUser = {
            ...existing,
            uid: uid || existing.uid,
            email: mail || existing.email,
            phone: tel || existing.phone,
            name: nazlawiName,
            role: admin ? "admin" : existing.role,
          };
          set((s) => ({
            currentUser: user,
            users: s.users.map((u) => (u.id === user.id ? user : u)),
            screen: user.role === "merchant" ? "market" : "home",
            shopMode: user.role === "merchant" ? "store" : "browse",
            toast: null,
          }));
          return;
        }
        const nextRole: UserRole = admin ? "admin" : role;
        const user: VillageUser = {
          id: uid || nid(),
          uid,
          name: nazlawiName,
          email: mail,
          phone: tel,
          password: "",
          role: nextRole,
          approved: true,
          banned: false,
          neighborhood: "النزل",
          showPhone: false,
          showDetails: true,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          currentUser: user,
          users: [...s.users, user],
          screen: nextRole === "merchant" ? "market" : "home",
          shopMode: nextRole === "merchant" ? "store" : "browse",
          toast: null,
        }));
      },
      logout: () => set({ currentUser: null, screen: "home", memberId: null, chatWith: null, shopId: null }),
      addToCart: (item, qty = 1) =>
        set((s) => {
          const found = s.cart.find((c) => c.productId === item.productId);
          if (found) {
            return {
              cart: s.cart.map((c) =>
                c.productId === item.productId ? { ...c, qty: c.qty + qty } : c,
              ),
            };
          }
          return { cart: [...s.cart, { ...item, qty }] };
        }),
      setCartQty: (productId, qty) =>
        set((s) => ({
          cart: qty <= 0 ? s.cart.filter((c) => c.productId !== productId) : s.cart.map((c) => (c.productId === productId ? { ...c, qty } : c)),
        })),
      clearCart: () => set({ cart: [] }),
      updateMe: (patch) => {
        const me = get().currentUser;
        if (!me) return;
        const user = { ...me, ...patch, id: me.id, role: me.role };
        set((s) => ({
          currentUser: user,
          users: s.users.map((u) => (u.id === me.id ? user : u)),
        }));
      },
      banUser: (id, banned) => {
        const me = get().currentUser;
        if (me?.role !== "admin") return;
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? { ...u, banned } : u)),
          currentUser: s.currentUser?.id === id ? null : s.currentUser,
          toast: banned ? "تم الحظر" : "تم إلغاء الحظر",
        }));
      },
      addMember: (name, phone, role) => {
        const me = get().currentUser;
        if (me?.role !== "admin") return;
        const mail = normalizeEmail(phone);
        const nazlawiName = name.trim();
        if (!mail.includes("@") || !nazlawiName) return;
        if (get().users.some((u) => normalizeEmail(u.email) === mail)) {
          set({ toast: "الإيميل مسجّل" });
          return;
        }
        const user: VillageUser = {
          id: nid(),
          name: isAdminEmail(mail) ? ADMIN_NAME : nazlawiName,
          email: mail,
          phone: "",
          password: "",
          role: isAdminEmail(mail) ? "admin" : role,
          approved: true,
          banned: false,
          neighborhood: "النزل",
          showPhone: false,
          showDetails: true,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ users: [...s.users, user], toast: "تم" }));
      },
      addPost: (caption, type, mediaUrl) => {
        const me = get().currentUser;
        if (!me || !canPublish(me.role, "timeline")) return;
        const post: TimelinePost = {
          id: nid(),
          authorId: me.id,
          authorName: me.name,
          type,
          caption: caption.trim() || undefined,
          mediaUrl,
          likes: 0,
          comments: [],
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ posts: [post, ...s.posts], toast: "تم" }));
      },
      editPost: (id, caption) => {
        const me = get().currentUser;
        if (!me) return;
        set((s) => ({
          posts: s.posts.map((p) =>
            p.id === id && (p.authorId === me.id || me.role === "admin")
              ? { ...p, caption: caption.trim() }
              : p,
          ),
          toast: "تم التعديل",
        }));
      },
      deletePost: (id) => {
        const me = get().currentUser;
        if (!me) return;
        const post = get().posts.find((p) => p.id === id);
        if (!post || (post.authorId !== me.id && me.role !== "admin")) return;
        set((s) => ({
          posts: s.posts.filter((p) => p.id !== id),
          toast: "تم الحذف",
        }));
      },
      reportPost: (id) => {
        const me = get().currentUser;
        if (!me) return;
        if (get().reports.some((r) => r.postId === id && r.reporterId === me.id)) {
          set({ toast: "اتبلغ قبل كده" });
          return;
        }
        set((s) => ({
          reports: [
            ...s.reports,
            { id: nid(), postId: id, reporterId: me.id, createdAt: new Date().toISOString() },
          ],
          toast: "تم الإبلاغ",
        }));
      },
      likePost: (id) =>
        set((s) => ({
          posts: s.posts.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)),
        })),
      commentPost: (id, text) => {
        const me = get().currentUser;
        if (!me || !text.trim()) return;
        set((s) => ({
          posts: s.posts.map((p) =>
            p.id === id ? { ...p, comments: [...p.comments, comment(me, text)] } : p,
          ),
        }));
      },
      addProduct: (title, description, price, photo) => {
        const me = get().currentUser;
        if (!me || !canPublish(me.role, "market")) return;
        const product: Product = {
          id: nid(),
          merchantId: me.id,
          merchantName: me.name,
          title: title.trim(),
          description: description.trim(),
          price: Number.isFinite(price) ? price : 0,
          unit: "قطعة",
          photo,
          comments: [],
        };
        set((s) => ({ products: [product, ...s.products], toast: "تم" }));
      },
      reserveProduct: (title) => set({ toast: `تم حجز «${title}»` }),
      commentProduct: (id, text) => {
        const me = get().currentUser;
        if (!me || !text.trim()) return;
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, comments: [...p.comments, comment(me, text)] } : p,
          ),
        }));
      },
      setMyDelivery: (status) => {
        const me = get().currentUser;
        if (!me || !canPublish(me.role, "delivery")) return;
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
      addRide: (type, from, to, price) => {
        const me = get().currentUser;
        if (!me || !canPublish(me.role, "transport")) return;
        set((s) => ({
          rides: [
            {
              id: nid(),
              type,
              driverName: me.name,
              phone: me.phone,
              from: from.trim() || "النزل",
              to: to.trim(),
              price: Number(price) || 0,
            },
            ...s.rides,
          ],
          toast: "تم",
        }));
      },
      addCarpool: (from, to, seats, note, photo) => {
        const me = get().currentUser;
        if (!me || !canPublish(me.role, "carpool")) return;
        const item: CarpoolPost = {
          id: nid(),
          authorId: me.id,
          authorName: me.name,
          from: from.trim() || "النزل",
          to: to.trim(),
          seats: seats || 1,
          note: note.trim(),
          photo,
          comments: [],
        };
        set((s) => ({ carpools: [item, ...s.carpools], toast: "تم" }));
      },
      commentCarpool: (id, text) => {
        const me = get().currentUser;
        if (!me || !text.trim()) return;
        set((s) => ({
          carpools: s.carpools.map((p) =>
            p.id === id ? { ...p, comments: [...p.comments, comment(me, text)] } : p,
          ),
        }));
      },
      addService: (specialty, neighborhood) => {
        const me = get().currentUser;
        if (!me || !canPublish(me.role, "services")) return;
        set((s) => ({
          services: [
            {
              id: nid(),
              ownerId: me.id,
              name: me.name,
              specialty: specialty.trim(),
              phone: me.phone,
              neighborhood: neighborhood.trim() || "النزل",
              rating: 5,
            },
            ...s.services,
          ],
          toast: "تم",
        }));
      },
      requestFriend: (toId) => {
        const me = get().currentUser;
        if (!me || me.id === toId) return;
        const exists = get().friends.find(
          (f) =>
            (f.fromId === me.id && f.toId === toId) ||
            (f.fromId === toId && f.toId === me.id),
        );
        if (exists?.status === "accepted") return;
        if (exists?.status === "pending") return;
        const link: FriendLink = {
          id: nid(),
          fromId: me.id,
          toId,
          status: "pending",
        };
        set((s) => ({
          friends: exists
            ? s.friends.map((f) => (f.id === exists.id ? { ...f, status: "pending", fromId: me.id, toId } : f))
            : [...s.friends, link],
          toast: "تم",
        }));
      },
      answerFriend: (id, accept) => {
        const me = get().currentUser;
        if (!me) return;
        set((s) => ({
          friends: s.friends.map((f) =>
            f.id === id && f.toId === me.id
              ? { ...f, status: accept ? "accepted" : "rejected" }
              : f,
          ),
        }));
      },
      followMerchant: (merchantKey) => {
        const me = get().currentUser;
        if (!me || !merchantKey) return;
        const exists = get().follows.some((f) => f.followerId === me.id && f.merchantKey === merchantKey);
        set((s) => ({
          follows: exists
            ? s.follows.filter((f) => !(f.followerId === me.id && f.merchantKey === merchantKey))
            : [...s.follows, { followerId: me.id, merchantKey }],
          toast: exists ? "اتلغت المتابعة" : "بتتابع التاجر",
        }));
      },
      sendMessage: (text) => {
        const me = get().currentUser;
        const other = get().chatWith;
        if (!me || !other || !text.trim()) return;
        const ok = get().friends.some(
          (f) =>
            f.status === "accepted" &&
            ((f.fromId === me.id && f.toId === other) ||
              (f.fromId === other && f.toId === me.id)),
        );
        if (!ok && me.role !== "admin") {
          set({ toast: "الصداقة مطلوبة" });
          return;
        }
        const msg: ChatMessage = {
          id: nid(),
          threadId: threadOf(me.id, other),
          senderId: me.id,
          senderName: me.name,
          text: text.trim(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ messages: [...s.messages, msg] }));
      },
      cartRefFor: (shopId) => {
        const existing = get().cartRefs[shopId];
        if (existing) return existing;
        const ref = `NZ-${shopId.slice(0, 4).toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
        set((s) => ({ cartRefs: { ...s.cartRefs, [shopId]: ref } }));
        return ref;
      },
      sendShopCart: (merchantUserId, text) => {
        const me = get().currentUser;
        if (!me || !merchantUserId || !text.trim()) return;
        const msg: ChatMessage = {
          id: nid(),
          threadId: threadOf(me.id, merchantUserId),
          senderId: me.id,
          senderName: me.name,
          text: text.trim(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          messages: [...s.messages, msg],
          chatWith: merchantUserId,
          screen: "chat",
          toast: "الحجز اتبعت للتاجر",
        }));
      },
      clearToast: () => set({ toast: null }),
      setToast: (msg) => set({ toast: msg }),
    }),
    {
      name: "nazlawi-v7",
      skipHydration: true,
      partialize: (s) => ({
        users: s.users,
        posts: s.posts,
        products: s.products,
        agents: s.agents,
        rides: s.rides,
        carpools: s.carpools,
        services: s.services,
        friends: s.friends,
        follows: s.follows,
        reports: s.reports,
        messages: s.messages,
        cart: s.cart,
        cartRefs: s.cartRefs,
        currentUser: s.currentUser,
        screen: s.screen,
        shopMode: s.shopMode,
      }),
    },
  ),
);

export function areFriends(friends: FriendLink[], a: string, b: string) {
  return friends.some(
    (f) =>
      f.status === "accepted" &&
      ((f.fromId === a && f.toId === b) || (f.fromId === b && f.toId === a)),
  );
}

export function friendLink(friends: FriendLink[], a: string, b: string) {
  return friends.find(
    (f) => (f.fromId === a && f.toId === b) || (f.fromId === b && f.toId === a),
  );
}
