self.addEventListener("push", (event) => {
  let payload = { title: "نزلاوي", body: "إشعار من قرية النزل", url: "/" };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    try {
      payload.body = event.data ? event.data.text() : payload.body;
    } catch {
      /* keep defaults */
    }
  }
  event.waitUntil(
    self.registration.showNotification(payload.title || "نزلاوي", {
      body: payload.body || "",
      icon: "/__grok/icon-180.png",
      badge: "/__grok/icon-180.png",
      dir: "rtl",
      lang: "ar",
      tag: "nazlawi-village",
      renotify: true,
      data: { url: payload.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      for (const client of windows) {
        if ("focus" in client) {
          client.focus();
          if ("navigate" in client) client.navigate(target);
          return;
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    }),
  );
});
