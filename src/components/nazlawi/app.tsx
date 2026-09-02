import { useEffect, useState } from "react";
import { Store, UserRound } from "lucide-react";
import { useNazlawi } from "@/lib/nazlawi/store";
import { COUNTRIES, firebaseError, signInWithGmail, toE164 } from "@/lib/nazlawi/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shell } from "./shell";
import { registerNazlawiWorker } from "@/lib/nazlawi/push-client";
import type { VillageUser } from "@/lib/nazlawi/types";

function needsProfile(user: VillageUser) {
  const emailName = user.email.split("@")[0] || "";
  const name = user.name.trim();
  if (!name || name === emailName) return true;
  if (!user.phone.trim()) return true;
  return false;
}

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
      {!liveUser ? <LoginScreen /> : needsProfile(liveUser) ? <ProfileSetup user={liveUser} /> : <Shell />}
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
          <p className="text-center text-xs text-primary-foreground/80" dir="ltr">
            {typeof window !== "undefined" ? window.location.hostname : ""}
          </p>

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

function ProfileSetup({ user }: { user: VillageUser }) {
  const updateMe = useNazlawi((s) => s.updateMe);
  const setToast = useNazlawi((s) => s.setToast);
  const [name, setName] = useState(user.name);
  const [dial, setDial] = useState("+966");
  const [phone, setPhone] = useState("");
  const [neighborhood, setNeighborhood] = useState(user.neighborhood || "النزل");
  const [bio, setBio] = useState(user.bio || "");

  function save() {
    const fullName = name.trim();
    const tel = toE164(dial, phone);
    if (fullName.length < 2) {
      setToast("اكتب الاسم");
      return;
    }
    if (phone.replace(/\D/g, "").length < 7) {
      setToast("اكتب رقم الجوال");
      return;
    }
    updateMe({
      name: fullName,
      phone: tel,
      neighborhood: neighborhood.trim() || "النزل",
      bio: bio.trim(),
    });
  }

  return (
    <section className="mx-auto flex min-h-dvh max-w-lg flex-col bg-bg px-6 pb-8 pt-[max(2.5rem,env(safe-area-inset-top))]">
      <p className="text-sm text-muted">حساب جديد</p>
      <h1 className="text-3xl font-extrabold">بيانات النزلاوي</h1>
      <p className="mt-1 text-sm text-muted">{user.email}</p>
      <div className="mt-6 flex flex-col gap-3">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم" />
        <div className="flex gap-2">
          <select
            value={dial}
            onChange={(e) => setDial(e.target.value)}
            className="h-10 rounded-md border bg-card px-2 text-sm"
            aria-label="مفتاح الدولة"
          >
            {COUNTRIES.map((c) => (
              <option key={c.iso} value={c.dial}>
                {c.name} {c.dial}
              </option>
            ))}
          </select>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="رقم الجوال" />
        </div>
        <Input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="الحي / القرية" />
        <Input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="نبذة مختصرة" />
        <Button type="button" size="lg" onClick={save}>
          حفظ ودخول
        </Button>
      </div>
    </section>
  );
}
