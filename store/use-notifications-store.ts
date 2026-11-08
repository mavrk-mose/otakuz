'use client';

import { create } from 'zustand';
import {
  collection,
  onSnapshot,
  query,
  where,
  type Timestamp,
} from 'firebase/firestore';
import { toast } from 'sonner';
import {
  app,
  db,
  initializeNotifications,
  onMessageListener,
  showBrowserNotification,
  type NotificationSetupResult,
} from '@/lib/firebase';
import { saveUserPushToken, type NotificationType } from '@/hooks/notifications/notification-requests';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Timestamp | null;
  read: boolean;
  link?: string;
}

interface NotificationsStoreState {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  firestoreError: string | null;
  setupResult: NotificationSetupResult | null;
  isEnablingPush: boolean;
  subscribeForUser: (uid: string) => () => void;
  enableWebNotifications: (uid?: string) => Promise<NotificationSetupResult>;
}

let activeUid: string | null = null;
let subscriberCount = 0;
let unsubscribeFirestore: (() => void) | null = null;
let unsubscribeForegroundPush: (() => void) | null = null;
const notifiedDocIds = new Set<string>();

function getTimestampMillis(ts: Timestamp | null | undefined): number {
  if (!ts) return Date.now();
  if (typeof ts.toMillis === 'function') return ts.toMillis();
  if (typeof (ts as { seconds?: number }).seconds === 'number') {
    return (ts as { seconds: number }).seconds * 1000;
  }
  return 0;
}

function tearDownActiveListeners() {
  unsubscribeFirestore?.();
  unsubscribeFirestore = null;
  unsubscribeForegroundPush?.();
  unsubscribeForegroundPush = null;
  activeUid = null;
  notifiedDocIds.clear();
}

export const useNotificationsStore = create<NotificationsStoreState>((set) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  firestoreError: null,
  setupResult: null,
  isEnablingPush: false,

  enableWebNotifications: async (uid?: string) => {
    set({ isEnablingPush: true });
    try {
      const result = await initializeNotifications({ promptPermission: true });
      set({ setupResult: result, isEnablingPush: false });

      if (result.pushToken && uid) {
        await saveUserPushToken(uid, result.pushToken).catch(() => undefined);
      }

      return result;
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      const fallbackResult: NotificationSetupResult = {
        status: 'service-worker-error',
        permission:
          typeof window !== 'undefined' && 'Notification' in window
            ? window.Notification.permission
            : 'unsupported',
        pushToken: null,
        serviceWorkerReady: false,
        reason,
        error,
      };
      set({ setupResult: fallbackResult, isEnablingPush: false });
      return fallbackResult;
    }
  },

  subscribeForUser: (uid: string) => {
    if (typeof window === 'undefined' || !uid) {
      return () => {};
    }

    if (activeUid && activeUid !== uid) {
      tearDownActiveListeners();
    }

    subscriberCount += 1;

    if (activeUid !== uid) {
      activeUid = uid;
      set({ loading: true, firestoreError: null });

      // Auto-sync Service Worker + FCM token if browser permission was already granted
      // (the app provider handles the initial permission request).
      void initializeNotifications({ promptPermission: false }).then((result) => {
        if (activeUid !== uid) return;
        set({ setupResult: result });
        if (result.pushToken) {
          void saveUserPushToken(uid, result.pushToken).catch(() => undefined);
        }
      });

      // Foreground FCM messages -> surface toast + OS Web Notification
      unsubscribeForegroundPush = onMessageListener(
        (payload) => {
          const title =
            payload.notification?.title || payload.data?.title || 'Otakuz';
          const body =
            payload.notification?.body || payload.data?.body || 'New notification';
          const link = payload.data?.link || payload.fcmOptions?.link || '/';

          toast(title, {
            description: body,
            ...(link
              ? {
                  action: {
                    label: 'Open',
                    onClick: () => window.location.assign(link),
                  },
                }
              : {}),
          });

          if (document.visibilityState !== 'visible') {
            void showBrowserNotification({
              title,
              body,
              link,
              tag: payload.messageId || `fcm-${Date.now()}`,
            });
          }
        },
        (error) => {
          const message = error instanceof Error ? error.message : String(error);
          set((state) => ({
            setupResult: state.setupResult
              ? { ...state.setupResult, status: 'fcm-error', reason: message, error }
              : null,
          }));
        }
      );

      if (!app) {
        set({
          loading: false,
          firestoreError:
            'Firebase is not configured (NEXT_PUBLIC_FIREBASE_* environment variables missing).',
        });
      } else {
        let initialSnapshotProcessed = false;
        const notificationsQuery = query(
          collection(db, 'notifications'),
          where('userId', '==', uid)
        );

        unsubscribeFirestore = onSnapshot(
          notificationsQuery,
          (snapshot) => {
            const items = (
              snapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data(),
              })) as NotificationItem[]
            )
              .sort(
                (a, b) =>
                  getTimestampMillis(b.timestamp) - getTimestampMillis(a.timestamp)
              )
              .slice(0, 30);

            set({
              notifications: items,
              unreadCount: items.filter((n) => !n.read).length,
              loading: false,
              firestoreError: null,
            });

            if (!initialSnapshotProcessed) {
              initialSnapshotProcessed = true;
              items.forEach((item) => notifiedDocIds.add(item.id));
              return;
            }

            snapshot.docChanges().forEach((change) => {
              if (change.type !== 'added') return;
              const docId = change.doc.id;
              if (notifiedDocIds.has(docId)) return;
              notifiedDocIds.add(docId);

              const data = change.doc.data() as Omit<NotificationItem, 'id'>;
              if (data.read) return;

              toast(data.title, {
                description: data.message,
                ...(data.link
                  ? {
                      action: {
                        label: 'View',
                        onClick: () => window.location.assign(data.link!),
                      },
                    }
                  : {}),
              });

              void showBrowserNotification({
                title: data.title,
                body: data.message,
                link: data.link || '/',
                tag: `notif-${docId}`,
              });
            });
          },
          (error) => {
            const formatted = `${error.code}: ${error.message}`;
            console.error('[Notifications] Firestore snapshot listener error:', error);
            set({
              loading: false,
              firestoreError: formatted,
            });
          }
        );
      }
    }

    let unsubscribed = false;
    return () => {
      if (unsubscribed) return;
      unsubscribed = true;
      subscriberCount = Math.max(0, subscriberCount - 1);

      if (subscriberCount === 0) {
        tearDownActiveListeners();
        set({
          notifications: [],
          unreadCount: 0,
          loading: false,
          firestoreError: null,
        });
      }
    };
  },
}));
