"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { motion } from 'framer-motion';
import { RecaptchaVerifier } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const { signIn } = useAuth();
  const router = useRouter();

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });
    }
  };

  const handleSignIn = async (provider: string) => {
    setIsLoading(true);
    try {
      await signIn(provider);
      router.push('/chat');
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // const sendVerificationCode = async () => {
  //   setIsLoading(true);
  //   try {
  //     setupRecaptcha();
  //     const appVerifier = (window as any).recaptchaVerifier;
  //     const confirmationResult = await signIn('phone', { phoneNumber, appVerifier });
  //     setVerificationId(confirmationResult.);
  //   } catch (error) {
  //     console.error('Error sending verification code:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
      >
        <div className="space-y-2 text-center">
          <h1 className="text-2xl text-black font-semibold tracking-tight">Sign In</h1>
          <p className="text-sm text-muted-foreground">
            Choose your preferred sign in method
          </p>
        </div>

        <div className="space-y-4">
          <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSignIn('google')}
              disabled={isLoading}
          >
            {isLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Icons.google className="mr-2 h-4 w-4" />
            )}
            Sign in with Google
          </Button>

          <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSignIn('facebook')}
              disabled={isLoading}
          >
            {isLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Icons.facebook className="mr-2 h-4 w-4" />
            )}
            Sign in with Facebook
          </Button>

          {/*<div className="space-y-2">*/}
          {/*  <Input*/}
          {/*      placeholder="Phone number"*/}
          {/*      value={phoneNumber}*/}
          {/*      onChange={(e) => setPhoneNumber(e.target.value)}*/}
          {/*  />*/}
          {/*  <Button*/}
          {/*      className="w-full"*/}
          {/*      onClick={sendVerificationCode}*/}
          {/*      disabled={isLoading || !phoneNumber}*/}
          {/*  >*/}
          {/*    Send Verification Code*/}
          {/*  </Button>*/}
          {/*</div>*/}

          {/*{verificationId && (*/}
          {/*    <div className="space-y-2">*/}
          {/*      <Input*/}
          {/*          placeholder="Verification code"*/}
          {/*          value={verificationCode}*/}
          {/*          onChange={(e) => setVerificationCode(e.target.value)}*/}
          {/*      />*/}
          {/*      <Button*/}
          {/*          className="w-full"*/}
          {/*          onClick={() => handleSignIn('phone')}*/}
          {/*          disabled={isLoading || !verificationCode}*/}
          {/*      >*/}
          {/*        Verify Code*/}
          {/*      </Button>*/}
          {/*    </div>*/}
          {/*)}*/}
        </div>

        <div id="recaptcha-container" />
      </motion.div>
  );
}

