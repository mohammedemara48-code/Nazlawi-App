import { useEffect } from "react";
import { DEMO_OTP, useNazlawi } from "@/lib/nazlawi/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { LeafMark } from "./mark";
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

  return (
    <div className="min-h-dvh bg-bg">
      {!liveUser ? (
        <LoginScreen />
      ) : !liveUser.approved ? (
        <PendingScreen />
      ) : (
        <Shell />
      )}
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
  const startLogin = useNazlawi((s) => s.startLogin);
  const confirmOtp = useNazlawi((s) => s.confirmOtp);
  const pendingPhone = useNazlawi((s) => s.pendingPhone);

  return pendingPhone ? (
    <OtpForm onConfirm={confirmOtp} phone={pendingPhone} />
  ) : (
    <section className="mx-auto flex min-h-dvh max-w-md flex-col px-6 py-10">
      <div className="mb-8 flex size-16 items-center justify-center rounded-2xl bg-secondary text-primary">
        <LeafMark />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight">نزلاوي</h1>
      <p className="mt-1 text-muted-foreground">دخول قرية النزل برقم الموبايل</p>
      <form
        className="mt-8 flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startLogin(
            String(fd.get("name") ?? ""),
            String(fd.get("phone") ?? ""),
            String(fd.get("hood") ?? ""),
          );
        }}
      >
        <label className="text-sm font-medium">
          الاسم
          <Input name="name" required className="mt-1" placeholder="اسمك في القرية" />
        </label>
        <label className="text-sm font-medium">
          الحارة / النزلة
          <Input name="hood" className="mt-1" placeholder="نزلة البحر" />
        </label>
        <label className="text-sm font-medium">
          رقم الموبايل
          <Input
            name="phone"
            required
            inputMode="tel"
            className="mt-1"
            placeholder="01xxxxxxxxx"
          />
        </label>
        <Button type="submit" size="lg" className="mt-2 w-full">
          إرسال كود التحقق
        </Button>
      </form>
      <p className="mt-6 text-center text-xs leading-6 text-muted-foreground">
        الكود التجريبي {DEMO_OTP}. رقم ينتهي بـ 0001 يدخل كأدمن موافق عليه.
      </p>
    </section>
  );
}

function OtpForm({
  phone,
  onConfirm,
}: {
  phone: string;
  onConfirm: (code: string) => string | null;
}) {
  return (
    <section className="mx-auto flex min-h-dvh max-w-md flex-col px-6 py-10">
      <h1 className="text-2xl font-extrabold">كود التحقق</h1>
      <p className="mt-1 text-muted-foreground">اتبعت الكود على {phone}</p>
      <form
        className="mt-8 flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const err = onConfirm(String(fd.get("code") ?? ""));
          if (err) window.alert(err);
        }}
      >
        <Input
          name="code"
          inputMode="numeric"
          maxLength={6}
          required
          className="h-14 text-center text-2xl tracking-[0.4em]"
          placeholder="••••••"
        />
        <Button type="submit" size="lg">
          تأكيد الدخول
        </Button>
      </form>
    </section>
  );
}

function PendingScreen() {
  const user = useNazlawi((s) => s.currentUser);
  const logout = useNazlawi((s) => s.logout);
  return (
    <section className="mx-auto flex min-h-dvh max-w-md flex-col items-center px-6 py-16 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-sand text-primary">
        <LeafMark />
      </div>
      <h1 className="mt-6 text-2xl font-extrabold">أهلاً {user?.name}</h1>
      <p className="mt-3 max-w-sm leading-7 text-muted-foreground">
        طلبك واصل لإدارة نزلاوي. هتقدر تدخل قريتي والسوق بعد موافقة الأدمن.
      </p>
      <Card className="mt-8 w-full p-4 text-right">
        <p className="font-semibold">{user?.phone}</p>
        <p className="text-sm text-muted-foreground">{user?.neighborhood}</p>
      </Card>
      <Button variant="outline" className="mt-auto w-full" onClick={logout}>
        تسجيل الخروج
      </Button>
    </section>
  );
}
