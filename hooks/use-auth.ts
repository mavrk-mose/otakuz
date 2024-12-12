"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  GoogleAuthProvider,
  FacebookAuthProvider,
  PhoneAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
  RecaptchaVerifier
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import useAuthStore from "@/store/use-auth-store";

export function useAuth() {
  const { user, loading, setUser, setLoading, setToken } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
        async (currentUser: User | null) => {
          try {
            if (!currentUser) {
              setUser(null);
              setToken(null);
              setLoading(false);
              return;
            }

            setUser(currentUser);
            const token = await currentUser.getIdToken();
            setToken(token);
            setLoading(false);
          } catch (error) {
            console.error('Authentication error:', error);
            setLoading(false);
          }
        },
        (error) => {
          console.error('Auth state change error:', error);
          setLoading(false);
        }
    );

    return () => unsubscribe();
  }, [setUser, setToken, setLoading]);

  const signIn = async (provider: string, credentials?: any): Promise<User> => {
    setLoading(true);
    try {
      let result;
      switch (provider) {
        case 'google':
          result = await signInWithPopup(auth, new GoogleAuthProvider());
          break;
        case 'facebook':
          result = await signInWithPopup(auth, new FacebookAuthProvider());
          break;
        case 'phone':
          if (!credentials || !credentials.phoneNumber || !credentials.appVerifier) {
            throw new Error('Phone sign-in requires phoneNumber and appVerifier');
          }
          result = await signInWithPhoneNumber(auth, credentials.phoneNumber, credentials.appVerifier);
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      if ('user' in result) {
        setUser(result.user);
        const token = await result.user.getIdToken();
        setToken(token);
        return result.user;
      } else {
        throw new Error('Sign-in failed');
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setToken(null);
      router.push('/login');
    } catch (error) {
      console.error('Sign-out error:', error);
      throw error;
    }
  };

  useAuthStore.setState({ signIn, signOut });

  return { user, loading, signIn, signOut };
}

