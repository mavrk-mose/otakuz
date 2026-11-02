'use client';

import { useEffect } from 'react';
import useAuthStore from '@/store/use-auth-store';

export function AuthInitializer() {
  useEffect(() => {
    const unsubscribe = useAuthStore.getState().subscribeAuth();
    return () => {
      unsubscribe();
    };
  }, []);

  return null;
}
