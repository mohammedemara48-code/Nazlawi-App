import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LeafMark } from "./mark";
import { isStandalone } from "@/lib/nazlawi/push-client";

type PromptEvent = Event & { prompt: () => Promise<void> };

function getPrompt(): PromptEvent | null {
  if (typeof window === "undefined") return null;
  return (window as Window & { __nazlawiInstall?: PromptEvent }).__nazlawiInstall ?? null;
}

export function InstallGate() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (sessionStorage.getItem("nazlawi-skip-install") === "1") return;
    setOpen(true);
    const onReady = () => setOpen(true);
    const onInstalled = () => setOpen(false);
    window.addEventListener("nazlawi-can-install", onReady);
    window.addEventListener("nazlawi-installed", onInstalled);
    return () => {
      window.removeEventListener("nazlawi-can-install", onReady);
      window.removeEventListener("nazlawi-installed", onInstalled);
    };
  }, []);

  if (!open) return null;

  async function download() {
    setBusy(true);
    const prompt = getPrompt();
    if (prompt) {
      await prompt.prompt();
      setBusy(false);
      setOpen(false);
      return;
    }
    window.setTimeout(async () => {
      const later = getPrompt();
      setBusy(false);
      if (later) {
        await later.prompt();
        setOpen(false);
      }
    }, 800);
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/50 p-4 sm:items-center">
      <div className="w-full max-w-sm rounded-3xl bg-card p-6 text-center shadow-xl">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-secondary text-primary">
          <LeafMark />
        </div>
        <p className="text-2xl font-extrabold">نزلاوي</p>
        <div className="mt-6 flex flex-col gap-2">
          <Button size="lg" className="w-full" disabled={busy} onClick={() => void download()}>
            تحميل التطبيق
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="w-full"
            onClick={() => {
              sessionStorage.setItem("nazlawi-skip-install", "1");
              setOpen(false);
            }}
          >
            متابعة
          </Button>
        </div>
      </div>
    </div>
  );
}
