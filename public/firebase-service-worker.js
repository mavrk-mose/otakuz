importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
});

class CustomPushEvent extends Event {
  constructor(data) {
      super('push');

      Object.assign(this, data);
      this.custom = true;
  }
}

/*
 * Overrides push notification data, to avoid having 'notification' key and firebase blocking
 * the message handler from being called
 */
self.addEventListener('push', (e) => {
    if (e.custom) return;

    const oldData = e.data;

    // Create a new event to dispatch, pull values from notification key and put it in data key,
    // and then remove notification key
    const newEvent = new CustomPushEvent({
        data: {
            ehheh: oldData.json(),
            json() {
                const newData = oldData.json();
                newData.data = {
                    ...newData.data,
                    ...newData.notification,
                };
                delete newData.notification;
                return newData;
            },
        },
        waitUntil: e.waitUntil.bind(e),
    });

    e.stopImmediatePropagation();

    dispatchEvent(newEvent);
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification;

  const notificationOptions = {
    body,
    icon: icon || '/icon.png',
    badge: '/badge.png',
    data: payload.data,
    actions: [
      {
        action: 'open',
        title: 'Open',
      },
      {
        action: 'close',
        title: 'Close',
      },
    ],
  };

  self.registration.showNotification(title, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  if (event?.notification?.data && event?.notification?.data?.link) {
      self.clients.openWindow(event.notification.data.link);
  }

  event.notification.close();
});