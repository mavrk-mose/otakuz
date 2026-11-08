"use client";

import { useState, useEffect } from "react";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import {
  createAppQueryClient,
  clearAccountQueries,
  refreshStaleQueries,
  shouldPersistQuery,
  CACHE_MAX_AGE,
  CACHE_BUSTER,
} from "@/lib/query-client";
import { createQueryPersister } from "@/lib/query-persister";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { PostHogProvider } from "posthog-js/react";
import posthog from "posthog-js";
import { usePostHogPageTracking } from "@/hooks/use-post-hog-tracking";
import useAuthStore from "@/store/use-auth-store";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { I18nProvider } from "@/components/i18n-provider";

import { useNotificationsStore } from "@/store/use-notifications-store";
import { saveUserPushToken } from "@/lib/notifications";

// Share the startup request across Strict Mode effect replays and remounts.
let notificationStartup: Promise<void> | undefined;

export function Providers({ children, ...props }: ThemeProviderProps) {
  const [queryClient] = useState(createAppQueryClient);
  const [persister] = useState(createQueryPersister);

  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe((state, previous) => {
      if (state.user?.uid !== previous.user?.uid)
        clearAccountQueries(queryClient);
    });
    const refresh = () => {
      if (document.visibilityState === "visible" && navigator.onLine)
        void refreshStaleQueries(queryClient);
    };
    const timer = setInterval(refresh, 60_000);
    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [queryClient]);

  useEffect(() => useAuthStore.getState().subscribeAuth(), []);

  useEffect(() => {
    notificationStartup ??= useNotificationsStore.getState()
      .enableWebNotifications()
      .then(async (result) => {
        // Authentication can finish while the browser permission prompt is open.
        const uid = useAuthStore.getState().user?.uid;
        if (uid && result.pushToken) {
          await saveUserPushToken(uid, result.pushToken).catch(() => undefined);
        }
      });
  }, []);

  useEffect(() => {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
    if (!posthogKey) return;

    posthog.init(posthogKey, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      disable_session_recording: true,
      person_profiles: "always",
      debug: false,
    });
  }, []);

  usePostHogPageTracking();

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: CACHE_MAX_AGE,
        buster: CACHE_BUSTER,
        dehydrateOptions: {
          shouldDehydrateQuery: shouldPersistQuery,
          shouldDehydrateMutation: () => false,
        },
      }}
    >
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
      <PostHogProvider client={posthog}>
        <NextThemesProvider {...props}>
          <I18nProvider>{children}</I18nProvider>
        </NextThemesProvider>
      </PostHogProvider>
    </PersistQueryClientProvider>
  );
}
