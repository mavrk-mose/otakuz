"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { create } from 'zustand';
import { Play, Loader2, Info } from 'lucide-react';
import Link from 'next/link';
import { useAnimeVideos } from '@/hooks/anime/use-anime-videos';

// react-dom's nested React declarations differ from the app's React 18 types.
const portal = createPortal as unknown as (children: ReactNode, container: Element) => ReactNode;

const useActivePreview = create<{ active: string | null; setActive: (active: string | null) => void }>(set => ({
  active: null, setActive: active => set({ active }),
}));

function PromoPreview({ animeId, title, poster }: { animeId: number | string; title: string; poster?: string }) {
  const { data, isLoading, isError } = useAnimeVideos(String(animeId));
  const promo = data?.promo.find(promo => Boolean(promo.trailer?.embed_url));
  const [failed, setFailed] = useState(false);
  let embedUrl: string | undefined;
  if (promo?.trailer.embed_url) {
    try {
      const url = new URL(promo.trailer.embed_url);
      if (url.protocol === 'https:' && /(^|\.)youtube(-nocookie)?\.com$/.test(url.hostname) && url.pathname.startsWith('/embed/')) {
        url.searchParams.set('autoplay', '1');
        url.searchParams.set('mute', '1');
        url.searchParams.set('playsinline', '1');
        url.searchParams.set('controls', '0');
        url.searchParams.set('rel', '0');
        embedUrl = url.toString();
      }
    } catch { /* An invalid preview URL falls back to the cover. */ }
  }
  return <>
    <div className="group/video relative aspect-video overflow-hidden bg-black">
      {embedUrl && !failed ? <iframe
        className="pointer-events-none absolute inset-0 h-full w-full border-0" src={embedUrl}
        title={`${title} promo preview`} allow="autoplay; encrypted-media; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin" tabIndex={-1}
        onError={() => setFailed(true)}
      /> : <>
        {poster && <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: `url(${JSON.stringify(poster)})` }} />}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-sm text-white">
          {isLoading ? <Loader2 className="h-6 w-6 animate-spin" aria-label="Loading preview" /> : (isError || failed) ? 'Preview unavailable' : 'No promo available'}
        </div>
      </>}
      <Link href={`/watch/${animeId}`} aria-label={`Play ${title}`} className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl"><Play className="h-8 w-8 fill-current" aria-hidden="true" /></span>
      </Link>
      <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/65 px-3 py-1 text-xs text-white">Muted preview</span>
    </div>
    <div className="flex items-center justify-between gap-4 p-5">
      <div className="min-w-0"><p className="line-clamp-2 text-xl font-bold sm:text-2xl">{title}</p><p className="mt-1 text-sm text-muted-foreground">Anime · Promo preview</p></div>
      <Link href={`/anime/${animeId}`} aria-label={`View details for ${title}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-muted transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"><Info className="h-5 w-5" aria-hidden="true" /></Link>
    </div>
  </>;
}

/** Delayed, isolated promo player. Portals keep previews out of clipped carousels. */
export function AnimeHoverPreview({ animeId, title, poster, children, className = '', enabled = true }: {
  animeId: number | string; title: string; poster?: string; children: ReactNode; className?: string; enabled?: boolean;
}) {
  const key = useId();
  const active = useActivePreview(state => state.active === key);
  const container = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const enterTimer = useRef<ReturnType<typeof setTimeout>>();
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>();
  const [position, setPosition] = useState<{ left: number; top: number; width: number }>();
  const close = useCallback(() => {
    clearTimeout(enterTimer.current); clearTimeout(leaveTimer.current);
    if (useActivePreview.getState().active === key) useActivePreview.getState().setActive(null);
  }, [key]);
  const cancelLeave = () => clearTimeout(leaveTimer.current);
  const scheduleClose = () => {
    clearTimeout(enterTimer.current);
    clearTimeout(leaveTimer.current);
    leaveTimer.current = setTimeout(() => {
      // Portal transitions and iframe insertion can emit synthetic leave events.
      if (container.current?.matches(':hover') || panel.current?.matches(':hover') || panel.current?.contains(document.activeElement)) return;
      close();
    }, 250);
  };
  const scheduleOpen = () => {
    cancelLeave();
    if (!enabled || active || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    clearTimeout(enterTimer.current);
    enterTimer.current = setTimeout(() => {
      const rect = container.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(640, Math.max(440, rect.width * 1.85), window.innerWidth - 24, Math.max(260, (window.innerHeight - 148) * 16 / 9));
      const height = width * 9 / 16 + 120;
      setPosition({ width, left: Math.max(12, Math.min(rect.left + (rect.width - width) / 2, window.innerWidth - width - 12)), top: Math.max(12, Math.min(rect.top, window.innerHeight - height - 12)) });
      useActivePreview.getState().setActive(key);
    }, 700);
  };
  useEffect(() => {
    if (!enabled) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    const onScroll = (event: Event) => {
      if (event.target instanceof Node && panel.current?.contains(event.target)) return;
      close();
    };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', close);
    window.addEventListener('keydown', onKey);
    return () => { close(); window.removeEventListener('scroll', onScroll, true); window.removeEventListener('resize', close); window.removeEventListener('keydown', onKey); };
  }, [close, enabled]);
  return <div ref={container} className={`relative min-w-0 ${className}`} onPointerEnter={event => { if (event.pointerType === 'mouse') scheduleOpen(); }} onPointerLeave={scheduleClose}>
    {children}
    {active && position && portal(<div ref={panel}
      className="fixed z-[70] overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl animate-in fade-in zoom-in-95 duration-200 motion-reduce:animate-none"
      style={position} onPointerEnter={cancelLeave} onPointerLeave={scheduleClose} onBlurCapture={scheduleClose}
      role="region" aria-label={`${title} promo preview`}
    ><PromoPreview animeId={animeId} title={title} poster={poster} /></div>, document.body)}
  </div>;
}
