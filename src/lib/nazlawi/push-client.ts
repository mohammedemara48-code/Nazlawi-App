import { VAPID_PUBLIC_KEY } from "./vapid";
import { savePushSubscription } from "./push-fns";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as { standalone?: boolean }).standalone))
  );
}

export function deviceKind(): "ios" | "android" | "other" {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

export async function registerNazlawiWorker() {
  if (!("serviceWorker" in navigator)) return null;
  return navigator.serviceWorker.register("/nazlawi-sw.js", { scope: "/" });
}

export async function enableVillagePush(): Promise<string> {
  if (typeof window === "undefined") return "غير متاح";
  if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return "غير مدعوم";
  }
  if (deviceKind() === "ios" && !isStandalone()) {
    return "ثبّت نزلاوي أولاً";
  }
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return "مرفوض";

  const reg = (await navigator.serviceWorker.getRegistration("/")) ?? (await registerNazlawiWorker());
  if (!reg) return "تعذر";
  await navigator.serviceWorker.ready;

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });
  const json = sub.toJSON();
  const endpoint = json.endpoint ?? "";
  const p256dh = json.keys?.p256dh ?? "";
  const auth = json.keys?.auth ?? "";
  const saved = await savePushSubscription({ data: { endpoint, p256dh, auth } });
  if (!saved.ok) return "تعذر";
  return "ok";
}
