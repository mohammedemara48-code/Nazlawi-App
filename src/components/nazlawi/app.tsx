import { useEffect, useState } from "react";
import type { ConfirmationResult } from "firebase/auth";
import { Store, UserRound } from "lucide-react";
import { useNazlawi } from "@/lib/nazlawi/store";
import {
  COUNTRIES,
  confirmPhoneCode,
  firebaseError,
  sendPhoneCode,
  signInWithGmail,
  toE164,
} from "@/lib/nazlawi/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shell } from "./shell";
import { registerNazlawiWorker } from "@/lib/nazlawi/push-client";

export function NazlawiApp() {
  const currentUser = useNazlawi((s) => s.currentUser);
  const users = useNazlawi((s) => s.users);
  const toast = useNazlawi((s) => s.toast);
  const clearToast = useNazlawi((s) => s.clearToast);

  useEffect(() => {
    void Promise.resolve(useNazlawi.persist.rehydrate());
    void registerNazlawiWorker();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(clearToast, 2400);
    return () => window.clearTimeout(t);
  }, [toast, clearToast]);

  const liveUser = currentUser
    ? (users.find((u) => u.id === currentUser.id) ?? currentUser)
    : null;

  if (liveUser?.banned) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg px-6">
        <p className="font-extrabold">الحساب محظور</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-bg">
      {!liveUser ? <LoginScreen /> : <Shell />}
      {toast ? (
        <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center px-4">
          <div className="rounded-full bg-ink px-4 py-2 text-sm text-primary-foreground shadow-lg">
            {toast}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LoginScreen() {
  const login = useNazlawi((s) => s.login);
  const loginFromAuth = useNazlawi((s) => s.loginFromAuth);
  const setToast = useNazlawi((s) => s.setToast);
  const [role, setRole] = useState<"resident" | "merchant">("resident");
  const [busy, setBusy] = useState(false);
  const [dial, setDial] = useState("+966");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirm, setConfirm] = useState<ConfirmationResult | null>(null);
  const [otpStep, setOtpStep] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  async function installApp() {
    setBusy(true);
    const prompt = (
      window as Window & { __nazlawiInstall?: { prompt: () => Promise<void> } }
    ).__nazlawiInstall;
    if (prompt) await prompt.prompt();
    setBusy(false);
  }

  async function gmail() {
    setBusy(true);
    try {
      const user = await signInWithGmail();
      loginFromAuth({
        email: user.email ?? "",
        name: user.displayName ?? "",
        uid: user.uid,
        phone: user.phoneNumber ?? "",
        role,
      });
    } catch (err) {
      setToast(firebaseError(err));
    }
    setBusy(false);
  }

  async function sendSms() {
    setBusy(true);
    setOtpStep(true);
    setCode("");
    try {
      const e164 = toE164(dial, phone);
      const next = await sendPhoneCode(e164);
      setConfirm(next);
      setToast("اتكتب الكود اللي وصلك");
    } catch (err) {
      setToast(firebaseError(err));
    }
    setBusy(false);
  }

  async function verifySms() {
    if (!confirm) return;
    setBusy(true);
    try {
      const user = await confirmPhoneCode(confirm, code);
      loginFromAuth({
        email: user.email ?? "",
        phone: user.phoneNumber ?? toE164(dial, phone),
        name: user.displayName ?? "",
        uid: user.uid,
        role,
      });
    } catch (err) {
      setToast(firebaseError(err));
    }
    setBusy(false);
  }

  return (
    <section className="relative mx-auto flex min-h-dvh max-w-lg flex-col overflow-hidden">
      <img src="/login-bg.jpg" alt="" className="absolute inset-0 size-full object-cover object-center" />
      <div className="absolute inset-0 bg-ink/55" />
      <div className="relative z-10 flex min-h-dvh flex-col px-6 pb-8 pt-[max(2.5rem,env(safe-area-inset-top))] text-primary-foreground">
        <p className="text-sm tracking-[0.35em]">NZLAWI</p>
        <h1 className="text-4xl font-extrabold tracking-tight">نزلاوي</h1>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("resident")}
            className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-3 py-5 backdrop-blur-sm ${
              role === "resident"
                ? "border-primary-foreground bg-primary-foreground/20"
                : "border-primary-foreground/30 bg-ink/30"
            }`}
          >
            <UserRound className="size-7" />
            <span className="font-extrabold">نزلاوي</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("merchant")}
            className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-3 py-5 backdrop-blur-sm ${
              role === "merchant"
                ? "border-primary-foreground bg-primary-foreground/20"
                : "border-primary-foreground/30 bg-ink/30"
            }`}
          >
            <Store className="size-7" />
            <span className="font-extrabold">تاجر</span>
          </button>
        </div>

        <div className="mt-8 flex flex-1 flex-col gap-3">
          <Button type="button" size="lg" className="w-full" disabled={busy} onClick={() => void gmail()}>
            الدخول بجيميل
          </Button>

          <div className="flex items-center gap-2 text-xs text-primary-foreground/70">
            <span className="h-px flex-1 bg-primary-foreground/30" />
            الجوال
            <span className="h-px flex-1 bg-primary-foreground/30" />
          </div>

          {otpStep ? (
            <div className="rounded-3xl bg-ink/50 p-4 backdrop-blur-sm">
              <p className="text-center text-sm text-primary-foreground/80">الكود اللي وصلك على</p>
              <p className="mb-4 text-center text-lg font-extrabold" dir="ltr">
                {toE164(dial, phone)}
              </p>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                placeholder="------"
                className="h-14 border-0 bg-primary-foreground text-center text-2xl tracking-[0.4em] text-fg"
              />
              <Button
                type="button"
                size="lg"
                className="mt-3 w-full"
                disabled={busy || code.length < 4 || !confirm}
                onClick={() => void verifySms()}
              >
                {busy ? "جاري التحقق" : "تأكيد الرمز"}
              </Button>
              <div className="mt-3 flex justify-between text-sm">
                <button
                  type="button"
                  className="underline"
                  disabled={busy}
                  onClick={() => {
                    setOtpStep(false);
                    setConfirm(null);
                    setCode("");
                  }}
                >
                  تغيير الرقم
                </button>
                <button type="button" className="underline" disabled={busy} onClick={() => void sendSms()}>
                  إعادة إرسال
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <select
                  value={dial}
                  onChange={(e) => setDial(e.target.value)}
                  className="h-10 rounded-md border-0 bg-primary-foreground px-2 text-sm text-fg"
                  aria-label="مفتاح الدولة"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.iso} value={c.dial}>
                      {c.name} {c.dial}
                    </option>
                  ))}
                </select>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  placeholder="رقم الجوال"
                  className="border-0 bg-primary-foreground text-fg"
                />
              </div>
              <Button type="button" size="lg" variant="secondary" disabled={busy || phone.length < 7} onClick={() => void sendSms()}>
                {busy ? "جاري إرسال الكود" : "إرسال كود التحقق"}
              </Button>
            </>
          )}

          <div id="nazlawi-recaptcha" />

          <button type="button" className="text-sm underline" onClick={() => setEmailOpen((v) => !v)}>
            دخول بالإيميل
          </button>
          {emailOpen ? (
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                login(String(fd.get("email") ?? ""), String(fd.get("password") ?? ""), role);
              }}
            >
              <Input name="email" type="email" required placeholder="الإيميل" className="border-0 bg-primary-foreground text-fg" />
              <Input name="password" type="password" required minLength={4} placeholder="كلمة المرور" className="border-0 bg-primary-foreground text-fg" />
              <Button type="submit" size="lg">
                دخول
              </Button>
            </form>
          ) : null}

          <Button type="button" size="lg" variant="secondary" className="mt-auto" disabled={busy} onClick={() => void installApp()}>
            تحميل التطبيق
          </Button>
        </div>
      </div>
    </section>
  );
}
