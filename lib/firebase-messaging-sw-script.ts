export function buildFirebaseMessagingSwResponse(): Response {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  };

  const hasValidFirebaseMessagingConfig = Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId,
  );

  const workerSource = `/* Otakuz Web & Push Notifications Service Worker */
const OFFLINE_CACHE = 'otakuz-offline-v1';
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(OFFLINE_CACHE).then((cache) =>
    cache.addAll(['/offline.html', '/icons/icon-192.png'])
  ));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(Promise.all([
    self.clients.claim(),
    caches.keys().then((keys) => Promise.all(keys
      .filter((key) => key.startsWith('otakuz-offline-') && key !== OFFLINE_CACHE)
      .map((key) => caches.delete(key)))),
  ]));
});

// Keep live pages and private data on the network; only cache the offline screen.
self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate' || event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).catch(async () => {
    return (await caches.match('/offline.html')) || Response.error();
  }));
});

const FIREBASE_CONFIG = ${JSON.stringify(firebaseConfig)};
const HAS_FIREBASE_MESSAGING = ${JSON.stringify(hasValidFirebaseMessagingConfig)};

if (HAS_FIREBASE_MESSAGING) {
  try {
    importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging-compat.js');

    firebase.initializeApp(FIREBASE_CONFIG);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      const notification = payload.notification || {};
      const data = payload.data || {};
      const title = notification.title || data.title || 'Otakuz';

      self.registration.showNotification(title, {
        body: notification.body || data.body || '',
        icon: notification.icon || data.icon || '/assets/logo.png',
        badge: '/assets/logo.png',
        data: {
          ...data,
          link: data.link || payload.fcmOptions?.link || '/',
        },
      });
    });
  } catch (err) {
    console.error('[Otakuz SW] Firebase Messaging initialization failed in service worker:', err);
  }
} else {
  console.info(
    '[Otakuz SW] Running in local Web Notification mode (Firebase Messaging env config incomplete).'
  );
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetLink = event.notification.data?.link || '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if ('focus' in client) {
            client.focus();
            if ('navigate' in client && targetLink) {
              return client.navigate(targetLink);
            }
            return client;
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetLink);
        }
      })
  );
});
`;

  return new Response(workerSource, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "Service-Worker-Allowed": "/",
    },
  });
}
