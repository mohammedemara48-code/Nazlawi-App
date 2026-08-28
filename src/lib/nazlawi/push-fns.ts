import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { VAPID_PUBLIC_KEY } from "./vapid";

const VAPID_PRIVATE_KEY = "q8oqn1r2z8F0se2mwqdzLvluyP4KnpcbnIu4xdtu1lM";

let lastBroadcast = 0;

async function pusher() {
  const webpush = (await import("web-push")).default;
  webpush.setVapidDetails(
    "mailto:nazlawi@village.local",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
  );
  return webpush;
}

export const savePushSubscription = createServerFn({ method: "POST" })
  .validator((d: { endpoint: string; p256dh: string; auth: string }) => d)
  .handler(async ({ data }) => {
    const endpoint = String(data.endpoint ?? "").slice(0, 2048);
    const p256dh = String(data.p256dh ?? "").slice(0, 512);
    const auth = String(data.auth ?? "").slice(0, 512);
    if (!endpoint.startsWith("https://") || !p256dh || !auth) {
      return { ok: false as const };
    }
    const sql = await getSql();
    await sql`
      insert into push_subscriptions (endpoint, p256dh, auth)
      values (${endpoint}, ${p256dh}, ${auth})
      on conflict (endpoint) do update set p256dh = excluded.p256dh, auth = excluded.auth
    `;
    return { ok: true as const };
  });

export const sendVillagePush = createServerFn({ method: "POST" })
  .validator((d: { title: string; body: string }) => d)
  .handler(async ({ data }) => {
    const now = Date.now();
    if (now - lastBroadcast < 15_000) {
      return { ok: false as const, sent: 0, reason: "throttle" as const };
    }
    lastBroadcast = now;
    const title = String(data.title ?? "نزلاوي").slice(0, 80) || "نزلاوي";
    const body = String(data.body ?? "").slice(0, 180);
    if (!body) return { ok: false as const, sent: 0, reason: "empty" as const };

    const sql = await getSql();
    const rows = await sql<{
      endpoint: string;
      p256dh: string;
      auth: string;
    }>`select endpoint, p256dh, auth from push_subscriptions`;

    const webpush = await pusher();
    let sent = 0;
    await Promise.all(
      rows.map(async (row) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: row.endpoint,
              keys: { p256dh: row.p256dh, auth: row.auth },
            },
            JSON.stringify({ title, body, url: "/" }),
          );
          sent += 1;
        } catch (err: unknown) {
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) {
            await sql`delete from push_subscriptions where endpoint = ${row.endpoint}`;
          }
        }
      }),
    );
    return { ok: true as const, sent };
  });
