"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';

export function usePostHogPageTracking() {
  const pathname = usePathname();
  const posthog = usePostHog();

  useEffect(() => {
    if (posthog) {
      posthog.capture('$pageview', { url: pathname });
    }
  }, [pathname, posthog]);
}
