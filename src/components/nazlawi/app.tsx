import { useEffect, useState } from "react";
import { Store, UserRound } from "lucide-react";
import { useNazlawi } from "@/lib/nazlawi/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LeafMark } from "./mark";
import { Shell } from "./shell";
import { InstallGate } from "./install-gate";
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

  return (
    <div className="min-h-dvh bg-bg">
      {!liveUser ? <LoginScreen /> : <Shell />}
      <InstallGate />
      {toast ? (
        <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
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

  return (
    <section className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-8 pt-[max(2.5rem,env(safe-area-inset-top))]">
      <div className="mb-8 flex size-16 items-center justify-center rounded-2xl bg-secondary text-primary">
        <LeafMark />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight">نزلاوي</h1>

      <div className="mt-8 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setRole("resident")}
          className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-3 py-5 ${
            role === "resident"
              ? "border-primary bg-secondary text-secondary-foreground"
              : "border-border bg-card"
          }`}
        >
          <UserRound className="size-7" />
          <span className="font-extrabold">حساب نزلاوي</span>
        </button>
        <button
          type="button"
          onClick={() => setRole("merchant")}
          className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-3 py-5 ${
            role === "merchant"
              ? "border-primary bg-secondary text-secondary-foreground"
              : "border-border bg-card"
          }`}
        >
          <Store className="size-7" />
          <span className="font-extrabold">حساب تاجر</span>
        </button>
      </div>

      <form
        className="mt-8 flex flex-1 flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          login(String(fd.get("name") ?? ""), String(fd.get("phone") ?? ""), role);
        }}
      >
        <label className="text-sm font-medium">
          اسم النزلاوي
          <Input name="name" required className="mt-1" autoComplete="name" />
        </label>
        <label className="text-sm font-medium">
          رقم الموبايل
          <Input
            name="phone"
            required
            inputMode="tel"
            className="mt-1"
            autoComplete="tel"
          />
        </label>
        <Button type="submit" size="lg" className="mt-auto w-full">
          دخول
        </Button>
      </form>
    </section>
  );
}
