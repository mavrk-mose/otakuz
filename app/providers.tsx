"use client"

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { PostHogProvider } from 'posthog-js/react';
import posthog from 'posthog-js';
import { usePostHogPageTracking } from '@/hooks/use-post-hog-tracking';
import { I18nProvider } from '@/components/i18n-provider';

export function Providers({ children, ...props }: ThemeProviderProps) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
    if (!posthogKey) return;

    posthog.init(posthogKey, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      disable_session_recording: true,
      person_profiles: 'always',
      debug: false,
    });
  }, []);

  usePostHogPageTracking();

  return (
    <QueryClientProvider client={queryClient}>
      <PostHogProvider client={posthog}>
        <NextThemesProvider {...props}>
          <I18nProvider>
            {children}
          </I18nProvider>
        </NextThemesProvider>
      </PostHogProvider>
    </QueryClientProvider>
  );
}
