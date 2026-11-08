"use client";

import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export function promoEmbedUrl(value?: string | null): string | undefined {
  if (!value) return;
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      !/(^|\.)youtube(-nocookie)?\.com$/.test(url.hostname) ||
      !/^\/embed\/[^/]+$/.test(url.pathname)
    )
      return;
    for (const [key, value] of Object.entries({
      autoplay: "1",
      mute: "1",
      playsinline: "1",
      controls: "0",
      rel: "0",
      enablejsapi: "1",
      loop: "1",
      playlist: url.pathname.split("/").pop()!,
    }))
      url.searchParams.set(key, value);
    if (typeof window !== "undefined") url.searchParams.set("origin", window.location.origin);
    return url.toString();
  } catch {
    return;
  }
}

/** Audio commands preserve playback position instead of reloading the iframe. */
export function PromoVideo({
  src,
  title,
  background = false,
  onError,
}: {
  src: string;
  title: string;
  background?: boolean;
  onError?: () => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [muted, setMuted] = useState(true);
  const toggleAudio = () => {
    const target = frame.current?.contentWindow;
    if (!target) return;
    const origin = new URL(src).origin;
    target.postMessage(
      JSON.stringify({ event: "command", func: muted ? "unMute" : "mute", args: [] }),
      origin,
    );
    if (muted)
      target.postMessage(
        JSON.stringify({ event: "command", func: "setVolume", args: [100] }),
        origin,
      );
    setMuted(!muted);
  };
  return (
    <>
      <iframe
        ref={frame}
        src={src}
        title={title}
        className={
          background
            ? "pointer-events-none absolute left-1/2 top-1/2 h-[max(70vh,56.25vw)] w-[max(100vw,124.45vh)] -translate-x-1/2 -translate-y-1/2 border-0"
            : "pointer-events-none absolute inset-0 h-full w-full border-0"
        }
        allow="autoplay; encrypted-media; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        tabIndex={-1}
        onError={onError}
      />
      <button
        type="button"
        onClick={toggleAudio}
        aria-label={muted ? "Enable promo audio" : "Mute promo audio"}
        aria-pressed={!muted}
        title={muted ? "Enable audio" : "Mute audio"}
        className="absolute bottom-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black/65 text-white shadow-lg transition-colors hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        {muted ? (
          <VolumeX className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Volume2 className="h-5 w-5" aria-hidden="true" />
        )}
      </button>
    </>
  );
}
