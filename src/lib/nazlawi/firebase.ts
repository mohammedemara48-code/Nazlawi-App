import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPopup,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
  type Auth,
  type ConfirmationResult,
} from "firebase/auth";

const config = {
  apiKey: String(import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyD8UCmGLRTV28msQ8MwC9esh-6PxlKSZqg"),
  authDomain: String(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "nazlawi-app.firebaseapp.com"),
  projectId: String(import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "nazlawi-app"),
  storageBucket: String(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "nazlawi-app.firebasestorage.app"),
  messagingSenderId: String(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "588724293394"),
  appId: String(import.meta.env.VITE_FIREBASE_APP_ID ?? "1:588724293394:web:15de8bfe95592601a6edcb"),
};

let recaptcha: RecaptchaVerifier | null = null;

export function firebaseReady() {
  return Boolean(config.apiKey && config.appId);
}

function app(): FirebaseApp | null {
  if (typeof window === "undefined" || !firebaseReady()) return null;
  return getApps().length ? getApp() : initializeApp(config);
}

export function firebaseAuth(): Auth | null {
  const instance = app();
  return instance ? getAuth(instance) : null;
}

export async function signInWithGmail() {
  const auth = firebaseAuth();
  if (!auth) throw new Error("firebase");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  provider.addScope("email");
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

function resetRecaptcha(auth: Auth) {
  try {
    recaptcha?.clear();
  } catch {
    /* already gone */
  }
  recaptcha = null;
  const host = document.getElementById("nazlawi-recaptcha");
  if (host) host.replaceChildren();
  recaptcha = new RecaptchaVerifier(auth, "nazlawi-recaptcha", { size: "invisible" });
  return recaptcha;
}

export async function sendPhoneCode(e164: string) {
  const auth = firebaseAuth();
  if (!auth) throw new Error("firebase");
  if (!document.getElementById("nazlawi-recaptcha")) throw new Error("recaptcha");
  try {
    if (!recaptcha) recaptcha = new RecaptchaVerifier(auth, "nazlawi-recaptcha", { size: "invisible" });
    return await signInWithPhoneNumber(auth, e164, recaptcha);
  } catch (err) {
    const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
    if (msg.includes("recaptcha") || msg.includes("already been rendered")) {
      return signInWithPhoneNumber(auth, e164, resetRecaptcha(auth));
    }
    throw err;
  }
}

export async function confirmPhoneCode(confirmation: ConfirmationResult, code: string) {
  const cred = await confirmation.confirm(code.trim());
  return cred.user;
}

export async function firebaseLogout() {
  const auth = firebaseAuth();
  if (auth) await firebaseSignOut(auth);
}

export const COUNTRIES = [
  { iso: "SA", name: "السعودية", dial: "+966" },
  { iso: "EG", name: "مصر", dial: "+20" },
  { iso: "AE", name: "الإمارات", dial: "+971" },
  { iso: "KW", name: "الكويت", dial: "+965" },
  { iso: "QA", name: "قطر", dial: "+974" },
  { iso: "BH", name: "البحرين", dial: "+973" },
  { iso: "OM", name: "عمان", dial: "+968" },
  { iso: "JO", name: "الأردن", dial: "+962" },
] as const;

export function toE164(dial: string, local: string) {
  let n = local.replace(/\D/g, "");
  if (n.startsWith("00")) n = n.slice(2);
  const d = dial.replace(/\D/g, "");
  if (n.startsWith(d)) return `+${n}`;
  if (n.startsWith("0")) n = n.slice(1);
  return `+${d}${n}`;
}

export function firebaseError(err: unknown) {
  const code = typeof err === "object" && err && "code" in err ? String((err as { code: string }).code) : "";
  const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
  if (code.includes("popup-closed")) return "اتقفل تسجيل جيميل";
  if (code.includes("invalid-phone")) return "رقم الجوال غلط";
  if (code.includes("invalid-verification")) return "كود التحقق غلط";
  if (code.includes("too-many-requests")) return "محاولات كتير، حاول بعد شوية";
  if (code.includes("quota") || code.includes("billing")) return "الرسائل خلصت النهاردة أو محتاجة فاتورة";
  if (code.includes("unauthorized-domain")) return "ضيف الدومين في Authorized domains";
  if (code.includes("operation-not-allowed")) return "اضغط Save في SMS region policy";
  if (msg.includes("recaptcha") || msg.includes("already been rendered")) return "اضغط إرسال الكود مرة واحدة كمان";
  if (code.includes("api-key") || code.includes("invalid-api") || err instanceof Error && err.message === "firebase") {
    return "ضيف إعدادات ويب Firebase";
  }
  return err instanceof Error ? err.message : "تعذر التسجيل";
}
