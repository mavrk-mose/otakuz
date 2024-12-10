"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Updated import for app router
import { Auth, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import useAuthStore from "@/store/use-auth-store";

export function useAuth() {
  const { user, loading, setUser, setLoading, setToken } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Correctly type the unsubscribe function
    const unsubscribe = auth.onAuthStateChanged(
        async (currentUser: User | null) => {
          try {
            if (!currentUser) {
              // Redirect to login and reset auth state
              setUser(null);
              setToken(null);
              setLoading(false);
              router.push('/login');
              return;
            }

            // Set user and token when authenticated
            setUser(currentUser);
            const token = await currentUser.getIdToken();
            setToken(token);
            setLoading(false);
          } catch (error) {
            console.error('Authentication error:', error);
            setLoading(false);
            router.push('/login');
          }
        },
        // Optional error handler
        (error) => {
          console.error('Auth state change error:', error);
          setLoading(false);
          router.push('/login');
        }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [setUser, setToken, setLoading]);

  return { user, loading };
}