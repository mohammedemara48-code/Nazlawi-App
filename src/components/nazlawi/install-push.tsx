import { useEffect, useState } from "react";
import { Bell, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  deviceKind,
  enableVillagePush,
  isStandalone,
  registerNazlawiWorker,
} from "@/lib/nazlawi/push-client";
import { sendVillagePush } from "@/lib/nazlawi/push-fns";
import { useNazlawi } from "@/lib/nazlawi/store";

type BeforeInstall = Event & { prompt: () => Promise<void> };

export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstall | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    void registerNazlawiWorker();
    setInstalled(isStandalone());
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstall);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  return { deferred, installed, kind: deviceKind() };
}

export function InstallAndNotifyCard() {
  const setToast = useNazlawi((s) => s.setToast);
  const { deferred, installed, kind } = useInstallPrompt();
  const [busy, setBusy] = useState(false);

  async function install() {
    if (deferred) {
      await deferred.prompt();
      return;
    }
    const platform = kind === "ios" ? "ios" : "android";
    window.location.assign(`/?install=1&platform=${platform}`);
  }

  async function notify() {
    setBusy(true);
    const result = await enableVillagePush();
    setBusy(false);
    setToast(result === "ok" ? "الإشعارات مفعّلة حتى والتطبيق مقفول" : result);
  }

  return (
    <Card className="mt-3 w-full space-y-3 p-4">
      <p className="font-extrabold">التثبيت والإشعارات</p>
      <p className="text-sm leading-6 text-muted-foreground">
        نزلاوي تطبيق ويب يُثبَّت على الشاشة الرئيسية لأندرويد وآيفون، ويشتغل بملء الشاشة.
        {kind === "ios"
          ? " على الآيفون: شارك → إضافة إلى الشاشة الرئيسية، وبعدها فعّل الإشعارات من داخل التطبيق."
          : " على أندرويد: ثبّت التطبيق ثم اسمح بالإشعارات."}
      </p>
      <Button className="w-full" variant={installed ? "secondary" : "default"} onClick={install}>
        <Smartphone className="size-4" />
        {installed ? "مثبّت على الجهاز" : "تثبيت على أندرويد أو آيفون"}
      </Button>
      <Button className="w-full" variant="outline" disabled={busy} onClick={notify}>
        <Bell className="size-4" />
        تفعيل الإشعارات وهي التطبيق مقفول
      </Button>
    </Card>
  );
}

export function BroadcastPushCard() {
  const setToast = useNazlawi((s) => s.setToast);
  return (
    <Card className="p-4">
      <p className="font-extrabold">إشعار لكل الأجهزة</p>
      <p className="mb-3 text-sm text-muted-foreground">
        يوصل والتطبيق مقفول للأعضاء اللي فعّلوا الإشعارات.
      </p>
      <form
        className="flex flex-col gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const res = await sendVillagePush({
            data: {
              title: String(fd.get("title") ?? "نزلاوي"),
              body: String(fd.get("body") ?? ""),
            },
          });
          if (res.ok) setToast(`اتبعت لـ ${res.sent} جهاز`);
          else if (res.reason === "throttle") setToast("استنى ثواني قبل إشعار جديد");
          else setToast("اكتب نص الإشعار");
        }}
      >
        <Input name="title" defaultValue="نزلاوي" placeholder="العنوان" />
        <Input name="body" required placeholder="نص الإشعار" />
        <Button type="submit">إرسال إشعار القرية</Button>
      </form>
    </Card>
  );
}
