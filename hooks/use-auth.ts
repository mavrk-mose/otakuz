'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from "@/store/use-auth-store";

export function useAuth() {
  const { user, loading, signIn, signOut, initialize } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  return { user, loading, signIn, signOut: handleSignOut };
}