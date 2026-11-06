"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { create } from 'zustand';
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { Play, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
  return <>
    <div className="relative aspect-video overflow-hidden bg-black">
      {promo && !failed ? <MediaPlayer
        className="pointer-events-none h-full w-full bg-black" src={promo.trailer.embed_url}
        title={`${title} preview`} poster={poster} autoPlay muted playsInline preload="auto"
        onError={() => setFailed(true)}
      ><MediaProvider /></MediaPlayer> : <>
        {/* Keep the cover visible when a promo is missing or cannot be played. */}
        {poster && <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: `url(${JSON.stringify(poster)})` }} />}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-sm text-white">
          {isLoading ? <Loader2 className="h-6 w-6 animate-spin" aria-label="Loading preview" /> : (isError || failed) ? 'Preview unavailable' : 'No promo available'}
        </div>
      </>}
    </div>
    <div className="space-y-3 p-3">
      <p className="line-clamp-2 font-semibold">{title}</p>
      <Button asChild className="w-full gap-2"><Link href={`/watch/${animeId}`}><Play className="h-4 w-4" />Watch now</Link></Button>
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
    leaveTimer.current = setTimeout(close, 150);
  };
  const scheduleOpen = () => {
    cancelLeave();
    if (!enabled || active || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    clearTimeout(enterTimer.current);
    enterTimer.current = setTimeout(() => {
      const rect = container.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(400, Math.max(260, rect.width * 1.2), window.innerWidth - 24);
      const height = width * 9 / 16 + 130;
      setPosition({ width, left: Math.max(12, Math.min(rect.left + (rect.width - width) / 2, window.innerWidth - width - 12)), top: Math.max(12, Math.min(rect.top, window.innerHeight - height - 12)) });
      useActivePreview.getState().setActive(key);
    }, 700);
  };
  useEffect(() => {
    if (!enabled) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    window.addEventListener('keydown', onKey);
    return () => { close(); window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close); window.removeEventListener('keydown', onKey); };
  }, [close, enabled]);
  return <div ref={container} className={`relative min-w-0 ${className}`} onPointerEnter={event => { if (event.pointerType === 'mouse') scheduleOpen(); }} onPointerLeave={scheduleClose}>
    {children}
    {active && position && portal(<div
      className="fixed z-[70] overflow-hidden rounded-xl border border-primary/40 bg-card text-card-foreground shadow-2xl animate-in fade-in zoom-in-95 duration-200 motion-reduce:animate-none"
      style={position} onPointerEnter={cancelLeave} onPointerLeave={scheduleClose}
      role="region" aria-label={`${title} promo preview`}
    ><PromoPreview animeId={animeId} title={title} poster={poster} /></div>, document.body)}
  </div>;
}
