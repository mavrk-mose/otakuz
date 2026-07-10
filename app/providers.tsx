"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { PostHogProvider } from 'posthog-js/react';
import { usePostHogPageTracking } from '@/hooks/use-post-hog-tracking';
import posthog from 'posthog-js'
import { useEffect } from 'react';
import {ToastProvider} from "@/components/ui/toast";
import { I18nProvider } from '@/components/i18n-provider';

const queryClient = new QueryClient();

export function Providers({ children, ...props }: ThemeProviderProps) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || '', {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      disable_session_recording: true,
      person_profiles: 'always',
      debug: false
    })
  }, [])

  useEffect(() => {
    // Vidstack rejects pending YouTube/Vimeo commands during normal teardown.
    const handleProviderTeardown = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = reason instanceof Error ? reason.message : reason;

      if (message === 'provider destroyed') {
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleProviderTeardown);

    return () => {
      window.removeEventListener('unhandledrejection', handleProviderTeardown);
    };
  }, []);

  usePostHogPageTracking();

  return (
    <QueryClientProvider client={queryClient}>
      <PostHogProvider client={posthog}>
        <NextThemesProvider {...props}>
          <I18nProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </I18nProvider>
        </NextThemesProvider>
      </PostHogProvider>
    </QueryClientProvider>
  );
}
