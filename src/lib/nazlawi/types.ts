export type UserRole = "resident" | "merchant" | "admin";
export type PostType = "photo" | "video" | "text";
export type RideType = "toktok" | "taxi" | "truck";
export type DeliveryStatus = "available" | "busy" | "offline";
export type FriendStatus = "pending" | "accepted" | "rejected";
export type ScreenId =
  | "home"
  | "categories"
  | "offers"
  | "cart"
  | "profile"
  | "timeline"
  | "people"
  | "market"
  | "delivery"
  | "transport"
  | "carpool"
  | "services"
  | "chat"
  | "admin";

export type Comment = {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
};

export type VillageUser = {
  id: string;
  uid?: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  approved: boolean;
  banned: boolean;
  avatar?: string;
  cover?: string;
  bio?: string;
  neighborhood: string;
  showPhone: boolean;
  showDetails: boolean;
  profileDone?: boolean;
  createdAt: string;
};

export type CartItem = {
  productId: string;
  shopId: string;
  title: string;
  price: number;
  qty: number;
  photo?: string;
};

export type TimelinePost = {
  id: string;
  authorId: string;
  authorName: string;
  type: PostType;
  caption?: string;
  mediaUrl?: string;
  likes: number;
  comments: Comment[];
  createdAt: string;
};

export type Follow = {
  followerId: string;
  merchantKey: string;
};

export type PostReport = {
  id: string;
  postId: string;
  reporterId: string;
  createdAt: string;
};

export type Product = {
  id: string;
  merchantId: string;
  merchantName: string;
  title: string;
  description: string;
  price: number;
  unit: string;
  photo?: string;
  comments: Comment[];
};

export type DeliveryAgent = {
  id: string;
  name: string;
  phone: string;
  status: DeliveryStatus;
  vehicle: string;
  rating: number;
};

export type RideOffer = {
  id: string;
  type: RideType;
  driverName: string;
  phone: string;
  from: string;
  to: string;
  price: number;
};

export type CarpoolPost = {
  id: string;
  authorId: string;
  authorName: string;
  from: string;
  to: string;
  seats: number;
  note: string;
  photo?: string;
  comments: Comment[];
};

export type ServicePro = {
  id: string;
  ownerId: string;
  name: string;
  specialty: string;
  phone: string;
  neighborhood: string;
  rating: number;
};

export type FriendLink = {
  id: string;
  fromId: string;
  toId: string;
  status: FriendStatus;
};

export type ChatMessage = {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
};
