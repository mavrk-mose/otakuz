'use client';
import { I18nText } from "@/components/i18n-text";
import { useI18n } from "@/components/i18n-provider";


import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstall() {
  const { t: localizedT } = useI18n();
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && window.isSecureContext && process.env.NODE_ENV === 'production') {
      void navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/', updateViaCache: 'none',
      }).catch((error) => console.error('[Otakuz] Service worker registration failed:', error));
    }

    const displayMode = window.matchMedia('(display-mode: standalone)');
    const isInstalled = () => displayMode.matches || (navigator as Navigator & { standalone?: boolean }).standalone;
    if (isInstalled()) return;
    let dismissed = false;
    try { dismissed = sessionStorage.getItem('otakuz-install-dismissed') === 'true'; } catch {}
    setHidden(dismissed);
    setIos(/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => { setHidden(true); setPrompt(null); };
    const onDisplayMode = () => { if (isInstalled()) onInstalled(); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    displayMode.addEventListener('change', onDisplayMode);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      displayMode.removeEventListener('change', onDisplayMode);
    };
  }, []);

  const dismiss = () => {
    setHidden(true);
    try { sessionStorage.setItem('otakuz-install-dismissed', 'true'); } catch {}
  };

  const install = async () => {
    if (!prompt) return;
    setInstalling(true);
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === 'accepted') setHidden(true);
    } catch (error) {
      console.error('[Otakuz] Install prompt failed:', error);
    } finally {
      setPrompt(null);
      setInstalling(false);
    }
  };

  if (hidden || (!prompt && !ios)) return null;

  return (
    <aside aria-label={localizedT("pwa.installLabel")} className="fixed bottom-24 left-4 right-4 z-50 rounded-xl border bg-card p-4 text-card-foreground shadow-xl sm:left-auto sm:w-80 lg:bottom-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold"><I18nText message="pwa.takeWithYou" /></p>
          <p className="mt-1 text-sm text-muted-foreground">
            {ios ? localizedT("pwa.iosInstructions") : localizedT("pwa.instructions")}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={dismiss} aria-label={localizedT("pwa.dismiss")}><X className="h-4 w-4" /></Button>
      </div>
      {prompt && <Button className="mt-3 w-full" disabled={installing} onClick={install}><Download className="mr-2 h-4 w-4" />{installing ? localizedT("pwa.installing") : localizedT("pwa.installLabel")}</Button>}
    </aside>
  );
}
