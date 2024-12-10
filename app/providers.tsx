"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { PostHogProvider } from 'posthog-js/react';
import { usePostHogPageTracking } from '@/hooks/use-post-hog-tracking';
import posthog from 'posthog-js'
import { useEffect } from 'react';

const queryClient = new QueryClient();


export function Providers({ children, ...props }: ThemeProviderProps) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || '', {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      person_profiles: 'always',
      debug: false
    })
  }, [])

  usePostHogPageTracking();

  return (
    <QueryClientProvider client={queryClient}>
      <PostHogProvider client={posthog}>
        <NextThemesProvider {...props}>
          {children}
        </NextThemesProvider>
      </PostHogProvider>
    </QueryClientProvider>
  );
}