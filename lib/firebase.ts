import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type Messaging,
} from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
let messaging: Messaging | null = null;

async function getMessagingClient() {
  if (
    typeof window === 'undefined' ||
    !window.isSecureContext ||
    !('Notification' in window) ||
    !('serviceWorker' in navigator) ||
    !(await isSupported())
  ) {
    return null;
  }

  messaging ??= getMessaging(app);
  return messaging;
}

export async function initializeNotifications() {
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

  // Push notifications are optional. Do not request permission when Firebase
  // Cloud Messaging has not been fully configured for this environment.
  if (!vapidKey) return;

  try {
    const messagingClient = await getMessagingClient();
    if (!messagingClient) return;

    const permission =
      Notification.permission === 'default'
        ? await Notification.requestPermission()
        : Notification.permission;

    if (permission !== 'granted') return;

    const serviceWorkerRegistration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw',
      { scope: '/' }
    );

    return getToken(messagingClient, {
      vapidKey,
      serviceWorkerRegistration,
    });
  } catch (error) {
    // Notifications should never prevent the rest of the application from
    // loading. Keep the failure visible in development without triggering the
    // Next.js error overlay.
    console.warn('Notification initialization skipped:', error);
  }
}

export function onMessageListener() {
  let isActive = true;
  let unsubscribe = () => {};

  void getMessagingClient()
    .then((messagingClient) => {
      if (!messagingClient) return;

      const stopListening = onMessage(messagingClient, (payload) => {
        console.info('Message received:', payload);
      });

      if (isActive) {
        unsubscribe = stopListening;
      } else {
        stopListening();
      }
    })
    .catch((error) => {
      console.warn('Foreground notification listener unavailable:', error);
    });

  return () => {
    isActive = false;
    unsubscribe();
  };
}

export { app, auth, db, storage, messaging };
