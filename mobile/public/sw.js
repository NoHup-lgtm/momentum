/* Service worker do momentum — Web Push (PWA).
   Recebe o push (mesmo com o app fechado) e mostra a notificação; ao clicar,
   abre/foca o app na URL indicada. */

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'momentum', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'momentum';
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag,
    data: { url: data.url || '/' },
    vibrate: [80, 40, 80],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  // Defesa em profundidade: só navega dentro do próprio app (caminho relativo).
  // Payloads vêm do nosso servidor, mas URL absoluto/externo nunca é válido aqui.
  let url = (event.notification.data && event.notification.data.url) || '/';
  if (typeof url !== 'string' || !url.startsWith('/') || url.startsWith('//')) url = '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((list) => {
        for (const client of list) {
          if ('focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        if (self.clients.openWindow) return self.clients.openWindow(url);
      }),
  );
});
