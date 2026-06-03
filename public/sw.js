// Service Worker para DelfinBoard
// Maneja notificaciones push y actúa como intermediario offline

const CACHE_NAME = 'delfinboard-v1';

self.addEventListener('install', (event) => {
  console.log('[SW] Instalado');
  self.skipWaiting(); // Activa inmediatamente sin esperar que se cierren otras pestañas
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activado');
  event.waitUntil(clients.claim()); // Toma el control de todas las pestañas abiertas
});

self.addEventListener('push', function(event) {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: 'DelfinBoard', body: event.data.text(), url: '/' };
  }

  const options = {
    body: data.body || 'Tienes un nuevo mensaje.',
    icon: '/vite.svg',
    badge: '/vite.svg',
    vibrate: [200, 100, 200],
    requireInteraction: false,  // Desaparece automáticamente después de un rato
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'DelfinBoard', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una pestaña abierta de la app, enfocarla
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Si no hay pestaña abierta, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
