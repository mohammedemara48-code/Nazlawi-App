export type UserRole =
  | "resident"
  | "merchant"
  | "driver"
  | "technician"
  | "doctor"
  | "admin";

export type PostType = "photo" | "video" | "voice" | "text";
export type RideType = "toktok" | "taxi" | "truck";
export type DeliveryStatus = "available" | "busy" | "offline";
export type ScreenId =
  | "profile"
  | "timeline"
  | "market"
  | "delivery"
  | "transport"
  | "carpool"
  | "services"
  | "chat"
  | "admin";

export type VillageUser = {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  approved: boolean;
  subscribed: boolean;
  neighborhood: string;
  createdAt: string;
};

export type TimelinePost = {
  id: string;
  authorId: string;
  authorName: string;
  type: PostType;
  caption?: string;
  durationSec: number;
  likes: number;
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
  authorName: string;
  from: string;
  to: string;
  seats: number;
  note: string;
};

export type ServicePro = {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  neighborhood: string;
  rating: number;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  text?: string;
  audioDuration: number;
  createdAt: string;
};
