import type { Metadata } from "next";

import { ChannelBrowser } from "@/components/channels/channel-browser";

export const metadata: Metadata = {
  title: "Live Animation Channels | Otakuz",
  description: "Watch free live Animation channels from the IPTV-org public directory.",
};

export default function ChannelsPage() {
  return <ChannelBrowser />;
}
