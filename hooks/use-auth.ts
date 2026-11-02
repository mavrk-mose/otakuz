'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/use-auth-store';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const loading = useAuthStore((state) => state.loading);
  const initialized = useAuthStore((state) => state.initialized);
  const signIn = useAuthStore((state) => state.signIn);
  const signOut = useAuthStore((state) => state.signOut);
  const subscribeAuth = useAuthStore((state) => state.subscribeAuth);
  const router = useRouter();

  useEffect(() => {
    return subscribeAuth();
  }, [subscribeAuth]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.push('/auth');
  }, [router, signOut]);

  return { user, token, loading, initialized, signIn, signOut: handleSignOut };
}
