import type { Metadata } from "next";
import { Suspense } from "react";

import { ChannelBrowser } from "@/components/channels/channel-browser";

export const metadata: Metadata = {
  title: "Live Animation Channels | Otakuz",
  description: "Watch free live Animation channels from the IPTV-org public directory.",
};

export default function ChannelsPage() {
  return (
    <Suspense
      fallback={
        <div className="-m-4 min-h-[calc(100vh-4rem)] animate-pulse bg-[#080808]">
          <div className="h-[520px] bg-gradient-to-br from-zinc-900 to-black lg:h-[620px]" />
          <div className="mx-auto grid max-w-[1600px] grid-cols-2 gap-4 px-5 py-10 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="aspect-video rounded-md bg-zinc-900" />
            ))}
          </div>
        </div>
      }
    >
      <ChannelBrowser />
    </Suspense>
  );
}
