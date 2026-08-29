import { useEffect, useState } from "react";
import { Store, UserRound } from "lucide-react";
import { useNazlawi } from "@/lib/nazlawi/store";
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
  const [role, setRole] = useState<"resident" | "merchant">("resident");
  const [busy, setBusy] = useState(false);

  async function installApp() {
    setBusy(true);
    const prompt = (
      window as Window & { __nazlawiInstall?: { prompt: () => Promise<void> } }
    ).__nazlawiInstall;
    if (prompt) await prompt.prompt();
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

        <form
          className="mt-8 flex flex-1 flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            login(String(fd.get("email") ?? ""), String(fd.get("password") ?? ""), role);
          }}
        >
          <label className="text-sm font-medium">
            الإيميل
            <Input
              name="email"
              type="email"
              required
              className="mt-1 border-0 bg-primary-foreground text-fg"
              autoComplete="email"
            />
          </label>
          <label className="text-sm font-medium">
            كلمة المرور
            <Input
              name="password"
              type="password"
              required
              minLength={4}
              className="mt-1 border-0 bg-primary-foreground text-fg"
              autoComplete="current-password"
            />
          </label>
          <div className="mt-auto flex flex-col gap-2">
            <Button type="submit" size="lg" className="w-full">
              دخول
            </Button>
            <Button
              type="button"
              size="lg"
              variant="secondary"
              className="w-full"
              disabled={busy}
              onClick={() => void installApp()}
            >
              تحميل التطبيق
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
