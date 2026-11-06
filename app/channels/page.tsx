import type { Metadata } from "next";
import { Suspense } from "react";

import { ChannelsSkeleton } from "@/components/skeletons/channels-skeleton";
import { ChannelBrowser } from "@/components/channels/channel-browser";

export const metadata: Metadata = {
  title: "Live Animation Channels | Otakuz",
  description: "Watch free live Animation channels from the IPTV-org public directory.",
};

export default function ChannelsPage() {
  return (
    <Suspense
      fallback={<ChannelsSkeleton />}
    >
      <ChannelBrowser />
    </Suspense>
  );
}
