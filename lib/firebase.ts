import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type MessagePayload,
  type Messaging,
} from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp(): FirebaseApp | null {
  if (!firebaseConfig.apiKey) {
    return null;
  }
  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
}

const app = getFirebaseApp();
const auth = app ? getAuth(app) : ({} as Auth);
const db = app ? getFirestore(app) : ({} as Firestore);
const storage = app ? getStorage(app) : ({} as FirebaseStorage);
let messaging: Messaging | null = null;
let swRegistrationPromise: Promise<ServiceWorkerRegistration> | null = null;

export type NotificationSetupStatus =
  | 'unsupported-browser'
  | 'insecure-context'
  | 'permission-default'
  | 'permission-denied'
  | 'service-worker-error'
  | 'local-only-no-firebase'
  | 'local-only-no-vapid'
  | 'fcm-unsupported'
  | 'fcm-error'
  | 'fcm-ready';

export interface NotificationSetupResult {
  status: NotificationSetupStatus;
  permission: NotificationPermission | 'unsupported';
  pushToken: string | null;
  serviceWorkerReady: boolean;
  reason?: string;
  error?: unknown;
}

function formatErrorReason(error: unknown): string {
  if (error instanceof Error) {
    const code = (error as { code?: string }).code;
    return code ? `${code}: ${error.message}` : error.message;
  }
  return String(error);
}

export async function ensureNotificationServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    throw new Error('Service Workers are not supported in this browser.');
  }

  if (!swRegistrationPromise) {
    swRegistrationPromise = navigator.serviceWorker
      .register('/firebase-messaging-sw.js', { scope: '/' })
      .then(async (registration) => {
        if (registration.active) {
          return registration;
        }
        return navigator.serviceWorker.ready;
      })
      .catch((error) => {
        swRegistrationPromise = null;
        throw error;
      });
  }

  return swRegistrationPromise;
}

async function getMessagingClient(): Promise<Messaging | null> {
  if (
    !app ||
    typeof window === 'undefined' ||
    !window.isSecureContext ||
    !('Notification' in window) ||
    !('serviceWorker' in navigator)
  ) {
    return null;
  }

  const supported = await isSupported();
  if (!supported) {
    return null;
  }

  messaging ??= getMessaging(app);
  return messaging;
}

export async function initializeNotifications(options?: {
  promptPermission?: boolean;
}): Promise<NotificationSetupResult> {
  if (
    typeof window === 'undefined' ||
    !('Notification' in window) ||
    !('serviceWorker' in navigator)
  ) {
    return {
      status: 'unsupported-browser',
      permission: 'unsupported',
      pushToken: null,
      serviceWorkerReady: false,
      reason: 'This browser does not support Web Notifications or Service Workers.',
    };
  }

  if (!window.isSecureContext) {
    const reason =
      'Web Notifications require HTTPS or localhost (window.isSecureContext is false).';
    console.error('[WebNotifications]', reason);
    return {
      status: 'insecure-context',
      permission: window.Notification.permission,
      pushToken: null,
      serviceWorkerReady: false,
      reason,
    };
  }

  let permission = window.Notification.permission;

  if (permission === 'default') {
    if (!options?.promptPermission) {
      return {
        status: 'permission-default',
        permission: 'default',
        pushToken: null,
        serviceWorkerReady: false,
        reason: 'Click "Enable Alerts" to grant browser notification permission.',
      };
    }

    permission = await window.Notification.requestPermission();
  }

  if (permission !== 'granted') {
    return {
      status: permission === 'denied' ? 'permission-denied' : 'permission-default',
      permission,
      pushToken: null,
      serviceWorkerReady: false,
      reason:
        permission === 'denied'
          ? 'Browser notifications are blocked for this site in your browser settings.'
          : 'Notification permission was dismissed before granting.',
    };
  }

  let serviceWorkerRegistration: ServiceWorkerRegistration;
  try {
    serviceWorkerRegistration = await ensureNotificationServiceWorker();
  } catch (error) {
    const reason = `Service Worker registration failed: ${formatErrorReason(error)}`;
    console.error('[WebNotifications]', reason, error);
    return {
      status: 'service-worker-error',
      permission,
      pushToken: null,
      serviceWorkerReady: false,
      reason,
      error,
    };
  }

  if (!app || !firebaseConfig.messagingSenderId || !firebaseConfig.appId) {
    const reason =
      'Firebase Messaging config (NEXT_PUBLIC_FIREBASE_*) is incomplete; local browser notifications are active, background FCM push is disabled.';
    console.info('[WebNotifications]', reason);
    return {
      status: 'local-only-no-firebase',
      permission,
      pushToken: null,
      serviceWorkerReady: true,
      reason,
    };
  }

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY?.trim();
  if (!vapidKey) {
    const reason =
      'NEXT_PUBLIC_FIREBASE_VAPID_KEY is not set; live browser notifications are active, background FCM push token registration skipped.';
    console.info('[WebNotifications]', reason);
    return {
      status: 'local-only-no-vapid',
      permission,
      pushToken: null,
      serviceWorkerReady: true,
      reason,
    };
  }

  try {
    const messagingClient = await getMessagingClient();
    if (!messagingClient) {
      const reason = 'Firebase Cloud Messaging is not supported by this browser.';
      console.error('[WebNotifications]', reason);
      return {
        status: 'fcm-unsupported',
        permission,
        pushToken: null,
        serviceWorkerReady: true,
        reason,
      };
    }

    const pushToken = await getToken(messagingClient, {
      vapidKey,
      serviceWorkerRegistration,
    });

    return {
      status: 'fcm-ready',
      permission,
      pushToken: pushToken || null,
      serviceWorkerReady: true,
    };
  } catch (error) {
    const reason = `FCM token registration failed: ${formatErrorReason(error)}`;
    console.error('[WebNotifications]', reason, error);
    return {
      status: 'fcm-error',
      permission,
      pushToken: null,
      serviceWorkerReady: true,
      reason,
      error,
    };
  }
}

export async function showBrowserNotification(options: {
  title: string;
  body: string;
  link?: string;
  tag?: string;
}): Promise<boolean> {
  if (
    typeof window === 'undefined' ||
    !('Notification' in window) ||
    window.Notification.permission !== 'granted'
  ) {
    return false;
  }

  const { title, body, link = '/', tag } = options;

  try {
    if ('serviceWorker' in navigator) {
      const registration = await ensureNotificationServiceWorker();
      await registration.showNotification(title, {
        body,
        icon: '/assets/logo.png',
        badge: '/assets/logo.png',
        tag,
        data: { link },
      });
      return true;
    }
  } catch (swError) {
    console.error(
      '[WebNotifications] Service Worker showNotification failed, falling back to Window Notification:',
      swError
    );
  }

  try {
    const notification = new window.Notification(title, {
      body,
      icon: '/assets/logo.png',
      tag,
    });
    notification.onclick = () => {
      window.focus();
      if (link) {
        window.location.assign(link);
      }
      notification.close();
    };
    return true;
  } catch (error) {
    console.error('[WebNotifications] Native Notification dispatch failed:', error);
    return false;
  }
}

export function onMessageListener(
  onForegroundMessage?: (payload: MessagePayload) => void,
  onSetupError?: (error: unknown) => void
) {
  let isActive = true;
  let unsubscribe = () => {};

  void getMessagingClient()
    .then((messagingClient) => {
      if (!messagingClient || !isActive) return;

      const stopListening = onMessage(messagingClient, (payload) => {
        onForegroundMessage?.(payload);
      });

      if (isActive) {
        unsubscribe = stopListening;
      } else {
        stopListening();
      }
    })
    .catch((error) => {
      console.error('[WebNotifications] Foreground FCM listener failed:', error);
      onSetupError?.(error);
    });

  return () => {
    isActive = false;
    unsubscribe();
  };
}

export { app, auth, db, storage, messaging };
