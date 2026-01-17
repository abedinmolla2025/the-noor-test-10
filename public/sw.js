/* Minimal service worker for Web Push notifications */

self.addEventListener('push', (event) => {
  const data = (() => {
    try {
      return event.data ? event.data.json() : {};
    } catch {
      return {};
    }
  })();

  const title = data.title || 'Notification';
  const body = data.body || '';
  const imageUrl = data.image_url || undefined;
  const deepLink = data.deep_link || '/';

  const options = {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: { deepLink },
    ...(imageUrl ? { image: imageUrl } : {}),
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const deepLink = event.notification?.data?.deepLink || '/';

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of allClients) {
        if ('focus' in client) {
          client.focus();
          client.navigate(deepLink);
          return;
        }
      }
      if (self.clients.openWindow) {
        await self.clients.openWindow(deepLink);
      }
    })(),
  );
});
